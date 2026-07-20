import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart3, 
  Loader2, 
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title as ChartTitle, 
  Tooltip as ChartTooltip, 
  Legend as ChartLegend 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, ChartTooltip, ChartLegend);

const CROP_OPTIONS = ["Rice", "Wheat", "Cotton", "Maize", "Tomato", "Potato", "Onion", "Turmeric", "Coconut", "Banana", "Sugarcane", "Mango", "Groundnut", "Chili"];

export default function HistoricalPrice() {
  const [crop, setCrop] = useState('Rice');
  const [markets, setMarkets] = useState<any[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [rangeDays, setRangeDays] = useState(30);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comparisonData, setComparisonData] = useState<Record<string, any[]>>({});

  // 1. Fetch available markets on load
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await api.get('/markets');
        setMarkets(res.data);
        if (res.data.length > 0) {
          // Select top 2 markets by default for comparison
          setSelectedMarkets(res.data.slice(0, 2).map((m: any) => m.id));
        }
      } catch (err) {
        console.error('Failed to load markets:', err);
      }
    };
    fetchMarkets();
  }, []);

  // 2. Fetch comparison data when inputs change
  useEffect(() => {
    if (selectedMarkets.length === 0) {
      setComparisonData({});
      return;
    }

    const fetchComparison = async () => {
      try {
        setLoading(true);
        setError('');
        const marketIdsStr = selectedMarkets.join(',');
        const res = await api.get(`/analytics/comparison?crop=${crop}&market_ids=${marketIdsStr}&range_days=${rangeDays}`);
        setComparisonData(res.data);
      } catch (err: any) {
        console.error(err);
        setError('Could not retrieve analytics. Please verify backend state.');
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [crop, selectedMarkets, rangeDays]);

  const handleMarketToggle = (id: string) => {
    setSelectedMarkets(prev => 
      prev.includes(id) 
        ? prev.filter(mId => mId !== id) 
        : [...prev, id]
    );
  };

  // 3. Formulate Chart Dataset
  const marketNames = Object.keys(comparisonData);
  let labels: string[] = [];
  
  // Find the longest date labels set
  marketNames.forEach(name => {
    const dates = comparisonData[name].map(p => p.date);
    if (dates.length > labels.length) {
      labels = dates;
    }
  });

  const colors = [
    'rgba(16, 185, 129, 1)',  // emerald
    'rgba(59, 130, 246, 1)',  // blue
    'rgba(245, 158, 11, 1)',  // amber
    'rgba(239, 68, 68, 1)',   // red
    'rgba(139, 92, 246, 1)',  // violet
    'rgba(236, 72, 153, 1)',  // pink
    'rgba(14, 165, 233, 1)'   // sky
  ];

  const datasets = marketNames.map((name, idx) => {
    return {
      label: name,
      data: comparisonData[name].map(p => p.price),
      borderColor: colors[idx % colors.length],
      backgroundColor: colors[idx % colors.length].replace(', 1)', ', 0.05)'),
      tension: 0.2,
      borderWidth: 2,
      pointRadius: 1,
      fill: false
    };
  });

  const chartData = { labels, datasets };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94a3b8' }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' },
        title: { display: true, text: 'Price (Rs/Kg)', color: '#94a3b8' }
      }
    }
  };

  const getStats = (prices: any[]) => {
    if (!prices || prices.length === 0) {
      return { min: 0, max: 0, avg: 0, vol: 0, growth: 0, minDate: 'N/A', maxDate: 'N/A', action: 'Hold Stock' };
    }
    
    // Sort by date to calculate growth
    const sorted = [...prices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstPrice = sorted[0].price;
    const lastPrice = sorted[sorted.length - 1].price;
    const growth = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
    
    const vals = prices.map(p => p.price);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    
    // Volatility (simple standard deviation percentage of mean)
    const variance = vals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / vals.length;
    const std = Math.sqrt(variance);
    const vol = avg > 0 ? (std / avg) * 100 : 0;
    
    // Find peak and bottom dates
    const minRecord = prices.find(p => p.price === min);
    const maxRecord = prices.find(p => p.price === max);
    const minDate = minRecord ? new Date(minRecord.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A';
    const maxDate = maxRecord ? new Date(maxRecord.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A';
    
    // Recommendation engine
    let action = 'Hold Stock';
    if (vol > 15) {
      action = 'Sell (High Volatility)';
    } else if (growth > 5) {
      action = 'Store / Delay Sell';
    } else if (growth < -5) {
      action = 'Sell Immediately';
    } else {
      action = 'Sell Crop';
    }
    
    return {
      min: round(min),
      max: round(max),
      avg: round(avg),
      vol: round(vol),
      growth: round(growth),
      minDate,
      maxDate,
      action
    };
  };

  const round = (v: number) => Math.round(v * 100) / 100;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-400" /> Market Price Analytics
        </h2>
        <p className="text-xs text-slate-400">
          Compare historical price fluctuations across multiple regional Mandis to identify seasonal opportunities.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main filter sections */}
      <div className="grid lg:grid-cols-4 gap-6">
        
        {/* Left Filter Pane */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-5 h-fit lg:col-span-1">
          <h3 className="font-extrabold text-slate-200 text-xs uppercase tracking-wider">Analytics Filter</h3>
          
          {/* Crop Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Crop Category</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-slate-300 transition"
            >
              {CROP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Time Range */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Time Interval</label>
            <select
              value={rangeDays}
              onChange={(e) => setRangeDays(parseInt(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-slate-300 transition"
            >
              <option value={30}>Past 30 Days (Short Term)</option>
              <option value={90}>Past 90 Days (Medium Term)</option>
              <option value={180}>Past 180 Days (Long Term)</option>
            </select>
          </div>

          {/* Market Toggles */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block mb-1">Mandi Centers</label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {markets.map((m) => (
                <label 
                  key={m.id}
                  className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-slate-100 transition p-1"
                >
                  <input
                    type="checkbox"
                    checked={selectedMarkets.includes(m.id)}
                    onChange={() => handleMarketToggle(m.id)}
                    className="accent-emerald-500 rounded border-slate-800 bg-slate-950"
                  />
                  <span>{m.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Chart pane */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center min-h-[400px] gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
              <p className="text-slate-400 font-semibold text-sm">Aggregating historical market values...</p>
            </div>
          ) : selectedMarkets.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-3 min-h-[400px]">
              <Layers className="w-12 h-12 text-slate-600" />
              <h3 className="font-bold text-slate-300">Select Markets to Compare</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Toggle the checkmarks of one or more Mandi locations in the left panel to load comparative price structures.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Line Chart */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-200 text-sm">Market Price Fluctuations Comparison</h3>
                  <Calendar className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="h-72">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Statistics Summary Table */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h3 className="font-extrabold text-slate-200 text-sm">Comparative Price Analytics Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold">
                        <th className="pb-3">Mandi Location</th>
                        <th className="pb-3">Min Price / Date</th>
                        <th className="pb-3">Max Price / Date</th>
                        <th className="pb-3">Average Price</th>
                        <th className="pb-3">Volatility Index</th>
                        <th className="pb-3">Price Growth</th>
                        <th className="pb-3 text-right">Selling Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketNames.map((name) => {
                        const stats = getStats(comparisonData[name]);
                        return (
                          <tr key={name} className="border-b border-slate-800/60 hover:bg-slate-950/20 text-slate-200 font-medium">
                            <td className="py-3.5 font-semibold text-slate-100">{name}</td>
                            <td className="py-3.5">
                              <div className="font-bold text-slate-200">Rs {stats.min}</div>
                              <div className="text-[10px] text-slate-500 font-normal">{stats.minDate}</div>
                            </td>
                            <td className="py-3.5">
                              <div className="font-bold text-slate-200">Rs {stats.max}</div>
                              <div className="text-[10px] text-slate-500 font-normal">{stats.maxDate}</div>
                            </td>
                            <td className="py-3.5 text-emerald-400 font-bold">Rs {stats.avg}</td>
                            <td className="py-3.5">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                stats.vol > 15 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                              }`}>
                                {stats.vol}% Volatility
                              </span>
                            </td>
                            <td className="py-3.5">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                stats.growth >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {stats.growth >= 0 ? '+' : ''}{stats.growth}%
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide uppercase ${
                                stats.action.includes('Immediately') ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                                stats.action.includes('Delay') ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}>
                                {stats.action}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
