import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiBase, setCustomApiBase } from '../api';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout, login } = useAuth();
  const [showApiModal, setShowApiModal] = useState(false);
  const [backendInput, setBackendInput] = useState(getApiBase());

  const handleSeedLogin = async (role) => {
    try {
      if (role === 'Donor') await login('donor@foodrescue.org', 'donor123');
      if (role === 'NGO') await login('ngo@foodrescue.org', 'ngo123');
      if (role === 'Volunteer') await login('volunteer@foodrescue.org', 'vol123');
      setActiveTab(role.toLowerCase());
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveBackendUrl = (e) => {
    e.preventDefault();
    setCustomApiBase(backendInput);
    setShowApiModal(false);
    window.location.reload();
  };

  const currentApi = getApiBase();
  const isDefaultOnVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') && currentApi === '/api';

  return (
    <>
      {/* Banner if backend URL is not connected on Vercel */}
      {isDefaultOnVercel && (
        <div className="bg-amber-500 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
          <span>⚠️ Backend API not connected to Render yet.</span>
          <button
            onClick={() => setShowApiModal(true)}
            className="underline font-bold bg-amber-600 px-2 py-0.5 rounded hover:bg-amber-700"
          >
            Connect Render Backend URL
          </button>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo & Tagline */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
              <span className="text-2xl">🍲</span>
              <div>
                <span className="text-xl font-bold tracking-tight text-emerald-700">FoodRescue</span>
                <span className="ml-2 text-xs uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold tracking-wider">
                  Prototype
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  activeTab === 'home'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Home & Impact
              </button>
              <button
                onClick={() => setActiveTab('donor')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  activeTab === 'donor'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Donor Portal
              </button>
              <button
                onClick={() => setActiveTab('ngo')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  activeTab === 'ngo'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                NGO Matching
              </button>
              <button
                onClick={() => setActiveTab('volunteer')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  activeTab === 'volunteer'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Volunteer Dispatch
              </button>
            </nav>

            {/* User state, demo switch, and settings */}
            <div className="flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right leading-tight">
                    <div className="text-xs font-semibold text-slate-900">{user.name}</div>
                    <div className="text-xs text-emerald-600 font-medium">{user.role} ({user.city || 'Roorkee'})</div>
                  </div>
                  <button
                    onClick={logout}
                    className="px-2.5 py-1 text-xs border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-xs">
                  <span className="text-slate-400 font-medium mr-1 hidden sm:inline">Demo Quick-Log:</span>
                  <button
                    onClick={() => handleSeedLogin('Donor')}
                    className="px-2 py-1 bg-amber-50 text-amber-800 rounded border border-amber-200 hover:bg-amber-100 font-medium"
                  >
                    Donor
                  </button>
                  <button
                    onClick={() => handleSeedLogin('NGO')}
                    className="px-2 py-1 bg-blue-50 text-blue-800 rounded border border-blue-200 hover:bg-blue-100 font-medium"
                  >
                    NGO
                  </button>
                  <button
                    onClick={() => handleSeedLogin('Volunteer')}
                    className="px-2 py-1 bg-purple-50 text-purple-800 rounded border border-purple-200 hover:bg-purple-100 font-medium"
                  >
                    Volunteer
                  </button>
                </div>
              )}

              {/* API Configuration Button */}
              <button
                onClick={() => {
                  setBackendInput(getApiBase());
                  setShowApiModal(true);
                }}
                title="Configure Backend API URL"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Backend URL Modal */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">🔗 Backend API URL Connection</h3>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              When running on Vercel, connect your deployed Render backend (e.g.,{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700">
                https://your-backend.onrender.com
              </code>
              ).
            </p>

            <form onSubmit={handleSaveBackendUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Render Backend URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://foodrescue-api.onrender.com"
                  value={backendInput}
                  onChange={(e) => setBackendInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomApiBase('');
                    setBackendInput('/api');
                    setShowApiModal(false);
                    window.location.reload();
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Reset to Default (/api)
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
