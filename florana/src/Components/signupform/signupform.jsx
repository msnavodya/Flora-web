import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { signupUser } from "../../api";
import logo from "../Assets/florana.jpg";
import googleLogo from "../Assets/google.jpg";
import "./signupform.css";


export default function SignUpForm() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const saveSession = (data) => {
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
    }

    if (data.user) {
      const normalizedUser = {
        ...data.user,
        id: data.user.id || data.user._id || "",
      };
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    }
  };

  const handleSignup = async () => {
    setErrorMessage("");
    const normalizedFullName = fullName.trim();
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();
    const normalizedContact = contact.trim();
    const normalizedLocation = location.trim();

    if (!normalizedFullName || !normalizedEmail || !normalizedPassword) {
      setErrorMessage("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await signupUser({
        full_name: normalizedFullName,
        email: normalizedEmail,
        password: normalizedPassword,
        contact: normalizedContact || null,
        location: normalizedLocation || null,
      });

      saveSession(response.data);
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Signup Error:", error);
      const detail = error.response?.data?.detail;
      setErrorMessage(
        Array.isArray(detail)
          ? detail.map((err) => err.msg || JSON.stringify(err)).join(", ")
          : detail || "Cannot connect to backend server!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="phone-frame">
        <div className="signup-card">
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>

          <div className="auth-header">
            <img src={logo} alt="Florana Logo" className="signup-logo" />
            <p className="auth-kicker">Create Account</p>
          </div>

          {errorMessage ? <p className="auth-message auth-error">{errorMessage}</p> : null}

          <div className="signup-form">
            <label className="auth-field">
              <span>Full name</span>
              <input
                type="text"
                className="input-field"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </label>
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                className="input-field"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="auth-field">
              <span>Contact number</span>
              <input
                type="tel"
                className="input-field"
                placeholder="Phone number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </label>
            <label className="auth-field">
              <span>Location</span>
              <select className="input-field" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">Select Location</option>
                <option value="Colombo">Colombo</option>
                <option value="Gampaha">Gampaha</option>
                <option value="Kandy">Kandy</option>
                <option value="Galle">Galle</option>
                <option value="Kurunegala">Kurunegala</option>
                <option value="Jaffna">Jaffna</option>
                <option value="Matara">Matara</option>
                <option value="Negombo">Negombo</option>
                <option value="Batticaloa">Batticaloa</option>
              </select>
            </label>
          </div>

          <button className="signup-btn" onClick={handleSignup} disabled={loading}>
            {loading ? "Signing Up..." : "SIGN UP"}
          </button>

          <div className="or-text">OR CONTINUE WITH</div>

          <button type="button" className="google-btn" onClick={() => window.open("https://accounts.google.com/signin", "_blank")}>
            <img src={googleLogo} alt="Google Logo" className="google-icon" />
            Google
          </button>

          <p className="login-text">
            Already with Florana?{" "}
            <span className="login-link" onClick={() => navigate("/signin")}>
              SIGN IN
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
