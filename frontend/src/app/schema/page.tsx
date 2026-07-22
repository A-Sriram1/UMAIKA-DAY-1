'use client';
import { useState, useEffect } from 'react';
import { Database, Loader2, GitBranch } from 'lucide-react';
import { getUploadStatus, generateSchema } from '@/lib/api';
import { Dataset, SchemaResult } from '@/types';

const DIM_COLORS: Record<string, string> = {
  DimCustomer: '#3b82f6',
  DimProduct:  '#8b5cf6',
  DimBranch:   '#10b981',
  DimChannel:  '#f59e0b',
  DimDate:     '#ec4899',
};

const DIM_FIELDS: Record<string, string[]> = {
  DimCustomer:  ['customer_key (PK)', 'customer_id', 'full_name', 'segment', 'city', 'country', 'credit_score', 'channel'],
  DimProduct:   ['product_key (PK)', 'product_id', 'product_name', 'type', 'category', 'interest_rate'],
  DimBranch:    ['branch_key (PK)', 'branch_id', 'branch_name', 'city', 'state', 'region', 'type'],
  DimChannel:   ['channel_key (PK)', 'channel_id', 'channel_name', 'channel_type', 'device_os'],
  DimDate:      ['date_key (PK)', 'date', 'day', 'month', 'quarter', 'year', 'fiscal_year', 'season'],
};

const FACT_FIELDS = [
  'transaction_key (PK)',
  'transaction_id',
  'customer_key (FK)',
  'product_key (FK)',
  'branch_key (FK)',
  'channel_key (FK)',
  'date_key (FK)',
  'amount',
  'currency',
  'transaction_type',
  'status',
  'fraud_score',
  'balance_after',
];

export default function SchemaPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [schema, setSchema] = useState<SchemaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getUploadStatus().then(d => setDatasets(d.datasets || []));
  }, []);

  async function handleGenerate() {
    setLoading(true); setError('');
    try {
      const ids = datasets.map(d => d.id);
      const res = await generateSchema(ids);
      setSchema(res);
    } catch {
      setError('Schema generation failed. Ensure datasets are uploaded and backend is running.');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Star Schema</h1>
          <p className="text-sm text-slate-400 mt-0.5">Auto-generated dimensional model for Power BI integration</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || datasets.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
          {loading ? 'Generating...' : 'Generate Schema'}
        </button>
      </div>

      {error && <div className="glass-card p-4 border border-rose-500/20 text-rose-400 text-sm">{error}</div>}

      {/* Always show the schema diagram */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-400" />
          Star Schema — Digital Banking Data Warehouse
          {schema && <span className="badge badge-green ml-2">Generated</span>}
        </h2>

        {/* Visual schema */}
        <div className="relative flex flex-col items-center gap-6">

          {/* Fact table */}
          <div className="schema-node fact w-52 z-10 shadow-lg shadow-blue-900/30">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-2">Fact Table</div>
            <div className="text-sm font-bold text-white mb-3">Fact_Transactions</div>
            <div className="text-left space-y-0.5">
              {FACT_FIELDS.map(f => (
                <div key={f} className={`text-[10px] ${f.includes('PK') ? 'text-amber-400 font-semibold' : f.includes('FK') ? 'text-blue-300' : 'text-slate-400'}`}>
                  {f.includes('PK') ? '🔑 ' : f.includes('FK') ? '🔗 ' : '  '}{f}
                </div>
              ))}
            </div>
          </div>

          {/* Connector lines area */}
          <div className="w-full flex items-start justify-center gap-4 flex-wrap">
            {Object.entries(DIM_FIELDS).map(([dimName, fields]) => {
              const color = DIM_COLORS[dimName] || '#64748b';
              return (
                <div key={dimName} className="flex flex-col items-center gap-2">
                  {/* Arrow up */}
                  <div className="w-px h-8 bg-gradient-to-b from-blue-500/60 to-transparent" />
                  <div
                    className="schema-node dim"
                    style={{ borderColor: `${color}55`, background: `${color}10` }}
                  >
                    <div
                      className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                      style={{ color }}
                    >
                      Dimension
                    </div>
                    <div className="text-sm font-bold text-white mb-2">{dimName}</div>
                    <div className="text-left space-y-0.5">
                      {fields.map(f => (
                        <div key={f} className={`text-[10px] ${f.includes('PK') ? 'text-amber-400 font-semibold' : 'text-slate-400'}`}>
                          {f.includes('PK') ? '🔑 ' : '  '}{f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Relationship table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200">Relationships</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>From Table</th>
              <th>To Table</th>
              <th>Join Key</th>
              <th>Cardinality</th>
            </tr>
          </thead>
          <tbody>
            {[
              { from: 'Fact_Transactions', to: 'DimCustomer', key: 'customer_key', card: 'Many → One' },
              { from: 'Fact_Transactions', to: 'DimProduct',  key: 'product_key',  card: 'Many → One' },
              { from: 'Fact_Transactions', to: 'DimBranch',   key: 'branch_key',   card: 'Many → One' },
              { from: 'Fact_Transactions', to: 'DimChannel',  key: 'channel_key',  card: 'Many → One' },
              { from: 'Fact_Transactions', to: 'DimDate',     key: 'date_key',     card: 'Many → One' },
            ].map(r => (
              <tr key={r.to}>
                <td><span className="badge badge-blue">{r.from}</span></td>
                <td><span className="badge badge-green">{r.to}</span></td>
                <td className="font-mono text-xs text-amber-400">{r.key}</td>
                <td className="text-slate-400 text-xs">{r.card}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
