'use client';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'rose';
  children?: ReactNode;
}

const colorMap = {
  blue:   { icon: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   glow: 'shadow-blue-500/10' },
  green:  { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' },
  yellow: { icon: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  glow: 'shadow-amber-500/10' },
  purple: { icon: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', glow: 'shadow-violet-500/10' },
  rose:   { icon: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/20',   glow: 'shadow-rose-500/10' },
};

export default function KpiCard({ title, value, subtitle, icon: Icon, trend, color = 'blue', children }: KpiCardProps) {
  const c = colorMap[color];

  return (
    <div className={`kpi-card glass-card p-5 border ${c.border} shadow-lg ${c.glow}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="mt-2">
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-sm font-medium text-slate-300 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
