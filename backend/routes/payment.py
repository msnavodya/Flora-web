from datetime import datetime, timedelta
import logging
from random import randint
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from pymongo.errors import AutoReconnect, ServerSelectionTimeoutError

try:
    from .. import database
    from ..utils import local_store
    from ..utils.paypal_client import (
        PayPalAPIError,
        PayPalConfigError,
        capture_order,
        create_order,
        get_order_details,
        get_paypal_public_config,
        get_paypal_status,
    )
except ImportError:
    import database
    from utils import local_store
    from utils.paypal_client import (
        PayPalAPIError,
        PayPalConfigError,
        capture_order,
        create_order,
        get_order_details,
        get_paypal_public_config,
        get_paypal_status,
    )


router = APIRouter(tags=["Payments"])
logger = logging.getLogger(__name__)

OTP_EXPIRY_MINUTES = 5
PROCESSING_DURATION_SECONDS = 3


class CheckoutItem(BaseModel):
    id: str
    name: str
    price: float = Field(ge=0)
    quantity: int = Field(default=1, ge=1)


class CreateOrderRequest(BaseModel):
    items: List[CheckoutItem]
    currency: str = Field(default="LKR", min_length=3, max_length=3)
    payment_method: str


class SendOtpRequest(BaseModel):
    order_id: str
    phone: str = Field(min_length=8)


class VerifyOtpRequest(BaseModel):
    order_id: str
    otp: str = Field(min_length=4, max_length=6)


class ConfirmPaymentRequest(BaseModel):
    order_id: str
    payment_method: str
    card_number: Optional[str] = None
    card_name: Optional[str] = None
    card_expiry: Optional[str] = None
    card_cvv: Optional[str] = None


class PayPalCreateOrderRequest(BaseModel):
    items: List[CheckoutItem]
    currency: str = Field(default="USD", min_length=3, max_length=3)


def _now():
    return datetime.utcnow()


def _normalize_method(payment_method: str) -> str:
    return payment_method.strip().lower()


def _sanitize_currency(currency: str) -> str:
    return currency.strip().upper()


def _serialize_order(order):
    serialized = {**order}
    serialized["id"] = str(serialized.get("_id", serialized.get("id", "")))
    serialized["_id"] = serialized["id"]
    serialized.pop("otp_code", None)
    return serialized


def _use_local_orders_store():
    return database.get_orders_collection() is None


def _use_local_payments_store():
    return database.get_payments_collection() is None


def _create_order_record(payload: CreateOrderRequest):
    subtotal = round(sum(item.price * item.quantity for item in payload.items), 2)
    timestamp = local_store.now_iso()

    return {
        "items": [item.model_dump() for item in payload.items],
        "currency": _sanitize_currency(payload.currency),
        "payment_method": _normalize_method(payload.payment_method),
        "subtotal": subtotal,
        "total": subtotal,
        "status": "created",
        "phone": None,
        "otp_verified": False,
        "otp_code": None,
        "otp_expires_at": None,
        "payment_details": {},
        "gateway_reference": None,
        "created_at": timestamp,
        "updated_at": timestamp,
    }


def _find_order(order_id: str):
    orders_collection = database.get_orders_collection()
    if orders_collection is None:
        return local_store.find_item(local_store.ORDERS_FILE, lambda item: item.get("_id") == order_id)
    return orders_collection.find_one({"_id": order_id})


def _save_new_order(record):
    orders_collection = database.get_orders_collection()
    if orders_collection is None:
        return local_store.create_item(local_store.ORDERS_FILE, record)

    stored = {"_id": record.get("_id") or f"ord_{randint(100000, 999999)}", **record}
    orders_collection.insert_one(stored)
    return stored


def _update_order(order_id: str, updates: dict):
    updates["updated_at"] = local_store.now_iso()
    orders_collection = database.get_orders_collection()

    if orders_collection is None:
        return local_store.update_item(
            local_store.ORDERS_FILE,
            lambda item: item.get("_id") == order_id,
            lambda item: {**item, **updates},
        )

    orders_collection.update_one({"_id": order_id}, {"$set": updates})
    return orders_collection.find_one({"_id": order_id})


def _refresh_order_status(order):
    if not order or order.get("status") != "processing":
        return order

    processing_started_at = order.get("processing_started_at")
    if not processing_started_at:
        return order

    try:
        started = datetime.fromisoformat(processing_started_at)
    except ValueError:
        return order

    if _now() - started < timedelta(seconds=PROCESSING_DURATION_SECONDS):
        return order

    return _update_order(
        str(order.get("_id")),
        {
            "status": "paid",
            "gateway_reference": order.get("gateway_reference") or f"pay_{randint(100000, 999999)}",
            "paid_at": local_store.now_iso(),
        },
    )


def _validate_card_details(payload: ConfirmPaymentRequest):
    number = (payload.card_number or "").strip()
    name = (payload.card_name or "").strip()
    expiry = (payload.card_expiry or "").strip()
    cvv = (payload.card_cvv or "").strip()

    if not number.isdigit() or len(number) != 16:
        raise HTTPException(status_code=400, detail="Card number must be 16 digits.")
    if not name:
        raise HTTPException(status_code=400, detail="Cardholder name is required.")
    if len(expiry) != 5 or expiry[2] != "/":
        raise HTTPException(status_code=400, detail="Expiry must use MM/YY format.")
    if not cvv.isdigit() or len(cvv) not in (3, 4):
        raise HTTPException(status_code=400, detail="CVV must be 3 or 4 digits.")

    return {
        "card_last4": number[-4:],
        "card_brand": "card",
        "cardholder_name": name,
    }


def _save_payment_record(record: dict):
    payments_collection = database.get_payments_collection()
    if payments_collection is None:
        return local_store.create_item(local_store.PAYMENTS_FILE, record)

    stored = {"_id": record["order_id"], **record}
    payments_collection.update_one({"_id": stored["_id"]}, {"$set": stored}, upsert=True)
    return payments_collection.find_one({"_id": stored["_id"]})


def _parse_paypal_amount(paypal_order: dict):
    purchase_units = paypal_order.get("purchase_units") or []
    first_unit = purchase_units[0] if purchase_units else {}
    amount = first_unit.get("amount") or {}
    return amount.get("value"), amount.get("currency_code")


def _parse_payer_email(paypal_order: dict):
    payer = paypal_order.get("payer") or {}
    return payer.get("email_address")


def _get_product_record(product_id: str):
    products_collection = database.get_products_collection()

    if products_collection is None:
        return local_store.find_item(local_store.PRODUCTS_FILE, lambda item: item.get("_id") == product_id)

    product = products_collection.find_one({"_id": product_id})
    if product is not None:
        return product

    if ObjectId.is_valid(product_id):
        return products_collection.find_one({"_id": ObjectId(product_id)})

    return None


def _resolve_catalog_items(items: List[CheckoutItem]):
    resolved_items = []

    for item in items:
        product = _get_product_record(item.id)
        if product is None:
            raise HTTPException(status_code=400, detail=f"Product {item.id} was not found.")

        resolved_items.append(
            {
                "id": item.id,
                "name": product.get("name", item.name),
                "price": float(product.get("price", item.price)),
                "quantity": item.quantity,
            }
        )

    return resolved_items


def _build_paypal_purchase_units(items: List[dict], currency: str):
    total = round(sum(item["price"] * item["quantity"] for item in items), 2)
    return [
        {
            "amount": {
                "currency_code": currency,
                "value": f"{total:.2f}",
                "breakdown": {
                    "item_total": {
                        "currency_code": currency,
                        "value": f"{total:.2f}",
                    }
                },
            },
            "items": [
                {
                    "name": item["name"][:127],
                    "unit_amount": {
                        "currency_code": currency,
                        "value": f"{item['price']:.2f}",
                    },
                    "quantity": str(item["quantity"]),
                }
                for item in items
            ],
        }
    ]


@router.get("/paypal/config")
def paypal_config():
    try:
        return get_paypal_public_config()
    except PayPalConfigError as error:
        logger.warning("PayPal config request failed validation: %s", error.details or error.message)
        raise HTTPException(status_code=400, detail=error.details or {"message": error.message})
    except PayPalAPIError as error:
        logger.exception("PayPal config request failed unexpectedly.")
        raise HTTPException(status_code=error.status_code, detail=error.details or {"message": error.message})
    except Exception:
        logger.exception("Unhandled exception in /paypal/config")
        raise HTTPException(status_code=500, detail={"message": "Unable to load PayPal configuration right now."})


@router.get("/paypal/debug")
def paypal_debug():
    try:
        return get_paypal_status()
    except Exception:
        logger.exception("Unhandled exception in /paypal/debug")
        raise HTTPException(status_code=500, detail={"message": "Unable to inspect PayPal debug status right now."})


@router.get("/paypal/status")
def paypal_status():
    try:
        return get_paypal_status()
    except Exception:
        logger.exception("Unhandled exception in /paypal/status")
        raise HTTPException(status_code=500, detail={"message": "Unable to inspect PayPal status right now."})


@router.post("/create-order")
def create_paypal_order(payload: PayPalCreateOrderRequest):
    try:
        if not payload.items:
            raise HTTPException(status_code=400, detail="Add at least one item before checkout.")

        currency = _sanitize_currency(payload.currency)
        resolved_items = _resolve_catalog_items(payload.items)
        paypal_order = create_order(
            {
                "intent": "CAPTURE",
                "purchase_units": _build_paypal_purchase_units(resolved_items, currency),
            }
        )
        return {
            "id": paypal_order["id"],
            "status": paypal_order.get("status", "CREATED"),
        }
    except HTTPException:
        raise
    except PayPalConfigError as error:
        logger.warning("PayPal create-order blocked by missing config: %s", error.details or error.message)
        raise HTTPException(status_code=400, detail=error.details or {"message": error.message})
    except PayPalAPIError as error:
        logger.exception("PayPal create-order request failed.")
        raise HTTPException(status_code=error.status_code, detail=error.details or error.message)
    except Exception:
        logger.exception("Unhandled exception in /create-order")
        raise HTTPException(status_code=500, detail={"message": "Unable to create PayPal order right now."})


@router.post("/capture-order/{order_id}")
def capture_paypal_order(order_id: str):
    try:
        capture_response = capture_order(order_id)
        order_details = get_order_details(order_id)
        amount, currency = _parse_paypal_amount(order_details)
        payment_record = {
            "order_id": order_id,
            "status": capture_response.get("status", order_details.get("status", "COMPLETED")),
            "amount": amount,
            "currency": currency,
            "payer_email": _parse_payer_email(order_details),
            "provider": "paypal",
            "capture_id": (
                ((capture_response.get("purchase_units") or [{}])[0].get("payments") or {})
                .get("captures", [{}])[0]
                .get("id")
            ),
            "created_at": local_store.now_iso(),
            "updated_at": local_store.now_iso(),
            "paypal_order": order_details,
            "paypal_capture": capture_response,
        }
        stored = _save_payment_record(payment_record)
        return {
            "message": "Payment captured successfully.",
            "payment": {
                "order_id": order_id,
                "status": payment_record["status"],
                "amount": payment_record["amount"],
                "currency": payment_record["currency"],
                "payer_email": payment_record["payer_email"],
                "storage": "local" if _use_local_payments_store() else "mongodb",
            },
            "details": capture_response,
            "stored_payment_id": str(stored.get("_id", "")) if stored else order_id,
        }
    except PayPalConfigError as error:
        logger.warning("PayPal capture blocked by missing config: %s", error.details or error.message)
        raise HTTPException(status_code=400, detail=error.details or {"message": error.message})
    except PayPalAPIError as error:
        logger.exception("PayPal capture request failed.")
        raise HTTPException(status_code=error.status_code, detail=error.details or error.message)
    except Exception:
        logger.exception("Unhandled exception in /capture-order/%s", order_id)
        raise HTTPException(status_code=500, detail={"message": "Unable to capture PayPal order right now."})


@router.post("/webhooks/paypal")
async def paypal_webhook(request: Request):
    payload = await request.json()
    return {
        "message": "Webhook received. Add PayPal signature verification before production use.",
        "event_type": payload.get("event_type"),
    }


@router.post("/payments/orders")
def create_internal_order(payload: CreateOrderRequest):
    try:
        if not payload.items:
            raise HTTPException(status_code=400, detail="Add at least one item before checkout.")

        payment_method = _normalize_method(payload.payment_method)
        if payment_method not in {"card", "paypal", "cod"}:
            raise HTTPException(status_code=400, detail="Unsupported payment method.")

        stored = _save_new_order(_create_order_record(payload))
        return {"message": "Order created", "order": _serialize_order(stored), "storage": "local" if _use_local_orders_store() else "mongodb"}
    except HTTPException:
        raise
    except (ServerSelectionTimeoutError, AutoReconnect) as error:
        raise HTTPException(status_code=503, detail=f"Payment storage unavailable: {error}")


@router.post("/payments/orders/otp")
def send_order_otp(payload: SendOtpRequest):
    order = _find_order(payload.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    if order.get("status") in {"paid", "confirmed"}:
        raise HTTPException(status_code=400, detail="This order is already completed.")

    otp_code = str(randint(1000, 9999))
    updated = _update_order(
        payload.order_id,
        {
            "status": "otp_sent",
            "phone": payload.phone.strip(),
            "otp_code": otp_code,
            "otp_verified": False,
            "otp_expires_at": (_now() + timedelta(minutes=OTP_EXPIRY_MINUTES)).isoformat(),
        },
    )
    return {
        "message": "OTP sent successfully.",
        "demo_otp": otp_code,
        "order": _serialize_order(updated),
    }


@router.post("/payments/orders/verify")
def verify_order_otp(payload: VerifyOtpRequest):
    order = _find_order(payload.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    if order.get("otp_code") != payload.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    expires_at = order.get("otp_expires_at")
    if expires_at:
        try:
            if _now() > datetime.fromisoformat(expires_at):
                raise HTTPException(status_code=400, detail="OTP expired. Request a new code.")
        except ValueError:
            pass

    updated = _update_order(
        payload.order_id,
        {
            "status": "verified",
            "otp_verified": True,
            "otp_code": None,
        },
    )
    return {"message": "Phone verified.", "order": _serialize_order(updated)}


@router.post("/payments/orders/confirm")
def confirm_internal_order_payment(payload: ConfirmPaymentRequest):
    order = _find_order(payload.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    payment_method = _normalize_method(payload.payment_method)
    if payment_method != order.get("payment_method"):
        raise HTTPException(status_code=400, detail="Payment method mismatch.")

    if not order.get("otp_verified"):
        raise HTTPException(status_code=400, detail="Verify phone number before payment.")

    if payment_method == "card":
        payment_details = _validate_card_details(payload)
        next_status = "processing"
        extra = {"processing_started_at": local_store.now_iso()}
    elif payment_method == "paypal":
        payment_details = {"provider": "paypal", "mode": "button_checkout"}
        next_status = "processing"
        extra = {"processing_started_at": local_store.now_iso()}
    else:
        payment_details = {"provider": "cash_on_delivery"}
        next_status = "confirmed"
        extra = {"paid_at": None, "gateway_reference": f"cod_{randint(100000, 999999)}"}

    updated = _update_order(
        payload.order_id,
        {
            "status": next_status,
            "payment_details": payment_details,
            **extra,
        },
    )
    return {
        "message": "Payment submitted.",
        "order": _serialize_order(updated),
    }


@router.get("/payments/orders/{order_id}")
def get_internal_order(order_id: str):
    order = _find_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    refreshed = _refresh_order_status(order) or order
    return {"order": _serialize_order(refreshed)}
