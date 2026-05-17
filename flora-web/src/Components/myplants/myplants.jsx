import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Menu as MenuIcon,
  Sparkles,
  Sprout,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { buildApiUrl, deletePlant, getPlants } from "../../api";
import { useTranslation } from "../language/LanguageContext";
import LanguageSelector from "../language/LanguageSelector";
import Menu from "../menu/menu";
import "./myplants.css";

const plantsCopy = {
  en: {
    loading: "Loading plants...",
    hello: "Hello Gardener!",
    title: "My Plants",
    subtitle: "Check plant health, review alerts, and jump into each flower profile in one tap.",
    tracked: "Tracked Plants",
    attention: "Need Attention",
    habits: "Healthy habits grow stronger flowers. Tap any card to open full details.",
    emptyTitle: "No plants added yet",
    emptyText: "Start tracking your flowers to build your mobile garden dashboard here.",
    needsCare: "Needs care",
    stable: "Stable",
  },
  si: {
    loading: "පැල පූරණය වෙමින්...",
    hello: "හෙලෝ වගාකරු!",
    title: "මගේ පැල",
    subtitle: "පැල සෞඛ්‍යය බලන්න, අනතුරු ඇඟවීම් සමාලෝචනය කරන්න, සහ එක් ටැප් එකකින් මල් පැතිකඩ විවෘත කරන්න.",
    tracked: "අනුගමනය කරන පැල",
    attention: "අවධානය අවශ්‍යයි",
    habits: "සෞඛ්‍ය සම්පන්න පුරුදු මල් වඩා ශක්තිමත් කරයි. සම්පූර්ණ විස්තර සඳහා ඕනෑම කාඩ්පතක් තට්ටු කරන්න.",
    emptyTitle: "තවම පැල එකතු කර නැත",
    emptyText: "මෙහි ඔබගේ ජංගම උද්‍යාන පුවරුව ගොඩනඟා ගැනීමට ඔබගේ මල් අනුගමනය කිරීම ආරම්භ කරන්න.",
    needsCare: "සැලකිල්ල අවශ්‍යයි",
    stable: "ස්ථිරයි",
  },
  ta: {
    loading: "செடிகள் ஏற்றப்படுகின்றன...",
    hello: "வணக்கம் தோட்டக்காரரே!",
    title: "என் செடிகள்",
    subtitle: "செடி ஆரோக்கியத்தை பாருங்கள், எச்சரிக்கைகளை சரிபாருங்கள், மற்றும் ஒரு தொடுதலில் ஒவ்வொரு மலர் சுயவிவரத்திற்கும் செல்லுங்கள்.",
    tracked: "கண்காணிக்கும் செடிகள்",
    attention: "கவனம் தேவை",
    habits: "ஆரோக்கியமான பழக்கங்கள் மலர்களை வலுப்படுத்தும். முழு விவரங்களைத் திறக்க எந்த அட்டையையும் தொட்டு பார்க்கவும்.",
    emptyTitle: "இதுவரை செடிகள் சேர்க்கப்படவில்லை",
    emptyText: "இங்கே உங்கள் மொபைல் தோட்ட டாஷ்போர்டை உருவாக்க உங்கள் மலர்களை கண்காணிக்கத் தொடங்குங்கள்.",
    needsCare: "பராமரிப்பு தேவை",
    stable: "நிலையாக உள்ளது",
  },
};

const MyPlants = () => {
  const navigate = useNavigate();
  const { languageCode } = useTranslation();
  const copy = plantsCopy[languageCode] || plantsCopy.en;
  const [menuOpen, setMenuOpen] = useState(false);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await getPlants();
        const allPlants = response.data || [];
        const validPlants = allPlants.filter((plant) => plant && plant.tracking !== false && plant.name?.trim());
        setPlants(validPlants);
      } catch (error) {
        console.error("Error fetching plants:", error);
        setPlants([
          { id: 1, name: "Monstera", type: "Tropical", health: "Healthy", watered: "2 days ago" },
          { id: 2, name: "Pothos", type: "Vine", health: "Healthy", watered: "1 day ago" },
          { id: 3, name: "Snake Plant", type: "Succulent", health: "Good", watered: "5 days ago" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
    const interval = setInterval(fetchPlants, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (plantId) => {
    if (!plantId || !window.confirm("Delete this plant?")) {
      return;
    }

    setDeletingId(plantId);

    try {
      await deletePlant(plantId);
      setPlants((previous) => previous.filter((plant) => (plant.id || plant._id) !== plantId));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed. Check backend.");
    } finally {
      setDeletingId(null);
    }
  };

  const goToProfile = (plantName) => {
    navigate(`/flower/${encodeURIComponent(plantName)}`);
  };

  const attentionCount = plants.filter((plant) => plant.warning).length;

  return (
    <div className="plants-wrapper">
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="plants-container">
        {loading ? (
          <p className="loading-text">{copy.loading}</p>
        ) : (
          <>
            <div className="plants-topbar">
              <button className="back-btn" aria-label="Go back" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
              </button>

              <div className="plants-topbar-actions">
                <LanguageSelector />

                <button className="menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
                  <MenuIcon size={18} />
                </button>
              </div>
            </div>

            <div className="plants-header">
              <div className="user-icon">
                <Sprout size={22} strokeWidth={2.1} />
              </div>

              <div className="plants-heading-copy">
                <p className="hello-text">{copy.hello}</p>
                <h2>{copy.title}</h2>
                <span className="plants-subtitle">{copy.subtitle}</span>
              </div>
            </div>

            <div className="plants-overview">
              <div className="summary-card">
                <span className="summary-icon mint">
                  <Sprout size={16} />
                </span>
                <div>
                  <strong>{plants.length}</strong>
                  <p>{copy.tracked}</p>
                </div>
              </div>

              <div className="summary-card warning-card">
                <span className="summary-icon peach">
                  <TriangleAlert size={16} />
                </span>
                <div>
                  <strong>{attentionCount}</strong>
                  <p>{copy.attention}</p>
                </div>
              </div>
            </div>

            <div className="summary-pill">
              <Sparkles size={14} />
              <span>{copy.habits}</span>
            </div>

            {plants.length === 0 ? (
              <div className="no-plants">
                <span className="empty-icon">
                  <Sprout size={26} />
                </span>
                <h3>{copy.emptyTitle}</h3>
                <p>{copy.emptyText}</p>
              </div>
            ) : (
              <div className="plants-grid">
                {plants.map((plant) => {
                  const id = plant.id || plant._id;

                  return (
                    <div
                      key={id}
                      className={`plant-card ${plant.warning ? "warning" : ""}`}
                      onClick={() => goToProfile(plant.name)}
                    >
                      <button
                        className="delete-btn"
                        aria-label="Delete plant"
                        disabled={deletingId === id}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(id);
                        }}
                      >
                        {deletingId === id ? "..." : <Trash2 size={14} />}
                      </button>

                      <img
                        src={plant.image_path ? buildApiUrl(plant.image_path) : "/defaultPlant.jpg"}
                        alt={plant.name}
                        className="plant-img"
                      />

                      <div className="plant-info">
                        <div className="plant-title-row">
                          <h4>{plant.name}</h4>
                          <span className={`status-chip ${plant.warning ? "warning" : "good"}`}>
                            {plant.warning ? copy.needsCare : copy.stable}
                          </span>
                        </div>

                        {plant.info ? <p className={plant.warning ? "danger-text" : ""}>{plant.info}</p> : null}

                        {plant.badges?.length > 0 ? (
                          <div className="badge-row">
                            {plant.badges.map((badge, index) => (
                              <span key={index} className={`badge ${plant.warning ? "red" : "green"}`}>
                                {badge}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <span className="arrow">
                        <ChevronRight size={18} />
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyPlants;
