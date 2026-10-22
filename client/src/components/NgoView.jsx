import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from './CountdownTimer';

export default function NgoView() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState('');

  const fetchNgoListings = async () => {
    try {
      const data = await apiRequest('/listings/ngo');
      setListings(data.listings || []);
    } catch (err) {
      console.error('Fetch NGO listings error:', err);
    }
  };

  useEffect(() => {
    fetchNgoListings();
    const interval = setInterval(fetchNgoListings, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (listingId) => {
    setActionLoading(listingId);
    setFeedback('');
    try {
      await apiRequest(`/listings/${listingId}/accept`, 'PATCH');
      setFeedback('Listing accepted! Routed to volunteer dispatch.');
      fetchNgoListings();
    } catch (err) {
      setFeedback('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] sm:text-xs font-bold mb-1">
            Smart Matching Engine
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">NGO Matchboard</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            <span className="font-semibold text-slate-800">{user?.name}</span> • Capacity:{' '}
            <span className="font-bold text-blue-700">{user?.capacity || 100} meals</span> • Base:{' '}
            <span className="font-semibold text-slate-800">{user?.city || 'Roorkee'}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Auto-polling 5s
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 text-xs rounded-lg font-medium ${
            feedback.startsWith('Error')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {feedback}
        </div>
      )}

      {/* Matching Algorithm Note */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3.5 sm:p-4 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
        <span className="font-bold">🎯 Scoring Rule:</span> Listings are ranked by{' '}
        <strong>Distance Score</strong> (closer is higher) + <strong>Capacity Fit Bonus</strong> (capacity ≥ meals) +{' '}
        <strong>Time Margin</strong> (safe window).
      </div>

      {/* Listings List */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Open Surplus Donations ({listings.length})
          </h2>
          <button
            onClick={fetchNgoListings}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600 font-medium"
          >
            🔄 Refresh
          </button>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs sm:text-sm">
            No open surplus food listings right now. Post one from the Donor portal!
          </div>
        ) : (
          <div className="space-y-3.5">
            {listings.map((item, index) => {
              const hasCapacity = (user?.capacity || 100) >= item.quantity;
              return (
                <div
                  key={item._id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-2.5 w-full md:flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-slate-900">{item.foodType}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          item.isVeg ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                      <span className="bg-indigo-100 text-indigo-900 text-xs px-2 py-0.5 rounded-full font-bold">
                        ⭐ Score: {item.matchScore}/100
                      </span>
                      {index === 0 && (
                        <span className="bg-emerald-600 text-white text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-bold">
                          Top Match
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[9px] font-bold uppercase">Meals</span>
                        <strong className="text-sm text-slate-900">{item.quantity}</strong> portions
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[9px] font-bold uppercase">Proximity</span>
                        <strong className="text-sm text-blue-700">{item.distanceKm} km</strong> away
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[9px] font-bold uppercase">Capacity</span>
                        <span className={`font-semibold ${hasCapacity ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {hasCapacity ? '✓ Full Fit' : '⚠ Partial'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[9px] font-bold uppercase">Donor</span>
                        <span className="font-semibold text-slate-800 truncate block">{item.donorName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                      <span>Safe Until: {new Date(item.safeUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <CountdownTimer targetDate={item.safeUntil} />
                      <span className="text-slate-400">({item.city})</span>
                    </div>
                  </div>

                  {/* Accept Button - Full width on mobile */}
                  <div className="w-full md:w-auto shrink-0">
                    <button
                      onClick={() => handleAccept(item._id)}
                      disabled={actionLoading === item._id}
                      className="w-full md:w-auto px-5 py-3 md:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      {actionLoading === item._id ? 'Accepting...' : '✓ Accept Donation'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
