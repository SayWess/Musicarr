import { useEffect, useRef } from "react";

const MAX_RETRIES = 5; // Maximum reconnection attempts

export function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);

  const connect = (url: string, onMessage: (data: any) => void) => {
    if (socketRef.current) return;

    if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
      console.error(`Invalid WebSocket URL: ${url}`);
      return;
    }

    console.log(`Connecting to WebSocket: ${url} (Attempt ${retryCount.current + 1})`);
    socketRef.current = new WebSocket(url);

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    };

    socketRef.current.onclose = (event) => {
      console.warn(`WebSocket closed (code: ${event.code})`);
      socketRef.current = null;

      if (!event.wasClean && retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        const delay = Math.min(1000 * retryCount.current, 5000); // Exponential backoff (max 5s)

        console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);
        setTimeout(() => connect(url, onMessage), delay);
      }
    };
  };

  const disconnect = () => {
    if (socketRef.current) {
      console.log("Closing WebSocket connection.");
      socketRef.current.close();
      socketRef.current = null;
      retryCount.current = 0; // Reset retry count on manual disconnect
    }
  };

  useEffect(() => {
    return () => disconnect(); // Cleanup on unmount
  }, []);

  return { connect, disconnect };
}
