import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../language/LanguageContext";
import "./home.css";
import logo from "../Assets/floranalogo.jpg";
import Menu from "../menu/menu";
import LanguageSelector from "../language/LanguageSelector";

export default function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const { t } = useTranslation();

  // ================= GET USER (FIXED) =================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("User parse error:", error);
        localStorage.removeItem("user");
      }
    } else {
      // allow guest user instead of redirecting
      setUser(null);
    }
  }, []);

  // ================= LOAD FEEDBACK =================
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("feedbacks") || "[]");
      setFeedbacks(saved);
    } catch {
      setFeedbacks([]);
    }
  }, []);

  // ================= SLIDER FIX =================
  useEffect(() => {
    if (feedbacks.length === 0) {
      setCurrentFeedbackIndex(0);
    } else if (currentFeedbackIndex >= feedbacks.length) {
      setCurrentFeedbackIndex(feedbacks.length - 1);
    }
  }, [feedbacks, currentFeedbackIndex]);

  // ================= SWIPE =================
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0 && currentFeedbackIndex < feedbacks.length - 1) {
        setCurrentFeedbackIndex((prev) => prev + 1);
      } else if (distance < 0 && currentFeedbackIndex > 0) {
        setCurrentFeedbackIndex((prev) => prev - 1);
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const nextFeedback = () => {
    setCurrentFeedbackIndex((prev) =>
      prev < feedbacks.length - 1 ? prev + 1 : 0
    );
  };

  const prevFeedback = () => {
    setCurrentFeedbackIndex((prev) =>
      prev > 0 ? prev - 1 : feedbacks.length - 1
    );
  };

  // ================= IMAGE SCAN =================
  const handleScan = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const { prediction, confidence } = data;

        const isHealthy = prediction === "Healthy Plant 🌿";
        const status = isHealthy
          ? "Healthy Plant 🌿"
          : "Unhealthy Plant - Disease Detected";

        setDiagnosis(
          `${status} (${prediction}) - Confidence: ${confidence}%`
        );
      } else {
        setDiagnosis(
          `❌ Error: ${data.detail || response.statusText}`
        );
      }
    } catch (error) {
      setDiagnosis("❌ Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">

      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <LanguageSelector />

      {/* HEADER */}
      <div className="top-header">
        <div className="header-left">
          <img src={logo} alt="Florana Logo" className="header-logo" />
          <h3 className="header-title">
            {user ? t("hello_user", { name: user.full_name }) : t("hello_guest")}
          </h3>
        </div>

        <button className="menu-btn" onClick={() => setMenuOpen(true)}>
          ☰
        </button>
      </div>

      {/* FILE INPUT */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleScan}
        accept="image/*"
      />

      {/* SEARCH */}
      <div className="search-box">
        <input type="text" placeholder={t("search_placeholder")} />
        <button className="search-icon">🔍</button>
      </div>

      {/* RESULT */}
      {diagnosis && (
        <div className="diagnosis-alert">
          <strong>Result: {diagnosis}</strong>
          <button onClick={() => setDiagnosis(null)}>×</button>
        </div>
      )}

      {/* CARDS */}
      <h2 className="section-title">{t("todays_insights")}</h2>

      <div className="cards-grid">
        <div className="card yellow" onClick={() => fileInputRef.current.click()}>
          <h4>{t("diagnose")}</h4>
          <p>{loading ? t("analyzing") : t("tap_to_scan_leaf")}</p>
        </div>

        <div className="card purple" onClick={() => navigate("/feedback")}>
          <h4>{t("feedback_card")}</h4>
          <p>{t("reviews", { count: feedbacks.length })}</p>
        </div>

        <div className="card green" onClick={() => navigate("/care") }>
          <h4>{t("care_reminder_card")}</h4>
          <p>Water Monstera.</p>
        </div>

        <div className="card blue" onClick={() => navigate("/quicktip") }>
          <h4>{t("quick_tip_card")}</h4>
          <p>Use well-draining soil.</p>
        </div>
      </div>

      {/* FEEDBACK SLIDESHOW */}
      <div className="home-feedback-box">
        <div className="feedback-header">
          <h3>User Feedback</h3>
          {feedbacks.length > 0 && (
            <span className="feedback-count">
              {currentFeedbackIndex + 1}/{feedbacks.length}
            </span>
          )}
        </div>

        {feedbacks.length === 0 ? (
          <div className="no-feedback-box">
            <p>🌿 No feedback yet</p>
          </div>
        ) : (
          <div className="feedback-slideshow">
            {/* Navigation Buttons */}
            <button
              className="slide-btn prev"
              onClick={prevFeedback}
              disabled={feedbacks.length <= 1}
            >
              ‹
            </button>

            {/* Slideshow Container */}
            <div className="slideshow-container">
              <div
                className="feedback-track"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{
                  transform: `translateX(-${currentFeedbackIndex * 100}%)`,
                  transition: "transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                }}
              >
                {feedbacks.map((entry, idx) => (
                  <div key={entry.id} className="feedback-slide">
                    <div className="feedback-card">
                      <div className="feedback-content">
                        <p className="feedback-msg">{entry.message}</p>
                        {entry.rating && (
                          <div className="feedback-stars">
                            {"⭐".repeat(entry.rating)}
                          </div>
                        )}
                      </div>
                      <small className="feedback-date">
                        {entry.timestamp || "Just now"}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <button
              className="slide-btn next"
              onClick={nextFeedback}
              disabled={feedbacks.length <= 1}
            >
              ›
            </button>

            {/* Dot Indicators */}
            {feedbacks.length > 1 && (
              <div className="feedback-dots">
                {feedbacks.map((_, idx) => (
                  <button
                    key={idx}
                    className={`dot ${idx === currentFeedbackIndex ? "active" : ""}`}
                    onClick={() => setCurrentFeedbackIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}