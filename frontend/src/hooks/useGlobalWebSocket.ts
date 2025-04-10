import { useWebSocket } from "./useWebSocket";
import { toast } from "sonner";
import { mutate } from "swr";
import { endpointPlaylists, endpointWebSocketPlaylists } from "@/constants/endpoints";

export function useGlobalWebSocket() {
  useWebSocket(endpointWebSocketPlaylists, (data) => {
    if (data.fetch_success) {
      mutate(`${endpointPlaylists}`);
      mutate(`${endpointPlaylists}/${data.playlist_id}/details`); // Maybe not needed anymore
      toast.success(`Playlist "${data.playlist_title}" refreshed successfully!`, {
        style: {
            backgroundColor: "#1e293b",
            color: "#f8fafc",
        },
      });
    } else if (data.fetch_success === false) {
      toast.error(`Failed to refresh playlist "${data.playlist_title || data.playlist_id}".`, {
        style: {
            backgroundColor: "#1e293b",
            color: "#f8fafc",
        },
      }
      );
    }
  }, "global-playlist-updates");
}
