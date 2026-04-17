// api.js
import axios from "axios";

// ================= BASE CONFIG =================
const defaultHost = window?.location?.hostname || "127.0.0.1";
const API_URL =
  process.env.REACT_APP_API_URL ||
  `http://${defaultHost}:8000`;

const API = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

console.log("API base URL:", API_URL);

// ================= REQUEST LOGGING =================
API.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.method, config.url, config.data || config.params);
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// ================= RESPONSE LOGGING =================
API.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ================= AUTH =================

// 🔐 REGISTER
export const registerUser = (email, password) => {
  return API.post("/auth/signup", { email, password });
};

// 🔐 LOGIN
export const loginUser = async (email, password) => {
  const res = await API.post("/auth/login", { email, password });

  // ✅ Save token automatically
  if (res.data.access_token) {
    localStorage.setItem("token", res.data.access_token);
  }

  return res;
};

// ================= AI PREDICTION =================

// 🌿 Predict plant disease
export const predictImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post("/predict", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ================= PLANTS =================

// 🌱 Get all plants
export const getPlants = () => {
  return API.get("/plants/");
};

// 🌱 Create new plant
export const createPlant = (formData) => {
  return API.post("/plants/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 🌱 Get plant by ID
export const getPlant = (plantId) => {
  return API.get(`/plants/${plantId}`);
};

// 🌱 Get plant by name
export const getPlantByName = (plantName) => {
  return API.get(`/plants/by-name/${encodeURIComponent(plantName)}`);
};

// ================= 🌱 GROWTH TRACKER =================

// 🌿 Add growth record
export const addGrowth = (formData) => {
  return API.post("/growth/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 🌿 Get growth history by plant ID
export const getGrowth = (plantId) => {
  return API.get(`/growth/${plantId}`);
};

// ================= EXTRA (OPTIONAL) =================

// 🚪 Logout helper
export const logoutUser = () => {
  localStorage.removeItem("token");
};