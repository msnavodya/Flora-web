import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../menu/menu";
import LanguageSelector from "../language/LanguageSelector";
import "./profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // ================= STATE =================
  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
  });

  // ================= LOAD USER =================
  useEffect(() => {
    // Load user info from localStorage (saved at login/signup)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Set demo user if none exists
      const demoUser = {
        id: "demo-001",
        full_name: "Demo User",
        email: "demo@florana.com"
      };
      setUser(demoUser);
    }
  }, [navigate]);

  return (
    <div className="profile-container">
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <LanguageSelector />

      {/* 🔙 Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>←</button>

      {/* 🔥 Menu Button */}
      <button className="menu-btn" style={{position: "absolute", top: "10px", right: "10px"}} onClick={() => setMenuOpen(true)}>☰</button>

      <h1>Your Profile</h1>

      <div className="profile-card">
        <p><strong>User ID:</strong> {user.id || "00123"}</p>
        <p><strong>Name:</strong> {user.full_name || "Sandy"}</p>
        <p><strong>Email:</strong> {user.email || "sandy@email.com"}</p>
      </div>

      <button
        className="profile-register-btn"
        onClick={() => navigate("/register")}
      >
        ➕ Register New Plant
      </button>

    </div>
  );
}
