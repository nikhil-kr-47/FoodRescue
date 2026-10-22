import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from './CountdownTimer';

// Hardcoded safe window table matching project requirements:
// cooked rice/curry 4h, bakery 12h, packaged 48h
const SAFE_WINDOW_TABLE = {
  'Cooked rice, curries, dal': 4,
  'Bakery items': 12,
  'Packaged food': 48,
  'Fried snacks and starters': 4,
  'Dairy-based sweets': 6
};

const CITY_COORDINATES = {
  Roorkee: { lat: 29.8543, lng: 77.8880 },
  Dehradun: { lat: 30.3165, lng: 78.0322 },
  Haridwar: { lat: 29.9457, lng: 78.1642 },
  Delhi: { lat: 28.6139, lng: 77.2090 }
};

export default function DonorView() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Default cooked time: now formatted for datetime-local
  const getNowLocal = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    foodType: 'Cooked rice, curries, dal',
    quantity: 30,
    isVeg: true,
    cookedAt: getNowLocal(),
    city: user?.city || 'Roorkee',
    lat: user?.lat || 29.8543,
    lng: user?.lng || 77.8880
  });

  // Calculate safe until preview
  const safeHours = SAFE_WINDOW_TABLE[formData.foodType] || 4;
  const calculatedSafeUntil = new Date(new Date(formData.cookedAt).getTime() + safeHours * 60 * 60 * 1000);

  const fetchMyListings = async () => {
    try {
      const data = await apiRequest('/listings/my');
      setListings(data.listings || []);
    } catch (err) {
      console.error('Fetch listings error:', err);
    }
  };

  useEffect(() => {
    fetchMyListings();
    // 5-second polling for automatic status updates
    const interval = setInterval(fetchMyListings, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCityChange = (e) => {
    const city = e.target.value;
    const coords = CITY_COORDINATES[city] || { lat: 29.8543, lng: 77.8880 };
    setFormData({
      ...formData,
      city,
      lat: coords.lat,
      lng: coords.lng
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await apiRequest('/listings', 'POST', formData);
      setMessage('Surplus food posted successfully! Safe-until deadline computed.');
      fetchMyListings();
      // Reset some fields
      setFormData((prev) => ({
        ...prev,
        quantity: 30,
        cookedAt: getNowLocal()
      }));
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Open for Matching</span>;
      case 'accepted':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Accepted by NGO</span>;
      case 'picked_up':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Picked Up</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Delivered</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Donor Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as <span className="font-semibold text-slate-800">{user?.name}</span> ({user?.role})
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Auto-polling listings every 5s
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Post Surplus Food Form (Requirement 2) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
            <span>➕ Post Surplus Food</span>
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            System automatically calculates the safe-until consumption deadline.
          </p>

          {message && (
            <div
              className={`p-3 text-xs rounded-md mb-4 ${
                message.startsWith('Error')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Food Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Food Category (determines safe window)
              </label>
              <select
                value={formData.foodType}
                onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Cooked rice, curries, dal">Cooked rice, curries, dal (4h limit)</option>
                <option value="Bakery items">Bakery items (12h limit)</option>
                <option value="Packaged food">Packaged food (48h limit)</option>
                <option value="Fried snacks and starters">Fried snacks and starters (4h limit)</option>
                <option value="Dairy-based sweets">Dairy-based sweets (6h limit)</option>
              </select>
            </div>

            {/* Quantity & Veg/Non-Veg */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity (Meals)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dietary Type</label>
                <select
                  value={formData.isVeg ? 'veg' : 'non-veg'}
                  onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === 'veg' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="veg">🟢 100% Veg</option>
                  <option value="non-veg">🔴 Non-Veg</option>
                </select>
              </div>
            </div>

            {/* Cooked Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cooked At (Time)</label>
              <input
                type="datetime-local"
                required
                value={formData.cookedAt}
                onChange={(e) => setFormData({ ...formData, cookedAt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Location (City dropdown or Lat/Lng) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup City</label>
              <select
                value={formData.city}
                onChange={handleCityChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
              >
                <option value="Roorkee">Roorkee (29.8543, 77.8880)</option>
                <option value="Dehradun">Dehradun (30.3165, 78.0322)</option>
                <option value="Haridwar">Haridwar (29.9457, 78.1642)</option>
                <option value="Delhi">Delhi (28.6139, 77.2090)</option>
              </select>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Live Safe-until calculation preview */}
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-xs font-semibold text-emerald-900 flex justify-between">
                <span>Rule-based Safe Window:</span>
                <span className="font-bold">+{safeHours} Hours</span>
              </div>
              <div className="text-xs text-emerald-800 mt-1">
                Auto-calculated Safe Until:{' '}
                <span className="font-semibold underline">
                  {isNaN(calculatedSafeUntil.getTime())
                    ? 'Invalid date'
                    : calculatedSafeUntil.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
                      ' (' +
                      calculatedSafeUntil.toLocaleDateString() +
                      ')'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-md transition shadow"
            >
              {submitting ? 'Submitting...' : 'Post Surplus Donation'}
            </button>
          </form>
        </div>

        {/* Donor's Listings List (Requirement 2) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Posted Food Listings</h2>
              <p className="text-xs text-slate-500">Live status tracking of your food contributions</p>
            </div>
            <button
              onClick={fetchMyListings}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 text-slate-600"
            >
              🔄 Refresh
            </button>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No surplus food listings posted yet. Use the form on the left to post one!
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((item) => (
                <div
                  key={item._id}
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white transition flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.foodType}</span>
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                          item.isVeg ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>🍽 <strong>{item.quantity}</strong> meals</span>
                      <span>📍 {item.city}</span>
                      <span>🕒 Cooked: {new Date(item.cookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span>Safe Until: {new Date(item.safeUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <CountdownTimer targetDate={item.safeUntil} />
                    </div>

                    {item.ngoName && (
                      <div className="text-[11px] text-blue-700 font-medium">
                        🏢 Accepted by NGO: <strong>{item.ngoName}</strong>
                      </div>
                    )}
                    {item.volunteerName && (
                      <div className="text-[11px] text-purple-700 font-medium">
                        🛵 Volunteer: <strong>{item.volunteerName}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
