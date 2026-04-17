import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../menu/menu";
import LanguageSelector from "../language/LanguageSelector";
import floranaLogo from "../Assets/floranalogo.jpg"; // adjust path if needed
import "./aboutus.css";

export default function AboutUs() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="about-wrapper">
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <LanguageSelector />
      <div className="about-container">

        {/* Back button (same style as other screens) */}
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>

        {/* Menu button */}
        <button className="menu-btn" onClick={() => setMenuOpen(true)}>☰</button>

        {/* Title */}
        <h2 className="about-title">About Us</h2>

        {/* Logo */}
        <div className="about-logo-box">
          <img src={floranaLogo} alt="Florana Logo" className="about-logo" />
        </div>

        {/* Short description (centered like your Figma) */}
        <p className="about-description">
          Florana is your personal digital plant companion designed to help you monitor,
          maintain, and grow your plants with ease. Our mission is to create a simple,
          beautiful, and smart solution for plant care — whether you're a beginner or an
          experienced plant lover.
        </p>

        {/* Info / Vision card */}
        <div className="about-info-card">
          <h3>Our Vision</h3>
          <p>
            To make plant care effortless, enjoyable, and accessible to everyone. We
            aim to blend smart technology with nature to help your plants grow healthier.
          </p>
        </div>

        {/* Developed by / version */}
        <div className="about-footer">
          <h3>Developed By</h3>
          <p className="team-text">Florana Development Team</p>
          <p className="about-version">Version 1.0.0</p>
        </div>

      </div>
    </div>
  );
}
