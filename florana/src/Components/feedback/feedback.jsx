import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleHelp, Mail, Menu as MenuIcon } from "lucide-react";
import { useTranslation } from "../language/LanguageContext";
import Menu from "../menu/menu";
import logo from "../Assets/floranalogo.jpg";
import { MobileActionButton, MobilePage, MobileSection } from "../mobile/MobilePage";
import "./feedback.css";

export default function Feedback() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("");

  const showStatus = (message) => {
    setStatus(message);
    window.clearTimeout(window.floranaFeedbackStatusTimer);
    window.floranaFeedbackStatusTimer = window.setTimeout(() => setStatus(""), 2400);
  };

  const handleSubmit = () => {
    if (!feedback.trim()) {
      showStatus("Write your feedback first.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      rating,
      message: feedback.trim(),
      createdAt: new Date().toISOString(),
      timestamp: new Date().toLocaleString(),
    };

    const saved = JSON.parse(localStorage.getItem("feedbacks") || "[]");
    saved.unshift(newEntry);
    localStorage.setItem("feedbacks", JSON.stringify(saved));
    window.dispatchEvent(new Event("florana-feedback-updated"));

    showStatus("Feedback saved.");
    setFeedback("");
    setRating(0);
  };

  return (
    <>
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <MobilePage
        pageClassName="feedback-wrapper"
        surfaceClassName="feedback-container"
        title={t("feedback_card")}
        subtitle="Send a rating, save your notes, or jump to support."
        rightActions={
          <button className="menu-btn app-icon-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <MenuIcon size={18} />
          </button>
        }
      >
        <div className="feedback-scroll-view">
          <img src={logo} alt="Flora Web Logo" className="feedback-logo" />

          {status ? <div className="feedback-status">{status}</div> : null}

          <MobileSection className="card support-card">
            <h3>{t("contact_support_card")}</h3>
            <div className="support-list">
              <button
                className="support-item support-button"
                onClick={() => {
                  window.location.href = "mailto:support@florana.com?subject=Flora%20Web%20Support";
                }}
              >
                <Mail size={16} />
                <span>{t("email_support")}</span>
              </button>
              <button className="support-item support-button" onClick={() => navigate("/help")}>
                <CircleHelp size={16} />
                <span>{t("faq_center")}</span>
              </button>
              <button className="support-item support-button" onClick={() => navigate("/settings")}>
                <span className="support-item-badge">+</span>
                <span>{t("call_us")}</span>
              </button>
            </div>
          </MobileSection>

          <MobileSection className="card thoughts-card">
            <h3>{t("share_your_thoughts")}</h3>
            <p>{t("rate_app")}</p>

            <div className="stars" role="group" aria-label="App rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={star <= rating ? "star filled" : "star"}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} stars`}
                >
                  {star}
                </button>
              ))}
            </div>

            <MobileActionButton className="secondary" onClick={() => navigate("/about")}>
              Open About Flora Web
            </MobileActionButton>

            <textarea
              className="feedback-input"
              placeholder={t("type_feedback")}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            <MobileActionButton onClick={handleSubmit}>{t("submit_feedback")}</MobileActionButton>
          </MobileSection>
        </div>
      </MobilePage>
    </>
  );
}
