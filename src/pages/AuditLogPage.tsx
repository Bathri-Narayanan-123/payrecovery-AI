import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ActionBadge, PolicyBadge } from '../components/Badges';
import { AuditLog } from '../types';

interface AuditLogPageProps {
  logs: AuditLog[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const AuditLogPage: React.FC<AuditLogPageProps> = ({ logs, onRefresh, isRefreshing }) => {
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          log.payment_id.toLowerCase().includes(q) ||
          log.customer.toLowerCase().includes(q) ||
          log.ai_reasoning.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (resultFilter !== 'all' && log.action_result !== resultFilter) {
        return false;
      }
      return true;
    });
  }, [logs, search, resultFilter]);

  const totalRecoveredVolume = useMemo(() => {
    return logs.reduce((acc, l) => acc + l.recovered_amount, 0);
  }, [logs]);

  const successfulRecoveriesCount = useMemo(() => {
    return logs.filter((l) => l.action_result === 'RECOVERED').length;
  }, [logs]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Compliance & AI Decision Audit Trail
            </h2>
            <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
              Immutable Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Every AI diagnosis, policy check, and Razorpay recovery action is recorded for regulatory transparency
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="self-start md:self-auto flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Audited Decisions
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{logs.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">100% trace coverage</div>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            Recovered Orders via Audit
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {successfulRecoveriesCount}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            ₹{totalRecoveredVolume.toLocaleString('en-IN')} reconciled
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Safety Interventions
          </div>
          <div className="text-2xl font-bold text-indigo-900 mt-1">
            {logs.filter((l) => l.policy_decision !== 'APPROVED').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Blocked or flagged for approval</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payment ID, customer, reasoning..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Action Outcomes</option>
            <option value="RECOVERED">RECOVERED</option>
            <option value="LINK_SENT">LINK_SENT</option>
            <option value="REMINDER_DELIVERED">REMINDER_DELIVERED</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="STOPPED">STOPPED</option>
            <option value="FAILED_RETRY">FAILED_RETRY</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Customer & ID</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Probability</th>
                <th className="px-5 py-3">AI Reasoning</th>
                <th className="px-5 py-3">Policy Check</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Result</th>
                <th className="px-5 py-3 text-right">Recovered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-slate-400 text-xs">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      <div>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{log.customer}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.payment_id}</div>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      ₹{log.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-bold text-indigo-700">{log.recovery_probability}%</span>
                    </td>

                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-slate-600 truncate text-[11px] font-normal" title={log.ai_reasoning}>
                        {log.ai_reasoning}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <PolicyBadge decision={log.policy_decision} />
                    </td>

                    <td className="px-5 py-3.5">
                      <ActionBadge action={log.selected_action} />
                    </td>

                    <td className="px-5 py-3.5">
                      {log.action_result === 'RECOVERED' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> RECOVERED
                        </span>
                      ) : log.action_result === 'STOPPED' ? (
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          STOPPED
                        </span>
                      ) : (
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                          {log.action_result}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right font-extrabold text-emerald-600 whitespace-nowrap">
                      {log.recovered_amount > 0 ? `+₹${log.recovered_amount.toLocaleString('en-IN')}` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot Modal Drawer when clicking an audit record */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Audit Record Detail</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold px-2 py-1 rounded bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Audit ID</span>
                  <div className="font-mono text-slate-800 font-semibold">{selectedLog.id}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Logged At</span>
                  <div className="text-slate-800">{new Date(selectedLog.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Customer</span>
                  <div className="text-slate-900 font-bold">{selectedLog.customer}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Payment ID</span>
                  <div className="font-mono text-slate-800">{selectedLog.payment_id}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">AI Reasoning Trace</span>
                <p className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-slate-700 mt-1 leading-relaxed">
                  {selectedLog.ai_reasoning}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase block">Policy Check</span>
                  <PolicyBadge decision={selectedLog.policy_decision} className="mt-1" />
                </div>
                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase block">Selected Action</span>
                  <ActionBadge action={selectedLog.selected_action} className="mt-1" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <div>
                  <div className="text-[11px] font-semibold text-emerald-800">Action Result: {selectedLog.action_result}</div>
                  <div className="text-[10px] text-emerald-700">Mode: {selectedLog.execution_mode}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-emerald-700 uppercase font-bold">Recovered</div>
                  <div className="text-lg font-extrabold text-emerald-700">
                    ₹{selectedLog.recovered_amount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
