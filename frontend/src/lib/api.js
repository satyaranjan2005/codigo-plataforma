import axios from "axios";
import { getErrorMessage, logError, isAuthError } from "./errorHandler";

/**
 * Simple axios client used across the app.
 * - baseURL is taken from NEXT_PUBLIC_API_BASE or falls back to '/api'
 * - automatically attaches Bearer token from localStorage key 'authToken' when present
 * - exports short helper wrappers that return response.data
 * - includes comprehensive error handling
 */

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000",
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
      console.error('Error attaching auth token:', e);
    }
    return config;
  },
  (error) => {
    logError(error, { location: 'api.interceptor.request' });
    return Promise.reject(error);
  }
);

// Response interceptor: unwrap data, handle 401 cleanup, log errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Log error for debugging
    logError(err, { 
      location: 'api.interceptor.response',
      url: err?.config?.url,
      method: err?.config?.method 
    });

    // Handle auth errors
    if (isAuthError(err) && typeof window !== "undefined") {
      try {
        // Clear auth data
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        localStorage.removeItem("sic_no");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        
        // Dispatch auth change event
        window.dispatchEvent(new Event('authChange'));
        
        // Redirect to login if on a protected route
        if (window.location.pathname.startsWith('/dashboard')) {
          window.location.href = '/login';
        }
      } catch (e) {
        console.error('Error handling auth cleanup:', e);
      }
    }
    
    return Promise.reject(err);
  }
);

// Helper wrappers (return data directly with better error messages)
export async function get(path, params = {}) {
  try {
    const res = await api.get(path, { params });
    return res.data;
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }
}

export async function post(path, body = {}, config = {}) {
  try {
    const res = await api.post(path, body, config);
    return res.data;
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }
}

export async function put(path, body = {}, config = {}) {
  try {
    const res = await api.put(path, body, config);
    return res.data;
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }
}

export async function del(path, config = {}) {
  try {
    const res = await api.delete(path, config);
    return res.data;
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }
}

export default api;
