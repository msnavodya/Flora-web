import React from "react";
import { Languages } from "lucide-react";
import { useTranslation } from "./LanguageContext";
import "./language.css";

const codeToLabel = {
  en: "English",
  si: "Sinhala",
  ta: "Tamil",
};

const labelToCode = {
  English: "en",
  Sinhala: "si",
  Tamil: "ta",
};

const languages = [
  { code: "en", short: "ENG", label: "English" },
  { code: "si", short: "\u0dc3\u0dd2\u0d82", label: "Sinhala" },
  { code: "ta", short: "\u0ba4\u0bae\u0bbf\u0bb4\u0bcd", label: "Tamil" },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useTranslation();
  const selectedLanguage = labelToCode[language] || "en";

  const handleLanguageChange = (languageCode) => {
    setLanguage(codeToLabel[languageCode] || "English");
  };

  return (
    <div className="language-selector" aria-label="Language selector">
      <label className="language-field">
        <span className="language-icon" aria-hidden="true">
          <Languages size={12} strokeWidth={2.3} />
        </span>
        <select
          value={selectedLanguage}
          onChange={(event) => handleLanguageChange(event.target.value)}
          className="language-dropdown"
          aria-label="Language options"
        >
          {languages.map((languageOption) => (
            <option key={languageOption.code} value={languageOption.code}>
              {languageOption.short}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
