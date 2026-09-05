import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { RecoveryEngine } from './server/recoveryEngine';
import { storage } from './server/storage';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'PayRecover AI Server',
      timestamp: new Date().toISOString(),
      gemini_configured: !!process.env.GEMINI_API_KEY,
      razorpay_configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    });
  });

  // Get aggregated dashboard metrics
  app.get('/api/metrics', (req, res) => {
    try {
      const metrics = storage.getMetrics();
      res.json(metrics);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to compute metrics' });
    }
  });

  // Get all transactions (supports optional filtering)
  app.get('/api/transactions', (req, res) => {
    try {
      const { status, payment_method, failure_reason, search } = req.query;
      let txs = storage.getAllTransactions();

      if (status && typeof status === 'string' && status !== 'all') {
        txs = txs.filter(t => t.status === status);
      }
      if (payment_method && typeof payment_method === 'string' && payment_method !== 'all') {
        txs = txs.filter(t => t.payment_method === payment_method);
      }
      if (failure_reason && typeof failure_reason === 'string' && failure_reason !== 'all') {
        txs = txs.filter(t => t.failure_reason === failure_reason);
      }
      if (search && typeof search === 'string') {
        const query = search.toLowerCase();
        txs = txs.filter(t =>
          t.payment_id.toLowerCase().includes(query) ||
          t.customer_name.toLowerCase().includes(query) ||
          t.customer_email.toLowerCase().includes(query)
        );
      }

      res.json(txs);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch transactions' });
    }
  });

  // Get single transaction by payment_id
  app.get('/api/transactions/:id', (req, res) => {
    try {
      const tx = storage.getTransactionById(req.params.id);
      if (!tx) {
        return res.status(404).json({ error: `Transaction ${req.params.id} not found` });
      }
      res.json(tx);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Analysis on a single transaction
  app.post('/api/transactions/:id/analyze', async (req, res) => {
    try {
      const tx = await RecoveryEngine.analyze(req.params.id);
      res.json({
        success: true,
        transaction: tx,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'AI analysis failed' });
    }
  });

  // Execute recovery action on a transaction
  app.post('/api/transactions/:id/recover', async (req, res) => {
    try {
      const { action, merchantApproved, forceSimulatedSuccess } = req.body;
      if (!action) {
        return res.status(400).json({ error: 'Recovery action is required' });
      }

      const outcome = await RecoveryEngine.executeAction(req.params.id, action, {
        merchantApproved: Boolean(merchantApproved),
        forceSimulatedSuccess: forceSimulatedSuccess !== undefined ? Boolean(forceSimulatedSuccess) : undefined,
        executionMode: 'manual_merchant',
      });

      res.json({
        success: true,
        ...outcome,
        metrics: storage.getMetrics(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Recovery execution failed' });
    }
  });

  // Batch recovery endpoint
  app.post('/api/recovery/batch', async (req, res) => {
    try {
      const result = await RecoveryEngine.runBatchRecovery();
      res.json({
        success: true,
        result,
        metrics: storage.getMetrics(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Batch recovery execution failed' });
    }
  });

  // Get audit logs
  app.get('/api/audit-logs', (req, res) => {
    try {
      const logs = storage.getAuditLogs();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get system settings
  app.get('/api/settings', (req, res) => {
    try {
      const settings = storage.getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update system settings
  app.put('/api/settings', (req, res) => {
    try {
      const updated = storage.updateSettings(req.body);
      res.json({
        success: true,
        settings: updated,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reset demo data
  app.post('/api/reset', (req, res) => {
    try {
      storage.resetData();
      res.json({
        success: true,
        message: 'Demo transaction and audit data successfully restored to baseline.',
        metrics: storage.getMetrics(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Vite Frontend Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PayRecover AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting PayRecover AI server:', err);
});
