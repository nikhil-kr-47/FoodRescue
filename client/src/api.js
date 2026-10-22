// Simple API helper with token management
// Automatically removes any old invalid custom URL saved previously in localStorage
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('foodrescue_backend_url');
    if (saved && saved.includes('foodrescue-api.onrender.com')) {
      localStorage.removeItem('foodrescue_backend_url');
    }
  } catch (e) {}
}

const API_BASE = '/api';

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
    throw new Error(data.error || 'Request failed');
  }

  return data;
}
