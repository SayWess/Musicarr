import { useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { endpointWebSocketPlaylists } from "@/constants/endpoints";
import { mutate } from "swr";
import { endpointPlaylists } from "@/constants/endpoints";
import successToast from "@/components/toasts/successToast";
import errorToast from "@/components/toasts/errorToast";

const useDownloadProgress = (playlistId: string) => {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [download_stage, setDownloadStage] = useState<Record<string, string>>({});

  const updateStatus = (video_id: string, status: "DOWNLOADING" | "DOWNLOADED" | "ERROR") => {
    mutate(
      `${endpointPlaylists}/${playlistId}/videos/${video_id}/download_status`,
      { status },
      false
    );
    mutate(`${endpointPlaylists}/${playlistId}/number_of_videos_downloaded`,);
  };

  useWebSocket(
    `${endpointWebSocketPlaylists}`,
    (data) => {
      if (data.playlist_id !== playlistId) return;

      const video_id = data.video_id;
      if (!video_id) return;

      switch (data.status) {
        case "started":
          setProgress((prev) => ({ ...prev, [video_id]: 0 }));
          updateStatus(video_id, "DOWNLOADING");
          break;

        case "downloading":
          if (typeof data.progress === "number") {
            setProgress((prev) => ({ ...prev, [video_id]: data.progress }));
            if (data.download_stage) {
              setDownloadStage((prev) => ({ ...prev, [video_id]: data.download_stage }));
            }
          }
          break;

        case "finished":
          setProgress((prev) => {
            const updated = { ...prev };
            delete updated[video_id];
            return updated;
          });
          updateStatus(video_id, "DOWNLOADED");
          successToast(`Download complete: ${data.video_title || video_id}`);
          mutate
          break;

        case "error":
          setProgress((prev) => {
            const updated = { ...prev };
            delete updated[video_id];
            return updated;
          });
          updateStatus(video_id, "ERROR");
          errorToast(`Download failed: ${data.video_title || video_id}`);
          break;
      }
    },
    `playlist-download-progress-${playlistId}`
  );

  return {
    getProgress: (id: string) => progress[id] ?? 0,
    getDownloadStage: (id: string) => download_stage[id] ?? ""
  };
};

export default useDownloadProgress;