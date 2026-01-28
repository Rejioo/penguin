import axios from "axios";

/**
 * Central Axios instance
 * Do NOT put auth logic anywhere else
 */
export const api = axios.create({
  baseURL: "http://localhost:5000", // Node backend
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach JWT automatically
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor
 * NO redirects, NO side effects
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Network error:", error);
      return Promise.reject({
        message: "Backend not reachable",
      });
    }

    return Promise.reject(error);
  }
);

// export default api;
