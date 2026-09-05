import { AuditLog, DashboardMetrics, SystemSettings, Transaction } from '../src/types';
import { INITIAL_TRANSACTIONS } from '../src/data/transactions';

class StorageService {
  private transactions: Transaction[] = [];
  private auditLogs: AuditLog[] = [];
  private settings: SystemSettings = {
    gemini_configured: !!process.env.GEMINI_API_KEY,
    razorpay_configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    demo_mode: true,
    max_auto_retries: 2,
    min_recovery_probability: 40,
    high_value_approval_threshold: 15000,
    auto_recovery_enabled: true,
    preferred_recovery_channel: 'payment_link',
  };

  constructor() {
    this.resetData();
  }

  public resetData() {
    // Deep clone initial transactions
    this.transactions = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
    this.auditLogs = [
      {
        id: 'audit_init_01',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        payment_id: 'pay_Nzk01A89xL12',
        customer: 'Aarav Sharma',
        amount: 4500,
        recovery_probability: 88,
        ai_reasoning: 'HDFC UPI gateway latency resolved. Scheduled background retry.',
        policy_decision: 'APPROVED',
        selected_action: 'retry',
        action_result: 'RECOVERED',
        recovered_amount: 4500,
        execution_mode: 'automated_batch'
      },
      {
        id: 'audit_init_02',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        payment_id: 'pay_Nzk08H33yU67',
        customer: 'Sunita Verma',
        amount: 6800,
        recovery_probability: 91,
        ai_reasoning: 'Customer PhonePe switch timeout resolved. Background re-dispatch successful.',
        policy_decision: 'APPROVED',
        selected_action: 'retry',
        action_result: 'RECOVERED',
        recovered_amount: 6800,
        execution_mode: 'automated_batch'
      }
    ];

    // Mark the two seeded audit payments as recovered
    const tx1 = this.transactions.find(t => t.payment_id === 'pay_Nzk01A89xL12');
    if (tx1) {
      tx1.status = 'recovered';
      tx1.recovered_at = new Date(Date.now() - 3600000 * 3).toISOString();
      tx1.recovery_action_executed = 'retry';
    }
    const tx2 = this.transactions.find(t => t.payment_id === 'pay_Nzk08H33yU67');
    if (tx2) {
      tx2.status = 'recovered';
      tx2.recovered_at = new Date(Date.now() - 3600000 * 2).toISOString();
      tx2.recovery_action_executed = 'retry';
    }
  }

  public getAllTransactions(): Transaction[] {
    return this.transactions;
  }

  public getTransactionById(payment_id: string): Transaction | undefined {
    return this.transactions.find(t => t.payment_id === payment_id);
  }

  public updateTransaction(updated: Transaction): Transaction {
    const index = this.transactions.findIndex(t => t.payment_id === updated.payment_id);
    if (index !== -1) {
      this.transactions[index] = updated;
    } else {
      this.transactions.unshift(updated);
    }
    return updated;
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public addAuditLog(log: Omit<AuditLog, 'id'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }

  public getSettings(): SystemSettings {
    // Dynamic check if environment variables became available
    this.settings.gemini_configured = !!process.env.GEMINI_API_KEY;
    this.settings.razorpay_configured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    return this.settings;
  }

  public updateSettings(partial: Partial<SystemSettings>): SystemSettings {
    this.settings = {
      ...this.settings,
      ...partial,
      gemini_configured: !!process.env.GEMINI_API_KEY,
      razorpay_configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    };
    return this.settings;
  }

  public getMetrics(): DashboardMetrics {
    let totalRevenueAtRisk = 0;
    let revenueRecovered = 0;
    let failedPaymentsCount = 0;
    let highPriorityCount = 0;
    let probabilitySum = 0;
    let activeTransactionsCount = 0;

    for (const t of this.transactions) {
      if (t.status === 'recovered') {
        revenueRecovered += t.amount;
      } else {
        totalRevenueAtRisk += t.amount;
        failedPaymentsCount++;
        probabilitySum += t.recovery_probability;
        activeTransactionsCount++;

        // High priority if amount > 15,000 or (probability > 75 and amount > 5,000)
        if (t.amount >= 15000 || (t.recovery_probability >= 75 && t.amount >= 5000)) {
          highPriorityCount++;
        }
      }
    }

    const totalRevenueTracked = totalRevenueAtRisk + revenueRecovered;
    const recoveryRate = totalRevenueTracked > 0 
      ? Math.round((revenueRecovered / totalRevenueTracked) * 100) 
      : 0;

    const averageRecoveryProbability = activeTransactionsCount > 0
      ? Math.round(probabilitySum / activeTransactionsCount)
      : 0;

    return {
      total_revenue_at_risk: totalRevenueAtRisk,
      revenue_recovered: revenueRecovered,
      recovery_rate: recoveryRate,
      failed_payments: failedPaymentsCount,
      high_priority_cases: highPriorityCount,
      average_recovery_probability: averageRecoveryProbability,
    };
  }
}

export const storage = new StorageService();
