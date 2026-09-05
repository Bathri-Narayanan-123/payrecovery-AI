import {
  AuditLog,
  BatchRecoveryResult,
  DashboardMetrics,
  RecoveryAction,
  SystemSettings,
  Transaction,
} from '../types';

export const api = {
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  async getMetrics(): Promise<DashboardMetrics> {
    const res = await fetch('/api/metrics');
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  async getTransactions(params?: {
    status?: string;
    payment_method?: string;
    failure_reason?: string;
    search?: string;
  }): Promise<Transaction[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.payment_method) query.set('payment_method', params.payment_method);
    if (params?.failure_reason) query.set('failure_reason', params.failure_reason);
    if (params?.search) query.set('search', params.search);

    const url = `/api/transactions${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async getTransaction(id: string): Promise<Transaction> {
    const res = await fetch(`/api/transactions/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch transaction ${id}`);
    return res.json();
  },

  async analyzeTransaction(id: string): Promise<{ success: boolean; transaction: Transaction }> {
    const res = await fetch(`/api/transactions/${id}/analyze`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to run AI analysis');
    return res.json();
  },

  async recoverTransaction(
    id: string,
    action: RecoveryAction,
    options?: { merchantApproved?: boolean; forceSimulatedSuccess?: boolean }
  ): Promise<{
    success: boolean;
    transaction: Transaction;
    result: string;
    recoveredAmount: number;
    metrics: DashboardMetrics;
    auditLogId: string;
  }> {
    const res = await fetch(`/api/transactions/${id}/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        merchantApproved: options?.merchantApproved,
        forceSimulatedSuccess: options?.forceSimulatedSuccess,
      }),
    });
    if (!res.ok) throw new Error('Failed to execute recovery action');
    return res.json();
  },

  async runBatchRecovery(): Promise<{
    success: boolean;
    result: BatchRecoveryResult;
    metrics: DashboardMetrics;
  }> {
    const res = await fetch('/api/recovery/batch', {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Batch recovery failed');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getSettings(): Promise<SystemSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; settings: SystemSettings }> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async resetData(): Promise<{ success: boolean; message: string; metrics: DashboardMetrics }> {
    const res = await fetch('/api/reset', {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset demo data');
    return res.json();
  },
};
