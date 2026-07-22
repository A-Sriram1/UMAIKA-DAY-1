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
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen bg-slate-900 border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
          <Landmark className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">BankETL</p>
          <p className="text-[10px] text-slate-400">Digital Banking Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 mb-2 mt-2">
          Main Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item ${active ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer status */}
      <div className="p-4 border-t border-slate-800">
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
