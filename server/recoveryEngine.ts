import { BatchRecoveryResult, PolicyDecision, RecoveryAction, Transaction } from '../src/types';
import { GeminiRecoveryService } from './geminiService';
import { SafetyPolicyEngine } from './policyEngine';
import { RazorpayService } from './razorpayService';
import { storage } from './storage';

export class RecoveryEngine {
  public static async analyze(paymentId: string): Promise<Transaction> {
    const tx = storage.getTransactionById(paymentId);
    if (!tx) {
      throw new Error(`Transaction with ID ${paymentId} not found`);
    }

    // Run AI analysis
    const aiAnalysis = await GeminiRecoveryService.analyzeTransaction(tx);
    tx.recovery_probability = aiAnalysis.recovery_probability;
    tx.risk_level = aiAnalysis.risk_level;
    tx.recommended_action = aiAnalysis.recommended_action;
    tx.expected_recovery = aiAnalysis.expected_recovery;
    tx.ai_analysis = aiAnalysis;

    // Evaluate safety policy against recommended action
    const settings = storage.getSettings();
    const policy = SafetyPolicyEngine.evaluate(tx, aiAnalysis.recommended_action, settings);
    tx.safety_policy = policy;

    storage.updateTransaction(tx);
    return tx;
  }

  public static async executeAction(
    paymentId: string,
    action: RecoveryAction,
    options: { merchantApproved?: boolean; executionMode?: 'automated_batch' | 'manual_merchant'; forceSimulatedSuccess?: boolean } = {}
  ): Promise<{ transaction: Transaction; result: string; recoveredAmount: number; auditLogId: string }> {
    const tx = storage.getTransactionById(paymentId);
    if (!tx) {
      throw new Error(`Transaction with ID ${paymentId} not found`);
    }

    const settings = storage.getSettings();
    const executionMode = options.executionMode || 'manual_merchant';

    // 1. Re-evaluate safety policy for this specific action
    const policy = SafetyPolicyEngine.evaluate(tx, action, settings);
    tx.safety_policy = policy;

    // Check if policy blocked action
    if (policy.decision === 'BLOCKED' && !options.merchantApproved) {
      const audit = storage.addAuditLog({
        timestamp: new Date().toISOString(),
        payment_id: tx.payment_id,
        customer: tx.customer_name,
        amount: tx.amount,
        recovery_probability: tx.recovery_probability,
        ai_reasoning: tx.ai_analysis?.reason || 'Safety policy restriction invoked.',
        policy_decision: policy.decision,
        selected_action: action,
        action_result: 'STOPPED',
        recovered_amount: 0,
        execution_mode: executionMode,
      });

      storage.updateTransaction(tx);
      return {
        transaction: tx,
        result: `Blocked by Safety Policy: ${policy.reason}`,
        recoveredAmount: 0,
        auditLogId: audit.id,
      };
    }

    // Check high-value approval
    if (policy.decision === 'REQUIRES_APPROVAL' && !options.merchantApproved) {
      return {
        transaction: tx,
        result: `Action Requires Merchant Sign-Off: Invoice ₹${tx.amount.toLocaleString('en-IN')} exceeds threshold.`,
        recoveredAmount: 0,
        auditLogId: '',
      };
    }

    let actionResult: 'RECOVERED' | 'FAILED_RETRY' | 'LINK_SENT' | 'REMINDER_DELIVERED' | 'ESCALATED' | 'STOPPED' = 'RECOVERED';
    let recoveredAmount = 0;

    // Execute or simulate specific action
    switch (action) {
      case 'retry': {
        tx.retry_count = (tx.retry_count || 0) + 1;
        const retryRes = await RazorpayService.executeRetry(tx);
        
        // Probability-based success determination or forced test success
        const isSuccess = options.forceSimulatedSuccess !== undefined 
          ? options.forceSimulatedSuccess 
          : (retryRes.gateway_status === 'captured');

        if (isSuccess) {
          tx.status = 'recovered';
          tx.recovered_at = new Date().toISOString();
          tx.recovery_action_executed = 'retry';
          recoveredAmount = tx.amount;
          actionResult = 'RECOVERED';
        } else {
          tx.status = 'failed';
          tx.recovery_action_executed = 'retry';
          recoveredAmount = 0;
          actionResult = 'FAILED_RETRY';
        }
        break;
      }

      case 'payment_link': {
        const linkRes = await RazorpayService.createPaymentLink(tx);
        tx.payment_link_url = linkRes.short_url;
        tx.recovery_action_executed = 'payment_link';

        // High probability links have high simulated conversion in demo mode (75% rate)
        const linkConverts = options.forceSimulatedSuccess !== undefined
          ? options.forceSimulatedSuccess
          : (Math.random() * 100 <= Math.max(65, tx.recovery_probability));

        if (linkConverts) {
          tx.status = 'recovered';
          tx.recovered_at = new Date().toISOString();
          recoveredAmount = tx.amount;
          actionResult = 'RECOVERED';
        } else {
          tx.status = 'link_sent';
          recoveredAmount = 0;
          actionResult = 'LINK_SENT';
        }
        break;
      }

      case 'reminder': {
        tx.recovery_action_executed = 'reminder';
        // Reminders convert 60% of eligible cases in demo simulation
        const reminderConverts = options.forceSimulatedSuccess !== undefined
          ? options.forceSimulatedSuccess
          : (Math.random() * 100 <= Math.max(50, tx.recovery_probability - 15));

        if (reminderConverts) {
          tx.status = 'recovered';
          tx.recovered_at = new Date().toISOString();
          recoveredAmount = tx.amount;
          actionResult = 'RECOVERED';
        } else {
          tx.status = 'reminder_sent';
          recoveredAmount = 0;
          actionResult = 'REMINDER_DELIVERED';
        }
        break;
      }

      case 'escalate': {
        tx.status = 'escalated';
        tx.recovery_action_executed = 'escalate';
        actionResult = 'ESCALATED';
        recoveredAmount = 0;
        break;
      }

      case 'stop': {
        tx.status = 'stopped';
        tx.recovery_action_executed = 'stop';
        actionResult = 'STOPPED';
        recoveredAmount = 0;
        break;
      }
    }

    // Write Audit Log
    const audit = storage.addAuditLog({
      timestamp: new Date().toISOString(),
      payment_id: tx.payment_id,
      customer: tx.customer_name,
      amount: tx.amount,
      recovery_probability: tx.recovery_probability,
      ai_reasoning: tx.ai_analysis?.reason || 'Automated recovery action applied under safety rules.',
      policy_decision: policy.decision,
      selected_action: action,
      action_result: actionResult,
      recovered_amount: recoveredAmount,
      execution_mode: executionMode,
    });

    storage.updateTransaction(tx);

    return {
      transaction: tx,
      result: `Action [${action.toUpperCase()}] executed: ${actionResult}. Recovered: ₹${recoveredAmount.toLocaleString('en-IN')}`,
      recoveredAmount,
      auditLogId: audit.id,
    };
  }

  public static async runBatchRecovery(): Promise<BatchRecoveryResult> {
    const all = storage.getAllTransactions();
    // Filter unrecovered transactions requiring attention
    const eligible = all.filter(t => t.status !== 'recovered' && t.status !== 'stopped');
    // Take at least 20 eligible items (or all eligible)
    const targetBatch = eligible.slice(0, Math.max(20, Math.min(eligible.length, 25)));

    let totalAnalyzed = 0;
    let actionsRecommended = 0;
    let actionsExecuted = 0;
    let paymentsRecovered = 0;
    let revenueAtRisk = 0;
    let revenueRecovered = 0;

    const processedItems: BatchRecoveryResult['processed_items'] = [];
    const settings = storage.getSettings();

    // Process in parallel chunks of 5 to maintain high responsiveness
    const chunkSize = 5;
    for (let i = 0; i < targetBatch.length; i += chunkSize) {
      const chunk = targetBatch.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (tx) => {
          totalAnalyzed++;
          revenueAtRisk += tx.amount;

          // 1. AI Analysis
          const aiAnalysis = await GeminiRecoveryService.analyzeTransaction(tx);
          tx.ai_analysis = aiAnalysis;
          tx.recovery_probability = aiAnalysis.recovery_probability;
          tx.recommended_action = aiAnalysis.recommended_action;
          tx.expected_recovery = aiAnalysis.expected_recovery;
          actionsRecommended++;

          // 2. Safety Policy Evaluation
          const policy = SafetyPolicyEngine.evaluate(tx, aiAnalysis.recommended_action, settings);
          tx.safety_policy = policy;

          let executedAction = aiAnalysis.recommended_action;
          let actionResult = 'SKIPPED';
          let itemRecovered = 0;

          // 3. Execution decision based on safety policy
          if (policy.decision === 'BLOCKED') {
            executedAction = 'stop';
            tx.status = 'stopped';
            actionResult = 'STOPPED';
            storage.addAuditLog({
              timestamp: new Date().toISOString(),
              payment_id: tx.payment_id,
              customer: tx.customer_name,
              amount: tx.amount,
              recovery_probability: tx.recovery_probability,
              ai_reasoning: aiAnalysis.reason,
              policy_decision: policy.decision,
              selected_action: 'stop',
              action_result: 'STOPPED',
              recovered_amount: 0,
              execution_mode: 'automated_batch',
            });
          } else if (policy.decision === 'REQUIRES_APPROVAL') {
            // High value orders remain at_risk until merchant approves
            tx.status = 'at_risk';
            actionResult = 'REQUIRES_APPROVAL';
          } else {
            // Safe to execute automatically
            actionsExecuted++;
            const res = await this.executeAction(tx.payment_id, executedAction, {
              merchantApproved: true,
              executionMode: 'automated_batch',
            });
            itemRecovered = res.recoveredAmount;
            actionResult = res.transaction.status === 'recovered' ? 'RECOVERED' : res.transaction.status.toUpperCase();

            if (itemRecovered > 0) {
              paymentsRecovered++;
              revenueRecovered += itemRecovered;
            }
          }

          storage.updateTransaction(tx);

          processedItems.push({
            payment_id: tx.payment_id,
            customer_name: tx.customer_name,
            amount: tx.amount,
            probability: tx.recovery_probability,
            recommended_action: aiAnalysis.recommended_action,
            policy_decision: policy.decision,
            action_result: actionResult,
            recovered_amount: itemRecovered,
            reason: aiAnalysis.reason,
          });
        })
      );
    }

    const recoverySuccessRate = actionsExecuted > 0
      ? Math.round((paymentsRecovered / actionsExecuted) * 100)
      : 0;

    return {
      total_analyzed: totalAnalyzed,
      actions_recommended: actionsRecommended,
      actions_executed: actionsExecuted,
      payments_recovered: paymentsRecovered,
      revenue_at_risk: revenueAtRisk,
      revenue_recovered: revenueRecovered,
      recovery_success_rate: recoverySuccessRate,
      processed_items: processedItems,
    };
  }
}
