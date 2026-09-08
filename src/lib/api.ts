import axios from "axios";
import { removeToken } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
    "bypass-tunnel-reminder": "true",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      typeof window !== "undefined" &&
      error.response &&
      error.response.status === 401 &&
      window.location.pathname !== "/"
    ) {
      removeToken();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getApiErrorMessage(error: any, defaultMsg = "An error occurred"): string {
  if (!error) return defaultMsg;
  const data = error.response?.data;
  if (data) {
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
    }
    if (typeof data.message === "string") return data.message;
  }
  if (error.message) return error.message;
  return defaultMsg;
}

export default api;

