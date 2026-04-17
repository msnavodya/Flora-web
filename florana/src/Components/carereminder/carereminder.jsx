import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../menu/menu";
import LanguageSelector from "../language/LanguageSelector";
import "./carereminder.css";

const defaultOptions = [
  { key: "watering", title: "Watering", info: "Notify when plant needs water" },
  { key: "fertilizing", title: "Fertilizing", info: "Remind when to fertilize" },
  { key: "pruning", title: "Pruning", info: "Alerts for trimming/shaping" },
  { key: "repotting", title: "Repotting", info: "Remind when to repot" },
  { key: "sunlight", title: "Sunlight", info: "Suggest moving plants for light" },
];

const initialOptions = {
  watering: true,
  fertilizing: false,
  pruning: false,
  repotting: false,
  sunlight: true,
};

const initialNotifications = { push: true, email: false };

export default function CareReminder() {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [options, setOptions] = useState(initialOptions);
  const [customNotes, setCustomNotes] = useState([]);
  const [newCustomNote, setNewCustomNote] = useState("");
  const [summaryMode, setSummaryMode] = useState("daily");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [wateringTime, setWateringTime] = useState("07:00");

  // ✅ NEW: in-app reminders
  const [inAppMessages, setInAppMessages] = useState([]);

  /* ========= LOAD ========= */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("careReminder") || "null");
    if (saved) {
      setOptions(saved.options ?? initialOptions);
      setCustomNotes(saved.customNotes ?? []);
      setSummaryMode(saved.summaryMode ?? "daily");
      setNotifications(saved.notifications ?? initialNotifications);
      setWateringTime(saved.wateringTime ?? "07:00");
      setInAppMessages(saved.inAppMessages ?? []);
    }

    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  /* ========= SAVE ========= */
  useEffect(() => {
    localStorage.setItem(
      "careReminder",
      JSON.stringify({
        options,
        customNotes,
        summaryMode,
        notifications,
        wateringTime,
        inAppMessages,
      })
    );
  }, [options, customNotes, summaryMode, notifications, wateringTime, inAppMessages]);

  /* ========= NOTIFICATION ========= */
  const sendNotification = () => {
    const messageText = `Time to water your plant (${wateringTime})`;

    // Browser push
    if (notifications.push && Notification.permission === "granted") {
      new Notification("🌿 Plant Care Reminder", { body: messageText });
    }

    // In-app message
    setInAppMessages((prev) => [
      { id: Date.now(), text: messageText },
      ...prev,
    ]);
  };

  /* ========= DAILY SCHEDULER ========= */
  const scheduleNotification = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!options.watering) return;

    const now = new Date();
    const [h, m] = wateringTime.split(":").map(Number);

    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const delay = target - now;

    timerRef.current = setTimeout(() => {
      sendNotification();
      scheduleNotification(); // repeat next day
    }, delay);
  };

  useEffect(() => {
    scheduleNotification();
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [wateringTime, options.watering, notifications.push]);

  /* ========= FUNCTIONS ========= */
  const toggleOption = (key) =>
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleNotification = (type) =>
    setNotifications((prev) => ({ ...prev, [type]: !prev[type] }));

  const addCustomNote = () => {
    const trimmed = newCustomNote.trim();
    if (!trimmed) return;
    setCustomNotes((prev) => [trimmed, ...prev]);
    setNewCustomNote("");
  };

  const removeCustomNote = (index) =>
    setCustomNotes((prev) => prev.filter((_, idx) => idx !== index));

  const activeTasks =
    defaultOptions.filter((opt) => options[opt.key]).length +
    customNotes.length;

  /* ========= UI ========= */
  return (
    <div className="care-reminder-mobile">
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <LanguageSelector />
      <div className="care-card">
        {/* HEADER */}
        <div className="header-row">
          <button className="back-btn" onClick={() => navigate("/home")}>←</button>
          <button className="menu-btn" style={{position: "absolute", top: "12px", right: "12px"}} onClick={() => setMenuOpen(true)}>☰</button>
          <h2>Care Reminder</h2>
        </div>

        {/* SUMMARY */}
        <div className="summary-row">
          <span>Active tasks: {activeTasks}</span>
          <span>Mode: {summaryMode}</span>
        </div>

        <div className="scroll-section">
          {/* OPTIONS */}
          <p className="section-title">Options</p>
          {defaultOptions.map((opt) => (
            <div key={opt.key} className="option-row">
              <div>
                <p>{opt.title}</p>
                <small>{opt.info}</small>
              </div>
              <button
                onClick={() => toggleOption(opt.key)}
                className={options[opt.key] ? "on" : "off"}
              >
                {options[opt.key] ? "On" : "Off"}
              </button>
            </div>
          ))}

          {/* TIME SETTING */}
          {options.watering && (
            <>
              <p className="section-title">Watering Time</p>
              <div className="time-picker-row">
                <input
                  type="time"
                  value={wateringTime}
                  onChange={(e) => setWateringTime(e.target.value)}
                />
              </div>
            </>
          )}

          {/* CUSTOM NOTES */}
          <p className="section-title">Custom Notes</p>
          <div className="custom-input-row">
            <input
              placeholder="Add note"
              value={newCustomNote}
              onChange={(e) => setNewCustomNote(e.target.value)}
            />
            <button onClick={addCustomNote}>Add</button>
          </div>
          {customNotes.map((note, i) => (
            <div key={i} className="custom-note-row">
              <span>{note}</span>
              <button onClick={() => removeCustomNote(i)}>✕</button>
            </div>
          ))}

          {/* SUMMARY */}
          <p className="section-title">Summary</p>
          <div className="summary-buttons">
            <button
              className={summaryMode === "daily" ? "active" : ""}
              onClick={() => setSummaryMode("daily")}
            >
              Daily
            </button>
            <button
              className={summaryMode === "weekly" ? "active" : ""}
              onClick={() => setSummaryMode("weekly")}
            >
              Weekly
            </button>
          </div>

          {/* NOTIFICATIONS */}
          <p className="section-title">Notifications</p>
          <div className="option-row">
            <div>Push Alerts</div>
            <button
              onClick={() => toggleNotification("push")}
              className={notifications.push ? "on" : "off"}
            >
              {notifications.push ? "On" : "Off"}
            </button>
          </div>
          <div className="option-row">
            <div>Email Alerts</div>
            <button
              onClick={() => toggleNotification("email")}
              className={notifications.email ? "on" : "off"}
            >
              {notifications.email ? "On" : "Off"}
            </button>
          </div>

          {/* TEST BUTTON */}
          <button className="test-btn" onClick={sendNotification}>
            Test Notification
          </button>

          {/* ========= IN-APP MESSAGES ========= */}
          {inAppMessages.length > 0 && (
            <div className="in-app-messages">
              <p className="section-title">Care Reminder Messages</p>
              {inAppMessages.map((msg) => (
                <div key={msg.id} className="message-box">
                  {msg.text}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}