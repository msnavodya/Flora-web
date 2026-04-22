import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import { ArrowLeft, LoaderCircle, Menu, ShoppingBag, WalletCards, X } from "lucide-react";
import LanguageSelector from "../language/LanguageSelector";
import MenuPanel from "../menu/menu";
import PayPalButton from "../PayPalButton/PayPalButton";
import {
  confirmPaymentOrder,
  createPaymentOrder,
  getPaymentOrder,
  sendPaymentOtp,
  verifyPaymentOtp,
} from "../../api";
import "react-phone-input-2/lib/style.css";
import "./cartPage.css";

const exchangeRates = { LKR: 1, USD: 0.0033, EUR: 0.003 };
const currencySymbols = { LKR: "Rs.", USD: "$", EUR: "EUR" };

export default function CartPage() {
  const navigate = useNavigate();
  const pollingRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(0);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "LKR");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState("");
  const [demoOtp, setDemoOtp] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  useEffect(() => () => window.clearInterval(pollingRef.current), []);

  const total = cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const paypalCurrency = currency === "LKR" ? "USD" : currency;
  const paypalItems = cartItems.map((item) => ({
    ...item,
    price: Number((Number(item.price || 0) * exchangeRates[paypalCurrency]).toFixed(2)),
    quantity: Number(item.quantity || 1),
  }));

  const formatPrice = (price) => {
    const converted = Number(price || 0) * exchangeRates[currency];
    return `${currencySymbols[currency]} ${converted.toFixed(2)}`;
  };

  const showStatus = (message) => {
    setStatus(message);
    window.clearTimeout(window.floranaCartStatusTimer);
    window.floranaCartStatusTimer = window.setTimeout(() => setStatus(""), 3200);
  };

  const resetCheckoutState = () => {
    setShowPayment(false);
    setStep(0);
    setPhone("");
    setOtp("");
    setDemoOtp("");
    setCard({ number: "", name: "", expiry: "", cvv: "" });
    setActiveOrderId("");
    setBusy(false);
    window.clearInterval(pollingRef.current);
  };

  const syncPaidOrder = () => {
    localStorage.removeItem("cart");
    setCartItems([]);
    showStatus("Order completed successfully.");
    window.setTimeout(() => resetCheckoutState(), 1200);
  };

  const handlePayPalSuccess = (payload) => {
    const payerEmail = payload?.payment?.payer_email;
    showStatus(payerEmail ? `PayPal payment successful for ${payerEmail}.` : "PayPal payment successful.");
    setStep(5);
    syncPaidOrder();
  };

  const handlePayPalError = (message) => {
    showStatus(message || "PayPal payment failed.");
  };

  const syncOrderState = (order) => {
    const statusValue = order?.status || "";

    if (statusValue === "otp_sent") {
      setStep(2);
      return;
    }

    if (statusValue === "verified") {
      setStep(3);
      return;
    }

    if (statusValue === "processing") {
      setStep(4);
      return;
    }

    if (statusValue === "paid" || statusValue === "confirmed") {
      setStep(5);
      syncPaidOrder();
    }
  };

  const pollOrderStatus = (orderId) => {
    window.clearInterval(pollingRef.current);
    pollingRef.current = window.setInterval(async () => {
      try {
        const response = await getPaymentOrder(orderId);
        syncOrderState(response.data?.order);
      } catch (error) {
        window.clearInterval(pollingRef.current);
        showStatus(error.response?.data?.detail || "Unable to refresh payment status.");
      }
    }, 1500);
  };

  const handleBack = () => {
    if (showPayment) {
      if (step > 0 && step < 4) {
        setStep((previous) => previous - 1);
      } else {
        resetCheckoutState();
      }
      return;
    }

    navigate(-1);
  };

  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter((item, index) => `${item.id}-${index}` !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    showStatus("Item removed from cart.");
  };

  const isValidPhone = (value) => {
    const slRegex = /^7\d{8}$|^0\d{9}$/;
    const usRegex = /^\d{10}$/;
    if (value.startsWith("94")) return slRegex.test(value.slice(2));
    if (value.startsWith("1")) return usRegex.test(value);
    return value.length >= 8;
  };

  const beginCheckout = async () => {
    if (cartItems.length === 0) {
      showStatus("Your cart is empty.");
      return;
    }

    setShowPayment(true);
    setStep(0);
    setActiveOrderId("");
    showStatus("Choose a payment method to start secure checkout.");
  };

  const selectPaymentMethod = async (method) => {
    setPaymentMethod(method);

    if (method === "paypal") {
      setActiveOrderId("");
      setStep(3);
      showStatus("Continue with PayPal Sandbox to approve payment.");
      return;
    }

    setBusy(true);
    try {
      const items = cartItems.map((item) => ({
        id: String(item.id || item._id || item.name),
        name: item.name,
        price: Number(item.price || 0),
        quantity: 1,
      }));
      const response = await createPaymentOrder({ items, currency, payment_method: method });
      const order = response.data?.order;
      setActiveOrderId(order?.id || "");
      setStep(1);
      showStatus("Payment method selected. Verify your phone to continue.");
    } catch (error) {
      showStatus(error.response?.data?.detail || "Unable to prepare payment.");
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = async () => {
    if (!isValidPhone(phone)) {
      showStatus("Enter a valid phone number first.");
      return;
    }

    setBusy(true);
    try {
      const response = await sendPaymentOtp({ order_id: activeOrderId, phone });
      setDemoOtp(response.data?.demo_otp || "");
      syncOrderState(response.data?.order);
      showStatus(`OTP sent. Demo code: ${response.data?.demo_otp || "check backend"}`);
    } catch (error) {
      showStatus(error.response?.data?.detail || "Unable to send OTP.");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      showStatus("Enter the OTP first.");
      return;
    }

    setBusy(true);
    try {
      const response = await verifyPaymentOtp({ order_id: activeOrderId, otp: otp.trim() });
      syncOrderState(response.data?.order);
      showStatus("Phone verified.");
    } catch (error) {
      showStatus(error.response?.data?.detail || "Unable to verify OTP.");
    } finally {
      setBusy(false);
    }
  };

  const handlePayment = async () => {
    setBusy(true);
    try {
      const response = await confirmPaymentOrder({
        order_id: activeOrderId,
        payment_method: paymentMethod,
        card_number: card.number.trim(),
        card_name: card.name.trim(),
        card_expiry: card.expiry.trim(),
        card_cvv: card.cvv.trim(),
      });
      const order = response.data?.order;
      syncOrderState(order);
      if (order?.status === "processing") {
        showStatus("Payment is processing in real time.");
        pollOrderStatus(activeOrderId);
      } else {
        showStatus("Order confirmed.");
      }
    } catch (error) {
      showStatus(error.response?.data?.detail || "Unable to confirm payment.");
    } finally {
      setBusy(false);
    }
  };

  const renderMethodSelection = () => (
    <>
      <h2>Select Payment Method</h2>
      <div className="method-item" onClick={() => selectPaymentMethod("card")}>
        <h4>Credit Card</h4>
        <p>Fast checkout with secure card validation.</p>
      </div>
      <div className="method-item" onClick={() => selectPaymentMethod("paypal")}>
        <h4>PayPal</h4>
        <p>Backend marks it processing and confirms in real time.</p>
      </div>
      <div className="method-item" onClick={() => selectPaymentMethod("cod")}>
        <h4>Cash on Delivery</h4>
        <p>Confirm now and pay when the order arrives.</p>
      </div>
    </>
  );

  return (
    <div className="app mobile-screen">
      <div className="cart-page mobile-frame">
        <div className="cart-scroll mobile-panel">
          <div className="nav">
            <button className="back-btn" aria-label="Go back" onClick={handleBack}>
              <ArrowLeft size={18} />
            </button>

            <div className="cart-title-wrap">
              <p className="cart-eyebrow">Florana Checkout</p>
              <h3 className="cart-heading">My Cart</h3>
            </div>

            <div className="cart-toolbar">
              <LanguageSelector />

              <button className="cart-icon-btn compact-cart-btn" aria-label="Cart overview">
                <ShoppingBag size={16} />
                {cartItems.length > 0 ? <span className="catalog-cart-badge">{cartItems.length}</span> : null}
              </button>

              <label className="cart-currency-pill" aria-label="Currency converter">
                <span className="currency-icon" aria-hidden="true">
                  <WalletCards size={14} />
                </span>
                <select
                  className="currency-mini"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                >
                  <option value="LKR">Rs.</option>
                  <option value="USD">$</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>

              <button className="menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
                <Menu size={18} />
              </button>
            </div>
          </div>

          <div className="cart-summary-card">
            <div>
              <p>Items in cart</p>
              <strong>{cartItems.length}</strong>
            </div>
            <div>
              <p>Total</p>
              <strong className="currency-text">{formatPrice(total)}</strong>
            </div>
          </div>

          {status ? <div className="cart-status">{status}</div> : null}

          <div className="cart-box">
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => {
                const itemKey = `${item.id}-${index}`;

                return (
                  <div key={itemKey} className="item">
                    <div>
                      <h4>{item.name}</h4>
                      <p className="currency-text">{formatPrice(item.price)}</p>
                    </div>

                    <button className="delete-btn" aria-label="Remove item" onClick={() => removeFromCart(itemKey)}>
                      <X size={16} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <ShoppingBag size={34} />
                <p>Your cart is empty right now.</p>
                <button className="checkout-btn" onClick={() => navigate("/catalog")}>
                  Continue Shopping
                </button>
              </div>
            )}
          </div>

          {cartItems.length > 0 ? (
            <button className="checkout-btn" onClick={beginCheckout} disabled={busy}>
              {busy ? "Preparing checkout..." : "Proceed to Payment"}
            </button>
          ) : null}

          {showPayment ? (
            <div className="overlay">
              <div className="overlay-bg" onClick={resetCheckoutState} />
              <div className="payment-drawer">
                <div className="payment-order-chip">
                  <span>Order</span>
                  <strong>{paymentMethod === "paypal" ? "PayPal Sandbox" : activeOrderId || "Creating..."}</strong>
                </div>

                {step === 0 ? renderMethodSelection() : null}

                {step === 1 ? (
                  <>
                    <h2>Verify Mobile Number</h2>
                    <p className="drawer-copy">We use phone verification before payment confirmation.</p>
                    <PhoneInput
                      country="lk"
                      value={phone}
                      onChange={setPhone}
                      enableSearch
                      placeholder="Phone number"
                      inputStyle={{ width: "100%", height: "46px", borderRadius: "14px" }}
                      buttonStyle={{ borderRadius: "14px 0 0 14px" }}
                    />
                    <button className="pay-btn" onClick={sendOtp} disabled={busy}>
                      {busy ? "Sending..." : "Send OTP"}
                    </button>
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <h2>Enter OTP</h2>
                    <p className="drawer-copy">Demo code: {demoOtp || "sent to backend response"}</p>
                    <input
                      className="input"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                    />
                    <button className="pay-btn" onClick={verifyOtp} disabled={busy}>
                      {busy ? "Verifying..." : "Verify OTP"}
                    </button>
                  </>
                ) : null}

                {step === 3 ? (
                  <>
                    {paymentMethod === "card" ? (
                      <>
                        <h2>Card Details</h2>
                        <p className="drawer-copy">Card data is validated by the backend before processing.</p>
                        <input
                          className="input"
                          placeholder="Card Number (16 digits)"
                          value={card.number}
                          onChange={(event) => setCard({ ...card, number: event.target.value.replace(/\D/g, "") })}
                        />
                        <input
                          className="input"
                          placeholder="Name on Card"
                          value={card.name}
                          onChange={(event) => setCard({ ...card, name: event.target.value })}
                        />
                        <div className="card-grid">
                          <input
                            className="input"
                            placeholder="MM/YY"
                            value={card.expiry}
                            onChange={(event) => setCard({ ...card, expiry: event.target.value })}
                          />
                          <input
                            className="input"
                            placeholder="CVV"
                            value={card.cvv}
                            onChange={(event) => setCard({ ...card, cvv: event.target.value.replace(/\D/g, "") })}
                          />
                        </div>
                        <button className="pay-btn" onClick={handlePayment} disabled={busy}>
                          {busy ? "Submitting..." : `Pay ${formatPrice(total)}`}
                        </button>
                      </>
                    ) : null}

                    {paymentMethod === "paypal" ? (
                      <>
                        <h2>PayPal Checkout</h2>
                        <p className="drawer-copy">Approve the order in PayPal Sandbox, then the backend captures it and stores the payment record.</p>
                        <PayPalButton
                          items={paypalItems}
                          currency={paypalCurrency}
                          onSuccess={handlePayPalSuccess}
                          onError={handlePayPalError}
                        />
                      </>
                    ) : null}

                    {paymentMethod === "cod" ? (
                      <>
                        <h2>Cash on Delivery</h2>
                        <p className="drawer-copy">Confirm the order now and pay the courier on delivery.</p>
                        <button className="pay-btn" onClick={handlePayment} disabled={busy}>
                          {busy ? "Submitting..." : `Confirm COD ${formatPrice(total)}`}
                        </button>
                      </>
                    ) : null}
                  </>
                ) : null}

                {step === 4 ? (
                  <div className="success">
                    <LoaderCircle className="spinner-icon" size={26} />
                    <h2>Payment Processing</h2>
                    <p>We are checking the latest order status from the backend.</p>
                  </div>
                ) : null}

                {step === 5 ? (
                  <div className="success">
                    <h2>Order Confirmed</h2>
                    <p>Your payment flow completed successfully.</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <MenuPanel isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
