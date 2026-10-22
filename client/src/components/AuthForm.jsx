import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthForm({ onSuccess }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Donor',
    city: 'Roorkee',
    capacity: 100
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(formData);
      } else {
        await login(formData.email, formData.password);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSeed = async (email, pass) => {
    setError('');
    setLoading(true);
    try {
      await login(email, pass);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs">
      <div className="flex border-b border-slate-200 mb-5">
        <button
          type="button"
          onClick={() => {
            setIsRegister(false);
            setError('');
          }}
          className={`w-1/2 pb-3 font-bold text-sm transition ${
            !isRegister
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegister(true);
            setError('');
          }}
          className={`w-1/2 pb-3 font-bold text-sm transition ${
            isRegister
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Create Account
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
        {isRegister && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full / Business Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Green Leaf Cafe or Care NGO"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {isRegister && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Donor">Donor (Restaurant, Hotel, Canteen)</option>
                <option value="NGO">NGO (Food Bank, Shelter)</option>
                <option value="Volunteer">Volunteer (Distributor / Rider)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Roorkee">Roorkee</option>
                <option value="Dehradun">Dehradun</option>
                <option value="Haridwar">Haridwar</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>

            {formData.role === 'NGO' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Capacity (Max meals)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition shadow-xs"
        >
          {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      {/* Demo Seed Quick Logins */}
      <div className="mt-5 pt-4 border-t border-slate-200">
        <div className="text-[11px] text-slate-500 font-bold mb-2 text-center uppercase tracking-wide">
          One-Click Demo Accounts
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => handleQuickSeed('donor@foodrescue.org', 'donor123')}
            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold text-xs text-center transition"
          >
            🍛 Donor<br />
            <span className="text-[9px] text-amber-700 font-normal">Restaurant</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickSeed('ngo@foodrescue.org', 'ngo123')}
            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg font-bold text-xs text-center transition"
          >
            🏢 NGO<br />
            <span className="text-[9px] text-blue-700 font-normal">Shelter</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickSeed('volunteer@foodrescue.org', 'vol123')}
            className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg font-bold text-xs text-center transition"
          >
            🛵 Volunteer<br />
            <span className="text-[9px] text-purple-700 font-normal">Rider</span>
          </button>
        </div>
      </div>
    </div>
  );
}
