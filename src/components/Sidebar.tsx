import React from 'react';
import {
  Activity,
  CheckCircle,
  Database,
  FileText,
  LayoutDashboard,
  Receipt,
  RotateCcw,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { DashboardMetrics, SystemSettings } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  metrics: DashboardMetrics | null;
  settings: SystemSettings | null;
  onResetData: () => void;
  isResetting: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  metrics,
  settings,
  onResetData,
  isResetting,
}) => {
  const pendingRecoveryCount = metrics?.failed_payments || 0;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    {
      id: 'recovery-center',
      label: 'Recovery Center',
      icon: Zap,
      badge: pendingRecoveryCount > 0 ? pendingRecoveryCount : undefined,
    },
    { id: 'audit-log', label: 'Audit Log', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-screen border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
            <Shield className="w-5 h-5 fill-white/20 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-lg">PayRecover</span>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-indigo-500/30">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Revenue Recovery Agent</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Merchant Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Agent Highlights */}
        <div className="pt-5 px-3">
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Live Agent Status
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between items-center">
                <span>AI Engine</span>
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Gemini 3.8 Flash
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Payment Rail</span>
                <span className="text-slate-300 font-medium">Razorpay Test</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Safety Policy</span>
                <span className="text-emerald-400 font-medium">Enforced</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer Info & Reset */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-xs space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            DEMO MODE
          </div>
          <span className="text-[10px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
            Razorpay Buildathon
          </span>
        </div>

        <button
          id="btn-reset-demo-data"
          onClick={onResetData}
          disabled={isResetting}
          title="Restore baseline 42 synthetic transactions and metrics"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors border border-slate-700/60 disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          {isResetting ? 'Resetting Demo...' : 'Reset Demo Data'}
        </button>
      </div>
    </aside>
  );
};
