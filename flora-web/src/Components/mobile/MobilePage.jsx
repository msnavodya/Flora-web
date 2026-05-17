import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "../language/LanguageSelector";
import "./mobilePage.css";

export function MobilePage({
  pageClassName = "",
  surfaceClassName = "",
  title,
  subtitle,
  onBack,
  rightActions,
  children,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate(-1);
  };

  return (
    <div className={`mobile-screen app-mobile-screen ${pageClassName}`.trim()}>
      <div className={`mobile-frame app-mobile-frame ${surfaceClassName}`.trim()}>
        <div className="mobile-panel app-mobile-panel">
          <header className="app-mobile-header">
            <div className="app-mobile-header-row">
              <button className="back-btn app-icon-btn" aria-label="Go back" onClick={handleBack}>
                <ArrowLeft size={18} />
              </button>

              <div className="app-mobile-header-actions">
                <LanguageSelector />
                {rightActions}
              </div>
            </div>

            {(title || subtitle) && (
              <div className="app-mobile-heading">
                {title ? <h1 className="app-mobile-title">{title}</h1> : null}
                {subtitle ? <p className="app-mobile-subtitle">{subtitle}</p> : null}
              </div>
            )}
          </header>

          <main className="app-mobile-content">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function MobileSection({ className = "", children }) {
  return <section className={`app-section ${className}`.trim()}>{children}</section>;
}

export function MobileActionButton({ className = "", children, ...props }) {
  return (
    <button className={`app-action-btn ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
