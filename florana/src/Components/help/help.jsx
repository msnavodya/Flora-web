import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../language/LanguageContext";
import Menu from "../menu/menu";
import LanguageSelector from "../language/LanguageSelector";
import "./help.css";
import logo from "../Assets/floranalogo.jpg";

export default function Help() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="help-wrapper">
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <LanguageSelector />
      <div className="help-container">

        {/* ===== BACK BUTTON ===== */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>

        {/* ===== MENU BUTTON ===== */}
        <button className="menu-btn" onClick={() => setMenuOpen(true)}>
          ☰
        </button>

        {/* ===== APP LOGO ===== */}
        <img src={logo} alt="Florana Logo" className="help-logo" />

        {/* ===== PAGE TITLE ===== */}
        <h2 className="help-title">{t("help_support")}</h2>

        {/* ===== HELP CARDS ===== */}
        <div className="card help-card">
          <h3>🔧 {t("app_not_working")}</h3>
          <p>{t("app_restart_hint")}</p>
        </div>

        <div className="card help-card">
          <h3>📩 {t("contact_support_card")}</h3>
          <p>Email: support@florana.com</p>
        </div>

        <div className="card help-card">
          <h3>📘 {t("faq_center")}</h3>
          <p>{t("share_your_thoughts")}</p>
        </div>

      </div>
    </div>
  );
}
