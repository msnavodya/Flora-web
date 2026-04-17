import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../menu/menu";
import { getPlantByName, getGrowth, addGrowth } from "../../api";
import "./flowerprofile.css";

/* ===== Default Images ===== */
import peonyImg from "../Assets/peonyflower.jpg";
import daisyImg from "../Assets/autumnflower.jpg";
import roseImg from "../Assets/summerflower.jpg";
import tulipsImg from "../Assets/springflower.jpg";

/* ===== Chart ===== */
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

export default function FlowerProfile() {
  const { plantName } = useParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [plant, setPlant] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHeight, setNewHeight] = useState('');
  const [newHealth, setNewHealth] = useState('');
  const [newNotes, setNewNotes] = useState('');

  /* ===== FETCH DATA ===== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPlantByName(decodeURIComponent(plantName));
        const plantData = res.data || res;

        setPlant(plantData);

        const growthRes = await getGrowth(plantData._id);
        setGrowthData(growthRes.data?.data || []);
      } catch (err) {
        console.error(err);
        setPlant({
          name: plantName,
          species: "Unknown",
          sunlight: "N/A",
          wateringFrequency: "N/A"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [plantName]);

  const handleAddGrowth = async (e) => {
    e.preventDefault();
    if (!newHeight) return;

    try {
      const formData = new FormData();
      formData.append('plant_id', plant._id);
      formData.append('height', newHeight);
      formData.append('health', newHealth || 'Good');
      formData.append('notes', newNotes);

      await addGrowth(formData);

      // Refetch growth data
      const growthRes = await getGrowth(plant._id);
      setGrowthData(growthRes.data?.data || []);

      // Reset form
      setNewHeight('');
      setNewHealth('');
      setNewNotes('');

      alert('Growth record added successfully!');
    } catch (err) {
      console.error('Error adding growth:', err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  /* ===== IMAGE HANDLING ===== */
  const plantImages = {
    Peony: peonyImg,
    Daisy: daisyImg,
    Rose: roseImg,
    Tulips: tulipsImg
  };

  const plantImage = plant?.image_path
    ? `http://127.0.0.1:8000/${plant.image_path}`
    : plantImages[plant?.name] || peonyImg;

  /* ===== SORT GROWTH ===== */
  const sortedGrowth = [...growthData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  /* ===== CHART DATA ===== */
  const chartData = {
    labels: sortedGrowth.map((g) =>
      new Date(g.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Height (cm)",
        data: sortedGrowth.map((g) => Number(g.height)),
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        borderColor: "#4caf50"
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  /* ===== HEALTH COLOR ===== */
  const getHealthColor = (health) => {
    if (!health) return "#777";
    if (health.toLowerCase().includes("good")) return "green";
    if (health.toLowerCase().includes("bad")) return "red";
    return "orange";
  };

  return (
    <div className="flower-wrapper">
      <div className="flower-container">

        {/* ===== HEADER ===== */}
        <div className="mobile-header">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h2 className="page-title">{plant?.name}</h2>
          <button className="menu-btn" onClick={() => setMenuOpen(true)}>☰</button>
        </div>

        {/* ===== IMAGE ===== */}
        <div className="flower-image-box">
          <img src={plantImage} alt={plant?.name} />
        </div>

        {/* ===== CONTENT ===== */}
        <div className="flower-card">

          {/* QUICK INFO */}
          <div className="quick-info">
            <div>☀ {plant?.sunlight || "N/A"}</div>
            <div>💧 {plant?.wateringFrequency || "N/A"}</div>
            <div>🌱 {plant?.species || "N/A"}</div>
          </div>

          {/* DETAILS */}
          <div className="details-card">
            <h4>Plant Details</h4>
            <p><strong>Soil:</strong> {plant?.soilType || "N/A"}</p>
            <p><strong>Climate:</strong> {plant?.climate || "N/A"}</p>
            <p><strong>Location:</strong> {plant?.location || "N/A"}</p>
            <p><strong>Last Watered:</strong> {plant?.lastWatered || "N/A"}</p>
          </div>

          {/* ===== CHART ===== */}
          <div className="growth-card">
            <h4>📈 Growth Tracker</h4>

            {sortedGrowth.length > 0 ? (
              <div className="chart-wrapper">
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <p className="empty-text">No growth data yet</p>
            )}
          </div>

          {/* ===== HISTORY ===== */}
          <div className="history-card">
            <h4>📊 Growth History</h4>

            {sortedGrowth.length === 0 && (
              <p className="empty-text">No records available</p>
            )}

            {sortedGrowth.map((g, index) => (
              <div key={index} className="history-item">
                <div>📅 {new Date(g.date).toLocaleDateString()}</div>
                <div>📏 {g.height} cm</div>
                <div style={{ color: getHealthColor(g.health) }}>
                  💚 {g.health}
                </div>
                {g.notes && <div>📝 {g.notes}</div>}
              </div>
            ))}
          </div>

          {/* ===== ADD GROWTH ===== */}
          <div className="growth-card">
            <h4>➕ Add Growth Record</h4>
            <form onSubmit={handleAddGrowth}>
              <input
                type="number"
                placeholder="Height (cm)"
                value={newHeight}
                onChange={(e) => setNewHeight(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Health (e.g., Good, Bad)"
                value={newHealth}
                onChange={(e) => setNewHealth(e.target.value)}
              />
              <textarea
                placeholder="Notes (optional)"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows="3"
              />
              <button type="submit">Add Record</button>
            </form>
          </div>

        </div>
      </div>
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}