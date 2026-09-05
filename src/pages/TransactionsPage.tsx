import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Filter,
  RefreshCw,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { ActionBadge, PolicyBadge, RiskBadge, StatusBadge } from '../components/Badges';
import { PaymentMethod, PaymentStatus, Transaction } from '../types';

interface TransactionsPageProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onRefresh: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  onSelectTransaction,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'amount' | 'probability' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matches =
            tx.payment_id.toLowerCase().includes(q) ||
            tx.customer_name.toLowerCase().includes(q) ||
            tx.customer_email.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Status
        if (statusFilter !== 'all' && tx.status !== statusFilter) return false;

        // Payment Method
        if (methodFilter !== 'all' && tx.payment_method !== methodFilter) return false;

        // Reason
        if (reasonFilter !== 'all' && tx.failure_reason !== reasonFilter) return false;

        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;
        if (sortField === 'amount') {
          valA = a.amount;
          valB = b.amount;
        } else if (sortField === 'probability') {
          valA = a.recovery_probability;
          valB = b.recovery_probability;
        } else {
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [transactions, search, statusFilter, methodFilter, reasonFilter, sortField, sortOrder]);

  const totalFilteredVolume = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [filteredTransactions]);

  const handleSortToggle = (field: 'amount' | 'probability' | 'created_at') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Transaction Ledger & Ingestion
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of merchant checkouts, failed events, and recovery lifecycles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            Showing <strong className="text-slate-800">{filteredTransactions.length}</strong> of{' '}
            {transactions.length} orders (₹{totalFilteredVolume.toLocaleString('en-IN')})
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name, email..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="failed">Failed</option>
              <option value="at_risk">At Risk</option>
              <option value="recovered">Recovered</option>
              <option value="link_sent">Link Dispatched</option>
              <option value="reminder_sent">Reminder Sent</option>
              <option value="escalated">Escalated</option>
              <option value="stopped">Stopped</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Payment Rails</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Netbanking">Netbanking</option>
              <option value="Wallet">Wallet</option>
            </select>
          </div>

          {/* Failure Reason Filter */}
          <div>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Failure Causes</option>
              <option value="timeout">Gateway Timeout</option>
              <option value="bank_decline">Bank Decline</option>
              <option value="insufficient_funds">Insufficient Funds</option>
              <option value="authentication_failure">Auth / OTP Drop</option>
              <option value="technical_error">Technical Error</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips Reset */}
        {(search || statusFilter !== 'all' || methodFilter !== 'all' || reasonFilter !== 'all') && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs text-slate-500">
            <span>Filtered results active</span>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setMethodFilter('all');
                setReasonFilter('all');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-medium underline text-[11px]"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Customer & ID</th>
                <th
                  onClick={() => handleSortToggle('amount')}
                  className="px-5 py-3 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Amount (INR)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Failure Reason</th>
                <th className="px-5 py-3">Retries</th>
                <th
                  onClick={() => handleSortToggle('probability')}
                  className="px-5 py-3 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Win Prob</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-5 py-3">AI Action</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Intervene</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-slate-400 text-xs">
                    No transactions matched your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.payment_id}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{tx.customer_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{tx.payment_id}</div>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {tx.payment_method}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-rose-600 capitalize font-medium">
                        {tx.failure_reason.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 font-mono">
                      {tx.retry_count} / 2
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-10 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              tx.recovery_probability >= 70
                                ? 'bg-emerald-500'
                                : tx.recovery_probability >= 45
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${tx.recovery_probability}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-800">{tx.recovery_probability}%</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <ActionBadge action={tx.recommended_action} />
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={tx.status} />
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransaction(tx);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-slate-200 transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
