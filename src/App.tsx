/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BatchRecoveryModal } from './components/BatchRecoveryModal';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TransactionDetailsModal } from './components/TransactionDetailsModal';
import { AuditLogPage } from './pages/AuditLogPage';
import { DashboardPage } from './pages/DashboardPage';
import { RecoveryCenterPage } from './pages/RecoveryCenterPage';
import { SettingsPage } from './pages/SettingsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { api } from './services/api';
import {
  AuditLog,
  BatchRecoveryResult,
  DashboardMetrics,
  RecoveryAction,
  SystemSettings,
  Transaction,
} from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  // Modal states
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchRecoveryResult | null>(null);

  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Load all initial data from server
  const loadAllData = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [m, txs, logs, sets] = await Promise.all([
        api.getMetrics(),
        api.getTransactions(),
        api.getAuditLogs(),
        api.getSettings(),
      ]);
      setMetrics(m);
      setTransactions(txs);
      setAuditLogs(logs);
      setSettings(sets);

      // If a transaction modal is open, refresh its data too
      if (selectedTransaction) {
        const refreshedTx = txs.find((t) => t.payment_id === selectedTransaction.payment_id);
        if (refreshedTx) setSelectedTransaction(refreshedTx);
      }
    } catch (err) {
      console.error('Error fetching application state:', err);
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Open details for a specific transaction
  const handleSelectTransaction = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsDetailsOpen(true);
  };

  // Run AI analysis on single transaction
  const handleRunAnalysis = async (paymentId: string) => {
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeTransaction(paymentId);
      if (res.success && res.transaction) {
        setSelectedTransaction(res.transaction);
        setTransactions((prev) =>
          prev.map((t) => (t.payment_id === paymentId ? res.transaction : t))
        );
      }
    } catch (err) {
      console.error('Failed to run AI analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Execute recovery action
  const handleExecuteAction = async (
    paymentId: string,
    action: RecoveryAction,
    merchantApproved = false,
    forceSimulatedSuccess?: boolean
  ) => {
    setIsExecuting(true);
    try {
      const res = await api.recoverTransaction(paymentId, action, {
        merchantApproved,
        forceSimulatedSuccess,
      });
      if (res.success) {
        setSelectedTransaction(res.transaction);
        setMetrics(res.metrics);
        // Refresh transactions and audit logs in background
        loadAllData(true);
      }
    } catch (err) {
      console.error('Execution error:', err);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  };

  // Run Batch Recovery
  const handleRunBatchRecovery = async () => {
    setIsBatchModalOpen(true);
    setIsBatchLoading(true);
    setBatchResult(null);
    try {
      const res = await api.runBatchRecovery();
      if (res.success) {
        setBatchResult(res.result);
        setMetrics(res.metrics);
        // Refresh local lists
        loadAllData(true);
      }
    } catch (err) {
      console.error('Batch recovery failed:', err);
    } finally {
      setIsBatchLoading(false);
    }
  };

  // Update Settings
  const handleUpdateSettings = async (updatedSettings: Partial<SystemSettings>) => {
    const res = await api.updateSettings(updatedSettings);
    if (res.success) {
      setSettings(res.settings);
    }
  };

  // Reset demo data
  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const res = await api.resetData();
      if (res.success) {
        await loadAllData(true);
        if (isDetailsOpen) setIsDetailsOpen(false);
        if (isBatchModalOpen) setIsBatchModalOpen(false);
      }
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const getHeaderMeta = () => {
    switch (currentTab) {
      case 'transactions':
        return {
          title: 'Transactions & Gateway Ingestion',
          subtitle: 'Live feed of failed and intercepted merchant checkouts across payment methods',
        };
      case 'recovery-center':
        return {
          title: 'Autonomous Recovery Center',
          subtitle: 'Triage and dispatch AI interventions across high-probability opportunities',
        };
      case 'audit-log':
        return {
          title: 'Compliance & Audit Log',
          subtitle: 'Complete immutable trace of AI reasoning, safety policy checks, and recovery outcomes',
        };
      case 'settings':
        return {
          title: 'System & Policy Settings',
          subtitle: 'Adjust safety bounds, retry ceilings, and gateway integration options',
        };
      default:
        return {
          title: 'Revenue Recovery Dashboard',
          subtitle: 'Autonomous AI recovery agent for failed Razorpay merchant transactions',
        };
    }
  };

  const meta = getHeaderMeta();

  return (
    <div className="flex h-screen bg-slate-100/70 font-sans text-slate-800 antialiased overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        metrics={metrics}
        settings={settings}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          metrics={metrics}
          onRunBatchRecovery={handleRunBatchRecovery}
          onRefresh={() => loadAllData(false)}
          isRefreshing={isRefreshing}
        />

        {/* Tab Content Views */}
        <main className="flex-1">
          {isInitialLoading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Initializing PayRecover AI Agent...</p>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardPage
                  metrics={metrics}
                  transactions={transactions}
                  onSelectTransaction={handleSelectTransaction}
                  onRunBatchRecovery={handleRunBatchRecovery}
                  onNavigateToRecovery={() => setCurrentTab('recovery-center')}
                />
              )}

              {currentTab === 'transactions' && (
                <TransactionsPage
                  transactions={transactions}
                  onSelectTransaction={handleSelectTransaction}
                  onRefresh={() => loadAllData(false)}
                />
              )}

              {currentTab === 'recovery-center' && (
                <RecoveryCenterPage
                  transactions={transactions}
                  onSelectTransaction={handleSelectTransaction}
                  onExecuteAction={handleExecuteAction}
                  onRunBatchRecovery={handleRunBatchRecovery}
                  isExecuting={isExecuting}
                />
              )}

              {currentTab === 'audit-log' && (
                <AuditLogPage
                  logs={auditLogs}
                  onRefresh={() => loadAllData(false)}
                  isRefreshing={isRefreshing}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsPage
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onResetData={handleResetData}
                  isResetting={isResetting}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Transaction Details Modal Drawer */}
      <TransactionDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        transaction={selectedTransaction}
        onRunAnalysis={handleRunAnalysis}
        onExecuteAction={handleExecuteAction}
        isAnalyzing={isAnalyzing}
        isExecuting={isExecuting}
      />

      {/* Batch Recovery Modal */}
      <BatchRecoveryModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        isLoading={isBatchLoading}
        result={batchResult}
        onRunAgain={handleRunBatchRecovery}
      />
    </div>
  );
}
