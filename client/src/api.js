// Simple API helper with token and backend URL management

export const getApiBase = () => {
  const saved = localStorage.getItem('foodrescue_backend_url');
  if (saved) return saved.replace(/\/$/, '');
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  return '/api';
};

export const setCustomApiBase = (url) => {
  if (!url) {
    localStorage.removeItem('foodrescue_backend_url');
  } else {
    // ensure /api suffix if not already present
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

  try {
    const response = await fetch(`${apiBase}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        `Failed to reach backend at "${apiBase}". If you haven't connected your Render URL, please set your backend URL in the top navbar ⚙️ settings.`
      );
    }
    throw err;
  }
}
