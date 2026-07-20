import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Common/Layout';
import { Loading } from './components/Common/Loading';

// Import Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CropPrediction from './pages/CropPrediction';
import MarketRecommendation from './pages/MarketRecommendation';
import WeatherDashboard from './pages/WeatherDashboard';
import HistoricalPrice from './pages/HistoricalPrice';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import BiDashboard from './pages/BiDashboard';

// Guard: Route must be authenticated
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Guard: Route must be admin-authorized
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return isAuthenticated && user?.role === 'admin' 
    ? <>{children}</> 
    : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Private Pages (Wrapped in Side/Nav Layout) */}
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="predict" element={<CropPrediction />} />
        <Route path="recommendations" element={<MarketRecommendation />} />
        <Route path="weather" element={<WeatherDashboard />} />
        <Route path="analytics" element={<HistoricalPrice />} />
        <Route path="settings" element={<Settings />} />
        <Route path="bi-analytics" element={<BiDashboard />} />
        
        {/* Admin Dashboard */}
        <Route 
          path="admin" 
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
      </Route>

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
