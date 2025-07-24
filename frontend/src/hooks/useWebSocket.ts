import { useEffect, useRef } from "react";

interface WebSocketInstance {
  socket: WebSocket;
  listeners: Map<string, (data: any) => void>; // Use a map for multiple listeners
  reconnectTimer?: NodeJS.Timeout;
  shouldReconnect: boolean;
}

const wsInstances: Record<string, WebSocketInstance> = {};

export function useWebSocket(
  url: string,
  onMessage: (data: any) => void,
  key: string,
  reconnectInterval: number = 5000
) {
  const listenerRef = useRef<(data: any) => void>(() => {});

  useEffect(() => {
    listenerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let instance = wsInstances[url];

    const setupWebSocket = () => {
      console.log(`Creating WebSocket for: ${url}`);
      const socket = new WebSocket(url);
      instance = {
        socket,
        listeners: new Map(),
        shouldReconnect: true,
      };
      wsInstances[url] = instance;

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          instance.listeners.forEach((listener) => listener(data));
        } catch (error) {
          console.error("WebSocket message error:", error);
        }
      };

      socket.onclose = () => {
        console.log(`WebSocket closed: ${url}`);
        if (instance?.shouldReconnect) {
          console.log(`Attempting to reconnect in ${reconnectInterval / 1000}s`);
          instance.reconnectTimer = setTimeout(() => {
            setupWebSocket();
          }, reconnectInterval);
        } else {
          delete wsInstances[url];
        }
      };

      socket.onerror = (err) => {
        socket.close();
      };
    };

    // First-time setup if instance doesn't exist
    if (!instance) {
      setupWebSocket();
      instance = wsInstances[url];
    }

    // Register this hook's listener
    instance.listeners.set(key, listenerRef.current);

    return () => {
      instance.listeners.delete(key);
      if (instance.listeners.size === 0) {
        instance.shouldReconnect = false;
        if (instance.reconnectTimer) {
          clearTimeout(instance.reconnectTimer);
        }
        instance.socket.close();
      }
    };
  }, [url, key, onMessage]); // Depend on key to prevent duplicate hooks
}
