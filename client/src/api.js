// Simple API helper with token management
// In production, fallback to VITE_API_BASE_URL (e.g. https://your-backend.onrender.com/api) or default to '/api'
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

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

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}
