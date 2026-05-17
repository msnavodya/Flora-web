import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getApiErrorMessage, loginUser } from "../../api";
import logo from "../Assets/florana.jpg";
import googleLogo from "../Assets/google.jpg";
import "./signinform.css";


export default function SignInForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser(normalizedEmail, normalizedPassword);

      if (response?.status === 200 && response.data?.access_token) {
        saveSession(response.data);
        setSuccessMessage("Login successful! Redirecting...");
        navigate("/home", { replace: true });
        return;
      }

      const data = response?.data || {};
      const detail = data.detail || data.message || "Login failed.";
      setErrorMessage(Array.isArray(detail) ? detail.map((err) => err.msg || JSON.stringify(err)).join(", ") : detail);
    } catch (error) {
      console.error("Login Error:", error);
      if (error.response?.status === 401) {
        setErrorMessage("Invalid email or password. If this is a new account, sign up first.");
      } else {
        setErrorMessage(getApiErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>

        <div className="auth-header">
          <img src={logo} alt="Flora Web Logo" className="signin-logo" />
          <p className="auth-kicker">Welcome Back</p>
          <h1>Sign in to your garden.</h1>
          <p className="auth-subtitle">Access real-time plant tracking, diagnoses, reminders, and shop updates.</p>
        </div>

        {errorMessage ? <p className="auth-message auth-error">{errorMessage}</p> : null}
        {successMessage ? <p className="auth-message auth-success">{successMessage}</p> : null}

        <form className="signin-form" onSubmit={handleLogin}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "LOG IN"}
          </button>
        </form>

        <div className="or-text">OR CONTINUE WITH</div>

        <button type="button" className="google-btn" onClick={() => window.open("https://accounts.google.com/signin", "_blank")}>
          <img src={googleLogo} alt="Google logo" className="google-icon" />
          Google
        </button>

        <p className="signup-text">
          New to Flora Web?{" "}
          <span className="signup-link" onClick={() => navigate("/signup")}>
            SIGN-UP
          </span>
        </p>
      </div>
    </div>
  );
}
