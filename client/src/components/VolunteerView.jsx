import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from './CountdownTimer';

export default function VolunteerView() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchVolunteerTasks = async () => {
    try {
      const data = await apiRequest('/listings/volunteer');
      setListings(data.listings || []);
    } catch (err) {
      console.error('Fetch volunteer tasks error:', err);
    }
  };

  useEffect(() => {
    fetchVolunteerTasks();
    // 5-second polling for automatic updates
    const interval = setInterval(fetchVolunteerTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (listingId, newStatus) => {
    setActionId(listingId);
    setMessage('');
    try {
      await apiRequest(`/listings/${listingId}/status`, 'PATCH', { status: newStatus });
      setMessage(`Listing marked as ${newStatus.replace('_', ' ')}!`);
      fetchVolunteerTasks();
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setActionId(null);
    }
  };

  const activeTasks = listings.filter((item) => ['accepted', 'picked_up'].includes(item.status));
  const completedTasks = listings.filter((item) => item.status === 'delivered');

  return (
    <div className="space-y-6 py-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-semibold mb-2">
            Volunteer Dispatch Network
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Volunteer Dispatch & Pickup</h1>
          <p className="text-sm text-slate-600 mt-1">
            Logged in as <span className="font-semibold">{user?.name}</span> ({user?.role}) • City:{' '}
            <span className="font-semibold">{user?.city || 'Roorkee'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Auto-polling tasks every 5s
        </div>
      </div>

      {message && (
        <div
          className={`p-3 text-xs rounded-md ${
            message.startsWith('Error')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Active Tasks Section (Requirement 4) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Active Rescue Tasks ({activeTasks.length})
            </h2>
            <p className="text-xs text-slate-500">Pick up food from donors and deliver to accepting NGOs</p>
          </div>
          <button
            onClick={fetchVolunteerTasks}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 text-slate-600"
          >
            🔄 Refresh
          </button>
        </div>

        {activeTasks.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No pending pickups right now. When an NGO accepts a donation, it will show up here!
          </div>
        ) : (
          <div className="space-y-4">
            {activeTasks.map((item) => (
              <div
                key={item._id}
                className={`p-5 rounded-xl border transition ${
                  item.status === 'picked_up'
                    ? 'border-purple-300 bg-purple-50/30'
                    : 'border-amber-300 bg-amber-50/20'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-slate-900">{item.foodType}</span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                          item.isVeg ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          item.status === 'picked_up'
                            ? 'bg-purple-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {item.status === 'picked_up' ? 'In Transit / Picked Up' : 'Accepted (Ready for Pickup)'}
                      </span>
                    </div>

                    {/* Routing Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                          📍 PICKUP ORIGIN (Donor)
                        </span>
                        <div className="text-sm font-semibold text-slate-900 mt-0.5">{item.donorName}</div>
                        <div className="text-slate-500">{item.city} (Lat: {item.lat}, Lng: {item.lng})</div>
                        <div className="text-slate-700 font-medium mt-1">Meals to carry: <strong>{item.quantity}</strong></div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">
                          🏢 DROP-OFF DESTINATION (NGO)
                        </span>
                        <div className="text-sm font-semibold text-slate-900 mt-0.5">{item.ngoName || 'Partner NGO'}</div>
                        <div className="text-slate-500">{item.city} Central Shelter</div>
                        <div className="text-slate-500 mt-1 flex items-center gap-1.5">
                          Safe window remaining: <CountdownTimer targetDate={item.safeUntil} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons (Requirement 4: Picked up & Delivered) */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-44">
                    {item.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(item._id, 'picked_up')}
                        disabled={actionId === item._id}
                        className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg transition shadow text-center"
                      >
                        {actionId === item._id ? 'Updating...' : '📦 Mark Picked Up'}
                      </button>
                    )}

                    {item.status === 'picked_up' && (
                      <button
                        onClick={() => handleUpdateStatus(item._id, 'delivered')}
                        disabled={actionId === item._id}
                        className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition shadow text-center"
                      >
                        {actionId === item._id ? 'Updating...' : '🏁 Mark Delivered'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Delivered Section */}
      {completedTasks.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
            Recently Completed Deliveries ({completedTasks.length})
          </h2>
          <div className="divide-y divide-slate-100">
            {completedTasks.slice(0, 5).map((item) => (
              <div key={item._id} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-slate-800">{item.foodType}</span> ({item.quantity} meals)
                  <span className="text-slate-400 ml-2">from {item.donorName} → to {item.ngoName || 'NGO'}</span>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Successfully Delivered
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
