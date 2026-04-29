import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, Leaf, Menu as MenuIcon, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import { formatPredictionResult, getApiErrorMessage, getBackendHealth, predictImage } from "../../api";
import LanguageSelector from "../language/LanguageSelector";
import Menu from "../menu/menu";
import "./predict.css";

export default function Predict() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelState, setModelState] = useState({ loaded: false, status: "checking" });

  useEffect(() => {
    let active = true;

    const syncModelState = async () => {
      try {
        const response = await getBackendHealth();
        const aiModel = response.data?.ai_model || {};
        if (!active) {
          return;
        }
        setModelState({
          loaded: Boolean(aiModel.loaded),
          status: aiModel.status || "ready",
        });
      } catch {
        if (!active) {
          return;
        }
        setModelState({ loaded: false, status: "offline" });
      }
    };

    syncModelState();
    const intervalId = window.setInterval(syncModelState, 30000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const analyzeFile = async (selectedFile) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await predictImage(selectedFile);
      setResult(formatPredictionResult(response.data));
      setModelState({ loaded: true, status: "ready" });
    } catch (error) {
      console.error(error);
      setResult({ error: getApiErrorMessage(error) });
      setModelState({ loaded: false, status: "offline" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    analyzeFile(selectedFile);
  };

  return (
    <div className="predict-container">
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <LanguageSelector />

      <div className="predict-topbar">
        <button className="back-btn" aria-label="Go back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <button className="menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
          <MenuIcon size={18} />
        </button>
      </div>

      <div className="predict-card">
        <div className="predict-hero">
          <div>
            <span className="predict-eyebrow">Florana AI</span>
            <h2>Plant Disease Prediction</h2>
            <p className="predict-subcopy">Upload one leaf image and get a live diagnosis from the trained model.</p>
          </div>
          <div className={`predict-status-badge ${modelState.loaded ? "ready" : "offline"}`}>
            <Activity size={14} />
            {modelState.loaded ? "Model Ready" : modelState.status === "checking" ? "Checking..." : "Model Offline"}
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />

        {preview ? <img src={preview} alt="preview" className="image-preview" /> : null}

        <button onClick={() => file && analyzeFile(file)} disabled={loading || !file} className="upload-btn">
          {loading ? "Analyzing..." : "Analyze Again"}
        </button>

        {result ? (
          <div className={`predict-result-card ${result.error ? "error" : result.isHealthy ? "healthy" : "warning"}`}>
            <div className="predict-result-header">
              <span className="predict-result-icon">
                {result.error ? <ShieldAlert size={20} /> : result.isHealthy ? <ShieldCheck size={20} /> : <Leaf size={20} />}
              </span>
              <div>
                <h3>
                  {result.error
                    ? "Diagnosis unavailable"
                    : result.isHealthy
                      ? "Healthy plant detected"
                      : "Disease detected"}
                </h3>
                <p>
                  {result.error
                    ? result.error
                    : `${result.prediction} • ${result.confidencePercent}% confidence`}
                </p>
              </div>
            </div>

            {!result.error && Array.isArray(result.top_predictions) && result.top_predictions.length > 0 ? (
              <div className="predict-top-list">
                <div className="predict-top-title">
                  <Sparkles size={14} />
                  Top model matches
                </div>
                {result.top_predictions.map((entry) => (
                  <div key={`${entry.raw_label}-${entry.confidence_percent}`} className="predict-top-item">
                    <span>{entry.label}</span>
                    <strong>{entry.confidence_percent}%</strong>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="status-message">Choose a clear leaf photo to start a live diagnosis.</p>
        )}
      </div>
    </div>
  );
}
