import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { setupGraphQL } from './graphql';
import { setupRestRoutes } from './routes';
import { setupWebSocket } from './websocket';
import { db } from './db';
import { redis } from './redis';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: db.connected ? 'connected' : 'disconnected',
    redis: redis.status === 'ready' ? 'connected' : 'disconnected'
  });
});

// Setup routes and GraphQL
setupRestRoutes(app);
setupGraphQL(app);
setupWebSocket(wss);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await db.end();
    await redis.quit();
    console.log('HTTP server closed');
    process.exit(0);
  });
});
