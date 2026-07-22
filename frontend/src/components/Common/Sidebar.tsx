import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  LineChart, 
  TrendingUp, 
  CloudSun, 
  Settings,
  X,
  Leaf,
  Bell,
  User,
  ShieldCheck,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Split navigation items into categories matching the image layout
  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['farmer', 'researcher', 'admin']
    },
    {
      name: 'Trends & Analytics',
      path: '/bi-analytics',
      icon: TrendingUp,
      roles: ['farmer', 'researcher', 'admin']
    },
    {
      name: 'Scenario Planner',
      path: '/predict',
      icon: LineChart,
      roles: ['farmer', 'researcher', 'admin']
    },
    {
      name: 'Market Locations',
      path: '/recommendations',
      icon: TrendingUp,
      roles: ['farmer', 'researcher', 'admin']
    }
  ];

  const insightItems = [
    {
      name: 'Weather Forecast',
      path: '/weather',
      icon: CloudSun,
      roles: ['farmer', 'researcher', 'admin']
    },
    {
      name: 'Price Alerts',
      path: '/settings', // Point to settings for configuration
      icon: Bell,
      hasDot: true,
      roles: ['farmer', 'researcher', 'admin']
    }
  ];

  // Filter based on current user role
  const navList = navigationItems.filter(item => item.roles.includes(user.role));
  const insightList = insightItems.filter(item => item.roles.includes(user.role));

  const linkClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
    ${isActive 
      ? 'bg-[#f59e0b] text-white shadow-md shadow-amber-500/20' 
      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
    }
  `;

  // Get user avatar initials
  const initials = user.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AU';

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-6">
          
          {/* Logo Section */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <img src="/agripredict_logo.png" className="w-8 h-8 rounded-lg shadow-sm" alt="AgriPredict Logo" />
              <div>
                <h1 className="text-sm font-black tracking-tight text-slate-800 dark:text-white leading-none">AgriPredict</h1>
                <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase block mt-1">Market Intelligence</span>
              </div>
            </div>
            
            {/* Mobile close button */}
            <button 
              onClick={onClose} 
              className="lg:hidden text-slate-400 hover:text-rose-500 p-1 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Category: NAVIGATION */}
          <div className="space-y-2">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase pl-3 block">Navigation</span>
            <nav className="flex flex-col gap-1">
              {navList.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink 
                    key={item.path} 
                    to={item.path} 
                    onClick={onClose}
                    className={linkClass}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Navigation Category: INSIGHTS */}
          <div className="space-y-2">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase pl-3 block">Insights</span>
            <nav className="flex flex-col gap-1">
              {insightList.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink 
                    key={item.path} 
                    to={item.path} 
                    onClick={onClose}
                    className={linkClass}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.hasDot && (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block shadow-sm animate-pulse" />
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Settings Nav Item */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <NavLink 
              to="/settings"
              onClick={onClose}
              className={linkClass}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </NavLink>
          </div>

        </div>

        {/* User profile footer block */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
          
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700 shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-slate-800 dark:text-white truncate leading-tight">{user.full_name || 'Agri User'}</h4>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block truncate capitalize">{user.role} · Premium Analyst</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-950/70 hover:border-rose-300 dark:hover:border-rose-800 transition-all duration-200 cursor-pointer group"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span>Sign out of account</span>
          </button>

        </div>

      </aside>
    </>
  );
};
