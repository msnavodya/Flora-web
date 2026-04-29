import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellRing, CalendarClock, Leaf, Menu as MenuIcon, Plus, UserRound } from "lucide-react";
import Menu from "../menu/menu";
import { MobileActionButton, MobilePage, MobileSection } from "../mobile/MobilePage";
import "./profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState({
    id: "",
    full_name: "",
    email: "",
  });
  const [profileStats, setProfileStats] = useState({
    plantCount: 0,
    reminderCount: 0,
    lastSync: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser({
        id: "demo-001",
        full_name: "Demo User",
        email: "demo@florana.com",
      });
    }

    const savedPlants = JSON.parse(localStorage.getItem("plants") || "[]");
    const careReminder = JSON.parse(localStorage.getItem("careReminder") || "null");
    const activeOptions = Object.values(careReminder?.options || {}).filter(Boolean).length;
    const reminderNotes = careReminder?.customNotes?.length || 0;

    setProfileStats({
      plantCount: Array.isArray(savedPlants) ? savedPlants.length : 0,
      reminderCount: activeOptions + reminderNotes,
      lastSync: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  }, []);

  const displayName = user.full_name || user.name || "Guest Gardener";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "FG";

  return (
    <>
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <MobilePage
        pageClassName="profile-page"
        surfaceClassName="profile-shell"
        title="Your Profile"
        subtitle="A cleaner mobile view of your account, plant activity, and quick actions."
        onBack={() => navigate(-1)}
        rightActions={
          <button className="menu-btn app-icon-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <MenuIcon size={18} />
          </button>
        }
      >
        <div className="profile-scroll-view">
          <section className="profile-hero">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-hero-copy">
              <p className="profile-eyebrow">Florana Account</p>
              <h2>{displayName}</h2>
              <span>{user.email || "guest@florana.app"}</span>
            </div>
          </section>

          <div className="profile-stats-grid">
            <div className="profile-stat-card">
              <span className="profile-stat-icon sage">
                <Leaf size={18} />
              </span>
              <strong>{profileStats.plantCount}</strong>
              <p>Tracked plants</p>
            </div>

            <div className="profile-stat-card">
              <span className="profile-stat-icon lavender">
                <BellRing size={18} />
              </span>
              <strong>{profileStats.reminderCount}</strong>
              <p>Active reminders</p>
            </div>
          </div>

          <MobileSection className="profile-card profile-details-card">
            <div className="profile-card-heading">
              <UserRound size={18} />
              <h3>Account details</h3>
            </div>
            <div className="profile-detail-row">
              <span>User ID</span>
              <strong>{user.id || "demo-001"}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Full name</span>
              <strong>{displayName}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Email</span>
              <strong>{user.email || "demo@florana.com"}</strong>
            </div>
          </MobileSection>

          <MobileSection className="profile-card profile-live-card">
            <div className="profile-card-heading">
              <CalendarClock size={18} />
              <h3>Live app status</h3>
            </div>
            <p className="profile-live-text">
              Your local Florana session is active. Reminder settings and profile details are loading from saved app
              data in real time.
            </p>
            <div className="profile-live-footer">
              <span>Last synced</span>
              <strong>{profileStats.lastSync || "--:--"}</strong>
            </div>
          </MobileSection>

          <div className="profile-action-stack">
            <MobileActionButton className="profile-register-btn" onClick={() => navigate("/register")}>
              <Plus size={16} />
              <span>Register New Plant</span>
            </MobileActionButton>
            <MobileActionButton className="secondary" onClick={() => navigate("/care")}>
              Open Care Reminder
            </MobileActionButton>
          </div>
        </div>
      </MobilePage>
    </>
  );
}
