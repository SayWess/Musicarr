import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { endpointWebSocketPlaylists } from "@/constants/endpoints";

const useDownloadProgress = (playlistId: string, onDownloadComplete?: (videoId: string) => void) => {
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Record<string, number>>({});
  const { connect, disconnect } = useWebSocket();

  useEffect(() => {
    if (!playlistId) return;

    connect(`${endpointWebSocketPlaylists}/${playlistId}`, (data) => {
      if (data.video_id) {
        setProgress((prev) => ({
          ...prev,
          [data.video_id]: data.progress,
        }));

        setDownloading((prev) => new Set(prev).add(data.video_id));

        if (data.message === "Download complete" && onDownloadComplete) {
          onDownloadComplete(data.video_id);
        }
      }
    });

    return () => disconnect(); // Cleanup on unmount
  }, [playlistId]);

  return {
    progress,
    downloading,
    setDownloading,
  };
};

export default useDownloadProgress;
