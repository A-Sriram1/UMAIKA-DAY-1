'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Loader2, ArrowDown, Play, RotateCw } from 'lucide-react';

const STEPS = [
  { id: 'extract',   label: 'Extract',   description: 'Read raw data from uploaded files (CSV / Excel)',       duration: 2000 },
  { id: 'validate',  label: 'Validate',  description: 'Check schema, column types, and null constraints',      duration: 1500 },
  { id: 'transform', label: 'Transform', description: 'Apply business rules, join and reshape datasets',       duration: 2500 },
  { id: 'clean',     label: 'Clean',     description: 'Remove duplicates, fill nulls, trim whitespace',        duration: 2000 },
  { id: 'merge',     label: 'Merge',     description: 'Join dimension tables and build star schema',           duration: 1800 },
  { id: 'load',      label: 'Load',      description: 'Write cleaned data to the data warehouse',              duration: 1200 },
  { id: 'export',    label: 'Export',     description: 'Generate Power BI-ready CSV / Excel / SQL outputs',     duration: 1000 },
];

type StepStatus = 'pending' | 'active' | 'done';

export default function PipelinePage() {
  const [statuses, setStatuses] = useState<StepStatus[]>(STEPS.map(() => 'pending'));
  const [running, setRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [progress, setProgress] = useState<number[]>(STEPS.map(() => 0));

  async function runPipeline() {
    setRunning(true);
    setStatuses(STEPS.map(() => 'pending'));
    setProgress(STEPS.map(() => 0));

    for (let i = 0; i < STEPS.length; i++) {
      setCurrentIdx(i);
      setStatuses(prev => prev.map((s, idx) => (idx === i ? 'active' : s)));

      // Animate progress for this step
      const step = STEPS[i];
      const interval = 50;
      const ticks = step.duration / interval;
      for (let t = 0; t <= ticks; t++) {
        await new Promise(r => setTimeout(r, interval));
        setProgress(prev => prev.map((p, idx) => (idx === i ? Math.min(100, (t / ticks) * 100) : p)));
      }

      setStatuses(prev => prev.map((s, idx) => (idx === i ? 'done' : s)));
      setProgress(prev => prev.map((p, idx) => (idx === i ? 100 : p)));
    }

    setCurrentIdx(STEPS.length);
    setRunning(false);
  }

  function resetPipeline() {
    setStatuses(STEPS.map(() => 'pending'));
    setProgress(STEPS.map(() => 0));
    setCurrentIdx(-1);
    setRunning(false);
  }

  const allDone = statuses.every(s => s === 'done');

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">ETL Pipeline</h1>
          <p className="text-sm text-slate-400 mt-0.5">Animated pipeline execution with live step progress</p>
        </div>
        <div className="flex gap-2">
          {allDone && (
            <button
              onClick={resetPipeline}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition border border-slate-700"
            >
              <RotateCw className="w-4 h-4" />
              Reset
            </button>
          )}
          <button
            onClick={runPipeline}
            disabled={running}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? 'Running...' : allDone ? 'Run Again' : 'Start Pipeline'}
          </button>
        </div>
      </div>

      {/* Pipeline steps */}
      <div className="glass-card p-6 space-y-0">
        {STEPS.map((step, idx) => {
          const status = statuses[idx];
          const prog = progress[idx];
          return (
            <div key={step.id}>
              <div className={`pipeline-step ${status} flex-row items-start gap-4 py-4`}>
                {/* Status circle */}
                <div className="flex-shrink-0">
                  {status === 'done'   && <CheckCircle className="w-8 h-8 text-emerald-400" />}
                  {status === 'active' && (
                    <div className="step-circle w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}
                  {status === 'pending' && (
                    <Circle className="w-8 h-8 text-slate-600" />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-sm font-semibold ${
                      status === 'done'   ? 'text-emerald-400' :
                      status === 'active' ? 'text-blue-300' :
                      'text-slate-500'
                    }`}>
                      Step {idx + 1}: {step.label}
                    </h3>
                    {status === 'done' && <span className="badge badge-green text-[9px]">Complete</span>}
                    {status === 'active' && <span className="badge badge-blue text-[9px]">In Progress</span>}
                  </div>
                  <p className={`text-xs mt-1 ${status === 'pending' ? 'text-slate-600' : 'text-slate-400'}`}>
                    {step.description}
                  </p>

                  {/* Progress bar (show for active or done) */}
                  {(status === 'active' || status === 'done') && (
                    <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-100 ${
                          status === 'done'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'progress-bar-animated bg-gradient-to-r from-blue-500 to-indigo-400'
                        }`}
                        style={{ width: `${prog}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Connector arrow */}
              {idx < STEPS.length - 1 && (
                <div className="flex items-center pl-4 py-1">
                  <div className={`w-px h-6 ml-3.5 ${
                    statuses[idx + 1] !== 'pending' || status === 'done' ? 'bg-emerald-500/40' : 'bg-slate-700'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion banner */}
      {allDone && (
        <div className="glass-card p-5 border border-emerald-500/20 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-emerald-400">Pipeline Complete!</p>
          <p className="text-xs text-slate-400 mt-1">All 7 ETL steps executed successfully. Data is ready for export.</p>
        </div>
      )}
    </div>
  );
}
