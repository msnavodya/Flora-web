import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider, useTranslation } from "./Components/language/LanguageContext";

/* ===================== AUTH PAGES ===================== */
import LoginPage from "./Components/login/login";
import SignInForm from "./Components/signinform/signinform";
import SignUpForm from "./Components/signupform/signupform";

/* ===================== MAIN PAGES ===================== */
import Home from "./Components/home/home";
import Catalog from "./Components/catalog/catalog";
import SeasonPage from "./Components/catalog/SeasonPage";
import CartPage from "./Components/catalog/cartPage";
import MyPlants from "./Components/myplants/myplants";
import FlowerProfile from "./Components/flowerprofile/flowerprofile";
import Register from "./Components/register/register";

/* ===================== EXTRA PAGES ===================== */
import Settings from "./Components/settings/settings";
import About from "./Components/aboutus/aboutus";
import Help from "./Components/help/help";
import Profile from "./Components/profile/profile";
import Feedback from "./Components/feedback/feedback";
import CareReminder from "./Components/carereminder/carereminder";
import QuickTip from "./Components/quicktip/quicktip";

/* ===================== ML ===================== */
import Predict from "./Components/predict/predict";

/* ===================== GLOBAL UI ===================== */
import Menu from "./Components/menu/menu";
import TopBar from "./Components/topbar/topbar";

/* ===================== 404 ===================== */
const NotFound = () => (
  <div style={{ textAlign: "center", padding: "50px" }}>
    <h1>404</h1>
    <p>Page Not Found</p>
  </div>
);

/* ===================== APP LAYOUT ===================== */
const AppLayout = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { language } = useTranslation();

  // 🔤 LOAD FONT ON START
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("florana_settings"));

    if (saved?.fontSize) {
      applyFont(saved.fontSize);
    } else {
      applyFont("Medium");
    }
  }, []);

  // 🔤 APPLY FONT
  const applyFont = (size) => {
    let value = "16px";
    if (size === "Small") value = "12px";
    if (size === "Large") value = "20px";

    document.documentElement.style.fontSize = value;
  };

  const authRoutes = ["/", "/signin", "/signup"];
  const showLayout = !authRoutes.includes(location.pathname);

  return (
    <div
      className="app-container"
      style={{ minHeight: "100vh" }}
      data-language={language} // 🔥 GLOBAL LANGUAGE ATTRIBUTE
    >
      {/* ===== TOPBAR & MENU ===== */}
      {showLayout && <TopBar onMenuClick={() => setMenuOpen(true)} />}
      {showLayout && <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />}

      {/* ===== ROUTES ===== */}
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/signup" element={<SignUpForm />} />

        {/* MAIN */}
        <Route path="/home" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/season/:season" element={<SeasonPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* PLANTS */}
        <Route path="/myplants" element={<MyPlants />} />
        <Route path="/flower/:plantName" element={<FlowerProfile />} />
        <Route path="/register" element={<Register />} />

        {/* ML */}
        <Route path="/predict" element={<Predict />} />

        {/* EXTRA */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/care" element={<CareReminder />} />
        <Route path="/quicktip" element={<QuickTip />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </div>
  );
};

/* ===================== ROOT ===================== */
export default function App() {
  return (
    <LanguageProvider>
      <AppLayout />
    </LanguageProvider>
  );
}
