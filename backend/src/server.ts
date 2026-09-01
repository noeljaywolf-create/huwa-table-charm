import express, { type Express } from 'express';
import cors from 'cors';
import db from './config/database';
import config from './config';
import { apiLimiter } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import catalogRoutes from './routes/catalog.routes';
import cartRoutes from './routes/cart.routes';
import checkoutRoutes from './routes/checkout.routes';
import webhookRoutes from './routes/webhook.routes';
import agentRoutes from './routes/agent.routes';
import adminRoutes from './routes/admin.routes';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    cors({
      origin: config.allowedOrigins,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(apiLimiter);

  // Health check
  app.get('/api/health', async (_req, res) => {
    try {
      await db.raw('SELECT 1');
      res.json({ success: true, data: { status: 'ok', env: config.env, timestamp: new Date().toISOString() } });
    } catch {
      res.status(503).json({ success: false, error: 'Database unavailable' });
    }
  });

  // Stripe webhook must see the raw body, so it is mounted before the JSON parser
  // is overridden conceptually; it uses its own expr.raw parser inside the route.
  app.use('/api/webhook', webhookRoutes);

  app.use('/api', authRoutes);
  app.use('/api', catalogRoutes);
  app.use('/api', cartRoutes);
  app.use('/api', checkoutRoutes);

  app.use('/api', agentRoutes);
  app.use('/api', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

// Bootstrap when run directly (dev/start). Kept so tests can import createApp() only.
const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));

if (isDirectRun) {
  const app = createApp();
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`HUWA TABLE CHARM API listening on http://localhost:${config.port} (${config.env})`);
  });
}
