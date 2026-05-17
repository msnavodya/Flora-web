import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import { ArrowLeft, LoaderCircle, Menu, ShoppingBag, WalletCards, X } from "lucide-react";
import { useTranslation } from "../language/LanguageContext";
import LanguageSelector from "../language/LanguageSelector";
import MenuPanel from "../menu/menu";
import PayPalButton from "../PayPalButton/PayPalButton";
import {
  confirmPaymentOrder,
  createPaymentOrder,
  getApiErrorMessage,
  getPaymentOrder,
  sendPaymentOtp,
  verifyPaymentOtp,
} from "../../api";
import "react-phone-input-2/lib/style.css";
import "./cartPage.css";

const exchangeRates = { LKR: 1, USD: 0.0033, EUR: 0.003 };
const currencySymbols = { LKR: "Rs.", USD: "$", EUR: "EUR" };
const cartCopy = {
  en: {
    checkout: "Flora Web Checkout",
    myCart: "My Cart",
    itemsInCart: "Items in cart",
    total: "Total",
    empty: "Your cart is empty right now.",
    continueShopping: "Continue Shopping",
    preparing: "Preparing checkout...",
    proceed: "Proceed to Payment",
    paymentMethod: "Select Payment Method",
    creditCard: "Credit Card",
    creditCardDesc: "Fast checkout with secure card validation.",
    paypalDesc: "Backend marks it processing and confirms in real time.",
    cod: "Cash on Delivery",
    codDesc: "Confirm now and pay when the order arrives.",
    verifyMobile: "Verify Mobile Number",
    phoneCopy: "We use phone verification before payment confirmation.",
    phoneNumber: "Phone number",
    sending: "Sending...",
    sendOtp: "Send OTP",
    enterOtp: "Enter OTP",
    demoCode: "Demo code:",
    sentToBackend: "sent to backend response",
    verifying: "Verifying...",
    verifyOtp: "Verify OTP",
    cardDetails: "Card Details",
    cardCopy: "Card data is validated by the backend before processing.",
    cardNumber: "Card Number (16 digits)",
    nameOnCard: "Name on Card",
    expiry: "MM/YY",
    submitting: "Submitting...",
    pay: "Pay",
    paypalCheckout: "PayPal Checkout",
    paypalCopy: "Approve the order in PayPal Sandbox, then the backend captures it and stores the payment record.",
    codCopy: "Confirm the order now and pay the courier on delivery.",
    confirmCod: "Confirm COD",
    processing: "Payment Processing",
    processingCopy: "We are checking the latest order status from the backend.",
    confirmed: "Order Confirmed",
    completed: "Your payment flow completed successfully.",
  },
  si: {
    checkout: "ෆ්ලෝරානා ගෙවීම්",
    myCart: "මගේ කරත්තය",
    itemsInCart: "කරත්තයේ අයිතම",
    total: "මුළු එකතුව",
    empty: "ඔබගේ කරත්තය දැන් හිස්ය.",
    continueShopping: "සාප්පු යාම දිගටම කරගෙන යන්න",
    preparing: "ගෙවීම සූදානම් කරමින්...",
    proceed: "ගෙවීමට ඉදිරියට යන්න",
    paymentMethod: "ගෙවීමේ ක්‍රමය තෝරන්න",
    creditCard: "ක්‍රෙඩිට් කාඩ්",
    creditCardDesc: "ආරක්ෂිත කාඩ් තහවුරු කිරීම සමඟ වේගවත් ගෙවීම.",
    paypalDesc: "බැක්එන්ඩ් එය ක්‍රියාවලියේ බව ලෙස සලකුණු කර තත්‍ය කාලීනව තහවුරු කරයි.",
    cod: "භාරදීමේදී මුදල්",
    codDesc: "දැන් තහවුරු කර ඇණවුම පැමිණි විට ගෙවන්න.",
    verifyMobile: "ජංගම දුරකථන අංකය තහවුරු කරන්න",
    phoneCopy: "ගෙවීම තහවුරු කිරීමට පෙර අපි දුරකථන තහවුරු කිරීම භාවිතා කරමු.",
    phoneNumber: "දුරකථන අංකය",
    sending: "යවමින්...",
    sendOtp: "OTP යවන්න",
    enterOtp: "OTP ඇතුළත් කරන්න",
    demoCode: "ඩෙමෝ කේතය:",
    sentToBackend: "බැක්එන්ඩ් ප්‍රතිචාරයට යවන ලදී",
    verifying: "තහවුරු කරමින්...",
    verifyOtp: "OTP තහවුරු කරන්න",
    cardDetails: "කාඩ් විස්තර",
    cardCopy: "කාඩ් දත්ත ක්‍රියාවලියට පෙර බැක්එන්ඩ් මගින් තහවුරු කරයි.",
    cardNumber: "කාඩ් අංකය (අංක 16)",
    nameOnCard: "කාඩ්පතේ නම",
    expiry: "MM/YY",
    submitting: "ඉදිරිපත් කරමින්...",
    pay: "ගෙවන්න",
    paypalCheckout: "PayPal ගෙවීම",
    paypalCopy: "PayPal Sandbox තුළ ඇණවුම අනුමත කරන්න, පසුව බැක්එන්ඩ් එය අල්ලා ගෙවීම් වාර්තාව සුරකියි.",
    codCopy: "දැන් ඇණවුම තහවුරු කර භාරදීමේදී කුරියර්ට ගෙවන්න.",
    confirmCod: "COD තහවුරු කරන්න",
    processing: "ගෙවීම සැකසෙමින් පවතී",
    processingCopy: "අපි බැක්එන්ඩ් වෙතින් නවතම ඇණවුම් තත්ත්වය පරීක්ෂා කරමින් සිටිමු.",
    confirmed: "ඇණවුම තහවුරුයි",
    completed: "ඔබගේ ගෙවීමේ ක්‍රියාවලිය සාර්ථකව අවසන් විය.",
  },
  ta: {
    checkout: "ஃப்ளோரானா கட்டணம்",
    myCart: "என் வண்டி",
    itemsInCart: "வண்டியில் உள்ளவை",
    total: "மொத்தம்",
    empty: "உங்கள் வண்டி இப்போது காலியாக உள்ளது.",
    continueShopping: "ஷாப்பிங்கை தொடருங்கள்",
    preparing: "கட்டணம் தயார் செய்யப்படுகிறது...",
    proceed: "கட்டணத்திற்கு செல்லுங்கள்",
    paymentMethod: "கட்டண முறையை தேர்வுசெய்க",
    creditCard: "கிரெடிட் கார்டு",
    creditCardDesc: "பாதுகாப்பான அட்டை சரிபார்ப்புடன் விரைவான கட்டணம்.",
    paypalDesc: "பின்புற அமைப்பு இதை செயலாக்கமாக குறித்து நேரடியாக உறுதிப்படுத்துகிறது.",
    cod: "வழங்கும் போது பணம்",
    codDesc: "இப்போது உறுதிப்படுத்து, ஆர்டர் வந்தபோது கட்டணம் செலுத்துங்கள்.",
    verifyMobile: "மொபைல் எண்ணை உறுதிப்படுத்து",
    phoneCopy: "கட்டண உறுதிப்பாட்டிற்கு முன் தொலைபேசி சரிபார்ப்பைப் பயன்படுத்துகிறோம்.",
    phoneNumber: "தொலைபேசி எண்",
    sending: "அனுப்புகிறது...",
    sendOtp: "OTP அனுப்பு",
    enterOtp: "OTP உள்ளிடுக",
    demoCode: "டெமோ குறியீடு:",
    sentToBackend: "பின்புற பதிலுக்கு அனுப்பப்பட்டது",
    verifying: "சரிபார்க்கிறது...",
    verifyOtp: "OTP சரிபார்",
    cardDetails: "அட்டை விவரங்கள்",
    cardCopy: "செயலாக்கத்திற்கு முன் அட்டை தகவல் பின்புறத்தில் சரிபார்க்கப்படுகிறது.",
    cardNumber: "அட்டை எண் (16 இலக்கங்கள்)",
    nameOnCard: "அட்டையில் உள்ள பெயர்",
    expiry: "MM/YY",
    submitting: "சமர்ப்பிக்கிறது...",
    pay: "செலுத்து",
    paypalCheckout: "PayPal கட்டணம்",
    paypalCopy: "PayPal Sandbox இல் ஆர்டரை ஒப்புதல் அளிக்கவும், பின்னர் பின்புறம் அதை பதிவு செய்கிறது.",
    codCopy: "இப்போது ஆர்டரை உறுதிப்படுத்து, வழங்கும் போது கூரியருக்கு கட்டணம் செலுத்துங்கள்.",
    confirmCod: "COD உறுதிப்படுத்து",
    processing: "கட்டணம் செயலாக்கப்படுகிறது",
    processingCopy: "பின்புறத்திலிருந்து சமீபத்திய ஆர்டர் நிலையை சரிபார்க்கிறோம்.",
    confirmed: "ஆர்டர் உறுதிப்படுத்தப்பட்டது",
    completed: "உங்கள் கட்டண செயல்முறை வெற்றிகரமாக முடிந்தது.",
  },
};

export default function CartPage() {
  const navigate = useNavigate();
  const { languageCode } = useTranslation();
  const copy = cartCopy[languageCode] || cartCopy.en;
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
        showStatus(getApiErrorMessage(error));
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
      showStatus(getApiErrorMessage(error));
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
      showStatus(getApiErrorMessage(error));
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
      showStatus(getApiErrorMessage(error));
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
      showStatus(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const renderMethodSelection = () => (
    <>
      <h2>{copy.paymentMethod}</h2>
      <div className="method-item" onClick={() => selectPaymentMethod("card")}>
        <h4>{copy.creditCard}</h4>
        <p>{copy.creditCardDesc}</p>
      </div>
      <div className="method-item" onClick={() => selectPaymentMethod("paypal")}>
        <h4>PayPal</h4>
        <p>{copy.paypalDesc}</p>
      </div>
      <div className="method-item" onClick={() => selectPaymentMethod("cod")}>
        <h4>{copy.cod}</h4>
        <p>{copy.codDesc}</p>
      </div>
    </>
  );

  return (
    <div className="app mobile-screen">
      <div className="cart-page mobile-frame">
        <div className="cart-scroll mobile-panel">
          <div className="nav">
            <div className="cart-top-row">
              <button className="back-btn" aria-label="Go back" onClick={handleBack}>
                <ArrowLeft size={18} />
              </button>

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

            <div className="cart-title-wrap">
              <p className="cart-eyebrow">{copy.checkout}</p>
              <h3 className="cart-heading">{copy.myCart}</h3>
              <p className="cart-subtitle">Review your flowers, confirm totals, and finish checkout with confidence.</p>
            </div>
          </div>

          <div className="cart-summary-card">
            <div className="summary-block">
              <p>{copy.itemsInCart}</p>
              <strong>{cartItems.length}</strong>
            </div>
            <div className="summary-block summary-total">
              <p>{copy.total}</p>
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
                    <div className="item-copy">
                      <span className="item-tag">Plant item</span>
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
                <p>{copy.empty}</p>
                <button className="checkout-btn" onClick={() => navigate("/catalog")}>
                  {copy.continueShopping}
                </button>
              </div>
            )}
          </div>

          {cartItems.length > 0 ? (
            <button className="checkout-btn cart-primary-btn" onClick={beginCheckout} disabled={busy}>
              {busy ? copy.preparing : copy.proceed}
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
                    <h2>{copy.verifyMobile}</h2>
                    <p className="drawer-copy">{copy.phoneCopy}</p>
                    <PhoneInput
                      country="lk"
                      value={phone}
                      onChange={setPhone}
                      enableSearch
                      placeholder={copy.phoneNumber}
                      inputStyle={{ width: "100%", height: "46px", borderRadius: "14px" }}
                      buttonStyle={{ borderRadius: "14px 0 0 14px" }}
                    />
                    <button className="pay-btn" onClick={sendOtp} disabled={busy}>
                      {busy ? copy.sending : copy.sendOtp}
                    </button>
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <h2>{copy.enterOtp}</h2>
                    <p className="drawer-copy">{`${copy.demoCode} ${demoOtp || copy.sentToBackend}`}</p>
                    <input
                      className="input"
                      placeholder={copy.enterOtp}
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                    />
                    <button className="pay-btn" onClick={verifyOtp} disabled={busy}>
                      {busy ? copy.verifying : copy.verifyOtp}
                    </button>
                  </>
                ) : null}

                {step === 3 ? (
                  <>
                    {paymentMethod === "card" ? (
                      <>
                        <h2>{copy.cardDetails}</h2>
                        <p className="drawer-copy">{copy.cardCopy}</p>
                        <input
                          className="input"
                          placeholder={copy.cardNumber}
                          value={card.number}
                          onChange={(event) => setCard({ ...card, number: event.target.value.replace(/\D/g, "") })}
                        />
                        <input
                          className="input"
                          placeholder={copy.nameOnCard}
                          value={card.name}
                          onChange={(event) => setCard({ ...card, name: event.target.value })}
                        />
                        <div className="card-grid">
                          <input
                            className="input"
                            placeholder={copy.expiry}
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
                          {busy ? copy.submitting : `${copy.pay} ${formatPrice(total)}`}
                        </button>
                      </>
                    ) : null}

                    {paymentMethod === "paypal" ? (
                      <>
                        <h2>{copy.paypalCheckout}</h2>
                        <p className="drawer-copy">{copy.paypalCopy}</p>
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
                        <h2>{copy.cod}</h2>
                        <p className="drawer-copy">{copy.codCopy}</p>
                        <button className="pay-btn" onClick={handlePayment} disabled={busy}>
                          {busy ? copy.submitting : `${copy.confirmCod} ${formatPrice(total)}`}
                        </button>
                      </>
                    ) : null}
                  </>
                ) : null}

                {step === 4 ? (
                  <div className="success">
                    <LoaderCircle className="spinner-icon" size={26} />
                    <h2>{copy.processing}</h2>
                    <p>{copy.processingCopy}</p>
                  </div>
                ) : null}

                {step === 5 ? (
                  <div className="success">
                    <h2>{copy.confirmed}</h2>
                    <p>{copy.completed}</p>
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
