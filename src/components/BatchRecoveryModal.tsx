import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Layers,
  RotateCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { BatchRecoveryResult } from '../types';
import { ActionBadge, PolicyBadge, StatusBadge } from './Badges';

interface BatchRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: BatchRecoveryResult | null;
  onRunAgain: () => void;
}

export const BatchRecoveryModal: React.FC<BatchRecoveryModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  result,
  onRunAgain,
}) => {
  const [animationStep, setAnimationStep] = useState(0);

  // Simulated progress step animation while loading
  useEffect(() => {
    if (isLoading) {
      setAnimationStep(1);
      const t1 = setTimeout(() => setAnimationStep(2), 700);
      const t2 = setTimeout(() => setAnimationStep(3), 1400);
      const t3 = setTimeout(() => setAnimationStep(4), 2100);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setAnimationStep(5);
    }
  }, [isLoading]);

  if (!isOpen) return null;

  const steps = [
    { num: 1, title: 'Scanning At-Risk Pipeline', desc: 'Filtering eligible failed and at-risk transactions' },
    { num: 2, title: 'Gemini AI Inference', desc: 'Evaluating recovery probability and strategic action' },
    { num: 3, title: 'Safety Policy Validation', desc: 'Enforcing retry caps, risk limits, and approval rules' },
    { num: 4, title: 'Razorpay Execution', desc: 'Executing retries, smart links, and customer reminders' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Autonomous Revenue Recovery Cycle</h2>
              <p className="text-xs text-slate-400">
                AI Detection → Policy Safety Check → Multi-Rail Recovery Action
              </p>
            </div>
          </div>
          {!isLoading && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            /* Loading Processing View */
            <div className="py-8 space-y-8">
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-indigo-50 border-4 border-indigo-200 flex items-center justify-center relative">
                  <RotateCw className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Executing Automated Recovery Agent...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  The AI agent is analyzing gateway signals, calculating probability vectors, and executing compliant interventions.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="max-w-md mx-auto space-y-3">
                {steps.map((s) => {
                  const isDone = animationStep > s.num;
                  const isCurrent = animationStep === s.num;
                  return (
                    <div
                      key={s.num}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? 'border-indigo-400 bg-indigo-50/50 shadow-xs'
                          : isDone
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-slate-100 bg-slate-50/50 opacity-40'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <RotateCw className="w-4 h-4 text-indigo-600 animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                            {s.num}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${isCurrent ? 'text-indigo-900' : isDone ? 'text-emerald-900' : 'text-slate-600'}`}>
                          {s.title}
                        </div>
                        <div className="text-[11px] text-slate-500">{s.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : result ? (
            /* Results Summary View */
            <div className="space-y-6">
              {/* Highlight KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Analyzed
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {result.total_analyzed}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {result.actions_recommended} recommended
                  </div>
                </div>

                <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100">
                  <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
                    Executed
                  </div>
                  <div className="text-2xl font-bold text-indigo-900 mt-1">
                    {result.actions_executed}
                  </div>
                  <div className="text-[11px] text-indigo-600 mt-0.5">Under safety rules</div>
                </div>

                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80">
                  <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                    Recovered
                  </div>
                  <div className="text-2xl font-bold text-emerald-700 mt-1">
                    ₹{result.revenue_recovered.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                    {result.payments_recovered} payments resolved
                  </div>
                </div>

                <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200/80">
                  <div className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">
                    Success Rate
                  </div>
                  <div className="text-2xl font-bold text-purple-900 mt-1">
                    {result.recovery_success_rate}%
                  </div>
                  <div className="text-[11px] text-purple-600 mt-0.5">Of executed actions</div>
                </div>
              </div>

              {/* Merchant Summary Callout */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Autonomous Recovery Result
                  </div>
                  <p className="text-sm font-medium text-slate-100 mt-1">
                    <strong className="text-emerald-400">₹{result.revenue_recovered.toLocaleString('en-IN')}</strong> recovered across{' '}
                    <strong>{result.payments_recovered}</strong> transactions ({result.recovery_success_rate}% success rate) without manual merchant intervention.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-semibold inline-block">
                    +₹{result.revenue_recovered.toLocaleString('en-IN')} Secured
                  </span>
                </div>
              </div>

              {/* Detailed Table of Processed Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Execution Log ({result.processed_items.length} Transactions)
                  </h4>
                  <span className="text-[11px] text-slate-400">Audited in system trail</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="px-3.5 py-2.5">Customer & ID</th>
                        <th className="px-3.5 py-2.5">Amount</th>
                        <th className="px-3.5 py-2.5">Probability</th>
                        <th className="px-3.5 py-2.5">Action</th>
                        <th className="px-3.5 py-2.5">Result</th>
                        <th className="px-3.5 py-2.5 text-right">Recovered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.processed_items.map((item) => (
                        <tr key={item.payment_id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-3.5 py-2">
                            <div className="font-semibold text-slate-900">{item.customer_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{item.payment_id}</div>
                          </td>
                          <td className="px-3.5 py-2 font-medium text-slate-800">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-3.5 py-2">
                            <span className="font-semibold text-indigo-700">{item.probability}%</span>
                          </td>
                          <td className="px-3.5 py-2">
                            <ActionBadge action={item.recommended_action} />
                          </td>
                          <td className="px-3.5 py-2">
                            {item.action_result === 'RECOVERED' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Recovered
                              </span>
                            ) : item.action_result === 'REQUIRES_APPROVAL' ? (
                              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Sign-Off Needed
                              </span>
                            ) : item.action_result === 'STOPPED' ? (
                              <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                Policy Stopped
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                {item.action_result}
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2 text-right font-bold text-emerald-600">
                            {item.recovered_amount > 0
                              ? `+₹${item.recovered_amount.toLocaleString('en-IN')}`
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              No results to display. Click run to execute.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Recorded in immutable audit trail with Gemini reasoning logs.
          </span>
          <div className="flex items-center gap-2">
            {!isLoading && (
              <>
                <button
                  onClick={onRunAgain}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200/70 border border-slate-300 transition-colors"
                >
                  Run Another Batch
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                >
                  Apply & Return to Dashboard
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
