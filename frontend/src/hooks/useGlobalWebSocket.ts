import { useWebSocket } from "./useWebSocket";
import { toast } from "sonner";
import { mutate } from "swr";
import { endpointPlaylists, endpointWebSocketPlaylists } from "@/constants/endpoints";
import infoToast from "@/components/toasts/infoToast";
import errorToast from "@/components/toasts/errorToast";
import successToast from "@/components/toasts/successToast";

export function useGlobalWebSocket() {
  useWebSocket(endpointWebSocketPlaylists, (data) => {
    if (data.fetch_success) {
      mutate(`${endpointPlaylists}`);
      mutate(`${endpointPlaylists}/${data.playlist_id}/details`); // Maybe not needed anymore
      successToast(`Playlist "${data.playlist_title}" refreshed successfully!`);
    } else if (data.fetch_success === false) {
      errorToast(`Failed to refresh playlist "${data.playlist_title || data.playlist_id}".`)
    }
  }, "global-playlist-updates");
}
