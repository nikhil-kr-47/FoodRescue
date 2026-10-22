// API helper with direct connection to your live Render backend
const PRODUCTION_BACKEND_URL = 'https://foodrescue-1z0t.onrender.com/api';

export const getApiBase = () => {
  // 1. Saved custom URL in localStorage (if any)
  const saved = localStorage.getItem('foodrescue_backend_url');
  if (saved) return saved.replace(/\/$/, '');

  // 2. Environment variable if set in Vercel
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  // 3. If running on Vercel or production, directly use your live Render backend!
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return PRODUCTION_BACKEND_URL;
  }

  // 4. Localhost fallback
  return '/api';
};

export const setCustomApiBase = (url) => {
  if (!url) {
    localStorage.removeItem('foodrescue_backend_url');
  } else {
    let clean = url.trim().replace(/\/$/, '');
    if (!clean.endsWith('/api') && !clean.includes('/api/')) {
      clean += '/api';
    }
    localStorage.setItem('foodrescue_backend_url', clean);
  }
};

export const getToken = () => localStorage.getItem('foodrescue_token');
export const setToken = (token) => localStorage.setItem('foodrescue_token', token);
export const removeToken = () => localStorage.removeItem('foodrescue_token');

export async function apiRequest(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const apiBase = getApiBase();

  const response = await fetch(`${apiBase}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}
