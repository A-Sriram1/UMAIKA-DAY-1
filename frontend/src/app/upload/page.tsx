'use client';
import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2, Info, X } from 'lucide-react';
import { uploadFiles } from '@/lib/api';
import { Dataset } from '@/types';

const ACCEPTED_TYPES = {
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
};

const DATASET_TYPES = ['Customer', 'Transactions', 'Branches', 'Products', 'Digital Channels', 'Calendar'];

interface FileState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  result?: Dataset;
  error?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPage() {
  const [files, setFiles] = useState<FileState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    const filtered = newFiles.filter(f =>
      f.name.endsWith('.csv') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
    );
    setFiles(prev => [
      ...prev,
      ...filtered.map(f => ({ file: f, progress: 0, status: 'pending' as const }))
    ]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (files.length === 0 || uploading) return;
    setUploading(true);

    const pending = files.filter(f => f.status === 'pending');
    const rawFiles = pending.map(f => f.file);

    // Mark all as uploading
    setFiles(prev => prev.map(f =>
      f.status === 'pending' ? { ...f, status: 'uploading', progress: 30 } : f
    ));

    // Simulate progress
    const progressTimer = setInterval(() => {
      setFiles(prev => prev.map(f =>
        f.status === 'uploading' && f.progress < 85
          ? { ...f, progress: f.progress + 10 }
          : f
      ));
    }, 300);

    try {
      const result = await uploadFiles(rawFiles);
      clearInterval(progressTimer);
      const datasets: Dataset[] = result.datasets || [];

      setFiles(prev => prev.map((f, idx) => {
        if (f.status === 'uploading') {
          const ds = datasets.find(d => d.original_filename === f.file.name);
          return { ...f, status: ds ? 'success' : 'error', progress: 100, result: ds, error: ds ? undefined : 'Upload failed' };
        }
        return f;
      }));
    } catch (err) {
      clearInterval(progressTimer);
      setFiles(prev => prev.map(f =>
        f.status === 'uploading'
          ? { ...f, status: 'error', progress: 0, error: 'Server error' }
          : f
      ));
    }
    setUploading(false);
  };

  const totalSize = files.reduce((s, f) => s + f.file.size, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dataset Upload</h1>
        <p className="text-sm text-slate-400 mt-0.5">Upload banking datasets for ETL processing</p>
      </div>

      {/* Dataset type reference */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-200">Accepted Dataset Types</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {DATASET_TYPES.map(t => (
            <span key={t} className="badge badge-blue text-center justify-center py-1.5">{t}</span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">Accepted formats: <strong className="text-slate-300">.csv</strong> and <strong className="text-slate-300">.xlsx</strong></p>
      </div>

      {/* Drop zone */}
      <div
        className={`dropzone p-10 text-center ${isDragging ? 'active' : ''}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleInput}
        />
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition ${isDragging ? 'bg-blue-500/20 scale-110' : 'bg-slate-800'}`}>
            <Upload className={`w-8 h-8 transition ${isDragging ? 'text-blue-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-200">
              {isDragging ? 'Release to add files' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-slate-400 mt-1">or click to browse · CSV and XLSX supported</p>
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200">
              Files ({files.length}) — {formatBytes(totalSize)}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiles([])}
                className="text-xs text-slate-400 hover:text-slate-200 transition"
              >Clear all</button>
              <button
                onClick={handleUpload}
                disabled={uploading || files.every(f => f.status !== 'pending')}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
              >
                {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {uploading ? 'Uploading...' : 'Upload All'}
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
            {files.map((fs, idx) => (
              <div key={idx} className="flex items-center gap-4 px-5 py-3">
                <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-200 truncate">{fs.file.name}</p>
                    <span className="text-xs text-slate-500 ml-3 flex-shrink-0">{formatBytes(fs.file.size)}</span>
                  </div>
                  {/* Progress bar */}
                  {(fs.status === 'uploading' || fs.status === 'success') && (
                    <div className="w-full bg-slate-800 rounded-full h-1 mb-1">
                      <div
                        className={`h-1 rounded-full transition-all duration-500 ${fs.status === 'success' ? 'bg-emerald-500' : 'progress-bar-animated bg-blue-500'}`}
                        style={{ width: `${fs.progress}%` }}
                      />
                    </div>
                  )}
                  {fs.result && (
                    <p className="text-[10px] text-slate-500">
                      {fs.result.rows.toLocaleString()} rows · {fs.result.columns} columns
                    </p>
                  )}
                  {fs.error && <p className="text-[10px] text-rose-400">{fs.error}</p>}
                </div>

                {/* Status icon */}
                <div className="flex-shrink-0">
                  {fs.status === 'pending'   && <span className="badge badge-yellow">Pending</span>}
                  {fs.status === 'uploading' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                  {fs.status === 'success'   && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                  {fs.status === 'error'     && <XCircle className="w-5 h-5 text-rose-400" />}
                </div>

                <button onClick={() => removeFile(idx)} className="text-slate-600 hover:text-slate-300 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success summary */}
      {files.some(f => f.status === 'success') && (
        <div className="glass-card p-4 border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-400">Upload Successful!</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {files.filter(f => f.status === 'success').length} file(s) uploaded.
                Navigate to <strong>Data Preview</strong> to inspect your data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
