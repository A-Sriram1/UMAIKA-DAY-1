'use client';
import { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { getUploadStatus, cleanDataset } from '@/lib/api';
import { Dataset, CleanResult } from '@/types';

interface Operation {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: string;
}

const OPERATIONS: Operation[] = [
  { id: 'remove_duplicates',  label: 'Remove Duplicates',     description: 'Drop exact duplicate rows',                  icon: '🔁', category: 'Rows' },
  { id: 'fill_missing',       label: 'Fill Missing Values',   description: 'Forward-fill then back-fill null cells',     icon: '🔧', category: 'Values' },
  { id: 'trim_spaces',        label: 'Trim Whitespace',       description: 'Strip leading/trailing spaces from strings', icon: '✂️', category: 'Text' },
  { id: 'normalize_columns',  label: 'Normalize Column Names',description: 'Lowercase, replace spaces with underscores', icon: '📋', category: 'Columns' },
  { id: 'convert_dates',      label: 'Standardize Dates',     description: 'Detect & convert date columns to ISO format', icon: '📅', category: 'Dates' },
  { id: 'remove_blanks',      label: 'Remove Blank Rows',     description: 'Drop rows that are entirely empty',          icon: '🗑️', category: 'Rows' },
  { id: 'fix_types',          label: 'Fix Data Types',        description: 'Coerce numeric columns stored as strings',   icon: '🔢', category: 'Values' },
  { id: 'remove_outliers',    label: 'Flag Outliers',         description: 'Detect numeric outliers (IQR method)',       icon: '📊', category: 'Values' },
];

export default function CleanPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selected, setSelected] = useState('');
  const [ops, setOps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CleanResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getUploadStatus().then(d => {
      setDatasets(d.datasets || []);
      if (d.datasets?.length) setSelected(d.datasets[0].id);
    });
  }, []);

  function toggle(id: string) {
    setOps(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleClean() {
    if (!selected || ops.size === 0) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await cleanDataset(selected, Array.from(ops));
      setResult(res);
    } catch (e) {
      setError('Cleaning failed. Make sure the backend is running.');
    }
    setLoading(false);
  }

  const categories = [...new Set(OPERATIONS.map(o => o.category))];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Cleaning</h1>
          <p className="text-sm text-slate-400 mt-0.5">Select operations and apply them to your dataset</p>
        </div>
        <select
          value={selected}
          onChange={e => { setSelected(e.target.value); setResult(null); }}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
        >
          {datasets.length === 0 && <option>No datasets</option>}
          {datasets.map(d => <option key={d.id} value={d.id}>{d.original_filename}</option>)}
        </select>
      </div>

      {/* Operations grid by category */}
      {categories.map(cat => (
        <div key={cat}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {OPERATIONS.filter(o => o.category === cat).map(op => {
              const active = ops.has(op.id);
              return (
                <button
                  key={op.id}
                  onClick={() => toggle(op.id)}
                  className={`glass-card p-4 text-left transition border ${active ? 'border-blue-500/50 bg-blue-500/10' : 'border-slate-700/30 hover:border-slate-600'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{op.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${active ? 'text-blue-300' : 'text-slate-200'}`}>{op.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{op.description}</p>
                    </div>
                    <div className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center ${active ? 'bg-blue-600 border-blue-600' : 'border-slate-600'}`}>
                      {active && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Action bar */}
      <div className="glass-card p-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-slate-300">
            {ops.size === 0
              ? 'Select at least one cleaning operation above'
              : `${ops.size} operation${ops.size > 1 ? 's' : ''} selected`}
          </p>
        </div>
        <button
          onClick={() => setOps(new Set(OPERATIONS.map(o => o.id)))}
          className="text-xs text-slate-400 hover:text-slate-200 transition"
        >Select All</button>
        <button
          onClick={() => setOps(new Set())}
          className="text-xs text-slate-400 hover:text-slate-200 transition"
        >Clear</button>
        <button
          onClick={handleClean}
          disabled={loading || ops.size === 0 || !selected}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Cleaning...' : 'Run Cleaning'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card p-4 border border-rose-500/20 text-rose-400 text-sm">{error}</div>
      )}

      {/* Before / After comparison */}
      {result && (
        <div className="glass-card overflow-hidden border border-emerald-500/20">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-semibold text-emerald-400">Cleaning Complete</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="p-5 text-center">
              <p className="text-3xl font-bold text-white">{result.original_rows.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">Rows Before</p>
            </div>
            <div className="p-5 flex flex-col items-center justify-center text-slate-500">
              <ArrowRight className="w-6 h-6" />
              <p className="text-xs mt-1 text-rose-400">−{result.rows_removed.toLocaleString()} removed</p>
            </div>
            <div className="p-5 text-center">
              <p className="text-3xl font-bold text-emerald-400">{result.new_rows.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">Rows After</p>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-slate-800 bg-emerald-500/5">
            <p className="text-xs text-slate-400">{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
