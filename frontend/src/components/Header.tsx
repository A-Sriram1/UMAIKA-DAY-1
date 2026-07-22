'use client';
import { Bell, Moon, Sun, Search } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications] = useState(3);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
      {/* Search */}
      <div className="hidden sm:block relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search datasets, operations..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition text-slate-400 hover:text-slate-200"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition text-slate-400 hover:text-slate-200">
          <Bell className="w-4 h-4" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full text-[9px] font-bold flex items-center justify-center text-white">
              {notifications}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xs font-bold text-white">
            DA
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">Data Analyst</p>
            <p className="text-[10px] text-slate-500">ETL Engineer</p>
          </div>
        </div>
      </div>
    </header>
  );
}
