import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../language/LanguageContext";
import Menu from "../menu/menu";
import LanguageSelector from "../language/LanguageSelector";
import "./quicktip.css";

const tipOptions = [
  { key: "soil", title: "Soil Tips", tip: "Use well-draining soil.", detail: "Helps prevent root rot and keeps roots healthy." },
  { key: "sunlight", title: "Sunlight Tips", tip: "Place in indirect sunlight.", detail: "Avoid harsh noon sun for most indoor tropical plants." },
  { key: "watering", title: "Watering Tips", tip: "Water deeply once a week.", detail: "Ensure excess water drains to avoid soggy roots." },
  { key: "fertilizer", title: "Fertilizer Tips", tip: "Use organic fertilizer every 2 weeks.", detail: "Supports growth without chemical buildup." },
  { key: "pest", title: "Pest Control Tips", tip: "Check leaves for insects weekly.", detail: "Early detection prevents infestations." },
  { key: "seasonal", title: "Seasonal Care Tips", tip: "Reduce watering during winter.", detail: "Plants often go into rest mode when cooler." },
  { key: "diy", title: "DIY Hacks", tip: "Use coffee grounds for soil enrichment.", detail: "Mix into compost for extra nutrients; don’t overdo it." },
  { key: "pairing", title: "Plant Pairing Tips", tip: "Group plants with similar water needs.", detail: "This avoids over/under-watering issues for pets." },
];

export default function QuickTip() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTipKey, setActiveTipKey] = useState("soil");

  const activeTip = tipOptions.find((item) => item.key === activeTipKey) || tipOptions[0];

  return (
    <div className="quick-tip-container">
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <LanguageSelector />
      <div className="quick-tip-card">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <button className="menu-btn" style={{position: "absolute", top: "12px", right: "12px"}} onClick={() => setMenuOpen(true)}>☰</button>
        <h2>{t("quick_tip")}</h2>

        <div className="tips-list">
          {tipOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setActiveTipKey(option.key)}
              className={`tip-chip ${activeTipKey === option.key ? "active" : ""}`}
            >
              {option.title}
            </button>
          ))}
        </div>

        <div className="tip-detail-box">
          <p className="tip-text">{activeTip.tip}</p>
          <p className="tip-details">{activeTip.detail}</p>
        </div>
      </div>
    </div>
  );
}
