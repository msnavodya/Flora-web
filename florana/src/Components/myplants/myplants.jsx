import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../menu/menu";
import LanguageSelector from "../language/LanguageSelector";
import { getPlants } from "../../api";
import "./myplants.css";

const MyPlants = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // ✅ track deleting item

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await getPlants();

        // ✅ supports BOTH formats
        const allPlants = response.data || response || [];

        const validPlants = allPlants.filter(
          (p) =>
            p &&
            p.tracking !== false &&
            p.name &&
            p.name.trim() !== ""
        );

        setPlants(validPlants);
      } catch (error) {
        console.error("Error fetching plants:", error);
        // Show demo plants if API fails
        const demoPlants = [
          { id: 1, name: "Monstera", type: "Tropical", health: "Healthy", watered: "2 days ago" },
          { id: 2, name: "Pothos", type: "Vine", health: "Healthy", watered: "1 day ago" },
          { id: 3, name: "Snake Plant", type: "Succulent", health: "Good", watered: "5 days ago" }
        ];
        setPlants(demoPlants);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
    const interval = setInterval(fetchPlants, 30000);
    return () => clearInterval(interval);
  }, []);

  // ✅ DELETE ONE ITEM
  const handleDelete = async (plantId) => {
    if (!plantId) return;

    const confirmDelete = window.confirm("Delete this plant?");
    if (!confirmDelete) return;

    setDeletingId(plantId);

    try {
      const res = await fetch(`http://127.0.0.1:8000/plants/${plantId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      // ✅ remove only that one item
      setPlants((prev) => prev.filter((p) => (p.id || p._id) !== plantId));
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

  return (
    <div className="plants-wrapper">
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <LanguageSelector />
      <div className="plants-container">
        {loading ? (
          <p className="loading-text">Loading plants...</p>
        ) : (
          <>
            <button className="back-btn" onClick={() => navigate(-1)}>
              ←
            </button>

            {/* MENU BUTTON */}
            <button className="menu-btn" style={{position: "absolute", top: "10px", right: "10px"}} onClick={() => setMenuOpen(true)}>☰</button>

            <div className="plants-header">
              <div className="user-icon">👤</div>
              <div>
                <p className="hello-text">Hello Gardener!</p>
                <h2>Your Flower Dashboard</h2>
              </div>
            </div>

            <div className="summary-pill">
              {plants.length} Plants •{" "}
              {plants.filter((p) => p.warning).length} Need Attention ⚠️
            </div>

            {plants.length === 0 ? (
              <div className="no-plants">🌱 No plants added</div>
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
                      {/* ✅ DELETE BUTTON */}
                      <button
                        className="delete-btn"
                        disabled={deletingId === id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(id);
                        }}
                      >
                        {deletingId === id ? "..." : "🗑"}
                      </button>

                      <img
                        src={
                          plant.image_path
                            ? `http://127.0.0.1:8000/${plant.image_path}`
                            : "/defaultPlant.jpg"
                        }
                        alt={plant.name}
                        className="plant-img"
                      />

                      <div className="plant-info">
                        <h4>
                          {plant.name}
                          {plant.warning && <span className="alert"> ⚠</span>}
                        </h4>

                        {plant.info && (
                          <p className={plant.warning ? "danger-text" : ""}>
                            {plant.info}
                          </p>
                        )}

                        {plant.badges?.length > 0 && (
                          <div className="badge-row">
                            {plant.badges.map((badge, i) => (
                              <span
                                key={i}
                                className={`badge ${
                                  plant.warning ? "red" : "green"
                                }`}
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="arrow">›</span>
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