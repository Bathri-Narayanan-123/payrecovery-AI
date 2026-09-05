import React, { useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Flame,
  Percent,
  RefreshCw,
  RotateCw,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ActionBadge, PolicyBadge, RiskBadge, StatusBadge } from '../components/Badges';
import { DashboardMetrics, Transaction } from '../types';

interface DashboardPageProps {
  metrics: DashboardMetrics | null;
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onRunBatchRecovery: () => void;
  onNavigateToRecovery: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metrics,
  transactions,
  onSelectTransaction,
  onRunBatchRecovery,
  onNavigateToRecovery,
}) => {
  // Chart 1: Revenue at Risk vs Recovered Comparison
  const revenueComparisonData = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: 'Revenue at Risk', amount: metrics.total_revenue_at_risk, fill: '#f43f5e' },
      { name: 'Recovered Revenue', amount: metrics.revenue_recovered, fill: '#10b981' },
    ];
  }, [metrics]);

  // Chart 2: Failure Reason Breakdown
  const failureReasonData = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach((t) => {
      const label = t.failure_reason.replace('_', ' ');
      counts[label] = (counts[label] || 0) + 1;
    });

    const colors = ['#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#64748b'];
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  }, [transactions]);

  // Chart 3: Recommended Actions Breakdown
  const actionsData = useMemo(() => {
    const counts: Record<string, { count: number; value: number }> = {
      retry: { count: 0, value: 0 },
      payment_link: { count: 0, value: 0 },
      reminder: { count: 0, value: 0 },
      escalate: { count: 0, value: 0 },
      stop: { count: 0, value: 0 },
    };

    transactions.forEach((t) => {
      if (counts[t.recommended_action]) {
        counts[t.recommended_action].count++;
        counts[t.recommended_action].value += t.amount;
      }
    });

    return [
      { action: 'Smart Retry', count: counts.retry.count, volume: counts.retry.value },
      { action: 'Payment Link', count: counts.payment_link.count, volume: counts.payment_link.value },
      { action: 'Reminder', count: counts.reminder.count, volume: counts.reminder.value },
      { action: 'Escalate', count: counts.escalate.count, volume: counts.escalate.value },
      { action: 'Stop', count: counts.stop.count, volume: counts.stop.value },
    ];
  }, [transactions]);

  // Chart 4: Recovery Success Rate by Payment Method
  const methodRecoveryData = useMemo(() => {
    const stats: Record<string, { total: number; recovered: number }> = {
      UPI: { total: 0, recovered: 0 },
      Card: { total: 0, recovered: 0 },
      Netbanking: { total: 0, recovered: 0 },
      Wallet: { total: 0, recovered: 0 },
    };

    transactions.forEach((t) => {
      if (stats[t.payment_method]) {
        stats[t.payment_method].total++;
        if (t.status === 'recovered') {
          stats[t.payment_method].recovered++;
        }
      }
    });

    return Object.entries(stats).map(([method, data]) => ({
      method,
      rate: data.total > 0 ? Math.round((data.recovered / data.total) * 100) : 0,
      recoveredCount: data.recovered,
      totalCount: data.total,
    }));
  }, [transactions]);

  // High Priority or High Recovery Probability Cases
  const topRecoveryOpportunities = useMemo(() => {
    return transactions
      .filter((t) => t.status !== 'recovered' && t.status !== 'stopped')
      .sort((a, b) => b.recovery_probability - a.recovery_probability || b.amount - a.amount)
      .slice(0, 6);
  }, [transactions]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              Autonomous Revenue Recovery Pipeline
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Recovering at-risk merchant revenue with AI reasoning
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              PayRecover AI intercepts failed Razorpay checkout events, deduces failure causes with Gemini, validates safety rules, and triggers automated multi-rail interventions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <button
              id="btn-dash-run-recovery"
              onClick={onRunBatchRecovery}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Run AI Recovery Agent</span>
            </button>
            <button
              onClick={onNavigateToRecovery}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
            >
              View Recovery Center
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Revenue At Risk</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              ₹{metrics?.total_revenue_at_risk.toLocaleString('en-IN') || 0}
            </div>
            <div className="text-[11px] text-rose-600 font-medium mt-0.5">
              {metrics?.failed_payments || 0} active failed payments
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Revenue Recovered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-emerald-700 tracking-tight">
              ₹{metrics?.revenue_recovered.toLocaleString('en-IN') || 0}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Secured to merchant account
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Recovery Rate</span>
            <Percent className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-indigo-700 tracking-tight">
              {metrics?.recovery_rate || 0}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Of intercepted revenue
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Failed Payments</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {metrics?.failed_payments || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Pending intervention</div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>High Priority</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {metrics?.high_priority_cases || 0}
            </div>
            <div className="text-[11px] text-orange-600 font-medium mt-0.5">&gt; ₹15k or High Win %</div>
          </div>
        </div>

        {/* Metric 6 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Avg Win Prob</span>
            <TrendingUp className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {metrics?.average_recovery_probability || 0}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Gemini Confidence</div>
          </div>
        </div>
      </div>

      {/* Visualizations Section (4 Recharts charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue at Risk vs Recovered */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Impact Comparison</h3>
              <p className="text-xs text-slate-500">
                At-risk revenue vs. AI-recovered funds (₹ INR)
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Reconciled
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {revenueComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Failure Reason Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Failed Payments by Reason</h3>
              <p className="text-xs text-slate-500">Root cause distribution across gateway signals</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={failureReasonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {failureReasonData.map((entry, index) => (
                    <Cell key={`cell-reason-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} transactions`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-slate-600 capitalize">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Recovery Actions Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Recovery Interventions</h3>
              <p className="text-xs text-slate-500">Action recommendations prescribed across pipeline</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionsData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="action" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(val: any, name: any) => [val, name === 'count' ? 'Transactions' : name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Recovery Success Rate by Payment Method */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recovery Rate by Payment Method</h3>
              <p className="text-xs text-slate-500">Efficiency across UPI, Cards, Netbanking & Wallets</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={methodRecoveryData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="method" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  unit="%"
                  domain={[0, 100]}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}% Recovery Rate`, 'Rate']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="rate" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority Recovery Opportunities Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              High-Value & Immediate Recovery Candidates
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by Gemini recovery probability and invoice value
            </p>
          </div>
          <button
            onClick={onNavigateToRecovery}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Open Recovery Center <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Failure Reason</th>
                <th className="px-6 py-3">Win Probability</th>
                <th className="px-6 py-3">AI Action</th>
                <th className="px-6 py-3">Policy Check</th>
                <th className="px-6 py-3 text-right">Intervene</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topRecoveryOpportunities.map((tx) => (
                <tr
                  key={tx.payment_id}
                  onClick={() => onSelectTransaction(tx)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="font-semibold text-slate-900">{tx.customer_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{tx.payment_id}</div>
                  </td>

                  <td className="px-6 py-3.5 font-bold text-slate-900">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </td>

                  <td className="px-6 py-3.5">
                    <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {tx.payment_method}
                    </span>
                  </td>

                  <td className="px-6 py-3.5">
                    <span className="text-rose-600 capitalize font-medium">
                      {tx.failure_reason.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
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
                      <span className="font-bold text-slate-800">{tx.recovery_probability}%</span>
                    </div>
                  </td>

                  <td className="px-6 py-3.5">
                    <ActionBadge action={tx.recommended_action} />
                  </td>

                  <td className="px-6 py-3.5">
                    <PolicyBadge decision={tx.safety_policy?.decision || 'APPROVED'} />
                  </td>

                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransaction(tx);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                    >
                      Review & Recover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
