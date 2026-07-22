'use client';
import { useState, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Database, FileCode, Loader2, CheckCircle } from 'lucide-react';
import { getUploadStatus, getExportUrl, getReportUrl } from '@/lib/api';
import { Dataset } from '@/types';

const EXPORT_FORMATS = [
  { id: 'csv',   label: 'CSV',                     description: 'Comma-separated values for universal import',          icon: FileText,        color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'excel', label: 'Excel (.xlsx)',             description: 'Microsoft Excel workbook via OpenPyXL',               icon: FileSpreadsheet, color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  { id: 'sql',   label: 'SQL Script',               description: 'CREATE TABLE + INSERT statements for PostgreSQL',     icon: Database,        color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20' },
  { id: 'pbi',   label: 'Power BI Ready',           description: 'Optimized CSV with clean headers for Power BI import',icon: FileCode,        color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
];

export default function ExportPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selected, setSelected] = useState('');
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    getUploadStatus().then(d => {
      setDatasets(d.datasets || []);
      if (d.datasets?.length) setSelected(d.datasets[0].id);
    });
  }, []);

  async function handleExport(format: string) {
    if (!selected) return;
    setLoading(format);

    // Small delay for UX
    await new Promise(r => setTimeout(r, 600));

    const url = format === 'pbi'
      ? getExportUrl(selected, 'csv') // Power BI uses optimized CSV
      : getExportUrl(selected, format as 'csv' | 'excel' | 'sql');

    // Trigger download via hidden link
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloaded(prev => new Set([...prev, format]));
    setLoading(null);
  }

  async function handleReportDownload() {
    if (!selected) return;
    setLoading('report');
    await new Promise(r => setTimeout(r, 400));
    const url = getReportUrl(selected);
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloaded(prev => new Set([...prev, 'report']));
    setLoading(null);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Export & Reports</h1>
          <p className="text-sm text-slate-400 mt-0.5">Download processed datasets and generate technical reports</p>
        </div>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
        >
          {datasets.length === 0 && <option>No datasets</option>}
          {datasets.map(d => <option key={d.id} value={d.id}>{d.original_filename}</option>)}
        </select>
      </div>

      {/* Export format cards */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Export Data As</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXPORT_FORMATS.map(fmt => {
            const Icon = fmt.icon;
            const isDone = downloaded.has(fmt.id);
            const isLoading = loading === fmt.id;
            return (
              <button
                key={fmt.id}
                onClick={() => handleExport(fmt.id)}
                disabled={!selected || isLoading}
                className={`glass-card p-5 text-left border ${fmt.border} hover:bg-slate-800/80 transition group disabled:opacity-50`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${fmt.bg} flex items-center justify-center group-hover:scale-110 transition`}>
                    {isLoading ? <Loader2 className={`w-5 h-5 ${fmt.color} animate-spin`} /> :
                     isDone ? <CheckCircle className="w-5 h-5 text-emerald-400" /> :
                     <Icon className={`w-5 h-5 ${fmt.color}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-200">{fmt.label}</p>
                      {isDone && <span className="badge badge-green text-[9px]">Downloaded</span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{fmt.description}</p>
                  </div>
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition flex-shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report generation */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Technical Report</h2>
        <div className="glass-card p-6 border border-blue-500/20">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white">ETL Technical Report (PDF)</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Auto-generated PDF including project objective, ETL workflow summary,
                cleaning operations performed, validation results, transformation rules,
                star schema design, column analysis, and export summary.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {['Project Objective', 'ETL Workflow', 'Cleaning Ops', 'Validation', 'Schema Design', 'Export Summary'].map(s => (
                  <span key={s} className="badge badge-blue">{s}</span>
                ))}
              </div>
            </div>
            <button
              onClick={handleReportDownload}
              disabled={!selected || loading === 'report'}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-600/20 flex-shrink-0"
            >
              {loading === 'report' ? <Loader2 className="w-4 h-4 animate-spin" /> :
               downloaded.has('report') ? <CheckCircle className="w-4 h-4" /> :
               <Download className="w-4 h-4" />}
              {loading === 'report' ? 'Generating...' :
               downloaded.has('report') ? 'Downloaded' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
