import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../menu/menu";
import LanguageSelector from "../language/LanguageSelector";
import "./predict.css";

export default function Predict() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const { prediction, confidence } = data;
        const isHealthy = prediction === "Healthy Plant 🌿";
        const status = isHealthy ? "Healthy Plant 🌿" : "Unhealthy Plant - Disease Detected";
        setMessage(`✅ ${status} (${prediction}) - Confidence: ${confidence}%`);
      } else {
        setMessage(`❌ Error: ${data.detail || response.statusText || "Unknown server error"}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="predict-container">
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <LanguageSelector />
      <button className="back-btn" style={{position: "absolute", top: "10px", left: "10px"}} onClick={() => navigate(-1)}>←</button>
      <button className="menu-btn" style={{position: "absolute", top: "10px", right: "10px"}} onClick={() => setMenuOpen(true)}>☰</button>
      <div className="predict-card">
        <h2>🌿 Plant Disease Prediction</h2>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />

        {preview && (
          <img src={preview} alt="preview" className="image-preview" />
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="upload-btn"
        >
          {loading ? "Processing..." : "Predict Disease"}
        </button>

        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  );
}
