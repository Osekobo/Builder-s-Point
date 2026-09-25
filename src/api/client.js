import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const isAdminRequest = (config) => {
  const url = config?.url || "";
  const method = (config?.method || "get").toLowerCase();

  if (url.includes("/admin")) return true;
  return url.includes("/products") && method !== "get";
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/");

    if (typeof window !== "undefined" && status === 401 && !isAuthEndpoint) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    if (typeof window !== "undefined" && status === 403 && isAdminRequest(error.config)) {
      window.dispatchEvent(new CustomEvent("auth:forbidden"));
    }

    return Promise.reject(error);
  },
);

export default api;
