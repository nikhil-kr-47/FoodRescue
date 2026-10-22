import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout, login } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSeedLogin = async (role) => {
    try {
      if (role === 'Donor') await login('donor@foodrescue.org', 'donor123');
      if (role === 'NGO') await login('ngo@foodrescue.org', 'ngo123');
      if (role === 'Volunteer') await login('volunteer@foodrescue.org', 'vol123');
      setActiveTab(role.toLowerCase());
      setMobileMenuOpen(false);
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home & Impact', icon: '📊' },
    { id: 'donor', label: 'Donor Portal', icon: '🍲' },
    { id: 'ngo', label: 'NGO Matching', icon: '🏢' },
    { id: 'volunteer', label: 'Volunteer Dispatch', icon: '🛵' }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Tagline */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer shrink-0"
            onClick={() => handleNavClick('home')}
          >
            <span className="text-2xl sm:text-3xl">🍲</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-emerald-700">
                FoodRescue
              </span>
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold tracking-wider">
                Demo
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === item.id
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="mr-1.5 text-xs">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop User Info & Quick Seed Switch */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                <div className="text-right leading-tight">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">{user.name}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">
                    {user.role} • {user.city || 'Roorkee'}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 font-medium transition shadow-2xs"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-xs bg-slate-50 border border-slate-200 p-1.5 rounded-lg">
                <span className="text-slate-500 font-medium px-1 text-[11px]">Quick Demo:</span>
                <button
                  onClick={() => handleSeedLogin('Donor')}
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold transition text-xs"
                >
                  Donor
                </button>
                <button
                  onClick={() => handleSeedLogin('NGO')}
                  className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded font-semibold transition text-xs"
                >
                  NGO
                </button>
                <button
                  onClick={() => handleSeedLogin('Volunteer')}
                  className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded font-semibold transition text-xs"
                >
                  Volunteer
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Hamburger Button + Role badge */}
          <div className="flex md:hidden items-center space-x-2">
            {user && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {user.role}
              </span>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`p-3 rounded-lg text-left text-xs font-semibold flex items-center gap-2 border transition ${
                  activeTab === item.id
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* User state in mobile */}
          {user ? (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between bg-slate-50 p-3 rounded-lg">
              <div>
                <div className="text-xs font-bold text-slate-900">{user.name}</div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  {user.role} ({user.city || 'Roorkee'})
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded font-semibold text-slate-700 shadow-xs"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Quick Demo Switcher
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSeedLogin('Donor')}
                  className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold text-xs text-center"
                >
                  🍛 Donor
                </button>
                <button
                  onClick={() => handleSeedLogin('NGO')}
                  className="py-2.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg font-bold text-xs text-center"
                >
                  🏢 NGO
                </button>
                <button
                  onClick={() => handleSeedLogin('Volunteer')}
                  className="py-2.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg font-bold text-xs text-center"
                >
                  🛵 Volunteer
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
