import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ShieldCheck, 
  Users, 
  MapPin, 
  Upload, 
  RefreshCw, 
  Terminal, 
  AlertTriangle,
  Loader2,
  Trash2,
  Plus
} from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'markets' | 'retrain' | 'logs'>('users');
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // 1. User Management State
  const [users, setUsers] = useState<any[]>([]);

  // 2. Market State
  const [mktName, setMktName] = useState('');
  const [mktDistrict, setMktDistrict] = useState('');
  const [mktState, setMktState] = useState('');
  const [mktLat, setMktLat] = useState(0.0);
  const [mktLon, setMktLon] = useState(0.0);
  const [mktCost, setMktCost] = useState(2.0);

  // 3. Dataset upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 4. Logs State
  const [logs, setLogs] = useState<any[]>([]);

  // Fetch data depending on active tab
  useEffect(() => {
    setError('');
    setMessage('');
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/logs?limit=40');
      setLogs(res.data);
    } catch (err: any) {
       setError('Failed to fetch system logs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setLoading(true);
      await api.delete(`/admin/users/${id}`);
      setMessage('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/admin/markets', {
        name: mktName,
        district: mktDistrict,
        state: mktState,
        latitude: mktLat,
        longitude: mktLon,
        base_transport_cost_per_km: mktCost
      });
      setMessage('Market mandi registered successfully');
      setMktName('');
      setMktDistrict('');
      setMktState('');
      setMktLat(0.0);
      setMktLon(0.0);
      setMktCost(2.0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Create market failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setError('');
    setMessage('');
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/admin/upload-dataset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message || 'Dataset uploaded successfully');
      setSelectedFile(null);
      // Clear file input manually
      const input = document.getElementById('dataset-input') as HTMLInputElement;
      if (input) input.value = '';
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Dataset import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerTraining = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/admin/train');
      setMessage(res.data.message || 'Retraining initiated.');
    } catch (err: any) {
      setError('Retraining failed to initialize.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" /> Administrative Operations Control Panel
        </h2>
        <p className="text-xs text-slate-400">
          Control platform resources, configure regional Mandis, import historical datasets, and trigger machine learning retraining.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 shrink-0 animate-bounce" />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'users' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Users className="w-4 h-4" /> User Management
        </button>
        <button
          onClick={() => setActiveTab('markets')}
          className={`pb-3 text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'markets' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <MapPin className="w-4 h-4" /> Market Mandis
        </button>
        <button
          onClick={() => setActiveTab('retrain')}
          className={`pb-3 text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'retrain' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <RefreshCw className="w-4 h-4" /> Model Retraining
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'logs' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Terminal className="w-4 h-4" /> System Logs
        </button>
      </div>

      {/* Content panes */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl min-h-[300px]">
        {loading && <div className="flex justify-center items-center py-6"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>}

        {/* User Tab */}
        {activeTab === 'users' && !loading && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-200 text-sm">Registered Accounts Directory</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Platform Role</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-800/60 text-slate-200 font-medium">
                      <td className="py-3 font-semibold text-slate-100">{u.full_name}</td>
                      <td className="py-3 text-slate-400">{u.email}</td>
                      <td className="py-3 capitalize">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                          u.role === 'admin' ? 'bg-rose-500/10 text-rose-400' : 
                          u.role === 'farmer' ? 'bg-emerald-500/10 text-emerald-400' : 
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-rose-400 hover:text-rose-300 p-1 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg cursor-pointer transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Market Tab */}
        {activeTab === 'markets' && (
          <div className="max-w-xl space-y-6">
            <h3 className="font-extrabold text-slate-200 text-sm">Register New Mandi Center</h3>
            <form onSubmit={handleCreateMarket} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-slate-400 font-semibold">Mandi Market Name</label>
                <input
                  type="text"
                  required
                  value={mktName}
                  onChange={(e) => setMktName(e.target.value)}
                  placeholder="Koyambedu Market"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">District</label>
                <input
                  type="text"
                  required
                  value={mktDistrict}
                  onChange={(e) => setMktDistrict(e.target.value)}
                  placeholder="Chennai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">State</label>
                <input
                  type="text"
                  required
                  value={mktState}
                  onChange={(e) => setMktState(e.target.value)}
                  placeholder="Tamil Nadu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={mktLat}
                  onChange={(e) => setMktLat(parseFloat(e.target.value) || 0)}
                  placeholder="13.0683"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={mktLon}
                  onChange={(e) => setMktLon(parseFloat(e.target.value) || 0)}
                  placeholder="80.1908"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-slate-400 font-semibold">Base Haulage Freight Rate (Rs/Km/Ton)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={mktCost}
                  onChange={(e) => setMktCost(parseFloat(e.target.value) || 0)}
                  placeholder="2.2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-slate-950 font-bold py-3 px-6 rounded-xl text-xs sm:col-span-2 mt-2 cursor-pointer transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Save Market Mandi
              </button>
            </form>
          </div>
        )}

        {/* Retrain Tab */}
        {activeTab === 'retrain' && (
          <div className="grid md:grid-cols-2 gap-8">
            
            {/*Retrain button*/}
            <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-800/80">
              <h4 className="font-bold text-slate-200 text-sm">Model Registry Control</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Initiate the backend evaluation pipeline. This reads all current database prices, trains all 6 regressors (Linear Regression, Decision Tree, Random Forest, XGBoost, LSTM, Hybrid LSTM + XGBoost), compares errors, updates server registry artifacts, and refreshes explanations.
              </p>
              <button 
                onClick={handleTriggerTraining}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-slate-950 font-bold py-3.5 px-6 rounded-xl text-xs cursor-pointer transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Retrain ML Pipelines
              </button>
            </div>

            {/*Dataset import*/}
            <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-800/80">
              <h4 className="font-bold text-slate-200 text-sm">Import Historical CSV</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload crop price dataset logs. CSV files must declare headers: <code>date (YYYY-MM-DD), crop, market, price_per_kg</code>.
              </p>
              <form onSubmit={handleFileUpload} className="space-y-3">
                <input
                  id="dataset-input"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 file:hover:bg-slate-700 transition"
                />
                <button
                  type="submit"
                  disabled={!selectedFile || loading}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/30 text-slate-950 font-bold py-3 px-6 rounded-xl text-xs cursor-pointer transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Upload & Parse CSV
                </button>
              </form>
            </div>

          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && !loading && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-200 text-sm">System Operations Console Logs</h3>
              <button 
                onClick={fetchLogs}
                className="text-xs bg-slate-800 hover:bg-slate-700/85 text-slate-300 px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 border border-slate-700/40"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Live Console
              </button>
            </div>
            
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl h-80 overflow-y-auto font-mono text-[11px] space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="leading-relaxed">
                  <span className="text-slate-500">[{new Date(log.created_at).toLocaleTimeString()}]</span>{' '}
                  <span className={log.level === 'ERROR' ? 'text-rose-400 font-bold' : log.level === 'WARNING' ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                    {log.level}
                  </span>:{' '}
                  <span className="text-slate-300">{log.message}</span>
                  {log.details && <pre className="text-rose-400 pl-4 mt-1 bg-slate-900 p-2 rounded-lg border border-slate-800/80 overflow-x-auto">{log.details}</pre>}
                </div>
              ))}
              {logs.length === 0 && <div className="text-slate-600 text-center py-12">No logs loaded yet.</div>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
