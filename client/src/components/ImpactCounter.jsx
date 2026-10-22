import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ImpactCounter({ setActiveTab }) {
  const { user, login } = useAuth();
  const [impact, setImpact] = useState({
    totalMealsDelivered: 0,
    totalListings: 0,
    openListings: 0,
    activeRedistributions: 0,
    deliveredCount: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchImpact = async () => {
    try {
      const data = await apiRequest('/stats/impact');
      setImpact(data);
    } catch (err) {
      console.error('Impact counter fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpact();
    const interval = setInterval(fetchImpact, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSeedLogin = async (role) => {
    try {
      if (role === 'Donor') await login('donor@foodrescue.org', 'donor123');
      if (role === 'NGO') await login('ngo@foodrescue.org', 'ngo123');
      if (role === 'Volunteer') await login('volunteer@foodrescue.org', 'vol123');
      setActiveTab(role.toLowerCase());
    } catch (err) {
      alert('Login error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 rounded-2xl p-5 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-500/30 text-emerald-100 mb-3 border border-emerald-400/30">
            🌱 SDG 12.3 & SDG 2 (Zero Hunger) Prototype
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2.5 leading-tight">
            Rescue Surplus Food in Real-Time
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6">
            A fast, rule-based redistribution platform connecting food businesses with local NGOs and volunteers before safe consumption limits expire.
          </p>

          {/* Quick CTA buttons - Responsive Stack */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => {
                if (!user) handleSeedLogin('Donor');
                else setActiveTab('donor');
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-white text-emerald-800 rounded-lg font-bold text-xs sm:text-sm shadow hover:bg-emerald-50 transition text-center"
            >
              Post Surplus Food (Donor)
            </button>
            <button
              onClick={() => {
                if (!user) handleSeedLogin('NGO');
                else setActiveTab('ngo');
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-900/60 text-white border border-emerald-400/40 rounded-lg font-bold text-xs sm:text-sm hover:bg-emerald-900 transition text-center"
            >
              Review Matching (NGO)
            </button>
            <button
              onClick={() => {
                if (!user) handleSeedLogin('Volunteer');
                else setActiveTab('volunteer');
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-900/60 text-white border border-emerald-400/40 rounded-lg font-bold text-xs sm:text-sm hover:bg-emerald-900 transition text-center"
            >
              Volunteer Dispatch
            </button>
          </div>
        </div>
      </div>

      {/* Requirement 6: Tiny Impact Counter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>📊 Live Redistribution Impact</span>
          </h2>
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Auto-polling every 5s
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Main Metric */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              {loading ? '...' : impact.totalMealsDelivered}
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-emerald-900 mt-1 uppercase tracking-wide">
              Total Meals Delivered
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5 hidden xs:block">Verified food rescued</div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black text-amber-700">
              {loading ? '...' : impact.openListings}
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-amber-900 mt-1 uppercase tracking-wide">
              Open Listings
            </div>
            <div className="text-[10px] text-amber-600 mt-0.5 hidden xs:block">Ready for NGO match</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black text-blue-700">
              {loading ? '...' : impact.activeRedistributions}
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-blue-900 mt-1 uppercase tracking-wide">
              Active Transfers
            </div>
            <div className="text-[10px] text-blue-600 mt-0.5 hidden xs:block">In Transit</div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black text-purple-700">
              {loading ? '...' : impact.deliveredCount}
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-purple-900 mt-1 uppercase tracking-wide">
              Completed Drives
            </div>
            <div className="text-[10px] text-purple-600 mt-0.5 hidden xs:block">Successfully served</div>
          </div>
        </div>
      </div>

      {/* Safety Table Reference Info */}
      <div className="bg-slate-100 rounded-xl p-4 sm:p-5 border border-slate-200">
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-2.5">
          ⏱ Food Safety Window Reference (Hardcoded Rule Table)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">🍛 Cooked rice, curries, dal</div>
            <div className="text-emerald-700 font-bold mt-1 text-xs">4 Hours Safe Window</div>
            <div className="text-slate-500 text-[10px] sm:text-[11px]">Immediate consumption needed</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">🍞 Bakery items</div>
            <div className="text-emerald-700 font-bold mt-1 text-xs">12 Hours Safe Window</div>
            <div className="text-slate-500 text-[10px] sm:text-[11px]">Breads, buns, dry pastries</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">📦 Sealed packaged food</div>
            <div className="text-emerald-700 font-bold mt-1 text-xs">48 Hours Safe Window</div>
            <div className="text-slate-500 text-[10px] sm:text-[11px]">Factory sealed items</div>
          </div>
        </div>
      </div>
    </div>
  );
}
