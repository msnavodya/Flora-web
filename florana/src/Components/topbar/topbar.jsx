import React from "react";
import "./topbar.css";

export default function TopBar({ onMenuClick }) {
  return (
    <div className="top-bar">
      <button className="menu-btn" onClick={onMenuClick}>
        ☰
      </button>
    </div>
  );
}
