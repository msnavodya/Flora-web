import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Menu as MenuIcon, MessageSquareText, Sparkles } from "lucide-react";
import { useTranslation } from "../language/LanguageContext";
import Menu from "../menu/menu";
import logo from "../Assets/floranalogo.jpg";
import { MobileActionButton, MobilePage, MobileSection } from "../mobile/MobilePage";
import "./help.css";

export default function Help() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <MobilePage
        pageClassName="help-wrapper"
        surfaceClassName="help-container"
        title={t("help_support")}
        subtitle="Support, quick fixes, and direct contact in one place."
        rightActions={
          <button className="menu-btn app-icon-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <MenuIcon size={18} />
          </button>
        }
      >
        <div className="help-scroll-view">
          <img src={logo} alt="Florana Logo" className="help-logo" />

          <MobileSection className="help-card">
            <div className="help-card-heading">
              <Sparkles size={18} />
              <h3>{t("app_not_working")}</h3>
            </div>
            <p>{t("app_restart_hint")}</p>
            <MobileActionButton onClick={() => navigate("/quicktip")}>Open Quick Tip</MobileActionButton>
          </MobileSection>

          <MobileSection className="help-card">
            <div className="help-card-heading">
              <Mail size={18} />
              <h3>{t("contact_support_card")}</h3>
            </div>
            <p>Email: support@florana.com</p>
            <MobileActionButton
              onClick={() => {
                window.location.href = "mailto:support@florana.com?subject=Florana%20Support";
              }}
            >
              Contact Support
            </MobileActionButton>
          </MobileSection>

          <MobileSection className="help-card">
            <div className="help-card-heading">
              <MessageSquareText size={18} />
              <h3>{t("faq_center")}</h3>
            </div>
            <p>{t("share_your_thoughts")}</p>
            <MobileActionButton className="secondary" onClick={() => navigate("/feedback")}>
              Send Feedback
            </MobileActionButton>
          </MobileSection>
        </div>
      </MobilePage>
    </>
  );
}
