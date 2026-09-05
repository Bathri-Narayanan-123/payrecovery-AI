import React from 'react';
import { Bot, CheckCircle2, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { DashboardMetrics } from '../types';

interface HeaderProps {
  title: string;
  subtitle: string;
  metrics: DashboardMetrics | null;
  onRunBatchRecovery: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  metrics,
  onRunBatchRecovery,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 shadow-xs">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            DEMO MODE
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick summary badges */}
        {metrics && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-1 text-slate-600">
              <span className="text-slate-400">At Risk:</span>
              <span className="font-semibold text-rose-600">
                ₹{metrics.total_revenue_at_risk.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 text-slate-600">
              <span className="text-slate-400">Recovered:</span>
              <span className="font-semibold text-emerald-600">
                ₹{metrics.revenue_recovered.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 text-slate-600">
              <span className="text-slate-400">Rate:</span>
              <span className="font-bold text-indigo-600">{metrics.recovery_rate}%</span>
            </div>
          </div>
        )}

        {/* Refresh button */}
        <button
          id="btn-header-refresh"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh metrics & transactions"
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Primary Agent Run Batch Action */}
        <button
          id="btn-header-run-recovery"
          onClick={onRunBatchRecovery}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
          <span>Run AI Recovery</span>
        </button>
      </div>
    </header>
  );
};
