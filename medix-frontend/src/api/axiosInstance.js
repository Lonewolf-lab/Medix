import axios from "axios";
import { useServerStatusStore } from "@/store/serverStatusStore";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

/** Backend origin without the /api suffix — for static file links (uploads). */
export const API_ORIGIN = baseURL.replace(/\/$/, "");

/**
 * Central axios instance.
 * - withCredentials: true  → the HttpOnly `medix_token` cookie set by the
 *   backend is sent automatically on every request (no manual JWT handling).
 * - All app calls hit `/api/...`, so baseURL includes `/api`.
 */
const api = axios.create({
  baseURL: `${baseURL.replace(/\/$/, "")}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Optional handler the auth store registers so a global 401 can log the user out
// without this module importing the store (avoids a circular dependency).
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

// Track active requests and their spin-up loading timeouts
const activeRequests = new Map();

const handleRequestCleanup = (config) => {
  const requestId = config?.headers?.["X-Request-ID"];
  if (requestId && activeRequests.has(requestId)) {
    clearTimeout(activeRequests.get(requestId));
    activeRequests.delete(requestId);
  }
  if (activeRequests.size === 0) {
    useServerStatusStore.getState().setServerSpinningUp(false);
  }
};

api.interceptors.request.use(
  (config) => {
    const requestId = Math.random().toString(36).substring(2, 9);
    config.headers["X-Request-ID"] = requestId;

    // If request takes longer than 1.5 seconds, it means the server is cold-starting / spinning up on Render.
    const timeoutId = setTimeout(() => {
      useServerStatusStore.getState().setServerSpinningUp(true);
    }, 1500);

    activeRequests.set(requestId, timeoutId);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    handleRequestCleanup(response.config);
    return response;
  },
  (error) => {
    handleRequestCleanup(error.config);
    const { response, config } = error;
    const isAuthCall = config?.url?.includes("/auth/");

    // Session expired / not logged in on a protected call → bubble up to app.
    if (response?.status === 401 && !isAuthCall && typeof onUnauthorized === "function") {
      onUnauthorized();
    }

    // Normalize to a predictable shape regardless of backend/error variety.
    const data = response?.data;
    const normalized = {
      status: response?.status ?? 0,
      message:
        data?.message ||
        (typeof data === "string" ? data : null) ||
        error.message ||
        "Something went wrong. Please try again.",
      fieldErrors: data?.fieldErrors ?? null,
      raw: data ?? null,
    };
    return Promise.reject(normalized);
  },
);

export default api;
