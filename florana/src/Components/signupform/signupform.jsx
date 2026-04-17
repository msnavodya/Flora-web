import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signupform.css";

import logo from "../Assets/florana.jpg";
import googleLogo from "../Assets/google.jpg";

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

    if (!fullName || !email || !password) {
      setErrorMessage("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          contact: contact || null,
          location: location || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        saveSession(data);
        navigate("/home", { replace: true });
      } else if (Array.isArray(data.detail)) {
        setErrorMessage(
          data.detail.map((err) => err.msg || JSON.stringify(err)).join(", ")
        );
      } else if (typeof data.detail === "string") {
        setErrorMessage(data.detail);
      } else {
        setErrorMessage("Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      setErrorMessage("Cannot connect to backend server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="phone-frame">
        <div className="signup-card">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ←
          </button>

          <img src={logo} alt="Florana Logo" className="signup-logo" />

          {errorMessage && (
            <p style={{ color: "red", fontSize: "14px" }}>{errorMessage}</p>
          )}

          <input
            type="text"
            className="input-field"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="email"
            className="input-field"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="tel"
            className="input-field"
            placeholder="Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
          <select
            className="input-field"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
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

          <button className="signup-btn" onClick={handleSignup} disabled={loading}>
            {loading ? "Signing Up..." : "SIGN UP"}
          </button>

          <div className="or-text">OR</div>

          <button
            className="google-btn"
            onClick={() =>
              window.open("https://accounts.google.com/signin", "_blank")
            }
          >
            <img src={googleLogo} alt="Google Logo" className="google-icon" />
            CONTINUE WITH GOOGLE
          </button>

          <p className="login-text">
            Already have an account?{" "}
            <span className="login-link" onClick={() => navigate("/signin")}>
              LOGIN
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
