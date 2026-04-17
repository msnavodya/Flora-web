import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../menu/menu";
import "./catalog.css";

export default function SeasonPage() {
  const { season } = useParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const API = "http://127.0.0.1:8000";
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  /* 🌍 Currency - global via localStorage */
  const [currency, setCurrency] = useState(
    localStorage.getItem("currency") || "LKR"
  );
  const [rates] = useState({
    LKR: 1,
    USD: 0.0033,
    EUR: 0.003,
  });

  // Listen to global currency changes from other pages
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrency(localStorage.getItem("currency") || "LKR");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Fetch products
  useEffect(() => {
    fetch(`${API}/shop/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  /* 💱 Convert Price */
  const convertPrice = (price) => {
    return (price * rates[currency]).toFixed(2);
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart 🛒");
  };

  const filteredProducts = products.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const productSeason = (p.season || "").toLowerCase();
    return (
      name.includes(search.toLowerCase()) &&
      (season === "all" || productSeason === season.toLowerCase())
    );
  });

  const seasonList = ["spring", "summer", "autumn", "winter", "all"];

  return (
    <div className="catalog-wrapper">
      <div className="catalog-container">

        {/* ===== TOP NAVBAR ===== */}
        <div className="top-navbar">
          <button className="nav-back" onClick={() => navigate(-1)}>←</button>
          <h3 className="nav-title">Plant Shop</h3>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* 🔥 SMALL CURRENCY SELECT */}
            <select
              className="currency-mini"
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                localStorage.setItem("currency", e.target.value);
              }}
            >
              <option value="LKR">Rs</option>
              <option value="USD">$</option>
              <option value="EUR">€</option>
            </select>

            <button className="nav-cart" onClick={() => navigate("/cart")}>
              🛒
            </button>

            <button className="menu-btn" onClick={() => setMenuOpen(true)}>☰</button>
          </div>
        </div>

        {/* ===== SEASON NAVBAR ===== */}
        <div className="season-navbar">
          {seasonList.map((s) => (
            <button
              key={s}
              className={`season-btn ${season === s ? "active-btn" : ""}`}
              onClick={() => navigate(`/season/${s}`)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* HEADER */}
        <div className="catalog-header">
          <div className="logo">🌸</div>
          <input
            type="text"
            placeholder="Search plants..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TITLE */}
        <h2 className="catalog-title">
          {season === "all"
            ? "All Plants 🌿"
            : `${season.toUpperCase()} Plants 🌿`}
        </h2>

        {/* PRODUCTS */}
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

                {/* 💱 UPDATED PRICE */}
                <p className="price">
                  {currency === "LKR" && "Rs. "}
                  {currency === "USD" && "$ "}
                  {currency === "EUR" && "€ "}
                  {convertPrice(p.price)}
                </p>

                <button onClick={() => addToCart(p)}>Add</button>
              </div>
            ))
          ) : (
            <p className="no-data">No plants available 🌱</p>
          )}
        </div>

      </div>
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}