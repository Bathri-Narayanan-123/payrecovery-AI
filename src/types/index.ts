export type PaymentMethod = 'UPI' | 'Card' | 'Netbanking' | 'Wallet';

export type FailureReason =
  | 'insufficient_funds'
  | 'bank_decline'
  | 'timeout'
  | 'technical_error'
  | 'authentication_failure'
  | 'unknown';

export type PaymentStatus =
  | 'failed'
  | 'at_risk'
  | 'recovered'
  | 'retry_pending'
  | 'link_sent'
  | 'reminder_sent'
  | 'escalated'
  | 'stopped';

export type RiskLevel = 'low' | 'medium' | 'high';

export type RecoveryAction = 'retry' | 'payment_link' | 'reminder' | 'escalate' | 'stop';

export type PolicyDecision = 'APPROVED' | 'REQUIRES_APPROVAL' | 'BLOCKED' | 'REJECTED';

export interface CustomerHistory {
  successful_payments_count: number;
  total_spend: number;
  customer_since: string;
  last_payment_date: string;
  failure_rate_pct: number;
  tier: 'VIP' | 'Regular' | 'New';
}

export interface AIAnalysis {
  recovery_probability: number;
  risk_level: RiskLevel;
  recommended_action: RecoveryAction;
  expected_recovery: number;
  reason: string;
  provider: 'gemini' | 'deterministic_fallback';
  analyzed_at: string;
}

export interface SafetyPolicyEvaluation {
  decision: PolicyDecision;
  rules_triggered: string[];
  reason: string;
  requires_approval: boolean;
  is_approved?: boolean;
  evaluated_at: string;
}

export interface Transaction {
  payment_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  failure_reason: FailureReason;
  retry_count: number;
  created_at: string;
  customer_history: CustomerHistory;
  recovery_probability: number;
  risk_level: RiskLevel;
  recommended_action: RecoveryAction;
  expected_recovery: number;
  ai_analysis?: AIAnalysis;
  safety_policy?: SafetyPolicyEvaluation;
  recovery_action_executed?: RecoveryAction;
  recovered_at?: string;
  payment_link_url?: string;
  razorpay_order_id?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  payment_id: string;
  customer: string;
  amount: number;
  recovery_probability: number;
  ai_reasoning: string;
  policy_decision: PolicyDecision;
  selected_action: RecoveryAction;
  action_result: 'RECOVERED' | 'FAILED_RETRY' | 'LINK_SENT' | 'REMINDER_DELIVERED' | 'ESCALATED' | 'STOPPED';
  recovered_amount: number;
  execution_mode: 'automated_batch' | 'manual_merchant';
}

export interface SystemSettings {
  gemini_configured: boolean;
  razorpay_configured: boolean;
  demo_mode: boolean;
  max_auto_retries: number;
  min_recovery_probability: number;
  high_value_approval_threshold: number;
  auto_recovery_enabled: boolean;
  preferred_recovery_channel: 'payment_link' | 'reminder' | 'retry';
}

export interface DashboardMetrics {
  total_revenue_at_risk: number;
  revenue_recovered: number;
  recovery_rate: number;
  failed_payments: number;
  high_priority_cases: number;
  average_recovery_probability: number;
}

export interface BatchRecoveryResult {
  total_analyzed: number;
  actions_recommended: number;
  actions_executed: number;
  payments_recovered: number;
  revenue_at_risk: number;
  revenue_recovered: number;
  recovery_success_rate: number;
  processed_items: {
    payment_id: string;
    customer_name: string;
    amount: number;
    probability: number;
    recommended_action: RecoveryAction;
    policy_decision: PolicyDecision;
    action_result: string;
    recovered_amount: number;
    reason: string;
  }[];
}
