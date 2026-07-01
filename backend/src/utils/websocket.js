const WebSocket = require('ws');

let wss = null;
const clients = new Set();

const initWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('[WEBSOCKET] Client connected. Active clients count:', clients.size);

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message);
        console.log(`[WEBSOCKET] Received event: ${parsed.event}`, parsed.data);

        // If it is a Chat message, broadcast it to all other active clients
        if (parsed.event === 'CHAT_MESSAGE') {
          broadcast('CHAT_MESSAGE', {
            senderName: parsed.data.senderName,
            text: parsed.data.text,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('[WEBSOCKET] Failed to parse client message:', err);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log('[WEBSOCKET] Client disconnected. Active clients count:', clients.size);
    });

    ws.on('error', (err) => {
      console.error('[WEBSOCKET] Error:', err);
      clients.delete(ws);
    });
  });
};

const broadcast = (event, data) => {
  if (!wss) return;
  const payload = JSON.stringify({ event, data });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

module.exports = {
  initWebSocket,
  broadcast
};
