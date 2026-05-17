import React from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

import floranaLogo from "../Assets/floranalogo.jpg";
import welcomeImg from "../Assets/welcome.jpg";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-wrapper">
      <div className="welcome-card">
        <div className="welcome-top">
          <img src={floranaLogo} alt="Flora Web Logo" className="logo-img" />
          <div className="welcome-copy">
           
            <h1>Grow smarter with Flora Web.</h1>
          
          </div>
        </div>
        <img src={welcomeImg} alt="Flower" className="welcome-image" />

        <div className="bottom-section">
          <div className="welcome-stats">
            <div>
              <strong>24/7</strong>
              <span>Plant insights</span>
            </div>
            <div>
              <strong>Live</strong>
              <span>Health tracking</span>
            </div>
          </div>

          <button className="start-btn" onClick={() => navigate("/signin")}>
            GET STARTED
          </button>
          <div className="swipe-bar"></div>
        </div>
      </div>
    </div>
  );
}
