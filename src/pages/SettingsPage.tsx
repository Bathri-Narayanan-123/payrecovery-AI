import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Info,
  Lock,
  RotateCcw,
  Save,
  Shield,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsPageProps {
  settings: SystemSettings | null;
  onUpdateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  onResetData: () => void;
  isResetting: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  isResetting,
}) => {
  const [maxAutoRetries, setMaxAutoRetries] = useState<number>(settings?.max_auto_retries || 2);
  const [minProbability, setMinProbability] = useState<number>(settings?.min_recovery_probability || 40);
  const [highValueThreshold, setHighValueThreshold] = useState<number>(
    settings?.high_value_approval_threshold || 15000
  );
  const [preferredChannel, setPreferredChannel] = useState<'payment_link' | 'reminder' | 'retry'>(
    settings?.preferred_recovery_channel || 'payment_link'
  );
  const [autoRecoveryEnabled, setAutoRecoveryEnabled] = useState<boolean>(
    settings?.auto_recovery_enabled ?? true
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateSettings({
        max_auto_retries: Number(maxAutoRetries),
        min_recovery_probability: Number(minProbability),
        high_value_approval_threshold: Number(highValueThreshold),
        preferred_recovery_channel: preferredChannel,
        auto_recovery_enabled: autoRecoveryEnabled,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          System & Recovery Policy Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure agent safety bounds, decision thresholds, and payment gateway connectivity
        </p>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings successfully updated and applied to safety engine.
        </div>
      )}

      {/* Connectivity & Service Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gemini Engine Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Gemini Reasoning Engine</h3>
                <p className="text-[11px] text-slate-400">gemini-3.8-flash</p>
              </div>
            </div>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                settings?.gemini_configured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {settings?.gemini_configured ? 'API Connected' : 'Deterministic Mode'}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {settings?.gemini_configured
              ? 'Server-side Gemini 3.8 Flash inference active. All transaction analyses use real multi-signal LLM prompting.'
              : 'Using the deterministic merchant reasoning engine with full gateway signal deduction. Set GEMINI_API_KEY for live LLM inference.'}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>API keys secured server-side only</span>
          </div>
        </div>

        {/* Razorpay Test Mode Architecture */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Razorpay Test Integration</h3>
                <p className="text-[11px] text-slate-400">Payment Rails & Links</p>
              </div>
            </div>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                settings?.razorpay_configured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              {settings?.razorpay_configured ? 'Razorpay Test API' : 'Simulated Test Rails'}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {settings?.razorpay_configured
              ? 'Connected to live Razorpay Test Mode. Generates real test payment links and test payment orders.'
              : 'Operating in Sandbox Test Simulation Mode. Zero real funds moved; mock payment URLs (rzp.io/i/...) and test order IDs generated.'}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Shield className="w-3 h-3 text-slate-400" />
            <span>Simulated test mode — no real money charged</span>
          </div>
        </div>
      </div>

      {/* Safety Policy Rules Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Safety Rules & Intervention Boundaries
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">Autonomous Guardrails</span>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Rule 1: Max Auto Retries */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="space-y-0.5 max-w-md">
              <label className="font-bold text-slate-900 text-xs">
                Maximum Automated Retries (Rule 1 & 7)
              </label>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Ceiling for background retries. If a payment reaches this cap, the policy blocks further retries and mandates human escalation to prevent customer bank alerts.
              </p>
            </div>
            <select
              value={maxAutoRetries}
              onChange={(e) => setMaxAutoRetries(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500 sm:w-36"
            >
              <option value={1}>1 Retry Max</option>
              <option value={2}>2 Retries Max (Default)</option>
              <option value={3}>3 Retries Max</option>
            </select>
          </div>

          {/* Rule 2: Minimum Recovery Probability */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="space-y-0.5 max-w-md">
              <label className="font-bold text-slate-900 text-xs">
                Minimum Win Probability Floor (Rule 2)
              </label>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                If Gemini recovery probability drops below this threshold, automatic actions are blocked and the engine mandates STOP to protect merchant reputation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="20"
                max="60"
                step="5"
                value={minProbability}
                onChange={(e) => setMinProbability(Number(e.target.value))}
                className="w-28 accent-indigo-600"
              />
              <span className="font-bold text-indigo-700 w-10 text-right">{minProbability}%</span>
            </div>
          </div>

          {/* Rule 3: High Value Approval Threshold */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="space-y-0.5 max-w-md">
              <label className="font-bold text-slate-900 text-xs">
                High-Value Approval Threshold (Rule 5)
              </label>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Invoices exceeding this amount require explicit merchant authorization before recovery intervention is dispatched.
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-semibold">₹</span>
              <input
                type="number"
                step="1000"
                value={highValueThreshold}
                onChange={(e) => setHighValueThreshold(Number(e.target.value))}
                className="w-32 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Rule 4: Preferred Fallback Channel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="space-y-0.5 max-w-md">
              <label className="font-bold text-slate-900 text-xs">
                Preferred Alternative Payment Channel
              </label>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Default recovery mechanism for card/netbanking limits and persistent technical declines.
              </p>
            </div>
            <select
              value={preferredChannel}
              onChange={(e) => setPreferredChannel(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500 sm:w-44"
            >
              <option value="payment_link">Hosted Payment Link</option>
              <option value="reminder">SMS / WhatsApp Reminder</option>
              <option value="retry">Automatic Gateway Retry</option>
            </select>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              id="btn-save-settings"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Apply Policy Bounds'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
            <Database className="w-4 h-4 text-slate-600" />
            <span>Reset Demo Baseline Transactions</span>
          </div>
          <button
            onClick={onResetData}
            disabled={isResetting}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Restore 42 Baseline Transactions'}</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Restores all 42 synthetic demo transactions, metrics, and initial audit logs to their default state so judges can re-test the complete autonomous recovery lifecycle from scratch.
        </p>
      </div>
    </div>
  );
};
