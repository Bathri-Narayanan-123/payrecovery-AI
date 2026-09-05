import { PolicyDecision, RecoveryAction, SafetyPolicyEvaluation, SystemSettings, Transaction } from '../src/types';

export class SafetyPolicyEngine {
  public static evaluate(
    transaction: Transaction,
    proposedAction: RecoveryAction,
    settings: SystemSettings
  ): SafetyPolicyEvaluation {
    const rulesTriggered: string[] = [];
    let decision: PolicyDecision = 'APPROVED';
    let requiresApproval = false;
    let reason = '';

    // Rule 4: Already recovered or successful
    if (transaction.status === 'recovered') {
      rulesTriggered.push('PAYMENT_ALREADY_RECOVERED');
      return {
        decision: 'BLOCKED',
        rules_triggered: rulesTriggered,
        reason: 'Payment is already marked as RECOVERED. Safety policy blocks duplicate recovery interventions.',
        requires_approval: false,
        evaluated_at: new Date().toISOString()
      };
    }

    // Rule 2: If recovery probability < min_recovery_probability (default 40%), recommend STOP
    if (transaction.recovery_probability < settings.min_recovery_probability) {
      rulesTriggered.push('PROBABILITY_BELOW_MIN_THRESHOLD');
      if (proposedAction !== 'stop') {
        decision = 'BLOCKED';
        reason = `Recovery probability (${transaction.recovery_probability}%) is below safe operating floor (${settings.min_recovery_probability}%). Action blocked to prevent customer fatigue; policy mandates STOP.`;
      } else {
        decision = 'APPROVED';
        reason = `Recovery probability (${transaction.recovery_probability}%) is below minimum threshold (${settings.min_recovery_probability}%). Safety policy confirms STOP intervention.`;
      }
      return {
        decision,
        rules_triggered: rulesTriggered,
        reason,
        requires_approval: false,
        evaluated_at: new Date().toISOString()
      };
    }

    // Rule 1 & Rule 3: Max automatic retries check
    if (proposedAction === 'retry') {
      if (transaction.retry_count >= settings.max_auto_retries) {
        rulesTriggered.push('MAX_RETRIES_EXCEEDED');
        decision = 'BLOCKED';
        reason = `Payment has already reached ${transaction.retry_count} retries (maximum allowed: ${settings.max_auto_retries}). Retrying blocked; recommend ESCALATE to human agent.`;
        return {
          decision,
          rules_triggered: rulesTriggered,
          reason,
          requires_approval: false,
          evaluated_at: new Date().toISOString()
        };
      }
    }

    // Rule 3: If retry_count >= 2 and recommending retry, escalate
    if (transaction.retry_count >= 2 && proposedAction === 'retry') {
      rulesTriggered.push('HIGH_RETRY_COUNT_ESCALATION_TRIGGER');
      decision = 'BLOCKED';
      reason = 'Retry count has reached ceiling (2). Policy blocks automated re-attempts and mandates human escalation.';
      return {
        decision,
        rules_triggered: rulesTriggered,
        reason,
        requires_approval: false,
        evaluated_at: new Date().toISOString()
      };
    }

    // Rule 5: High-value payments require merchant approval
    if (transaction.amount >= settings.high_value_approval_threshold) {
      rulesTriggered.push('HIGH_VALUE_THRESHOLD_EXCEEDED');
      requiresApproval = true;
      decision = 'REQUIRES_APPROVAL';
      reason = `Transaction amount (₹${transaction.amount.toLocaleString('en-IN')}) meets or exceeds high-value threshold (₹${settings.high_value_approval_threshold.toLocaleString('en-IN')}). Requires merchant sign-off before automatic execution.`;
    } else {
      rulesTriggered.push('SAFE_THRESHOLD_VALIDATED');
      decision = 'APPROVED';
      reason = `Safe policy validation passed: Probability is ${transaction.recovery_probability}%, retry count is ${transaction.retry_count}/${settings.max_auto_retries}, and amount ₹${transaction.amount.toLocaleString('en-IN')} is within automated recovery ceiling.`;
    }

    return {
      decision,
      rules_triggered: rulesTriggered,
      reason,
      requires_approval: requiresApproval,
      is_approved: !requiresApproval,
      evaluated_at: new Date().toISOString()
    };
  }
}
