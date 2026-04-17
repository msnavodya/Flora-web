import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api";
import "./signinform.css";

import logo from "../Assets/florana.jpg";
import googleLogo from "../Assets/google.jpg";

export default function SignInForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= SAVE SESSION =================
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

  // ================= HANDLE LOGIN =================
  const handleLogin = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser(email, password);
      console.log("Login response:", response);

      if (response?.status === 200 && response.data?.access_token) {
        saveSession(response.data);

        setSuccessMessage("Login successful! Redirecting...");
        setErrorMessage("");

        navigate("/home", { replace: true });

        // fallback safety redirect
        setTimeout(() => {
          if (window.location.pathname !== "/home") {
            window.location.href = "/home";
          }
        }, 300);

        return;
      }

      const data = response?.data || {};
      const detail = data.detail || data.message || "Login failed.";

      setErrorMessage(
        Array.isArray(detail)
          ? detail.map((err) => err.msg || JSON.stringify(err)).join(", ")
          : detail
      );
    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        const errData = error.response.data;
        setErrorMessage(
          errData?.detail ||
            errData?.message ||
            "Login failed. Please check your email and password."
        );
      } else {
        setErrorMessage(
          "Unable to connect to the backend. Please ensure the API server is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="signin-container">
      <div className="signin-card">

        {/* Back Button */}
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ←
        </button>

        {/* Logo */}
        <img src={logo} alt="Florana Logo" className="signin-logo" />

        {/* Messages */}
        {errorMessage && (
          <p style={{ color: "red", fontSize: "14px" }}>
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p style={{ color: "#0f5132", fontSize: "14px" }}>
            {successMessage}
          </p>
        )}

        {/* Form */}
        <form className="signin-form" onSubmit={handleLogin}>
          <input
            type="email"
            className="input-field"
            placeholder="Email address"
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

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "LOG IN"}
          </button>
        </form>

        {/* OR Divider */}
        <div className="or-text">OR</div>

        {/* Google Login */}
        <button
          className="google-btn"
          onClick={() =>
            window.open("https://accounts.google.com/signin", "_blank")
          }
        >
          <img src={googleLogo} alt="Google logo" className="google-icon" />
          CONTINUE WITH GOOGLE
        </button>

        {/* SIGN-UP (NOW REDIRECTS TO HOME) */}
        <p className="signup-text">
          Create a new account{" "}
          <span
            className="signup-link"
            onClick={() => navigate("/home")}
            style={{ cursor: "pointer", fontWeight: "bold" }}
          >
            SIGN-UP
          </span>
        </p>

      </div>
    </div>
  );
}