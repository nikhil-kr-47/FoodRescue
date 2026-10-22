import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout, login } = useAuth();

  const handleSeedLogin = async (role) => {
    try {
      if (role === 'Donor') await login('donor@foodrescue.org', 'donor123');
      if (role === 'NGO') await login('ngo@foodrescue.org', 'ngo123');
      if (role === 'Volunteer') await login('volunteer@foodrescue.org', 'vol123');
      setActiveTab(role.toLowerCase());
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };

  return (
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

          {/* User state & quick demo switch */}
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
          </div>
        </div>
      </div>
    </header>
  );
}
