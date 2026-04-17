import React from "react";
import { useNavigate } from "react-router-dom";
import "./menu.css";

import logo from "../Assets/floranalogo.jpg";

export default function Menu({ isOpen, onClose }) {
  const navigate = useNavigate();

  // Navigate to a route and close menu
  const goTo = (path) => {
    navigate(path);
    onClose();
  };

  // Menu items array
  const menuItems = [
    { path: "/home", label: "Home", icon: "🏠" },
    { path: "/profile", label: "Profile", icon: "👤" },
    { path: "/catalog", label: "Catalog", icon: "📚" },
    { path: "/myplants", label: "My Plants", icon: "🪴" },
    { path: "/care", label: "Care Reminder", icon: "⏰" },
    { path: "/quicktip", label: "Quick Tip", icon: "💡" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
    { path: "/about", label: "About", icon: "ℹ️" },
    { path: "/help", label: "Help", icon: "❓" },
    { path: "/feedback", label: "Feedback", icon: "✉️" },
  ];

  return (
    <div className={`menu-overlay ${isOpen ? "show" : ""}`} onClick={onClose}>
      <div
        className={`menu-container ${isOpen ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="back-btn" onClick={onClose}>←</button>

        {/* HEADER */}
        <div className="menu-header">
          <img src={logo} alt="Florana Logo" className="menu-logo" />
          <h2 className="menu-title">Menu</h2>
        </div>

        {/* MENU ITEMS */}
        <div className="menu-items">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className="menu-item"
              onClick={() => goTo(item.path)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* LOGOUT */}
          <button
            onClick={() => goTo("/")}
            className="menu-item logout"
          >
            <span className="icon">⏻</span>
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}
