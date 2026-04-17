import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../language/LanguageContext";
import Menu from "../menu/menu";
import LanguageSelector from "../language/LanguageSelector";
import "./catalog.css";

/* Images */
import springImg from "../Assets/springflower.jpg";
import summerImg from "../Assets/summerflower.jpg";
import autumnImg from "../Assets/autumnflower.jpg";
import winterImg from "../Assets/winterflower.jpg";

export default function Catalog() {
  const navigate = useNavigate();
  const API = "http://127.0.0.1:8000";

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("buy");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const { t } = useTranslation();

  /* 🌍 Currency - global via localStorage */
  const [currency, setCurrency] = useState(
    localStorage.getItem("currency") || "LKR"
  );
  const [rates] = useState({
    LKR: 1,
    USD: 0.0033,
    EUR: 0.003,
  });

  /* Listen for global changes from other tabs/pages */
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrency(localStorage.getItem("currency") || "LKR");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /* Update localStorage whenever currency changes */
  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const [newPlant, setNewPlant] = useState({
    name: "",
    price: "",
    season: "Spring",
    image: null,
  });

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/shop/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setProducts([]);
    }
  };

  // ================= LOAD =================
  useEffect(() => {
    fetchProducts();
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cart.length);
  }, []);

  // ================= CONVERT PRICE =================
  const convertPrice = (price) => {
    return (price * rates[currency]).toFixed(2);
  };

  // ================= ADD TO CART =================
  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCount(cart.length);
    alert("Added to cart 🛒");
  };

  // ================= NAVIGATE =================
  const goToSeasonPage = (season) => {
    navigate(`/season/${season.toLowerCase()}`);
  };

  // ================= SELL =================
  const handleSell = async () => {
    if (!newPlant.name || !newPlant.price || !newPlant.image) {
      alert("Please fill all fields + image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newPlant.name);
      formData.append("price", newPlant.price);
      formData.append("season", newPlant.season);
      formData.append("file", newPlant.image);

      await fetch(`${API}/shop/products`, {
        method: "POST",
        body: formData,
      });

      alert("Plant listed successfully 🌱");

      setNewPlant({
        name: "",
        price: "",
        season: "Spring",
        image: null,
      });

      fetchProducts();
      setActiveTab("buy");
    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    }
  };

  // ================= SEARCH =================
  const filteredProducts = products.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  // ================= SEASONS =================
  const seasons = [
    { title: "Spring", image: springImg },
    { title: "Summer", image: summerImg },
    { title: "Autumn", image: autumnImg },
    { title: "Winter", image: winterImg },
  ];

  return (
    <div className="catalog-wrapper">
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <LanguageSelector />
      <div className="catalog-container">
        {/* BACK */}
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>

        {/* MENU BUTTON */}
        <button className="menu-btn" style={{position: "absolute", top: "10px", right: "10px"}} onClick={() => setMenuOpen(true)}>☰</button>

        {/* HEADER */}
        <div className="catalog-header">
          <div className="logo">🌸</div>

          <input
            type="text"
            placeholder={t("search_plants")}
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* 🔥 SMALL CURRENCY SELECT */}
          <select
            className="currency-mini"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="LKR">Rs</option>
            <option value="USD">$</option>
            <option value="EUR">€</option>
          </select>

          {/* CART */}
          <div className="cart-icon" onClick={() => navigate("/cart")}>
            🛒
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </div>
        </div>

        <h2 className="catalog-title">Season Catalog</h2>

        {/* TOGGLE */}
        <div className="toggle-bar">
          <button
            className={activeTab === "buy" ? "active" : ""}
            onClick={() => setActiveTab("buy")}
          >
            Buy
          </button>
          <button
            className={activeTab === "sell" ? "active" : ""}
            onClick={() => setActiveTab("sell")}
          >
            Sell
          </button>
        </div>

        {/* ================= BUY ================= */}
        {activeTab === "buy" && (
          <>
            <div className="season-grid">
              {seasons.map((season) => (
                <div
                  key={season.title}
                  className="season-card"
                  onClick={() => goToSeasonPage(season.title)}
                >
                  <img src={season.image} alt={season.title} />
                  <div className="season-name">{season.title}</div>
                </div>
              ))}

              <div
                className="season-card all-card"
                onClick={() => navigate("/season/all")}
              >
                <div className="season-name">All</div>
              </div>
            </div>

            <h3 className="section-title">All Plants 🌿</h3>

            <div className="product-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <div key={p.id} className="product-card">
                    <img
                      src={p.image ? `${API}/${p.image}` : "/defaultPlant.jpg"}
                      alt={p.name}
                    />

                    <h4>{p.name}</h4>
                    <p>🌼 {p.season}</p>

                    {/* 💱 PRICE */}
                    <p className="price">
                      {currency === "LKR" && "Rs. "}
                      {currency === "USD" && "$ "}
                      {currency === "EUR" && "€ "}
                      {convertPrice(p.price)}
                    </p>

                    <button onClick={() => addToCart(p)}>
                      Add to Cart
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-data">No plants found 🌱</p>
              )}
            </div>
          </>
        )}

        {/* ================= SELL ================= */}
        {activeTab === "sell" && (
          <div className="sell-form">
            <h3>Manage Your Plants 🌱</h3>

            <input
              type="text"
              placeholder="Plant Name"
              value={newPlant.name}
              onChange={(e) =>
                setNewPlant({ ...newPlant, name: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Price"
              value={newPlant.price}
              onChange={(e) =>
                setNewPlant({ ...newPlant, price: e.target.value })
              }
            />

            <select
              value={newPlant.season}
              onChange={(e) =>
                setNewPlant({ ...newPlant, season: e.target.value })
              }
            >
              <option>Spring</option>
              <option>Summer</option>
              <option>Autumn</option>
              <option>Winter</option>
            </select>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewPlant({ ...newPlant, image: e.target.files[0] })
              }
            />

            <button onClick={handleSell}>List Plant</button>

            <h4>Your Listed Plants</h4>

            <div className="product-grid">
              {products.map((p) => (
                <div key={p.id} className="product-card">
                  <img
                    src={p.image ? `${API}/${p.image}` : "/defaultPlant.jpg"}
                    alt={p.name}
                  />
                  <h4>{p.name}</h4>
                  <p>🌼 {p.season}</p>
                  <p className="price">
                    {currency === "LKR" && "Rs. "}
                    {currency === "USD" && "$ "}
                    {currency === "EUR" && "€ "}
                    {convertPrice(p.price)}
                  </p>

                  <button
                    onClick={async () => {
                      if (window.confirm(`Delete ${p.name}? ❌`)) {
                        await fetch(`${API}/shop/products/${p.id}`, {
                          method: "DELETE",
                        });
                        fetchProducts();
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FLOATING CART */}
        <div className="floating-cart" onClick={() => navigate("/cart")}>
          🛒 {cartCount}
        </div>
      </div>
    </div>
  );
}