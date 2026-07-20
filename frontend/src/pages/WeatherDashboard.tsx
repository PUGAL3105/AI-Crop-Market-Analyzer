import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  CloudSun, 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Wind,
  Loader2,
  AlertTriangle,
  Info
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

const DISTRICTS = ["Chennai", "Dindigul", "Coimbatore", "Cuddalore", "Salem", "Erode", "Madurai", "Tiruchirappalli", "Tirupur", "Dharmapuri", "Vellore", "Theni", "Thanjavur", "Tirunelveli", "Kanyakumari", "Villupuram", "Thoothukudi", "Namakkal"];

export default function WeatherDashboard() {
  const [district, setDistrict] = useState('Chennai');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/weather?district=${district}`);
        setWeatherData(res.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch weather indicators. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [district]);

  // Set up chart data for weather trends (7 days)
  const forecast = weatherData?.forecast || [];
  const chartLabels = forecast.map((f: any) => new Date(f.date).toLocaleDateString(undefined, { weekday: 'short' }));
  const tempMaxs = forecast.map((f: any) => f.temp_max);
  const tempMins = forecast.map((f: any) => f.temp_min);
  const rainfalls = forecast.map((f: any) => f.rainfall);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Max Temp (°C)',
        data: tempMaxs,
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b',
        tension: 0.3,
        yAxisID: 'y'
      },
      {
        label: 'Min Temp (°C)',
        data: tempMins,
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        tension: 0.3,
        yAxisID: 'y'
      },
      {
        label: 'Precipitation (mm)',
        data: rainfalls,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.3,
        fill: true,
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8' }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      },
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        title: { display: true, text: 'Temperature (°C)', color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        title: { display: true, text: 'Precipitation (mm)', color: '#94a3b8' },
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with district selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-emerald-400" /> Weather Risk Dashboard
          </h2>
          <p className="text-xs text-slate-400">
            Monitor real-time seasonal climates and heavy precipitation alerts targeting crop yields.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 pl-3">District:</span>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-slate-300 transition"
          >
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-slate-400 font-semibold text-sm">Querying Open-Meteo Satellite feeds...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Main indicators grids */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Indicator 1: Temp */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="bg-amber-500/10 text-amber-400 p-3 rounded-2xl">
                <Thermometer className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block">Temperature</span>
                <span className="text-2xl font-black text-slate-100">{weatherData?.temperature}°C</span>
              </div>
            </div>

            {/* Indicator 2: Rain */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-2xl">
                <CloudRain className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block">Precipitation</span>
                <span className="text-2xl font-black text-slate-100">{weatherData?.rainfall} mm</span>
              </div>
            </div>

            {/* Indicator 3: Humidity */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="bg-blue-500/10 text-blue-400 p-3 rounded-2xl">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block">Relative Humidity</span>
                <span className="text-2xl font-black text-slate-100">{weatherData?.humidity}%</span>
              </div>
            </div>

            {/* Indicator 4: Wind Speed */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="bg-teal-500/10 text-teal-400 p-3 rounded-2xl">
                <Wind className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block">Wind Velocity</span>
                <span className="text-2xl font-black text-slate-100">{weatherData?.wind_speed} km/h</span>
              </div>
            </div>

          </div>

          {/* 7-Days Visual Chart & Detailed cards */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Chart */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl lg:col-span-2 space-y-4">
              <h3 className="font-extrabold text-slate-200 text-sm">7-Day Meteorological Trend</h3>
              <div className="h-72">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Warning Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-200 text-sm flex items-center gap-2">
                  <AlertTriangle className="text-amber-400 w-5 h-5 animate-bounce" /> Crop Protection Advice
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {weatherData?.rainfall > 50.0 
                    ? 'Warning: High cumulative rain detected. Damp soil increases root fungal risks in Potato and Tomato crops. Ensure adequate drainage lines.' 
                    : weatherData?.temperature > 34.0
                    ? 'Alert: High heatwave indexes recorded. High evapotranspiration limits grain weights in Maize. Double irrigation cycles.'
                    : 'Weather parameters correspond to standard seasonal distributions. No high agricultural risk factors detected.'
                  }
                </p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 mt-4 flex items-start gap-2.5 text-[11px] text-slate-500">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Advice generated based on real-time district statistics and crop weather sensitivities.</span>
              </div>
            </div>

          </div>

          {/* Forecast Cards list */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-200 text-sm">Detailed 7-Day Forecast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {forecast.map((f: any) => (
                <div 
                  key={f.date}
                  className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl text-center space-y-3"
                >
                  <p className="text-xs font-bold text-slate-300">
                    {new Date(f.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                  </p>
                  <div className="bg-slate-950/80 border border-slate-800/40 rounded-xl p-2 text-xs font-semibold">
                    <p className="text-amber-400">{Math.round(f.temp_max)}°C</p>
                    <p className="text-blue-400">{Math.round(f.temp_min)}°C</p>
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-1">
                    <p className="flex items-center justify-center gap-1"><CloudRain className="w-3.5 h-3.5 text-emerald-400" /> {f.rainfall}mm</p>
                    <p className="flex items-center justify-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-400" /> {f.humidity}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
