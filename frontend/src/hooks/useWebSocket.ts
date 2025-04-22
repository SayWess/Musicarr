import { useEffect, useRef } from "react";

interface WebSocketInstance {
  socket: WebSocket;
  listeners: Map<string, (data: any) => void>; // Use a map for multiple listeners
}

const wsInstances: Record<string, WebSocketInstance> = {};

export function useWebSocket(url: string, onMessage: (data: any) => void, key: string) {
  const listenerRef = useRef<(data: any) => void>(() => {});
  
  useEffect(() => {
    listenerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let instance = wsInstances[url];

    if (!instance) {
      console.log(`Creating WebSocket for: ${url}`);
      const socket = new WebSocket(url);

      instance = { socket, listeners: new Map() };
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
        delete wsInstances[url];
      };
    }

    instance.listeners.set(key, listenerRef.current);

    return () => {
      instance.listeners.delete(key);
      if (instance.listeners.size === 0) {
        instance.socket.close();
        delete wsInstances[url];
      }
    };
  }, [url, key, onMessage]); // Depend on key to prevent duplicate hooks
}
