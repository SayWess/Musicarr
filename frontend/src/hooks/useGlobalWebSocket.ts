import { useWebSocket } from "./useWebSocket";
import { mutate } from "swr";
import { endpointPlaylists, endpointWebSocketPlaylists, endpointWebSocketUploaders } from "@/constants/endpoints";
import infoToast from "@/components/toasts/infoToast";
import errorToast from "@/components/toasts/errorToast";
import successToast from "@/components/toasts/successToast";

export function useGlobalWebSocket() {
  useWebSocket(endpointWebSocketPlaylists, (data) => {
    if (data.fetch_success === true) {
      mutate(`${endpointPlaylists}`);
      mutate(`${endpointPlaylists}/${data.playlist_id}/details`); // Maybe not needed anymore
      successToast(data.message);
    } else if (data.fetch_success === false) {
      errorToast(data.message)
    }
  }, "global-playlist-updates");

  
  useWebSocket(endpointWebSocketUploaders, (data) => {
  }, "global-uploader-updates");

}
