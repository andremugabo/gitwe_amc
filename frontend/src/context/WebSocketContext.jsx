import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '../utils/toast';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [chatMessages, setChatMessages] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (wsRef.current) {
        wsRef.current.close();
      }
      return;
    }

    let socketUrl = 'ws://localhost:5001';
    if (window.location.protocol === 'https:') {
      socketUrl = `wss://${window.location.host}`;
    } else {
      // Dynamic fallback for dev
      socketUrl = `ws://${window.location.hostname}:5001`;
    }

    let reconnectTimeout;

    const connect = () => {
      console.log('[WEBSOCKET] Connecting to:', socketUrl);
      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WEBSOCKET] Connected successfully.');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          console.log(`[WEBSOCKET] Incoming event: ${payload.event}`, payload.data);

          if (payload.event === 'NOTIFICATION') {
            // Only trigger toast if user is the targeted recipient
            if (payload.data.recipientId === user.id) {
              toast.info(`${payload.data.title}: ${payload.data.message}`);
            }
          }

          if (payload.event === 'CHAT_MESSAGE') {
            setChatMessages(prev => [...prev, payload.data]);
          }
        } catch (err) {
          console.error('[WEBSOCKET] Failed to parse message:', err);
        }
      };

      ws.onclose = () => {
        console.log('[WEBSOCKET] Closed. Attempting reconnect in 4s...');
        reconnectTimeout = setTimeout(connect, 4000);
      };

      ws.onerror = (err) => {
        console.error('[WEBSOCKET] Error:', err);
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user]);

  const sendChatMessage = (text) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && user) {
      const msg = {
        event: 'CHAT_MESSAGE',
        data: {
          senderName: user.name,
          text
        }
      };
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  return (
    <WebSocketContext.Provider value={{ chatMessages, sendChatMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
