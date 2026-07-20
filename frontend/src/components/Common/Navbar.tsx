import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, User as UserIcon, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/10 dark:border-slate-800/50 bg-slate-900/60 dark:bg-slate-950/60 text-slate-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-slate-700 dark:text-slate-350 hover:text-emerald-600 dark:hover:text-emerald-400 p-1 transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <img src="/agripredict_logo.png" className="w-8.5 h-8.5 rounded-lg shadow-sm" alt="AgriPredict Logo" />
          <div>
            <h1 className="font-extrabold text-xl leading-none bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent">
              AgriPredict <span className="text-emerald-600 dark:text-emerald-400 font-medium">Pro</span>
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">Explainable AI Agricultural Engine</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 p-2.5 rounded-xl transition cursor-pointer shadow border border-slate-200 dark:border-slate-700/50"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Info & Actions */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-850">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">{user.full_name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
            </div>
            <div className="relative group">
              <div className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700/50 p-2 rounded-xl transition cursor-pointer flex items-center justify-center">
                <UserIcon className="w-5 h-5" />
              </div>
              
              {/* Dropdown Menu on hover/click */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 hidden group-hover:block hover:block transition-all z-50">
                <div className="px-3 py-2 border-b border-slate-800 md:hidden">
                  <p className="text-sm font-semibold text-slate-200 leading-tight">{user.full_name}</p>
                  <p className="text-[11px] text-slate-400 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
