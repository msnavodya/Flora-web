import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, ShoppingCart, WalletCards } from "lucide-react";
import { buildApiUrl, createProduct, deleteProduct, getApiErrorMessage, getProducts } from "../../api";
import { useTranslation } from "../language/LanguageContext";
import autumnImg from "../Assets/autumnflower.jpg";
import springImg from "../Assets/springflower.jpg";
import summerImg from "../Assets/summerflower.jpg";
import winterImg from "../Assets/winterflower.jpg";
import LanguageSelector from "../language/LanguageSelector";
import MenuPanel from "../menu/menu";
import "./catalog.css";

const exchangeRates = { LKR: 1, USD: 0.0033, EUR: 0.003 };
const currencySymbols = { LKR: "Rs.", USD: "$", EUR: "EUR" };
const catalogCopy = {
  en: {
    shop: "Florana Shop",
    title: "Season Catalog",
    subtitle: "Browse plants, switch currency instantly, and manage what you want to buy or sell.",
    listed: "{count} plants listed",
    buy: "Buy Plants",
    sell: "Sell Plants",
    allPlants: "All Plants",
    available: "Available Plants",
    addToCart: "Add to Cart",
    noPlants: "No plants found for that search.",
    listForSale: "List a Plant for Sale",
    plantName: "Plant Name",
    price: "Price",
    listPlant: "List Plant",
    yourListed: "Your Listed Plants",
    remove: "Delete",
  },
  si: {
    shop: "ෆ්ලෝරානා වෙළඳසැල",
    title: "සමය අනුව පැල එකතුව",
    subtitle: "පැල බලන්න, මුදල් ඒකකය වහාම මාරු කරන්න, සහ ඔබ මිලදී ගැනීමට හෝ විකිණීමට කැමති දේ කළමනාකරණය කරන්න.",
    listed: "පැල {count}ක් ලැයිස්තුගතයි",
    buy: "පැල මිලදී ගන්න",
    sell: "පැල විකුණන්න",
    allPlants: "සියලු පැල",
    available: "පවතින පැල",
    addToCart: "කරත්තයට දමන්න",
    noPlants: "එම සෙවුම සඳහා පැල හමු නොවීය.",
    listForSale: "විකිණීමට පැලයක් ලැයිස්තුගත කරන්න",
    plantName: "පැල නාමය",
    price: "මිල",
    listPlant: "පැලය ලැයිස්තුගත කරන්න",
    yourListed: "ඔබ ලැයිස්තුගත කළ පැල",
    remove: "මකන්න",
  },
  ta: {
    shop: "ஃப்ளோரானா கடை",
    title: "பருவ கால செடி தொகுப்பு",
    subtitle: "செடிகளை பாருங்கள், நாணயத்தை உடனே மாற்றுங்கள், நீங்கள் வாங்கவோ விற்கவோ விரும்பும்வற்றை நிர்வகிக்குங்கள்.",
    listed: "{count} செடிகள் பட்டியலிடப்பட்டுள்ளன",
    buy: "செடிகள் வாங்க",
    sell: "செடிகள் விற்க",
    allPlants: "அனைத்து செடிகள்",
    available: "கிடைக்கும் செடிகள்",
    addToCart: "வண்டியில் சேர்",
    noPlants: "அந்த தேடலுக்கு செடிகள் கிடைக்கவில்லை.",
    listForSale: "விற்பனைக்கு ஒரு செடியை பட்டியலிடுங்கள்",
    plantName: "செடி பெயர்",
    price: "விலை",
    listPlant: "செடியை பட்டியலிடு",
    yourListed: "நீங்கள் பட்டியலிட்ட செடிகள்",
    remove: "நீக்கு",
  },
};

const seasons = [
  { title: "Spring", image: springImg },
  { title: "Summer", image: summerImg },
  { title: "Autumn", image: autumnImg },
  { title: "Winter", image: winterImg },
];

export default function Catalog() {
  const navigate = useNavigate();
  const { t, languageCode } = useTranslation();
  const copy = catalogCopy[languageCode] || catalogCopy.en;
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("buy");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [status, setStatus] = useState("");
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "LKR");
  const [newPlant, setNewPlant] = useState({
    name: "",
    price: "",
    season: "Spring",
    image: null,
  });

  const syncCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  };

  const showStatus = (message) => {
    setStatus(message);
    window.clearTimeout(window.floranaCatalogStatusTimer);
    window.floranaCatalogStatusTimer = window.setTimeout(() => setStatus(""), 2500);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrency(localStorage.getItem("currency") || "LKR");
      syncCartCount();
    };

    fetchProductsList();
    syncCartCount();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const fetchProductsList = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setProducts([]);
      showStatus(getApiErrorMessage(error));
    }
  };

  const formatPrice = (price) => {
    const converted = Number(price || 0) * exchangeRates[currency];
    return `${currencySymbols[currency]} ${converted.toFixed(2)}`;
  };

  const updateCurrency = (value) => {
    setCurrency(value);
    localStorage.setItem("currency", value);
    showStatus(`Currency changed to ${value}.`);
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    syncCartCount();
    showStatus(`${product.name} added to cart.`);
  };

  const handleSell = async () => {
    if (!newPlant.name || !newPlant.price || !newPlant.image) {
      showStatus("Add the plant name, price, season, and image first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newPlant.name);
      formData.append("price", newPlant.price);
      formData.append("season", newPlant.season);
      formData.append("file", newPlant.image);

      await createProduct(formData);
      setNewPlant({ name: "", price: "", season: "Spring", image: null });
      fetchProductsList();
      setActiveTab("buy");
      showStatus("Plant listed successfully.");
    } catch (error) {
      console.error(error);
      showStatus(getApiErrorMessage(error));
    }
  };

  const filteredProducts = products.filter((product) =>
    (product.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="catalog-wrapper mobile-screen">
      <MenuPanel isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

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
                  onChange={(event) => updateCurrency(event.target.value)}
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

          <div className="catalog-hero">
            <div>
              <p className="catalog-eyebrow">{copy.shop}</p>
              <h2 className="catalog-title">{copy.title}</h2>
              <p className="catalog-subtitle">{copy.subtitle}</p>
            </div>

            <div className="catalog-meta-card">
              <div className="meta-stat">{copy.listed.replace("{count}", products.length)}</div>
            </div>
          </div>

          {status ? <div className="catalog-status">{status}</div> : null}

          <div className="catalog-header">
            <input
              type="text"
              placeholder={t("search_plants")}
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="toggle-bar">
            <button className={activeTab === "buy" ? "active" : ""} onClick={() => setActiveTab("buy")}>
              {copy.buy}
            </button>
            <button className={activeTab === "sell" ? "active" : ""} onClick={() => setActiveTab("sell")}>
              {copy.sell}
            </button>
          </div>

          {activeTab === "buy" ? (
            <>
              <div className="season-grid">
                {seasons.map((season) => (
                  <div key={season.title} className="season-card" onClick={() => navigate(`/season/${season.title.toLowerCase()}`)}>
                    <img src={season.image} alt={season.title} />
                    <div className="season-name">{season.title}</div>
                  </div>
                ))}

                <div className="season-card all-card" onClick={() => navigate("/season/all")}>
                  <div className="season-name">{copy.allPlants}</div>
                </div>
              </div>

              <h3 className="section-title">{copy.available}</h3>

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
            </>
          ) : (
            <div className="sell-form">
              <h3>{copy.listForSale}</h3>

              <input
                type="text"
                placeholder={copy.plantName}
                value={newPlant.name}
                onChange={(event) => setNewPlant({ ...newPlant, name: event.target.value })}
              />
              <input
                type="number"
                placeholder={copy.price}
                value={newPlant.price}
                onChange={(event) => setNewPlant({ ...newPlant, price: event.target.value })}
              />

              <select
                value={newPlant.season}
                onChange={(event) => setNewPlant({ ...newPlant, season: event.target.value })}
              >
                <option>Spring</option>
                <option>Summer</option>
                <option>Autumn</option>
                <option>Winter</option>
              </select>

              <input
                type="file"
                accept="image/*"
                onChange={(event) => setNewPlant({ ...newPlant, image: event.target.files?.[0] || null })}
              />

              <button onClick={handleSell}>{copy.listPlant}</button>

              <h4>{copy.yourListed}</h4>

              <div className="product-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-card">
                    <img src={product.image ? buildApiUrl(product.image) : "/defaultPlant.jpg"} alt={product.name} />
                    <h4>{product.name}</h4>
                    <p>{product.season}</p>
                    <p className="price currency-text">{formatPrice(product.price)}</p>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Delete ${product.name}?`)) {
                          await deleteProduct(product.id);
                          fetchProductsList();
                          showStatus(`${product.name} deleted.`);
                        }
                      }}
                    >
                      {copy.remove}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
