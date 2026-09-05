import React from 'react';
import {
  AlertTriangle,
  ArrowRightCircle,
  Ban,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  RotateCw,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { PaymentStatus, PolicyDecision, RecoveryAction, RiskLevel } from '../types';

export const StatusBadge: React.FC<{ status: PaymentStatus; className?: string }> = ({ status, className = '' }) => {
  switch (status) {
    case 'recovered':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Recovered
        </span>
      );
    case 'at_risk':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          At Risk
        </span>
      );
    case 'failed':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 ${className}`}>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          Failed
        </span>
      );
    case 'retry_pending':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 ${className}`}>
          <RotateCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          Retry Pending
        </span>
      );
    case 'link_sent':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 ${className}`}>
          <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
          Link Dispatched
        </span>
      );
    case 'reminder_sent':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 ${className}`}>
          <Bell className="w-3.5 h-3.5 text-sky-600" />
          Reminder Sent
        </span>
      );
    case 'escalated':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 ${className}`}>
          <UserCheck className="w-3.5 h-3.5 text-purple-600" />
          Escalated
        </span>
      );
    case 'stopped':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 ${className}`}>
          <Ban className="w-3.5 h-3.5 text-slate-500" />
          Stopped
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 ${className}`}>
          {status}
        </span>
      );
  }
};

export const RiskBadge: React.FC<{ risk: RiskLevel; className?: string }> = ({ risk, className = '' }) => {
  switch (risk) {
    case 'low':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          Low Risk
        </span>
      );
    case 'medium':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          Medium Risk
        </span>
      );
    case 'high':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
          High Risk
        </span>
      );
    default:
      return null;
  }
};

export const ActionBadge: React.FC<{ action: RecoveryAction; className?: string }> = ({ action, className = '' }) => {
  switch (action) {
    case 'retry':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
          <RotateCw className="w-3 h-3 text-blue-600" />
          Smart Retry
        </span>
      );
    case 'payment_link':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 ${className}`}>
          <ExternalLink className="w-3 h-3 text-indigo-600" />
          Payment Link
        </span>
      );
    case 'reminder':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200 ${className}`}>
          <Bell className="w-3 h-3 text-cyan-600" />
          Smart Reminder
        </span>
      );
    case 'escalate':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 ${className}`}>
          <ArrowRightCircle className="w-3 h-3 text-purple-600" />
          Escalate
        </span>
      );
    case 'stop':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
          <Ban className="w-3 h-3 text-slate-500" />
          Stop Recovery
        </span>
      );
    default:
      return <span>{action}</span>;
  }
};

export const PolicyBadge: React.FC<{ decision: PolicyDecision; className?: string }> = ({ decision, className = '' }) => {
  switch (decision) {
    case 'APPROVED':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Policy: Approved
        </span>
      );
    case 'REQUIRES_APPROVAL':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Requires Sign-Off
        </span>
      );
    case 'BLOCKED':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
          <Ban className="w-3.5 h-3.5 text-rose-600" />
          Policy: Blocked
        </span>
      );
    default:
      return <span>{decision}</span>;
  }
};
