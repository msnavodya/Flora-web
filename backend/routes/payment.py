from fastapi import APIRouter, Request

router = APIRouter()

@router.post("/payment-notify")
async def payment_notify(request: Request):
    data = await request.form()
    print("Payment Notification:", data)

    # TODO:
    # save order to MongoDB
    # verify payment

    return {"status": "ok"}