import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../menu/menu";
import LanguageSelector from "../language/LanguageSelector";
import { useTranslation } from "../language/LanguageContext";
import "./settings.css";

export default function Settings() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  // ================= STATE =================
  const [fontSize, setFontSize] = useState("Medium");
  const [wateringReminders, setWateringReminders] = useState(true);
  const [diseaseAlerts, setDiseaseAlerts] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(false);

  // ================= LOAD SETTINGS =================
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("florana_settings"));

      if (saved) {
        setFontSize(saved.fontSize ?? "Medium");
        setLanguage(saved.language ?? "English");
        setWateringReminders(saved.wateringReminders ?? true);
        setDiseaseAlerts(saved.diseaseAlerts ?? false);
        setWeeklySummary(saved.weeklySummary ?? false);

        applyFont(saved.fontSize ?? "Medium");
        applyLanguage(saved.language ?? "English");
      } else {
        applyFont("Medium");
        applyLanguage("English");
      }
    } catch (err) {
      console.log(err);
    }

  }, [setLanguage]);

  // ================= APPLY FUNCTIONS =================
  const applyFont = (size) => {
    let value = "16px";
    if (size === "Small") value = "12px";
    if (size === "Large") value = "20px";

    document.documentElement.style.fontSize = value;
  };

  const applyLanguage = (lang) => {
    setLanguage(lang);
  };

  // ================= SAVE =================
  const saveSettings = (updated) => {
    const data = {
      fontSize,
      language,
      wateringReminders,
      diseaseAlerts,
      weeklySummary,
      ...updated,
    };
    localStorage.setItem("florana_settings", JSON.stringify(data));
  };

  // ================= HANDLERS =================
  const handleFontChange = (e) => {
    const value = e.target.value;
    setFontSize(value);
    applyFont(value);
    saveSettings({ fontSize: value });
  };

  const handleLanguageChange = (e) => {
    const value = e.target.value;
    setLanguage(value);
    applyLanguage(value);
    saveSettings({ language: value });
  };

  const toggleWatering = () => {
    const value = !wateringReminders;
    setWateringReminders(value);
    saveSettings({ wateringReminders: value });
  };

  const toggleDisease = () => {
    const value = !diseaseAlerts;
    setDiseaseAlerts(value);
    saveSettings({ diseaseAlerts: value });
  };

  const toggleWeeklySummary = () => {
    const value = !weeklySummary;
    setWeeklySummary(value);
    saveSettings({ weeklySummary: value });
  };

  const handleClearHistory = () => {
    localStorage.removeItem("florana_search_history");
    alert(t("search_history_cleared"));
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:support@florana.com?subject=Help%20Request";
  };

  // ================= UI =================
  return (
    <div className="settings-wrapper">
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <LanguageSelector />
      <div className="settings-container">

        <button className="settings-back" onClick={() => navigate(-1)}>
          ←
        </button>

        {/* Menu button */}
        <button className="menu-btn" style={{position: "absolute", top: "10px", right: "10px", fontSize: "18px", background: "white", color: "#7b55c0"}} onClick={() => setMenuOpen(true)}>
          ☰
        </button>

        <h2 className="settings-title">{t("settings")}</h2>

        <p className="section-title">{t("display")}</p>

        <div className="settings-card">
          <label>{t("font_size")}</label>
          <select value={fontSize} onChange={handleFontChange}>
            <option>Small</option>
            <option>Medium</option>
            <option>Large</option>
          </select>
        </div>

        <div className="settings-card">
          <label>{t("language")}</label>
          <select value={language} onChange={handleLanguageChange}>
            <option>English</option>
            <option>Sinhala</option>
            <option>Tamil</option>
          </select>
        </div>

        <p className="section-title">{t("notifications")}</p>

        <div className="settings-card">
          <label>{t("watering_reminders")}</label>
          <input type="checkbox" checked={wateringReminders} onChange={toggleWatering} />
        </div>

        <div className="settings-card">
          <label>{t("disease_alerts")}</label>
          <input type="checkbox" checked={diseaseAlerts} onChange={toggleDisease} />
        </div>

        <div className="settings-card">
          <label>{t("weekly_summary")}</label>
          <input type="checkbox" checked={weeklySummary} onChange={toggleWeeklySummary} />
        </div>

        <p className="section-title">{t("privacy_security")}</p>

        <div className="settings-card clickable" onClick={handleClearHistory}>
          <label>{t("clear_search_history")}</label>
        </div>

        <p className="section-title">{t("support")}</p>

        <div className="settings-card clickable" onClick={handleContactSupport}>
          <label>{t("contact_support")}</label>
        </div>

      </div>
    </div>
  );
}