'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Upload, Eye, Sparkles, Database,
  ShieldCheck, Workflow, Download, FileText, Landmark
} from 'lucide-react';

const navItems = [
  { href: '/',            label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/upload',      label: 'Upload Data',  icon: Upload },
  { href: '/preview',     label: 'Data Preview', icon: Eye },
  { href: '/clean',       label: 'Data Cleaning',icon: Sparkles },
  { href: '/schema',      label: 'Star Schema',  icon: Database },
  { href: '/validation',  label: 'Validation',   icon: ShieldCheck },
  { href: '/pipeline',    label: 'ETL Pipeline', icon: Workflow },
  { href: '/export',      label: 'Export',       icon: Download },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 flex-shrink-0 flex md:flex-col h-16 md:h-screen bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 fixed bottom-0 md:relative z-50">
      {/* Logo */}
      <div className="hidden md:flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
          <Landmark className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">BankETL</p>
          <p className="text-[10px] text-slate-400">Digital Banking Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-x-auto md:overflow-y-auto p-2 md:p-3 flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 items-center md:items-stretch hide-scrollbar">
        <p className="hidden md:block text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 mb-2 mt-2">
          Main Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item flex-col md:flex-row min-w-[72px] md:min-w-0 justify-center p-2 md:p-3 ${active ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0 mb-1 md:mb-0" />
              <span className="text-[10px] md:text-sm whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer status */}
      <div className="hidden md:block p-4 border-t border-slate-800">
        <div className="glass-card p-3 text-center">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Backend Online</span>
          </div>
          <p className="text-[10px] text-slate-500">FastAPI v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
