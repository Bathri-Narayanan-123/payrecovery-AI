import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Bell,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  MessageSquare,
  RotateCw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { RecoveryAction, Transaction } from '../types';
import { ActionBadge, PolicyBadge, RiskBadge, StatusBadge } from './Badges';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onRunAnalysis: (paymentId: string) => Promise<void>;
  onExecuteAction: (paymentId: string, action: RecoveryAction, merchantApproved?: boolean, forceSimulatedSuccess?: boolean) => Promise<void>;
  isAnalyzing: boolean;
  isExecuting: boolean;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onRunAnalysis,
  onExecuteAction,
  isAnalyzing,
  isExecuting,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'reminder_preview' | 'payment_link'>('details');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleActionClick = async (action: RecoveryAction, approved = false, simulatedSuccess?: boolean) => {
    setActionSuccessMessage(null);
    try {
      await onExecuteAction(transaction.payment_id, action, approved, simulatedSuccess);
      setActionSuccessMessage(`Action [${action.toUpperCase()}] executed successfully.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: any) {
      setActionSuccessMessage(`Execution error: ${err.message}`);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isRecovered = transaction.status === 'recovered';
  const requiresApproval = transaction.safety_policy?.decision === 'REQUIRES_APPROVAL';
  const isBlocked = transaction.safety_policy?.decision === 'BLOCKED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono text-sm font-bold">
              {transaction.payment_method}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{transaction.customer_name}</h2>
                <StatusBadge status={transaction.status} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{transaction.payment_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Message */}
        {actionSuccessMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Top Key Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Amount</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                ₹{transaction.amount.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{transaction.currency}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Failure Reason</div>
              <div className="text-xs font-semibold text-rose-600 mt-1 capitalize">
                {transaction.failure_reason.replace('_', ' ')}
              </div>
              <div className="text-[10px] text-slate-400">Gateway code</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Retry Count</div>
              <div className="text-xs font-bold text-slate-800 mt-1">
                {transaction.retry_count} / 2 retries
              </div>
              <div className="text-[10px] text-slate-400">Max limit: 2</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Created At</div>
              <div className="text-xs font-medium text-slate-700 mt-1">
                {new Date(transaction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-[10px] text-slate-400">
                {new Date(transaction.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Customer Profile & Payment History */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              Customer Profile & Historical Reliability
            </h3>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Customer Tier</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] inline-block mt-0.5">
                  {transaction.customer_history.tier} Merchant Tier
                </span>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">{transaction.customer_email}</div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Lifetime Spend</span>
                <span className="font-bold text-slate-900 text-sm">
                  ₹{transaction.customer_history.total_spend.toLocaleString('en-IN')}
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {transaction.customer_history.successful_payments_count} successful orders
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Past Failure Rate</span>
                <span className={`font-semibold text-xs ${transaction.customer_history.failure_rate_pct < 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {transaction.customer_history.failure_rate_pct}% of checkouts
                </span>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Since {transaction.customer_history.customer_since}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: AI Recovery Analysis */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                AI Recovery Analysis (Gemini Engine)
              </h3>
              <button
                id="btn-reanalyze-gemini"
                onClick={() => onRunAnalysis(transaction.payment_id)}
                disabled={isAnalyzing}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50"
              >
                <RotateCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Re-Evaluate with Gemini'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white p-4 rounded-xl border border-indigo-100/80 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Recovery Probability</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xl font-black text-indigo-700">
                      {transaction.recovery_probability}%
                    </span>
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Risk Rating</span>
                  <div className="mt-1">
                    <RiskBadge risk={transaction.risk_level} />
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Recommended Action</span>
                  <div className="mt-1">
                    <ActionBadge action={transaction.recommended_action} />
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Expected Recovery</span>
                  <span className="text-sm font-bold text-emerald-700 block mt-1">
                    ₹{transaction.expected_recovery.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="bg-white/90 p-3 rounded-lg border border-indigo-100 text-xs text-slate-700">
                <span className="font-semibold text-slate-900 block mb-0.5">AI Merchant Reasoning:</span>
                <p className="leading-relaxed text-slate-600">
                  {transaction.ai_analysis?.reason ||
                    'AI analyzes bank clearing latency and historic customer reliability to recommend recovery action.'}
                </p>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Provider:{' '}
                  <span className="font-medium text-slate-600">
                    {transaction.ai_analysis?.provider === 'gemini'
                      ? 'Gemini 3.8 Flash'
                      : 'Deterministic Merchant Recovery Engine'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Safety Policy Evaluation */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              Safety Policy Engine
            </h3>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PolicyBadge decision={transaction.safety_policy?.decision || 'APPROVED'} />
                  {requiresApproval && (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Amount &gt; ₹15,000 threshold
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">Deterministic Enforcement</span>
              </div>

              <p className="text-slate-600 leading-relaxed">
                {transaction.safety_policy?.reason ||
                  'Transaction validated against retry limits, minimum recovery floor, and merchant approval thresholds.'}
              </p>

              {transaction.safety_policy?.rules_triggered && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {transaction.safety_policy.rules_triggered.map((rule, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 text-slate-600 font-mono text-[10px] px-2 py-0.5 rounded"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Generated Payment Link / Active Touchpoints Preview */}
          {transaction.payment_link_url && (
            <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-indigo-950 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                  Razorpay Test Payment Link Active
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">
                  Test Mode
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-indigo-200">
                <input
                  readOnly
                  value={transaction.payment_link_url}
                  className="flex-1 bg-transparent font-mono text-xs text-slate-700 outline-hidden"
                />
                <button
                  onClick={() => handleCopyLink(transaction.payment_link_url!)}
                  className="text-indigo-600 hover:text-indigo-800 p-1"
                  title="Copy Link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {copiedLink && (
                <div className="text-[11px] text-emerald-600 font-medium">Link copied to clipboard!</div>
              )}
              <div className="pt-1 flex justify-end">
                <button
                  onClick={() => handleActionClick('payment_link', true, true)}
                  disabled={isExecuting || isRecovered}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Simulate Customer Settlement (Recover ₹{transaction.amount.toLocaleString('en-IN')})
                </button>
              </div>
            </div>
          )}

          {/* Section 3: Recovery Actions */}
          <div className="space-y-2.5 pt-1">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Execute Safe Recovery Action</span>
              {isRecovered && (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Fully Recovered
                </span>
              )}
            </h3>

            {isRecovered ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Payment Recovered Successfully!
                </div>
                <p className="text-emerald-700">
                  Full revenue ₹{transaction.amount.toLocaleString('en-IN')} was recovered and recorded in the audit trail. No further intervention is required.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* High Value Warning / Approval Action */}
                {requiresApproval && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Merchant Sign-off Required (Amount ₹{transaction.amount.toLocaleString('en-IN')})</span>
                    </div>
                    <p className="text-amber-700 text-[11px]">
                      Policy flags invoices over ₹15,000 for human review prior to automated execution.
                    </p>
                    <button
                      onClick={() => handleActionClick(transaction.recommended_action, true, true)}
                      disabled={isExecuting}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs"
                    >
                      Authorize & Execute AI Recommended Action ({transaction.recommended_action.toUpperCase()})
                    </button>
                  </div>
                )}

                {/* Grid of Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    id="btn-action-retry"
                    onClick={() => handleActionClick('retry', true)}
                    disabled={isExecuting || isBlocked || transaction.retry_count >= 2}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group text-center"
                  >
                    <RotateCw className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Retry Payment</span>
                    <span className="text-[10px] text-blue-600">Smart Gateway Retry</span>
                  </button>

                  <button
                    id="btn-action-payment-link"
                    onClick={() => handleActionClick('payment_link', true)}
                    disabled={isExecuting}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 text-indigo-900 transition-colors disabled:opacity-40 text-center group"
                  >
                    <ExternalLink className="w-4 h-4 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Payment Link</span>
                    <span className="text-[10px] text-indigo-600">Hosted Razorpay Rail</span>
                  </button>

                  <button
                    id="btn-action-reminder"
                    onClick={() => handleActionClick('reminder', true)}
                    disabled={isExecuting}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100/60 text-cyan-900 transition-colors disabled:opacity-40 text-center group"
                  >
                    <Bell className="w-4 h-4 text-cyan-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Send Reminder</span>
                    <span className="text-[10px] text-cyan-600">SMS / WhatsApp</span>
                  </button>

                  <button
                    id="btn-action-escalate"
                    onClick={() => handleActionClick('escalate', true)}
                    disabled={isExecuting}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-purple-900 transition-colors disabled:opacity-40 text-center group"
                  >
                    <UserCheck className="w-4 h-4 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Escalate Case</span>
                    <span className="text-[10px] text-purple-600">Merchant Outreach</span>
                  </button>

                  <button
                    id="btn-action-stop"
                    onClick={() => handleActionClick('stop', true)}
                    disabled={isExecuting}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-40 text-center group"
                  >
                    <Ban className="w-4 h-4 text-slate-500 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Stop Recovery</span>
                    <span className="text-[10px] text-slate-500">Cease Interventions</span>
                  </button>

                  <button
                    id="btn-action-force-recover"
                    onClick={() => handleActionClick(transaction.recommended_action, true, true)}
                    disabled={isExecuting}
                    title="Simulate immediate customer payment in demo mode"
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition-colors disabled:opacity-40 text-center group"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Demo Settle</span>
                    <span className="text-[10px] text-emerald-700 font-medium">+₹{transaction.amount.toLocaleString('en-IN')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Decisions logged to immutable audit trail</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
