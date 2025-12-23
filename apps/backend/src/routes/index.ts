import type { Express } from 'express';
import express from 'express';

export function setupRestRoutes(app: Express) {
  const apiRouter = express.Router();

  // Placeholder routes - will be expanded with actual endpoints
  apiRouter.get('/status', (req, res) => {
    res.json({ message: 'API is running' });
  });

  app.use('/api', apiRouter);
  console.log('✅ REST routes configured');
}
