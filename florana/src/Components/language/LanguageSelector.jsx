import React from 'react';
import { useTranslation } from './LanguageContext';
import './language.css';

const LanguageSelector = () => {
  const { language, setLanguage } = useTranslation();

  const codeToLabel = {
    en: 'English',
    si: 'Sinhala',
    ta: 'Tamil',
  };

  const labelToCode = {
    English: 'en',
    Sinhala: 'si',
    Tamil: 'ta',
  };

  const selectedLanguage = labelToCode[language] || 'en';

  const handleLanguageChange = (languageCode) => {
    setLanguage(codeToLabel[languageCode] || 'English');
  };

  const languages = [
    { code: 'en', name: 'EN' },
    { code: 'si', name: 'SI' },
    { code: 'ta', name: 'TA' }
  ];

  return (
    <div className="language-selector">
      <select
        value={selectedLanguage}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="language-dropdown"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;