import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlarmClock, ArrowLeft, BellRing, Menu, Plus, Trash2 } from "lucide-react";
import MenuPanel from "../menu/menu";
import { useTranslation } from "../language/LanguageContext";
import LanguageSelector from "../language/LanguageSelector";
import "./carereminder.css";

const initialOptions = {
  watering: true,
  fertilizing: false,
  pruning: false,
  repotting: false,
  sunlight: true,
};

const initialNotifications = { push: true, email: false };

const careCopy = {
  en: {
    eyebrow: "Plant schedule",
    title: "Care Reminder",
    subtitle: "Keep watering and care tasks organized with a clean mobile planner that saves automatically.",
    activeTasks: "Active tasks",
    mode: "Mode",
    options: "Options",
    watering: "Watering",
    wateringInfo: "Notify when plant needs water",
    fertilizing: "Fertilizing",
    fertilizingInfo: "Remind when to fertilize",
    pruning: "Pruning",
    pruningInfo: "Alerts for trimming and shaping",
    repotting: "Repotting",
    repottingInfo: "Remind when to repot",
    sunlight: "Sunlight",
    sunlightInfo: "Suggest moving plants for better light",
    on: "On",
    off: "Off",
    wateringTime: "Watering Time",
    customNotes: "Custom Notes",
    addNote: "Add note",
    summary: "Summary",
    daily: "Daily",
    weekly: "Weekly",
    notifications: "Notifications",
    pushAlerts: "Push Alerts",
    pushAlertsInfo: "Browser notification reminders.",
    emailAlerts: "Email Alerts",
    emailAlertsInfo: "Save your email reminder preference.",
    testNotification: "Test Notification",
    careMessages: "Care Reminder Messages",
  },
  si: {
    eyebrow: "පැල කාලසටහන",
    title: "සැලකිලි මතක් කිරීම",
    subtitle: "ජලය දැමීම සහ සැලකිලි කාර්යයන් ස්වයංක්‍රීයව සුරකින පිරිසිදු ජංගම සැලසුම්කරණයක් සමඟ සංවිධානය කරගන්න.",
    activeTasks: "සක්‍රිය කාර්යයන්",
    mode: "ක්‍රමය",
    options: "විකල්ප",
    watering: "ජලය දැමීම",
    wateringInfo: "පැලට ජලය අවශ්‍ය විට දැනුම් දෙන්න",
    fertilizing: "පෝෂක දැමීම",
    fertilizingInfo: "පෝෂක දැමිය යුතු වේලාව මතක් කරන්න",
    pruning: "කප්පාදු කිරීම",
    pruningInfo: "කැපීම හා හැඩගැස්වීම සඳහා ඇඟවීම්",
    repotting: "නැවත බඳුනකට මාරු කිරීම",
    repottingInfo: "නැවත බඳුනකට මාරු කළ යුතු වේලාව මතක් කරන්න",
    sunlight: "හිරු එළිය",
    sunlightInfo: "වඩා හොඳ ආලෝකය සඳහා පැල ගෙනයෑම යෝජනා කරන්න",
    on: "සක්‍රිය",
    off: "අක්‍රිය",
    wateringTime: "ජලය දැමීමේ වේලාව",
    customNotes: "අභිරුචි සටහන්",
    addNote: "සටහන එක් කරන්න",
    summary: "සාරාංශය",
    daily: "දිනපතා",
    weekly: "සතිපතා",
    notifications: "දැනුම්දීම්",
    pushAlerts: "Push දැනුම්දීම්",
    pushAlertsInfo: "බ්‍රව්සර් දැනුම්දීම් මතක් කිරීම්.",
    emailAlerts: "විද්‍යුත් තැපැල් දැනුම්දීම්",
    emailAlertsInfo: "ඔබගේ විද්‍යුත් තැපැල් මතක් කිරීමේ අභිරුචිය සුරකින්න.",
    testNotification: "දැනුම්දීම පරීක්ෂා කරන්න",
    careMessages: "සැලකිලි මතක් කිරීමේ පණිවිඩ",
  },
  ta: {
    eyebrow: "செடி அட்டவணை",
    title: "பராமரிப்பு நினைவூட்டல்",
    subtitle: "தானாக சேமிக்கும் சுத்தமான மொபைல் திட்டமிடலுடன் நீர்ப்பாய்ச்சி மற்றும் பராமரிப்பு பணிகளை ஒழுங்குபடுத்து.",
    activeTasks: "செயலில் உள்ள பணிகள்",
    mode: "முறை",
    options: "விருப்பங்கள்",
    watering: "நீர்ப்பாய்ச்சி",
    wateringInfo: "செடிக்கு நீர் தேவைப்படும் போது அறிவிக்கவும்",
    fertilizing: "உரம் இடுதல்",
    fertilizingInfo: "எப்போது உரம் இட வேண்டும் என்று நினைவூட்டவும்",
    pruning: "கிளைச்சுற்று",
    pruningInfo: "வெட்டுதல் மற்றும் வடிவமைப்பிற்கான அறிவிப்புகள்",
    repotting: "மறு நட்டம்",
    repottingInfo: "எப்போது மீண்டும் நட்டம் செய்ய வேண்டும் என்று நினைவூட்டவும்",
    sunlight: "சூரிய ஒளி",
    sunlightInfo: "சிறந்த ஒளிக்காக செடிகளை நகர்த்த பரிந்துரைக்கவும்",
    on: "இயக்கு",
    off: "நிறுத்து",
    wateringTime: "நீர்ப்பாய்ச்சி நேரம்",
    customNotes: "தனிப்பயன் குறிப்புகள்",
    addNote: "குறிப்பு சேர்",
    summary: "சுருக்கம்",
    daily: "தினசரி",
    weekly: "வாராந்திர",
    notifications: "அறிவிப்புகள்",
    pushAlerts: "Push அறிவிப்புகள்",
    pushAlertsInfo: "உலாவி அறிவிப்பு நினைவூட்டல்கள்.",
    emailAlerts: "மின்னஞ்சல் அறிவிப்புகள்",
    emailAlertsInfo: "உங்கள் மின்னஞ்சல் நினைவூட்டல் விருப்பத்தை சேமிக்கவும்.",
    testNotification: "அறிவிப்பை சோதிக்கவும்",
    careMessages: "பராமரிப்பு நினைவூட்டல் செய்திகள்",
  },
};

export default function CareReminder() {
  const navigate = useNavigate();
  const { languageCode } = useTranslation();
  const copy = careCopy[languageCode] || careCopy.en;
  const timerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [options, setOptions] = useState(initialOptions);
  const [customNotes, setCustomNotes] = useState([]);
  const [newCustomNote, setNewCustomNote] = useState("");
  const [summaryMode, setSummaryMode] = useState("daily");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [wateringTime, setWateringTime] = useState("07:00");
  const [inAppMessages, setInAppMessages] = useState([]);
  const [status, setStatus] = useState("");
  const defaultOptions = [
    { key: "watering", title: copy.watering, info: copy.wateringInfo },
    { key: "fertilizing", title: copy.fertilizing, info: copy.fertilizingInfo },
    { key: "pruning", title: copy.pruning, info: copy.pruningInfo },
    { key: "repotting", title: copy.repotting, info: copy.repottingInfo },
    { key: "sunlight", title: copy.sunlight, info: copy.sunlightInfo },
  ];

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

  const showStatus = (message) => {
    setStatus(message);
    window.clearTimeout(window.floranaCareStatusTimer);
    window.floranaCareStatusTimer = window.setTimeout(() => setStatus(""), 2600);
  };

  const sendNotification = () => {
    const messageText = `Time to water your plant (${wateringTime})`;

    if (notifications.push && Notification.permission === "granted") {
      new Notification("Plant Care Reminder", { body: messageText });
    }

    setInAppMessages((previous) => [{ id: Date.now(), text: messageText }, ...previous]);
    showStatus("Test reminder added.");
  };

  const scheduleNotification = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!options.watering) return;

    const now = new Date();
    const [hour, minute] = wateringTime.split(":").map(Number);
    const target = new Date();
    target.setHours(hour, minute, 0, 0);

    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    const delay = target - now;

    timerRef.current = setTimeout(() => {
      sendNotification();
      scheduleNotification();
    }, delay);
  };

  useEffect(() => {
    scheduleNotification();
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [wateringTime, options.watering, notifications.push]);

  const toggleOption = (key) => {
    setOptions((previous) => ({ ...previous, [key]: !previous[key] }));
    showStatus(`${key} reminder updated.`);
  };

  const toggleNotification = (type) => {
    setNotifications((previous) => ({ ...previous, [type]: !previous[type] }));
    showStatus(`${type} alerts updated.`);
  };

  const addCustomNote = () => {
    const trimmed = newCustomNote.trim();

    if (!trimmed) {
      showStatus("Add a note first.");
      return;
    }

    setCustomNotes((previous) => [trimmed, ...previous]);
    setNewCustomNote("");
    showStatus("Custom reminder added.");
  };

  const removeCustomNote = (index) => {
    setCustomNotes((previous) => previous.filter((_, currentIndex) => currentIndex !== index));
    showStatus("Custom reminder removed.");
  };

  const activeTasks = defaultOptions.filter((option) => options[option.key]).length + customNotes.length;

  return (
    <div className="care-page mobile-screen">
      <MenuPanel isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="care-shell mobile-frame">
        <div className="care-scroll mobile-panel">
          <LanguageSelector />

          <div className="care-topbar">
            <button className="back-btn" aria-label="Go back" onClick={() => navigate("/home")}>
              <ArrowLeft size={18} />
            </button>

            <button className="menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
              <Menu size={18} />
            </button>
          </div>

          <div className="care-hero">
            <div className="care-hero-icon">
              <AlarmClock size={22} />
            </div>
            <p className="care-eyebrow">{copy.eyebrow}</p>
            <h2>{copy.title}</h2>
            <p className="care-subtitle">{copy.subtitle}</p>

            <div className="summary-row">
              <span>{copy.activeTasks}: {activeTasks}</span>
              <span>{copy.mode}: {summaryMode}</span>
            </div>
          </div>

          {status ? <div className="care-status">{status}</div> : null}

          <div className="care-section">
            <p className="section-title">{copy.options}</p>
            {defaultOptions.map((option) => (
              <div key={option.key} className="option-row">
                <div>
                  <p>{option.title}</p>
                  <small>{option.info}</small>
                </div>
                <button
                  onClick={() => toggleOption(option.key)}
                  className={`toggle-btn ${options[option.key] ? "on" : "off"}`}
                >
                  {options[option.key] ? copy.on : copy.off}
                </button>
              </div>
            ))}
          </div>

          {options.watering ? (
            <div className="care-section">
              <p className="section-title">{copy.wateringTime}</p>
              <div className="time-picker-row">
                <input type="time" value={wateringTime} onChange={(event) => setWateringTime(event.target.value)} />
              </div>
            </div>
          ) : null}

          <div className="care-section">
            <p className="section-title">{copy.customNotes}</p>
            <div className="custom-input-row">
              <input
                placeholder={copy.addNote}
                value={newCustomNote}
                onChange={(event) => setNewCustomNote(event.target.value)}
              />
              <button onClick={addCustomNote} aria-label="Add custom note">
                <Plus size={16} />
              </button>
            </div>

            {customNotes.map((note, index) => (
              <div key={`${note}-${index}`} className="custom-note-row">
                <span>{note}</span>
                <button onClick={() => removeCustomNote(index)} aria-label="Remove custom note">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="care-section">
            <p className="section-title">{copy.summary}</p>
            <div className="summary-buttons">
              <button
                className={`summary-btn ${summaryMode === "daily" ? "active" : ""}`}
                onClick={() => setSummaryMode("daily")}
              >
                {copy.daily}
              </button>
              <button
                className={`summary-btn ${summaryMode === "weekly" ? "active" : ""}`}
                onClick={() => setSummaryMode("weekly")}
              >
                {copy.weekly}
              </button>
            </div>
          </div>

          <div className="care-section">
            <p className="section-title">{copy.notifications}</p>
            <div className="option-row">
              <div>
                <p>{copy.pushAlerts}</p>
                <small>{copy.pushAlertsInfo}</small>
              </div>
              <button
                onClick={() => toggleNotification("push")}
                className={`toggle-btn ${notifications.push ? "on" : "off"}`}
              >
                {notifications.push ? copy.on : copy.off}
              </button>
            </div>

            <div className="option-row">
              <div>
                <p>{copy.emailAlerts}</p>
                <small>{copy.emailAlertsInfo}</small>
              </div>
              <button
                onClick={() => toggleNotification("email")}
                className={`toggle-btn ${notifications.email ? "on" : "off"}`}
              >
                {notifications.email ? copy.on : copy.off}
              </button>
            </div>

            <button className="test-btn" onClick={sendNotification}>
              <BellRing size={16} />
              <span>{copy.testNotification}</span>
            </button>
          </div>

          {inAppMessages.length > 0 ? (
            <div className="care-section">
              <p className="section-title">{copy.careMessages}</p>
              <div className="in-app-messages">
                {inAppMessages.map((message) => (
                  <div key={message.id} className="message-box">
                    {message.text}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
