import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  RotateCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ActionBadge, PolicyBadge, RiskBadge, StatusBadge } from '../components/Badges';
import { RecoveryAction, Transaction } from '../types';

interface RecoveryCenterPageProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onExecuteAction: (paymentId: string, action: RecoveryAction, merchantApproved?: boolean, forceSimulatedSuccess?: boolean) => Promise<void>;
  onRunBatchRecovery: () => void;
  isExecuting: boolean;
}

export const RecoveryCenterPage: React.FC<RecoveryCenterPageProps> = ({
  transactions,
  onSelectTransaction,
  onExecuteAction,
  onRunBatchRecovery,
  isExecuting,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'high_prob' | 'requires_approval' | 'retry' | 'payment_link' | 'recovered'>('all');
  const [search, setSearch] = useState('');

  // Filtered by tab
  const filteredCases = useMemo(() => {
    return transactions.filter((tx) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          tx.payment_id.toLowerCase().includes(q) ||
          tx.customer_name.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (activeTab === 'recovered') {
        return tx.status === 'recovered';
      }

      // Remaining tabs focus on unresolved / at-risk payments
      if (tx.status === 'recovered') return false;

      if (activeTab === 'high_prob') {
        return tx.recovery_probability >= 70;
      }
      if (activeTab === 'requires_approval') {
        return tx.safety_policy?.decision === 'REQUIRES_APPROVAL' || tx.amount >= 15000;
      }
      if (activeTab === 'retry') {
        return tx.recommended_action === 'retry';
      }
      if (activeTab === 'payment_link') {
        return tx.recommended_action === 'payment_link';
      }

      return true;
    });
  }, [transactions, activeTab, search]);

  const atRiskCases = useMemo(() => transactions.filter(t => t.status !== 'recovered'), [transactions]);
  const highProbCases = useMemo(() => atRiskCases.filter(t => t.recovery_probability >= 70), [atRiskCases]);
  const approvalCases = useMemo(() => atRiskCases.filter(t => t.safety_policy?.decision === 'REQUIRES_APPROVAL' || t.amount >= 15000), [atRiskCases]);
  const recoveredCases = useMemo(() => transactions.filter(t => t.status === 'recovered'), [transactions]);

  const totalAtRiskVolume = useMemo(() => atRiskCases.reduce((acc, t) => acc + t.amount, 0), [atRiskCases]);
  const totalRecoveredVolume = useMemo(() => recoveredCases.reduce((acc, t) => acc + t.amount, 0), [recoveredCases]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Run AI Recovery Trigger */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md border border-indigo-950/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            Active Recovery Dispatcher
          </div>
          <h2 className="text-xl font-bold">Autonomous Batch Intervention Console</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Execute the full recovery workflow across eligible orders. The agent simulates Razorpay test payment links, automated retries, and SMS nudges under strict safety policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-rec-center-batch"
            onClick={onRunBatchRecovery}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-transform active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-indigo-100" />
            <span>Execute Batch Recovery (20+ Orders)</span>
          </button>
        </div>
      </div>

      {/* Tabs and Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Pending ({atRiskCases.length})
          </button>

          <button
            onClick={() => setActiveTab('high_prob')}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'high_prob'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            High Probability ({highProbCases.length})
          </button>

          <button
            onClick={() => setActiveTab('requires_approval')}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'requires_approval'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Requires Sign-Off ({approvalCases.length})
          </button>

          <button
            onClick={() => setActiveTab('retry')}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'retry'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Retries Eligible
          </button>

          <button
            onClick={() => setActiveTab('payment_link')}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'payment_link'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Payment Links
          </button>

          <button
            onClick={() => setActiveTab('recovered')}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'recovered'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            Recovered ({recoveredCases.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or customer..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid of Recovery Opportunity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No recovery cases match the selected filter.
          </div>
        ) : (
          filteredCases.map((tx) => {
            const isRecovered = tx.status === 'recovered';
            const requiresSignOff = tx.safety_policy?.decision === 'REQUIRES_APPROVAL';
            return (
              <div
                key={tx.payment_id}
                onClick={() => onSelectTransaction(tx)}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all p-5 flex flex-col justify-between cursor-pointer space-y-4"
              >
                {/* Top Row: Customer & Status */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{tx.customer_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{tx.payment_id}</div>
                    </div>
                    <StatusBadge status={tx.status} />
                  </div>

                  {/* Financial amount */}
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-extrabold text-slate-900">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono ml-1">{tx.payment_method}</span>
                    </div>

                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 capitalize">
                      {tx.failure_reason.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* AI & Policy Diagnostics */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Recovery Probability</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-indigo-700">{tx.recovery_probability}%</span>
                      <span className="text-[10px] text-slate-400">
                        (~₹{tx.expected_recovery.toLocaleString('en-IN')})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Safety Policy</span>
                    <PolicyBadge decision={tx.safety_policy?.decision || 'APPROVED'} />
                  </div>

                  <div className="text-[11px] text-slate-600 italic line-clamp-2 leading-tight pt-1 border-t border-slate-200/60">
                    "{tx.ai_analysis?.reason || 'Reasoning based on gateway latency and customer tier.'}"
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <ActionBadge action={tx.recommended_action} />

                  {isRecovered ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Recovered
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Direct execute action with demo settlement support
                        onExecuteAction(tx.payment_id, tx.recommended_action, true, true);
                      }}
                      disabled={isExecuting}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <span>Execute</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
