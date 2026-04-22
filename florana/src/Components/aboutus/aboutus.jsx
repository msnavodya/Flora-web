import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Menu as MenuIcon } from "lucide-react";
import floranaLogo from "../Assets/floranalogo.jpg";
import { useTranslation } from "../language/LanguageContext";
import LanguageSelector from "../language/LanguageSelector";
import Menu from "../menu/menu";
import "./aboutus.css";

const aboutCopy = {
  en: {
    title: "About Us",
    description:
      "Florana is your personal digital plant companion designed to help you monitor, maintain, and grow your plants with ease. Our mission is to create a simple, beautiful, and smart solution for plant care whether you're a beginner or an experienced plant lover.",
    visionTitle: "Our Vision",
    visionText:
      "To make plant care effortless, enjoyable, and accessible to everyone. We aim to blend smart technology with nature to help your plants grow healthier.",
    developedBy: "Developed By",
    team: "Florana Development Team",
    version: "Version 1.0.0",
  },
  si: {
    title: "අප ගැන",
    description:
      "Florana යනු ඔබගේ පැල පහසුවෙන් නිරීක්ෂණය කිරීමට, පවත්වා ගැනීමට සහ වර්ධනය කිරීමට උපකාරී වන ඔබගේ පුද්ගලික ඩිජිටල් පැල මිතුරායි. අපගේ මෙහෙවර වන්නේ ආරම්භකයෙකු හෝ පළපුරුදු පැල ආදරවන්තයෙකු වුවද පැල සුරැකීම සඳහා සරල, ලස්සන සහ බුද්ධිමත් විසඳුමක් නිර්මාණය කිරීමයි.",
    visionTitle: "අපගේ දැක්ම",
    visionText:
      "පැල රැකබලා ගැනීම සෑම කෙනෙකුටම පහසු, රසවත් සහ ප්‍රවේශ විය හැකි දෙයක් බවට පත් කිරීමයි. ඔබගේ පැල වඩා සෞඛ්‍ය සම්පන්නව වර්ධනය වීමට ස්වභාවය හා බුද්ධිමත් තාක්ෂණය එකට ගෙන ඒම අපගේ අරමුණයි.",
    developedBy: "සංවර්ධනය කළේ",
    team: "Florana සංවර්ධන කණ්ඩායම",
    version: "අනුවාදය 1.0.0",
  },
  ta: {
    title: "எங்களை பற்றி",
    description:
      "Florana என்பது உங்கள் செடிகளை எளிதாக கண்காணிக்க, பராமரிக்க மற்றும் வளர்க்க உதவும் உங்கள் தனிப்பட்ட டிஜிட்டல் செடி துணை. நீங்கள் தொடக்க நிலையிலோ அனுபவமிக்க செடி நேசியோ ஆயினும், செடி பராமரிப்பிற்கு எளிய, அழகான மற்றும் புத்திசாலித்தனமான தீர்வை உருவாக்குவதே எங்கள் பணி.",
    visionTitle: "எங்கள் நோக்கம்",
    visionText:
      "செடி பராமரிப்பை அனைவருக்கும் எளிதான, மகிழ்ச்சியான மற்றும் அணுகக்கூடியதாக மாற்றுவது. உங்கள் செடிகள் ஆரோக்கியமாக வளர உதவ இயற்கையையும் புத்திசாலித்தனமான தொழில்நுட்பத்தையும் இணைப்பதே எங்கள் குறிக்கோள்.",
    developedBy: "உருவாக்கியது",
    team: "Florana அபிவிருத்தி குழு",
    version: "பதிப்பு 1.0.0",
  },
};

export default function AboutUs() {
  const navigate = useNavigate();
  const { languageCode } = useTranslation();
  const copy = aboutCopy[languageCode] || aboutCopy.en;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="about-wrapper">
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <LanguageSelector />
      <div className="about-container">
        <div className="page-topbar">
          <button className="back-btn" aria-label="Go back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <button className="menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <MenuIcon size={18} />
          </button>
        </div>

        <h2 className="about-title">{copy.title}</h2>

        <div className="about-logo-box">
          <img src={floranaLogo} alt="Florana Logo" className="about-logo" />
        </div>

        <p className="about-description">{copy.description}</p>

        <div className="about-info-card">
          <h3>{copy.visionTitle}</h3>
          <p>{copy.visionText}</p>
        </div>

        <div className="about-footer">
          <h3>{copy.developedBy}</h3>
          <p className="team-text">{copy.team}</p>
          <p className="about-version">{copy.version}</p>
        </div>
      </div>
    </div>
  );
}
