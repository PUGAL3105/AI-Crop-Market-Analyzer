import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  TrendingUp, 
  MapPin, 
  Calendar, 
  CloudSun, 
  AlertTriangle,
  Bell, 
  DollarSign, 
  Truck, 
  Loader2,
  CheckCircle,
  Inbox
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. Get user profile
        const profileRes = await api.get('/auth/me');
        const profile = profileRes.data.profile || {};
        
        const district = profile.location_district || 'Chennai';
        const market = profile.location_market || 'Koyambedu Market';
        
        // 2. Fetch current weather for the district
        const weatherRes = await api.get(`/weather?district=${district}`);
        
        // 3. Fetch default predictions for farmer's primary crop
        const primaryCrops = profile.primary_crops ? profile.primary_crops.split(',') : ['Rice'];
        const crop = primaryCrops[0];
        
        // Generate mock prices or retrieve historical price trends
        let marketsList: any[] = [];
        try {
          marketsList = (await api.get('/markets')).data;
        } catch (e) {
          console.error(e);
        }
        
        const selectedMarketObj = marketsList.find(m => m.name === market) || marketsList[0];
        
        let priceHistory: any[] = [];
        if (selectedMarketObj) {
          try {
            priceHistory = (await api.get(`/analytics/historical?crop=${crop}&market_id=${selectedMarketObj.id}&range_days=7`)).data;
          } catch (e) {
             console.error(e);
          }
        }
        
        const historyPrices = priceHistory.length >= 7 
          ? priceHistory.map(p => p.price_per_kg) 
          : [31.2, 31.5, 31.8, 31.6, 32.0, 32.2, 32.5];
          
        const predRes = await api.post('/predictions/predict', {
          crop,
          district,
          market,
          quantity: 1000.0,
          harvest_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days out
          history_prices: historyPrices
        });
        
        // 4. Fetch recommendations
        let recsRes: any = null;
        try {
          recsRes = await api.post('/markets/recommend', {
            crop,
            quantity_kg: 1000.0,
            harvest_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            current_district: district
          });
        } catch (e) {
          console.error(e);
        }

        // Gather mock/real notifications
        const notifData = [
          { id: '1', title: 'Heavy Rainfall Warning', message: `Precipitation of >60mm forecasted in ${district} next Wednesday. Protect mature crops.`, is_read: false, created_at: new Date().toISOString() },
          { id: '2', title: 'Market Shift Alert', message: `Tomato price predictions surged by 12% in Azadpur Mandi due to transport issues.`, is_read: true, created_at: new Date().toISOString() }
        ];
        setNotifications(notifData);
        
        setDashboardData({
          weather: weatherRes.data,
          prediction: predRes.data,
          recommendations: recsRes?.data,
          crop,
          market,
          district,
          history: priceHistory
        });
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setAlertMessage('Could not fetch dashboard data. Please verify backend is active.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        <p className="text-slate-400 font-semibold text-sm">Aggregating agricultural indicators...</p>
      </div>
    );
  }

  // Set up chart data
  const chartLabels = dashboardData?.history?.length > 0 
    ? dashboardData.history.map((h: any) => h.date)
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    
  const chartPrices = dashboardData?.history?.length > 0 
    ? dashboardData.history.map((h: any) => h.price_per_kg)
    : [31.2, 31.5, 31.8, 31.6, 32.0, 32.2, 32.5];

  const lineChartData = {
    labels: [...chartLabels, 'Predicted'],
    datasets: [
      {
        label: `${dashboardData?.crop} Price (Rs/Kg)`,
        data: [...chartPrices, dashboardData?.prediction?.predicted_price || 34.0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: (context: any) => {
          const index = context.dataIndex;
          const count = context.dataset.data.length;
          return index === count - 1 ? '#f59e0b' : '#10b981'; // Orange point for predicted
        },
        pointRadius: (context: any) => {
          const index = context.dataIndex;
          const count = context.dataset.data.length;
          return index === count - 1 ? 6 : 4;
        }
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` Price: Rs ${context.raw}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  const bestRec = dashboardData?.recommendations?.recommendations?.[0];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
        <div>
          <h2 className="text-2xl font-black text-slate-100">Welcome, {user?.full_name}</h2>
          <p className="text-xs text-slate-400 mt-1 capitalize">Role: {user?.role} Portal</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-semibold">
          <MapPin className="w-4 h-4" /> {dashboardData?.market} Mandi, {dashboardData?.district}
        </div>
      </div>

      {alertMessage && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{alertMessage}</span>
        </div>
      )}

      {/* 2. Top Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Expected Spot Price */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/20 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400">Predicted Price</span>
            <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-100">Rs {dashboardData?.prediction?.predicted_price || 0} <span className="text-xs font-medium text-slate-400">/ Kg</span></h3>
            <p className="text-[10px] text-slate-400 mt-1">Confidence Score: <span className="text-emerald-400 font-semibold">{((dashboardData?.prediction?.confidence_score || 0.85) * 100).toFixed(0)}%</span></p>
          </div>
        </div>

        {/* Metric 2: Estimated Net Profit */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/20 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400">Optimal Selling Profit</span>
            <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-100">
              Rs {(bestRec?.net_profit ?? dashboardData?.prediction?.expected_profit ?? 0).toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">For quantity of 1,000 Kg</p>
          </div>
        </div>

        {/* Metric 3: Best Recommended Market */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/20 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400">Best Market Mandi</span>
            <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-black text-slate-100 truncate">
              {bestRec ? bestRec.market_name : dashboardData?.market}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Distance: <span className="text-emerald-400 font-semibold">{bestRec ? bestRec.distance_km : 0} Km</span>
            </p>
          </div>
        </div>

        {/* Metric 4: Recommended Selling Date */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/20 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400">Best Selling Date</span>
            <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-black text-slate-100">
              {bestRec ? new Date(bestRec.recommended_selling_date).toLocaleDateString() : new Date().toLocaleDateString()}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 capitalize">
              Trend Status: 
              <span className={dashboardData?.prediction?.price_trend === 'up' ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                {dashboardData?.prediction?.price_trend}
              </span>
            </p>
          </div>
        </div>

      </div>

      {/* 3. Analytics Chart & Weather Forecast widgets */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Line Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-slate-200">Price Trend Forecast</h3>
              <p className="text-[10px] text-slate-400">Weekly historical prices coupled with AI predictions</p>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-bold border border-emerald-500/20 uppercase">
              {dashboardData?.crop}
            </span>
          </div>
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Weather Dashboard Widget */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-200">Weather Dashboard</h3>
                <p className="text-[10px] text-slate-400">Conditions at {dashboardData?.district}</p>
              </div>
              <CloudSun className="w-5 h-5 text-emerald-400" />
            </div>

            {/* Current weather details */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <span className="text-3xl font-black text-slate-100">{dashboardData?.weather?.temperature}°C</span>
                <p className="text-[10px] text-slate-400 mt-1 capitalize">Recorded date: {dashboardData?.weather?.recorded_date}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-slate-300">Humidity: <span className="font-semibold">{dashboardData?.weather?.humidity}%</span></p>
                <p className="text-xs text-slate-300">Rainfall: <span className="font-semibold text-emerald-400">{dashboardData?.weather?.rainfall}mm</span></p>
                <p className="text-xs text-slate-300">Wind: <span className="font-semibold">{dashboardData?.weather?.wind_speed}km/h</span></p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Forecast Risk Level:</span>
            <span className={dashboardData?.weather?.rainfall > 50 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {dashboardData?.weather?.rainfall > 50 ? 'High Harvest Risk' : 'Optimal Conditions'}
            </span>
          </div>
        </div>

      </div>

      {/* 4. Selling Recommendations List & Notifications alerts */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Mandi Recommendations */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-slate-200">Optimal Mandi Market Recommendations</h3>
              <p className="text-[10px] text-slate-400">Sorted by expected net profit (includes haulage costs)</p>
            </div>
            <Truck className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="space-y-3 overflow-y-auto max-h-60 pr-1">
            {dashboardData?.recommendations?.recommendations?.map((rec: any, idx: number) => (
              <div 
                key={rec.market_id}
                className={`p-4 rounded-2xl flex justify-between items-center transition border ${
                  idx === 0 
                    ? 'bg-emerald-500/5 border-emerald-500/30' 
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-sm">{rec.market_name}</span>
                    {idx === 0 && (
                      <span className="text-[9px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-extrabold uppercase">
                        Best Choice
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Distance: <span className="font-semibold text-slate-300">{rec.distance_km} Km</span> | 
                    Freight: <span className="font-semibold text-slate-300">Rs {rec.transport_cost}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-100 text-sm">Rs {(rec.net_profit || 0).toLocaleString()}</span>
                  <p className="text-[9px] text-slate-400">Net Profit</p>
                </div>
              </div>
            )) || (
              <div className="flex flex-col items-center justify-center p-6 text-slate-500 gap-2">
                <Inbox className="w-8 h-8" />
                <p className="text-xs">No selling optimizations generated yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-slate-200">Alert Center</h3>
            </div>
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-full text-[9px] animate-pulse">
                {notifications.filter(n => !n.is_read).length} New
              </span>
            )}
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id)}
                className={`p-3.5 rounded-2xl text-xs space-y-2 cursor-pointer transition border ${
                  notif.is_read 
                    ? 'bg-slate-950/30 border-slate-800/60 opacity-60' 
                    : 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-200">{notif.title}</span>
                  {!notif.is_read && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">{notif.message}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
