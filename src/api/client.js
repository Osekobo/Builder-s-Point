import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/");

    if (status === 401 && !isAuthEndpoint) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject(error);
  },
);

export default api;