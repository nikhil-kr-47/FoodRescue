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
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex border-b border-slate-200 mb-6">
        <button
          type="button"
          onClick={() => {
            setIsRegister(false);
            setError('');
          }}
          className={`w-1/2 pb-3 font-semibold text-sm transition ${
            !isRegister
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegister(true);
            setError('');
          }}
          className={`w-1/2 pb-3 font-semibold text-sm transition ${
            isRegister
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Register
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {isRegister && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name / Entity Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Green Leaf Cafe or Care NGO"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {isRegister && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Donor">Donor (Restaurant, Hotel, Canteen)</option>
                <option value="NGO">NGO (Food Bank, Shelter)</option>
                <option value="Volunteer">Volunteer (Distributor / Rider)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Roorkee">Roorkee</option>
                <option value="Dehradun">Dehradun</option>
                <option value="Haridwar">Haridwar</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>

            {formData.role === 'NGO' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity (Meals count)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-md transition shadow"
        >
          {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      {/* Demo Seed Quick Logins */}
      <div className="mt-6 pt-5 border-t border-slate-200">
        <div className="text-xs text-slate-500 font-medium mb-2.5 text-center">
          Or test immediately with a seed account:
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickSeed('donor@foodrescue.org', 'donor123')}
            className="p-2 text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded font-medium text-center"
          >
            🍛 Donor<br />
            <span className="text-[10px] text-amber-700">donor@foodrescue</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickSeed('ngo@foodrescue.org', 'ngo123')}
            className="p-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded font-medium text-center"
          >
            🏢 NGO<br />
            <span className="text-[10px] text-blue-700">ngo@foodrescue</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickSeed('volunteer@foodrescue.org', 'vol123')}
            className="p-2 text-xs bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded font-medium text-center"
          >
            🛵 Volunteer<br />
            <span className="text-[10px] text-purple-700">vol@foodrescue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
