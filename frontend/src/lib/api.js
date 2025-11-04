import axios from "axios";

/**
 * Simple axios client used across the app.
 * - baseURL is taken from NEXT_PUBLIC_API_BASE or falls back to '/api'
 * - automatically attaches Bearer token from localStorage key 'authToken' when present
 * - exports short helper wrappers that return response.data
 */

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach token if available
api.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("authToken");
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Basic response interceptor: unwrap data, handle 401 cleanup
api.interceptors.response.use(
  (res) => res,
  (err) => {
    try {
      if (err?.response?.status === 401 && typeof window !== "undefined") {
        // optional: remove stored token to force re-auth on next load
        localStorage.removeItem("authToken");
      }
    } catch (e) {
      // ignore
    }
    return Promise.reject(err);
  }
);

// Helper wrappers (return data directly)
export async function get(path, params = {}) {
  const res = await api.get(path, { params });
  return res.data;
}

export async function post(path, body = {}, config = {}) {
  const res = await api.post(path, body, config);
  return res.data;
}

export async function put(path, body = {}, config = {}) {
  const res = await api.put(path, body, config);
  return res.data;
}

export async function del(path, config = {}) {
  const res = await api.delete(path, config);
  return res.data;
}

export default api;
