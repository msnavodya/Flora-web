import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import Menu from "../menu/menu";
import "react-phone-input-2/lib/style.css";
import "./cartPage.css";

export default function CartPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  const [step, setStep] = useState(0); // 0=choose method,1=phone,2=OTP,3=payment,4=success

  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });

  /* Currency */
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "LKR");
  const [rates] = useState({ LKR: 1, USD: 0.0033, EUR: 0.003 });

  // Load cart
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart")) || [{ id: 1, name: "Shoe Flower", price: 2000 }];
    setCartItems(saved);
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  const convertPrice = (price) => (price * rates[currency]).toFixed(2);

  const handleBack = () => {
    if (showPayment) step > 0 ? setStep(step - 1) : setShowPayment(false);
    else window.history.back();
  };

  // 📱 Phone validation for real-world formats
  const isValidPhone = (phone) => {
    // SL phone: 10 digits (starts with 7, 6, or 0 for demo purposes)
    const slRegex = /^7\d{8}$|^0\d{9}$/;
    const usRegex = /^\d{10}$/;
    if (phone.startsWith("94")) {
      return slRegex.test(phone.slice(2));
    } else if (phone.startsWith("1")) {
      return usRegex.test(phone);
    }
    return phone.length >= 8; // fallback
  };

  // Send OTP
  const sendOtp = () => {
    if (!isValidPhone(phone)) return alert("Enter a valid phone number!");
    const otpCode = Math.floor(1000 + Math.random() * 9000);
    setGeneratedOtp(otpCode.toString());
    alert(`OTP sent: ${otpCode}`); // demo only
    setStep(2);
  };

  // Verify OTP
  const verifyOtp = () => {
    if (otp === generatedOtp) setStep(3);
    else alert("Invalid OTP!");
  };

  // Card validation
  const validateCard = () => {
    const { number, name, expiry, cvv } = card;
    if (!number.match(/^\d{16}$/)) return alert("Card number must be 16 digits");
    if (!name) return alert("Enter cardholder name");
    if (!expiry.match(/^\d{2}\/\d{2}$/)) return alert("Expiry must be MM/YY");
    if (!cvv.match(/^\d{3,4}$/)) return alert("CVV must be 3 or 4 digits");
    return true;
  };

  const handlePayment = () => {
    if (paymentMethod === "card" && !validateCard()) return;
    setStep(4);
    setTimeout(() => {
      localStorage.removeItem("cart");
      setCartItems([]);
      setShowPayment(false);
      setStep(0);
    }, 2000);
  };

  return (
    <div className="app">
      <div className="cart-page" style={{ width: "350px", minHeight: "700px" }}>
        <div className="nav">
          <button className="back-btn" onClick={handleBack}>←</button>
          <h3 className="cart-heading">My Cart</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <select
              className="currency-mini"
              value={currency}
              onChange={(e) => { setCurrency(e.target.value); localStorage.setItem("currency", e.target.value); }}
            >
              <option value="LKR">Rs</option>
              <option value="USD">$</option>
              <option value="EUR">€</option>
            </select>
            <button className="menu-btn" onClick={() => setMenuOpen(true)}>☰</button>
          </div>
        </div>

        <div className="cart-box">
          {cartItems.map(item => (
            <div key={item.id} className="item">
              <h4>{item.name}</h4>
              <p>
                {currency === "LKR" ? "Rs. " : currency === "USD" ? "$ " : "€ "}
                {convertPrice(item.price)}
              </p>
            </div>
          ))}
        </div>

        <h2>Total: {currency === "LKR" ? "Rs. " : currency === "USD" ? "$ " : "€ "} {convertPrice(total)}</h2>

        <button className="checkout-btn" onClick={() => setShowPayment(true)}>Proceed to Payment 💳</button>

        {showPayment && (
          <div className="overlay">
            <div className="overlay-bg" onClick={() => setShowPayment(false)} />
            <div className="payment-drawer">
              {/* STEP 0: Payment Method */}
              {step === 0 && (
                <>
                  <h2>Select Payment Method</h2>
                  <div className="method-item" onClick={() => { setPaymentMethod("card"); setStep(1); }}><h4>Credit Card</h4></div>
                  <div className="method-item" onClick={() => { setPaymentMethod("paypal"); setStep(1); }}><h4>PayPal</h4></div>
                  <div className="method-item" onClick={() => { setPaymentMethod("cod"); setStep(1); }}><h4>Cash on Delivery</h4></div>
                </>
              )}

              {/* STEP 1: PHONE INPUT */}
              {step === 1 && (
                <>
                  <h2>Enter Your Phone</h2>
                  <PhoneInput
                    country="lk"
                    value={phone}
                    onChange={setPhone}
                    enableSearch
                    placeholder="Phone number"
                    inputStyle={{ width: "100%" }}
                  />
                  <button className="pay-btn" onClick={sendOtp}>Send OTP 📩</button>
                </>
              )}

              {/* STEP 2: OTP */}
              {step === 2 && (
                <>
                  <h2>Verify OTP</h2>
                  <input className="input" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} />
                  <button className="pay-btn" onClick={verifyOtp}>Verify ✅</button>
                </>
              )}

              {/* STEP 3: PAYMENT */}
              {step === 3 && (
                <>
                  {paymentMethod === "card" && (
                    <>
                      <h2>Card Details</h2>
                      <input className="input" placeholder="Card Number (16 digits)" value={card.number} onChange={e => setCard({ ...card, number: e.target.value.replace(/\D/g,"") })} />
                      <input className="input" placeholder="Name on Card" value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} />
                      <input className="input" placeholder="MM/YY" value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} />
                      <input className="input" placeholder="CVV" value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g,"") })} />
                      <button className="pay-btn" onClick={handlePayment}>Pay {currency === "LKR" ? "Rs. " : currency === "USD" ? "$ " : "€ "}{convertPrice(total)} 💳</button>
                    </>
                  )}

                  {paymentMethod === "paypal" && <button className="pay-btn" onClick={handlePayment}>PayPal Pay {convertPrice(total)}</button>}
                  {paymentMethod === "cod" && <button className="pay-btn" onClick={handlePayment}>Cash on Delivery {convertPrice(total)}</button>}
                </>
              )}

              {/* STEP 4: SUCCESS */}
              {step === 4 && (
                <div className="success">
                  <h2>✅ Payment Successful!</h2>
                  <p>Thank you for your order.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}