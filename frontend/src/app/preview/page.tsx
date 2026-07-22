'use client';
import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Info, AlertTriangle } from 'lucide-react';
import { getUploadStatus, previewDataset } from '@/lib/api';
import { Dataset, PreviewData, ColumnStat } from '@/types';

export default function PreviewPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUploadStatus().then(d => {
      setDatasets(d.datasets || []);
      if (d.datasets?.length) setSelected(d.datasets[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    previewDataset(selected, page)
      .then(setPreview)
      .catch(() => setPreview(null))
      .finally(() => setLoading(false));
  }, [selected, page]);

  const rows = preview?.data ?? [];
  const columns = preview?.column_stats ?? [];

  // Client-side search filter
  const filtered = search
    ? rows.filter(row =>
        Object.values(row).some(v =>
          String(v).toLowerCase().includes(search.toLowerCase())
        )
      )
    : rows;

  // Sort
  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        const av = a[sortCol] ?? '';
        const bv = b[sortCol] ?? '';
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : filtered;

  function handleSort(col: string) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  }

  function missingColor(missing: number, total: number) {
    if (!total) return 'badge-green';
    const pct = missing / total;
    if (pct > 0.15) return 'badge-red';
    if (pct > 0.05) return 'badge-yellow';
    return 'badge-green';
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Preview</h1>
          <p className="text-sm text-slate-400 mt-0.5">Inspect, search, sort and filter your uploaded datasets</p>
        </div>
        {/* Dataset selector */}
        <select
          value={selected}
          onChange={e => { setSelected(e.target.value); setPage(1); }}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
        >
          {datasets.length === 0 && <option>No datasets</option>}
          {datasets.map(d => (
            <option key={d.id} value={d.id}>{d.original_filename}</option>
          ))}
        </select>
      </div>

      {/* Column stats */}
      {preview && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-slate-200">Column Summary</h2>
            <span className="badge badge-blue ml-auto">{columns.length} columns</span>
            <span className="badge badge-yellow">{preview.duplicate_count} duplicates</span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
            {columns.map((col: ColumnStat) => (
              <div
                key={col.name}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs"
              >
                <p className="font-medium text-slate-200 truncate max-w-[120px]">{col.name}</p>
                <p className="text-slate-500 mt-0.5">{col.type}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`badge ${missingColor(col.missing, preview.total_rows)} text-[9px]`}>
                    {col.missing} null
                  </span>
                  <span className="badge badge-blue text-[9px]">{col.unique} unique</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + table */}
      <div className="glass-card overflow-hidden">
        {/* Controls */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search rows..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          {preview && (
            <span className="text-xs text-slate-400 ml-auto">
              {preview.total_rows.toLocaleString()} total rows · page {page}/{preview.total_pages}
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-auto" style={{ maxHeight: '55vh' }}>
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
              Loading preview...
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <AlertTriangle className="w-10 h-10 mb-2 opacity-30" />
              <p>{datasets.length === 0 ? 'No datasets uploaded yet.' : 'No rows match your search.'}</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th
                      key={col.name}
                      onClick={() => handleSort(col.name)}
                      className="cursor-pointer hover:text-slate-300 select-none"
                    >
                      <div className="flex items-center gap-1">
                        {col.name}
                        {sortCol === col.name && (
                          <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, ri) => (
                  <tr key={ri}>
                    {columns.map(col => {
                      const val = row[col.name];
                      const isNull = val === null || val === undefined || val === '';
                      return (
                        <td key={col.name} title={String(val ?? '')}>
                          {isNull
                            ? <span className="text-rose-500/60 italic text-[10px]">null</span>
                            : String(val)
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {preview && preview.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <span className="text-xs text-slate-500">Page {page} of {preview.total_pages}</span>
            <button
              onClick={() => setPage(p => Math.min(preview.total_pages, p + 1))}
              disabled={page === preview.total_pages}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 transition"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
