import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  MapPin, 
  TrendingUp, 
  HelpCircle,
  AlertTriangle,
  Loader2,
  CheckCircle
} from 'lucide-react';

const DISTRICT_MARKETS: Record<string, string[]> = {
  "Delhi": ["Azadpur Mandi", "Keshopur Mandi"],
  "East Delhi": ["Ghazipur Mandi"],
  "Thane": ["Vashi Market"],
  "Kalyan": ["Kalyan Mandi"],
  "Pune": ["Pune Mandi"],
  "Chennai": ["Koyambedu Market"],
  "Guntur": ["Guntur Mirchi Yard"]
};

export default function Settings() {
  const { user, refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [farmSize, setFarmSize] = useState(user?.profile?.farm_size_hectares || 1.0);
  const [primaryCrops, setPrimaryCrops] = useState(user?.profile?.primary_crops || 'Rice');
  const [district, setDistrict] = useState(user?.profile?.location_district || 'Delhi');
  const [market, setMarket] = useState(user?.profile?.location_market || 'Azadpur Mandi');

  // Sync user profile state when user object loads/refreshes
  useEffect(() => {
    if (user) {
      if (user.full_name) setFullName(user.full_name);
      if (user.profile?.farm_size_hectares) setFarmSize(user.profile.farm_size_hectares);
      if (user.profile?.primary_crops) setPrimaryCrops(user.profile.primary_crops);
      if (user.profile?.location_district) setDistrict(user.profile.location_district);
      if (user.profile?.location_market) setMarket(user.profile.location_market);
    }
  }, [user]);

  // Sync market selection when district changes
  useEffect(() => {
    const markets = DISTRICT_MARKETS[district] || [];
    if (markets.length > 0 && !markets.includes(market)) {
      setMarket(markets[0]);
    }
  }, [district]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Save farmer profile
      await api.put('/auth/farmer-profile', {
        farm_size_hectares: parseFloat(farmSize.toString()) || 0,
        primary_crops: primaryCrops,
        location_district: district,
        location_market: market
      });

      setSuccess('Profile updated successfully!');
      await refreshUser();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-emerald-400" /> Account Settings
        </h2>
        <p className="text-xs text-slate-400">
          Modify your farm specifications, coordinates, and default Mandis.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex gap-3 text-xs">
          <CheckCircle className="w-5 h-5 shrink-0 animate-bounce" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Card: Account Info */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 h-fit text-center">
          <div className="w-20 h-20 bg-slate-850 border border-slate-850 rounded-full flex items-center justify-center mx-auto text-slate-400 shadow-inner">
            <UserIcon className="w-10 h-10" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-200">{user?.full_name}</h3>
            <p className="text-xs text-slate-400 mt-1 capitalize">Role: {user?.role}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Right Form: Profile Settings */}
        {user?.role === 'farmer' ? (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl md:col-span-2 space-y-6">
            <h3 className="font-extrabold text-slate-200 text-sm">Farm Profile Specifications</h3>
            
            <form onSubmit={handleSaveProfile} className="grid sm:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Farm Size (Hectares)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={farmSize}
                  onChange={(e) => setFarmSize(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Primary Crops Grown (comma separated)</label>
                <input
                  type="text"
                  required
                  value={primaryCrops}
                  onChange={(e) => setPrimaryCrops(e.target.value)}
                  placeholder="Rice, Wheat, Tomato"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Default District Location</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 text-slate-300"
                >
                  {Object.keys(DISTRICT_MARKETS).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Default Selling Mandi</label>
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 text-slate-300"
                >
                  {(DISTRICT_MARKETS[district] || []).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-slate-950 font-bold py-3.5 px-6 rounded-xl text-xs sm:col-span-2 mt-4 cursor-pointer transition flex items-center justify-center gap-2"
              >
                {loading ? 'Saving adjustments...' : 'Save Settings Details'}
              </button>

            </form>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl md:col-span-2 flex flex-col items-center justify-center text-center p-12 text-slate-500">
             <HelpCircle className="w-12 h-12 text-slate-600 mb-2" />
             <h3 className="font-bold text-slate-300">General Settings</h3>
             <p className="text-xs text-slate-400 max-w-sm mt-1">
                Role-based farm configuration profiles are only applicable to farmers. No custom adjustments are required for your user account.
             </p>
          </div>
        )}

      </div>
    </div>
  );
}
