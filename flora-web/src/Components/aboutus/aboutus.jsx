import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleHelp, Info, Menu as MenuIcon, MessageSquareText } from "lucide-react";
import floranaLogo from "../Assets/floranalogo.jpg";
import { useTranslation } from "../language/LanguageContext";
import Menu from "../menu/menu";
import { MobileActionButton, MobilePage, MobileSection } from "../mobile/MobilePage";
import "./aboutus.css";

const aboutCopy = {
  en: {
    title: "About Us",
    description:
      "Flora Web is your personal digital plant companion designed to help you monitor, maintain, and grow your plants with ease. Our mission is to create a simple, beautiful, and smart solution for plant care whether you're a beginner or an experienced plant lover.",
    visionTitle: "Our Vision",
    visionText:
      "To make plant care effortless, enjoyable, and accessible to everyone. We aim to blend smart technology with nature to help your plants grow healthier.",
    developedBy: "Developed By",
    team: "Flora Web Development Team",
    version: "Version 1.0.0",
  },
  si: {
    title: "à¶…à¶´ à¶œà·à¶±",
    description:
      "Florana à¶ºà¶±à·” à¶”à¶¶à¶œà·š à¶´à·à¶½ à¶´à·„à·ƒà·”à·€à·™à¶±à·Š à¶±à·’à¶»à·“à¶šà·Šà·‚à¶«à¶º à¶šà·’à¶»à·“à¶¸à¶§, à¶´à·€à¶­à·Šà·€à· à¶œà·à¶±à·“à¶¸à¶§ à·ƒà·„ à·€à¶»à·Šà¶°à¶±à¶º à¶šà·’à¶»à·“à¶¸à¶§ à¶‹à¶´à¶šà·à¶»à·“ à·€à¶± à¶”à¶¶à¶œà·š à¶´à·”à¶¯à·Šà¶œà¶½à·’à¶š à¶©à·’à¶¢à·’à¶§à¶½à·Š à¶´à·à¶½ à¶¸à·’à¶­à·”à¶»à·à¶ºà·’. à¶…à¶´à¶œà·š à¶¸à·™à·„à·™à·€à¶» à·€à¶±à·Šà¶±à·š à¶†à¶»à¶¸à·Šà¶·à¶šà¶ºà·™à¶šà·” à·„à· à¶´à·…à¶´à·”à¶»à·”à¶¯à·” à¶´à·à¶½ à¶†à¶¯à¶»à·€à¶±à·Šà¶­à¶ºà·™à¶šà·” à·€à·”à·€à¶¯ à¶´à·à¶½ à·ƒà·”à¶»à·à¶šà·“à¶¸ à·ƒà¶³à·„à· à·ƒà¶»à¶½, à¶½à·ƒà·Šà·ƒà¶± à·ƒà·„ à¶¶à·”à¶¯à·Šà¶°à·’à¶¸à¶­à·Š à·€à·’à·ƒà¶³à·”à¶¸à¶šà·Š à¶±à·’à¶»à·Šà¶¸à·à¶«à¶º à¶šà·’à¶»à·“à¶¸à¶ºà·’.",
    visionTitle: "à¶…à¶´à¶œà·š à¶¯à·à¶šà·Šà¶¸",
    visionText:
      "à¶´à·à¶½ à¶»à·à¶šà¶¶à¶½à· à¶œà·à¶±à·“à¶¸ à·ƒà·‘à¶¸ à¶šà·™à¶±à·™à¶šà·”à¶§à¶¸ à¶´à·„à·ƒà·”, à¶»à·ƒà·€à¶­à·Š à·ƒà·„ à¶´à·Šâ€à¶»à·€à·šà· à·€à·’à¶º à·„à·à¶šà·’ à¶¯à·™à¶ºà¶šà·Š à¶¶à·€à¶§ à¶´à¶­à·Š à¶šà·’à¶»à·“à¶¸à¶ºà·’. à¶”à¶¶à¶œà·š à¶´à·à¶½ à·€à¶©à· à·ƒà·žà¶›à·Šâ€à¶º à·ƒà¶¸à·Šà¶´à¶±à·Šà¶±à·€ à·€à¶»à·Šà¶°à¶±à¶º à·€à·“à¶¸à¶§ à·ƒà·Šà·€à¶·à·à·€à¶º à·„à· à¶¶à·”à¶¯à·Šà¶°à·’à¶¸à¶­à·Š à¶­à·à¶šà·Šà·‚à¶«à¶º à¶‘à¶šà¶§ à¶œà·™à¶± à¶’à¶¸ à¶…à¶´à¶œà·š à¶…à¶»à¶¸à·”à¶«à¶ºà·’.",
    developedBy: "à·ƒà¶‚à·€à¶»à·Šà¶°à¶±à¶º à¶šà·…à·š",
    team: "Florana à·ƒà¶‚à·€à¶»à·Šà¶°à¶± à¶šà¶«à·Šà¶©à·à¶ºà¶¸",
    version: "à¶…à¶±à·”à·€à·à¶¯à¶º 1.0.0",
  },
  ta: {
    title: "à®Žà®™à¯à®•à®³à¯ˆ à®ªà®±à¯à®±à®¿",
    description:
      "Florana à®Žà®©à¯à®ªà®¤à¯ à®‰à®™à¯à®•à®³à¯ à®šà¯†à®Ÿà®¿à®•à®³à¯ˆ à®Žà®³à®¿à®¤à®¾à®• à®•à®£à¯à®•à®¾à®£à®¿à®•à¯à®•, à®ªà®°à®¾à®®à®°à®¿à®•à¯à®• à®®à®±à¯à®±à¯à®®à¯ à®µà®³à®°à¯à®•à¯à®• à®‰à®¤à®µà¯à®®à¯ à®‰à®™à¯à®•à®³à¯ à®¤à®©à®¿à®ªà¯à®ªà®Ÿà¯à®Ÿ à®Ÿà®¿à®œà®¿à®Ÿà¯à®Ÿà®²à¯ à®šà¯†à®Ÿà®¿ à®¤à¯à®£à¯ˆ. à®¨à¯€à®™à¯à®•à®³à¯ à®¤à¯Šà®Ÿà®•à¯à®• à®¨à®¿à®²à¯ˆà®¯à®¿à®²à¯‹ à®…à®©à¯à®ªà®µà®®à®¿à®•à¯à®• à®šà¯†à®Ÿà®¿ à®¨à¯‡à®šà®¿à®¯à¯‹ à®†à®¯à®¿à®©à¯à®®à¯, à®šà¯†à®Ÿà®¿ à®ªà®°à®¾à®®à®°à®¿à®ªà¯à®ªà®¿à®±à¯à®•à¯ à®Žà®³à®¿à®¯, à®…à®´à®•à®¾à®© à®®à®±à¯à®±à¯à®®à¯ à®ªà¯à®¤à¯à®¤à®¿à®šà®¾à®²à®¿à®¤à¯à®¤à®©à®®à®¾à®© à®¤à¯€à®°à¯à®µà¯ˆ à®‰à®°à¯à®µà®¾à®•à¯à®•à¯à®µà®¤à¯‡ à®Žà®™à¯à®•à®³à¯ à®ªà®£à®¿.",
    visionTitle: "à®Žà®™à¯à®•à®³à¯ à®¨à¯‹à®•à¯à®•à®®à¯",
    visionText:
      "à®šà¯†à®Ÿà®¿ à®ªà®°à®¾à®®à®°à®¿à®ªà¯à®ªà¯ˆ à®…à®©à¯ˆà®µà®°à¯à®•à¯à®•à¯à®®à¯ à®Žà®³à®¿à®¤à®¾à®©, à®®à®•à®¿à®´à¯à®šà¯à®šà®¿à®¯à®¾à®© à®®à®±à¯à®±à¯à®®à¯ à®…à®£à¯à®•à®•à¯à®•à¯‚à®Ÿà®¿à®¯à®¤à®¾à®• à®®à®¾à®±à¯à®±à¯à®µà®¤à¯. à®‰à®™à¯à®•à®³à¯ à®šà¯†à®Ÿà®¿à®•à®³à¯ à®†à®°à¯‹à®•à¯à®•à®¿à®¯à®®à®¾à®• à®µà®³à®° à®‰à®¤à®µ à®‡à®¯à®±à¯à®•à¯ˆà®¯à¯ˆà®¯à¯à®®à¯ à®ªà¯à®¤à¯à®¤à®¿à®šà®¾à®²à®¿à®¤à¯à®¤à®©à®®à®¾à®© à®¤à¯Šà®´à®¿à®²à¯à®¨à¯à®Ÿà¯à®ªà®¤à¯à®¤à¯ˆà®¯à¯à®®à¯ à®‡à®£à¯ˆà®ªà¯à®ªà®¤à¯‡ à®Žà®™à¯à®•à®³à¯ à®•à¯à®±à®¿à®•à¯à®•à¯‹à®³à¯.",
    developedBy: "à®‰à®°à¯à®µà®¾à®•à¯à®•à®¿à®¯à®¤à¯",
    team: "Florana à®…à®ªà®¿à®µà®¿à®°à¯à®¤à¯à®¤à®¿ à®•à¯à®´à¯",
    version: "à®ªà®¤à®¿à®ªà¯à®ªà¯ 1.0.0",
  },
};

export default function AboutUs() {
  const navigate = useNavigate();
  const { languageCode } = useTranslation();
  const copy = aboutCopy[languageCode] || aboutCopy.en;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <MobilePage
        pageClassName="about-wrapper"
        surfaceClassName="about-container"
        title={copy.title}
        subtitle={copy.description}
        rightActions={
          <button className="menu-btn app-icon-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <MenuIcon size={18} />
          </button>
        }
      >
        <div className="about-scroll-view">
          <div className="about-logo-box">
            <img src={floranaLogo} alt="Flora Web Logo" className="about-logo" />
          </div>

          <MobileSection className="about-info-card">
            <div className="about-section-heading">
              <Info size={18} />
              <h3>{copy.visionTitle}</h3>
            </div>
            <p>{copy.visionText}</p>
          </MobileSection>

          <div className="app-grid-two about-action-row">
            <MobileActionButton className="secondary" onClick={() => navigate("/help")}>
              <CircleHelp size={16} />
              <span>Help</span>
            </MobileActionButton>
            <MobileActionButton className="secondary" onClick={() => navigate("/feedback")}>
              <MessageSquareText size={16} />
              <span>Feedback</span>
            </MobileActionButton>
          </div>

          <MobileSection className="about-footer">
            <h3>{copy.developedBy}</h3>
            <p className="team-text">{copy.team}</p>
            <p className="about-version">{copy.version}</p>
          </MobileSection>
        </div>
      </MobilePage>
    </>
  );
}
