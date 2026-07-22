import React, { useState } from 'react';
import api from '../services/api';
import { 
  TrendingUp, 
  MapPin, 
  Truck, 
  Warehouse, 
  Calendar, 
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Info,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';

const CROP_OPTIONS = ["Rice", "Wheat", "Cotton", "Maize", "Tomato", "Potato", "Onion", "Turmeric", "Coconut", "Banana", "Sugarcane", "Mango", "Groundnut", "Chili"];
const DISTRICTS = ["Chennai", "Dindigul", "Coimbatore", "Cuddalore", "Salem", "Erode", "Madurai", "Tiruchirappalli", "Tirupur", "Dharmapuri", "Vellore", "Theni", "Thanjavur", "Tirunelveli", "Kanyakumari", "Villupuram", "Thoothukudi", "Namakkal"];

export default function MarketRecommendation() {
  const [crop, setCrop] = useState('Rice');
  const [quantity, setQuantity] = useState(1000);
  const [harvestDate, setHarvestDate] = useState(() => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    return future.toISOString().split('T')[0];
  });
  const [currentDistrict, setCurrentDistrict] = useState('Chennai');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      const res = await api.post('/markets/recommend', {
        crop,
        quantity_kg: quantity,
        harvest_date: harvestDate,
        current_district: currentDistrict
      });
      setRecommendations(res.data.recommendations || []);
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Recommendation fetch failed. Verify backend services.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" /> Intelligent Selling Recommendations
        </h2>
        <p className="text-xs text-slate-400">
          Optimize crop sales by assessing haulage cost logistics, market spot pricing, and storage fees across regional Mandi yards.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Form Settings */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 h-fit">
          <h3 className="font-extrabold text-slate-200 text-sm">Recommendation Parameters</h3>
          <form onSubmit={handleCalculate} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Select Crop</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-slate-300 transition"
              >
                {CROP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Harvest Load (Kg)</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-slate-200 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Your Current District</label>
              <select
                value={currentDistrict}
                onChange={(e) => setCurrentDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-slate-300 transition"
              >
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Expected Harvest Date</label>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-slate-200 transition"
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-slate-950 font-bold py-3.5 rounded-xl cursor-pointer shadow-lg shadow-emerald-500/15 active:scale-[0.98] transition flex items-center justify-center gap-2 text-sm"
            >
              {loading ? 'Analyzing Freight & Prices...' : 'Run Selling Optimization'}
            </button>

          </form>
        </div>

        {/* Results grid */}
        <div className="lg:col-span-2 space-y-6">
          {recommendations.length > 0 ? (
            <div className="space-y-6">
              
              {/* Highlight Best Option */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl" />
                <span className="text-[10px] bg-emerald-500 text-slate-950 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                  Top Recommended Market
                </span>
                
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-emerald-400" /> {recommendations[0].market_name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Located in {recommendations[0].district} district. Geodesic distance: <span className="text-slate-200 font-bold">{recommendations[0].distance_km} Km</span>
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-3xl font-black text-emerald-400">Rs {(recommendations[0].net_profit || 0).toLocaleString()}</span>
                    <p className="text-[10px] text-slate-400">Expected Net Income</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800/80 grid sm:grid-cols-3 gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>Freight: <strong>Rs {recommendations[0].transport_cost}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-emerald-400" />
                    <span>Storage: <strong>Rs {recommendations[0].storage_cost}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Sell Date: <strong>{new Date(recommendations[0].recommended_selling_date).toLocaleDateString()}</strong></span>
                  </div>
                </div>
              </div>

              {/* Comparison list */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-200 text-sm">Alternative Markets Comparison</h3>
                
                <div className="space-y-3">
                  {recommendations.slice(1).map((rec) => (
                    <div 
                      key={rec.market_id} 
                      className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-slate-700/80 transition"
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-slate-200 text-base">{rec.market_name}</span>
                        <p className="text-xs text-slate-400 flex flex-wrap gap-x-3">
                          <span>Dist: <strong>{rec.distance_km} Km</strong></span>
                          <span>Freight: <strong>Rs {rec.transport_cost}</strong></span>
                          <span>Storage: <strong>Rs {rec.storage_cost}</strong></span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 border-slate-800 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="font-black text-slate-200">Rs {(rec.net_profit || 0).toLocaleString()}</span>
                          <p className="text-[10px] text-slate-400">Net Profit</p>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-xl text-slate-400 hover:text-emerald-400 transition cursor-pointer">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-3 h-full min-h-[400px]">
              <Truck className="w-12 h-12 text-slate-600 animate-bounce" />
              <h3 className="font-bold text-slate-300">Run Spatial Yield Analysis</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Enter your crop volume and target locations to compute geographic profit rankings.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
