import axios from "axios";

const browserHostname = typeof window !== "undefined" ? window.location.hostname : "";
const isLocalBrowser = ["localhost", "127.0.0.1"].includes(browserHostname);
const localDevApiUrl = "http://localhost:8000";
const envApiUrl = process.env.REACT_APP_API_URL?.trim();
const rawApiUrl = (isLocalBrowser ? localDevApiUrl : envApiUrl)?.replace(/\/+$/, "");
const normalizedApiUrl = !rawApiUrl
  ? "/api"
  : rawApiUrl.endsWith("/api")
    ? rawApiUrl
    : `${rawApiUrl}/api`;

export const API_URL = normalizedApiUrl;
export const ASSET_URL = API_URL.endsWith("/api") ? API_URL.slice(0, -4) : API_URL;
const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [1200, 2500, 4000];
const WARMUP_TIMEOUT_MS = 30000;
const BACKEND_READY_TTL_MS = 5 * 60 * 1000;

let backendReadyPromise = null;
let backendReadyConfirmedAt = 0;

console.info("[Florana API] Base URL:", API_URL);

const API = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const isMutationMethod = (method = "get") => ["post", "put", "patch", "delete"].includes(method.toLowerCase());
const isBackendReadyFresh = () => backendReadyConfirmedAt > 0 && Date.now() - backendReadyConfirmedAt < BACKEND_READY_TTL_MS;

const shouldRetryRequest = (error) => {
  const status = error.response?.status;
  const method = (error.config?.method || "get").toLowerCase();
  const isSafeMethod = ["get", "head", "options"].includes(method);
  const isTimeout = error.code === "ECONNABORTED";
  const isNetworkError = !error.response && (error.message === "Network Error" || error.code === "ERR_NETWORK");
  const isServerUnavailable = [502, 503, 504].includes(status);

  return isSafeMethod && (isTimeout || isNetworkError || isServerUnavailable);
};

export const getApiErrorMessage = (error) => {
  const detail = error.response?.data?.detail;
  const serverMessage = Array.isArray(detail)
    ? detail.map((entry) => entry.msg || JSON.stringify(entry)).join(", ")
    : detail || error.response?.data?.message;

  if (serverMessage) {
    return serverMessage;
  }

  if (error.code === "ECONNABORTED") {
    return "The backend is taking too long to respond. It may be waking up on Render. Please try again in a moment.";
  }

  if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
    return "Cannot connect to the backend server. Check your connection and try again while the server wakes up.";
  }

  return "Cannot connect to backend server.";
};

const HEALTHY_PREDICTION_LABELS = ["healthy plant", "healthy", "fresh leaf"];

const prettifyPredictionLabel = (value = "Unknown") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const formatPredictionResult = (payload = {}) => {
  const rawPrediction = payload.raw_prediction || payload.prediction || payload.disease || "Unknown";
  const prediction = payload.prediction ? String(payload.prediction) : prettifyPredictionLabel(rawPrediction);
  const confidence =
    typeof payload.confidence === "number"
      ? payload.confidence
      : typeof payload.confidence_percent === "number"
        ? payload.confidence_percent / 100
        : 0;
  const confidencePercent =
    typeof payload.confidence_percent === "number"
      ? payload.confidence_percent
      : Number((confidence * 100).toFixed(2));
  const isHealthy =
    typeof payload.is_healthy === "boolean"
      ? payload.is_healthy
      : HEALTHY_PREDICTION_LABELS.includes(String(rawPrediction).toLowerCase()) ||
        HEALTHY_PREDICTION_LABELS.includes(prediction.toLowerCase());

  return {
    ...payload,
    prediction,
    rawPrediction,
    confidence,
    confidencePercent,
    isHealthy,
  };
};

const ensureBackendReady = async ({ force = false } = {}) => {
  if (!force && isBackendReadyFresh()) {
    return backendReadyPromise || Promise.resolve();
  }

  if (!force && backendReadyPromise) {
    return backendReadyPromise;
  }

  backendReadyPromise = API.get("/health", {
    timeout: WARMUP_TIMEOUT_MS,
    metadata: {
      retryCount: 0,
      skipBackendReadyCheck: true,
    },
  })
    .then((response) => {
      backendReadyConfirmedAt = Date.now();
      backendReadyPromise = null;
      return response;
    })
    .catch((error) => {
      backendReadyPromise = null;
      backendReadyConfirmedAt = 0;
      throw error;
    });

  return backendReadyPromise;
};


API.interceptors.request.use(
  async (config) => {
    config.metadata = {
      retryCount: config.metadata?.retryCount || 0,
      startedAt: config.metadata?.startedAt || Date.now(),
      skipBackendReadyCheck: Boolean(config.metadata?.skipBackendReadyCheck),
    };

    if (isMutationMethod(config.method) && !config.metadata.skipBackendReadyCheck) {
      await ensureBackendReady();
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const url = `${config.baseURL || ""}${config.url || ""}`;
    console.info("[Florana API] Request:", {
      method: (config.method || "get").toUpperCase(),
      url,
      retryCount: config.metadata.retryCount,
    });

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => {
    console.info("[Florana API] Response:", {
      method: (response.config.method || "get").toUpperCase(),
      url: `${response.config.baseURL || ""}${response.config.url || ""}`,
      status: response.status,
      durationMs: Date.now() - (response.config.metadata?.startedAt || Date.now()),
    });

    return response;
  },
  async (error) => {
    const config = error.config || {};
    const retryCount = config.metadata?.retryCount || 0;

    console.error("[Florana API] Error:", {
      url: `${config.baseURL || ""}${config.url || ""}`,
      method: (config.method || "get").toUpperCase(),
      status: error.response?.status || "NO_RESPONSE",
      code: error.code || "UNKNOWN",
      message: error.message,
      detail: error.response?.data || null,
      retryCount,
    });

    if (shouldRetryRequest(error) && retryCount < MAX_RETRIES) {
      const nextRetryCount = retryCount + 1;
      const retryDelay = RETRY_DELAYS_MS[retryCount] || RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];

      config.metadata = {
        ...(config.metadata || {}),
        retryCount: nextRetryCount,
      };

      console.warn("[Florana API] Retrying request:", {
        url: `${config.baseURL || ""}${config.url || ""}`,
        method: (config.method || "get").toUpperCase(),
        retryCount: nextRetryCount,
        retryDelay,
      });

      await delay(retryDelay);
      return API(config);
    }

    return Promise.reject(error);
  }
);


export const buildApiUrl = (path = "") => {
  if (!path) {
    return API_URL;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath.startsWith("/uploads/")) {
    return `${ASSET_URL}${normalizedPath}`;
  }

  return `${API_URL}${normalizedPath}`;
};

export const warmUpBackend = () => ensureBackendReady();
export const getBackendHealth = () =>
  API.get("/health", {
    metadata: {
      skipBackendReadyCheck: true,
    },
  });


export const signupUser = (payload) => API.post("/auth/signup", payload);

export const loginUser = async (email, password) => {
  const response = await API.post("/auth/login", { email, password });

  if (response.data?.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }

  return response;
};

export const predictImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getPlants = () => API.get("/plants/");

export const createPlant = (formData) =>
  API.post("/plants/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deletePlant = (plantId) => API.delete(`/plants/${plantId}`);

export const getPlant = (plantId) => API.get(`/plants/${plantId}`);

export const getPlantByName = (plantName) =>
  API.get(`/plants/by-name/${encodeURIComponent(plantName)}`);

export const addGrowth = (formData) =>
  API.post("/growth/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getGrowth = (plantId) => API.get(`/growth/${plantId}`);

export const getProducts = () => API.get("/shop/products");

export const createPaymentOrder = (payload) => API.post("/payments/orders", payload);

export const sendPaymentOtp = (payload) => API.post("/payments/orders/otp", payload);

export const verifyPaymentOtp = (payload) => API.post("/payments/orders/verify", payload);

export const confirmPaymentOrder = (payload) => API.post("/payments/orders/confirm", payload);

export const getPaymentOrder = (orderId) => API.get(`/payments/orders/${orderId}`);

export const getPayPalConfig = () => API.get("/paypal/config");

export const createPayPalOrder = (payload) => API.post("/create-order", payload);

export const capturePayPalOrder = (orderId) => API.post(`/capture-order/${orderId}`);

export const createProduct = (formData) =>
  API.post("/shop/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteProduct = (productId) => API.delete(`/shop/products/${productId}`);

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};


export default API;
