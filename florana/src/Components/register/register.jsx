import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../menu/menu";
import { createPlant } from "../../api";
import "./register.css";

export default function Register() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    species: "",
    flowerId: "",
    flowerCatalog: "",
    location: "",
    specificLocation: "",
    climate: "",
    sunlight: "Partial Sun",
    soilType: "",
    wateringFrequency: "",
    fertilizerSchedule: "",
    lastWatered: "",
    initialSize: "",
    tracking: true,
    image: null,
    imagePreview: null,
  });

  const [nextId, setNextId] = useState(1);

  // ===== HANDLERS =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSunlightChange = (opt) => {
    setForm((prev) => ({ ...prev, sunlight: opt }));
  };

  // ===== SUBMIT (🔥 FIXED) =====
  const handleSubmit = async () => {
    if (!form.name) {
      alert("Please enter a Plant Name!");
      return;
    }

    try {
      const formData = new FormData();

      // ✅ Append fields manually (clean & safe)
      formData.append("name", form.name);
      formData.append("species", form.species);
      formData.append("flowerId", form.flowerId || `F-${nextId}`);
      formData.append("flowerCatalog", form.flowerCatalog);
      formData.append("location", form.location);
      formData.append("specificLocation", form.specificLocation);
      formData.append("climate", form.climate);
      formData.append("sunlight", form.sunlight);
      formData.append("soilType", form.soilType);
      formData.append("wateringFrequency", form.wateringFrequency);
      formData.append("fertilizerSchedule", form.fertilizerSchedule);
      formData.append("lastWatered", form.lastWatered);
      formData.append("initialSize", form.initialSize);

      // ✅ IMPORTANT: convert boolean
      formData.append("tracking", form.tracking ? "true" : "false");

      // ✅ IMAGE
      if (form.image) {
        formData.append("image", form.image);
      }

      const response = await createPlant(formData);

      console.log("SUCCESS:", response.data);

      setNextId((prev) => prev + 1);

      // ✅ Better navigation (fallback if no ID)
      const plantName = response.data?.name || form.name;
      navigate(`/flower/${encodeURIComponent(plantName)}`);

    } catch (error) {
      console.error("FULL ERROR:", error.response?.data || error.message);
      alert(error.response?.data?.detail || "Failed to register plant");
    }
  };

  // ===== OPTIONS =====
  const sunlightOptions = ["Full Sun", "Partial Sun", "Shade"];
  const flowerCatalogOptions = ["Spring", "Summer", "Autumn", "Winter"];
  const soilTypeOptions = ["Loamy", "Sandy", "Clay", "Peaty", "Chalky"];
  const environmentOptions = ["Indoor", "Outdoor", "Greenhouse"];
  const climateOptions = ["Tropical", "Temperate", "Arid", "Subtropical"];

  return (
    <div className="register-wrapper">
      <div className="register-container">

        <div className="mobile-header">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h1 className="page-title">Register Plant</h1>
          <button className="menu-btn" onClick={() => setMenuOpen(true)}>☰</button>
        </div>

        {/* IMAGE */}
        <div className="image-row">
          <label className="image-box">
            {form.imagePreview ? (
              <img src={form.imagePreview} alt="Preview" className="image-preview" />
            ) : (
              <span className="plus">+</span>
            )}
            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
          </label>
          <span className="image-text">
            {form.image ? form.image.name : "Choose Image"}
          </span>
        </div>

        {/* BASIC */}
        <h3 className="section-title">Basic Info</h3>
        <input className="input" placeholder="Plant Name" name="name" value={form.name} onChange={handleChange} />
        <input className="input" placeholder="Plant Species" name="species" value={form.species} onChange={handleChange} />

        <select className="input" name="flowerCatalog" value={form.flowerCatalog} onChange={handleChange}>
          <option value="">Flower Catalog</option>
          {flowerCatalogOptions.map((opt) => <option key={opt}>{opt}</option>)}
        </select>

        <input className="input" placeholder={`Flower ID (Auto: F-${nextId})`} name="flowerId" value={form.flowerId} onChange={handleChange} />

        {/* ENV */}
        <h3 className="section-title">Environment</h3>
        <input className="input" placeholder="Location" name="location" value={form.location} onChange={handleChange} />

        <select className="input" name="specificLocation" value={form.specificLocation} onChange={handleChange}>
          <option value="">Specific Location</option>
          {environmentOptions.map((opt) => <option key={opt}>{opt}</option>)}
        </select>

        <select className="input" name="climate" value={form.climate} onChange={handleChange}>
          <option value="">Climate</option>
          {climateOptions.map((opt) => <option key={opt}>{opt}</option>)}
        </select>

        {/* SUNLIGHT */}
        <h3 className="section-title">Sunlight</h3>
        <div className="option-row">
          {sunlightOptions.map((opt) => (
            <label key={opt} className={`check ${form.sunlight === opt ? "active" : ""}`}>
              <input type="radio" checked={form.sunlight === opt} onChange={() => handleSunlightChange(opt)} />
              {opt}
            </label>
          ))}
        </div>

        {/* CARE */}
        <h3 className="section-title">Care</h3>
        <select className="input" name="soilType" value={form.soilType} onChange={handleChange}>
          <option value="">Soil Type</option>
          {soilTypeOptions.map((opt) => <option key={opt}>{opt}</option>)}
        </select>

        <input className="input" placeholder="Watering Frequency" name="wateringFrequency" value={form.wateringFrequency} onChange={handleChange} />
        <input className="input" placeholder="Fertilizer Schedule" name="fertilizerSchedule" value={form.fertilizerSchedule} onChange={handleChange} />

        {/* TRACKING */}
        <h3 className="section-title">Tracking</h3>
        <label>
          <input type="checkbox" checked={form.tracking} onChange={handleCheckboxChange} name="tracking" />
          {form.tracking ? " Enabled" : " Disabled"}
        </label>

        {/* SUBMIT */}
        <button className="submit-btn" onClick={handleSubmit}>
          Register Plant
        </button>

      </div>
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}