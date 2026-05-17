import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Menu, ShoppingCart, WalletCards } from "lucide-react";
import { buildApiUrl, getProducts } from "../../api";
import { useTranslation } from "../language/LanguageContext";
import LanguageSelector from "../language/LanguageSelector";
import MenuPanel from "../menu/menu";
import "./catalog.css";

const exchangeRates = { LKR: 1, USD: 0.0033, EUR: 0.003 };
const currencySymbols = { LKR: "Rs.", USD: "$", EUR: "EUR" };
const seasonCopy = {
  en: {
    finder: "Plant Finder",
    allPlants: "All Plants",
    plantsSuffix: "Plants",
    subtitle: "Shop by season, switch the currency instantly, and keep your cart synced while you browse.",
    results: "{count} results",
    noPlants: "No plants available for this season.",
    addToCart: "Add to Cart",
  },
  si: {
    finder: "පැල සොයන්නා",
    allPlants: "සියලු පැල",
    plantsSuffix: "පැල",
    subtitle: "සමය අනුව සාප්පු යන්න, මුදල් ඒකකය වහාම මාරු කරන්න, සහ බ්‍රවුස් කරන අතරතුර ඔබගේ කරත්තය සම්බන්ධ කර තබන්න.",
    results: "ප්‍රතිඵල {count}",
    noPlants: "මෙම සමයට පැල නොමැත.",
    addToCart: "කරත්තයට දමන්න",
  },
  ta: {
    finder: "செடி கண்டுபிடிப்பான்",
    allPlants: "அனைத்து செடிகள்",
    plantsSuffix: "செடிகள்",
    subtitle: "பருவத்தின்படி வாங்குங்கள், நாணயத்தை உடனே மாற்றுங்கள், உலாவும் போது உங்கள் வண்டியை இணைத்துப் பேணுங்கள்.",
    results: "{count} முடிவுகள்",
    noPlants: "இந்த பருவத்திற்கு செடிகள் இல்லை.",
    addToCart: "வண்டியில் சேர்",
  },
};

export default function SeasonPage() {
  const { season } = useParams();
  const navigate = useNavigate();
  const { t, languageCode } = useTranslation();
  const copy = seasonCopy[languageCode] || seasonCopy.en;
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "LKR");
  const [cartCount, setCartCount] = useState(0);
  const [status, setStatus] = useState("");

  const syncCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  };

  const showStatus = (message) => {
    setStatus(message);
    window.clearTimeout(window.floranaSeasonStatusTimer);
    window.floranaSeasonStatusTimer = window.setTimeout(() => setStatus(""), 2400);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrency(localStorage.getItem("currency") || "LKR");
      syncCartCount();
    };

    getProducts()
      .then((response) => setProducts(response.data || []))
      .catch(() => setProducts([]));

    syncCartCount();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const formatPrice = (price) => {
    const converted = Number(price || 0) * exchangeRates[currency];
    return `${currencySymbols[currency]} ${converted.toFixed(2)}`;
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    syncCartCount();
    showStatus(`${product.name} added to cart.`);
  };

  const filteredProducts = products.filter((product) => {
    const name = (product.name || "").toLowerCase();
    const productSeason = (product.season || "").toLowerCase();
    return name.includes(search.toLowerCase()) && (season === "all" || productSeason === season?.toLowerCase());
  });

  const seasonList = ["spring", "summer", "autumn", "winter", "all"];

  return (
    <div className="catalog-wrapper mobile-screen">
      <div className="catalog-container mobile-frame">
        <div className="catalog-scroll mobile-panel">
          <div className="catalog-topbar">
            <button className="back-btn" aria-label="Go back" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
            </button>

            <div className="catalog-actions">
              <LanguageSelector />

              <button className="catalog-cart-btn compact-cart-btn" aria-label="Open cart" onClick={() => navigate("/cart")}>
                <ShoppingCart size={16} />
                {cartCount > 0 ? <span className="catalog-cart-badge">{cartCount}</span> : null}
              </button>

              <label className="catalog-currency-btn" aria-label="Currency converter">
                <span className="currency-icon" aria-hidden="true">
                  <WalletCards size={14} />
                </span>
                <select
                  className="currency-mini"
                  aria-label="Currency"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                >
                  <option value="LKR">Rs.</option>
                  <option value="USD">$</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>

              <button className="menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
                <Menu size={18} />
              </button>
            </div>
          </div>

          <div className="catalog-hero season-hero">
            <div>
              <p className="catalog-eyebrow">{copy.finder}</p>
              <h2 className="catalog-title">
                {season === "all" ? copy.allPlants : `${season?.toUpperCase()} ${copy.plantsSuffix}`}
              </h2>
              <p className="catalog-subtitle">{copy.subtitle}</p>
            </div>

            <div className="catalog-meta-card">
              <div className="meta-stat">{copy.results.replace("{count}", filteredProducts.length)}</div>
            </div>
          </div>

          {status ? <div className="catalog-status">{status}</div> : null}

          <div className="season-navbar">
            {seasonList.map((item) => (
              <button
                key={item}
                className={`season-btn ${season === item ? "active-btn" : ""}`}
                onClick={() => navigate(`/season/${item}`)}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="catalog-header season-header">
            <input
              type="text"
              placeholder={t("search_plants")}
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <img src={product.image ? buildApiUrl(product.image) : "/defaultPlant.jpg"} alt={product.name} />
                  <h4>{product.name}</h4>
                  <p>{product.season}</p>
                  <p className="price currency-text">{formatPrice(product.price)}</p>
                  <button onClick={() => addToCart(product)}>{copy.addToCart}</button>
                </div>
              ))
            ) : (
              <p className="no-data">{copy.noPlants}</p>
            )}
          </div>
        </div>
      </div>

      <MenuPanel isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
