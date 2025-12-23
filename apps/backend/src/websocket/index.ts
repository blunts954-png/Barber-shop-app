import type { WebSocketServer, WebSocket } from 'ws';

interface Client {
  id: string;
  ws: WebSocket;
  userId?: string;
  shopId?: string;
  role?: 'owner' | 'barber' | 'client';
}

const clients = new Map<string, Client>();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket) => {
    const clientId = generateId();
    clients.set(clientId, { id: clientId, ws });

    console.log(`🔌 Client connected: ${clientId}`);

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        handleMessage(clientId, data);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`🔌 Client disconnected: ${clientId}`);
    });

    // Send welcome message
    ws.send(JSON.stringify({ type: 'connected', clientId }));
  });

  console.log('✅ WebSocket server configured');
}

function handleMessage(clientId: string, data: any) {
  const client = clients.get(clientId);
  if (!client) return;

  switch (data.type) {
    case 'auth':
      // Handle authentication
      client.userId = data.userId;
      client.shopId = data.shopId;
      client.role = data.role;
      break;

    case 'subscribe':
      // Handle subscriptions (queue updates, appointment changes, etc.)
      break;

    default:
      console.log('Unknown message type:', data.type);
  }
}

export function broadcastToShop(shopId: string, message: any) {
  clients.forEach((client) => {
    if (client.shopId === shopId && client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
