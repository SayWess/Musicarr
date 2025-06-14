import infoToast from "@/components/toasts/infoToast";
import { getItemUrl } from "./extractYouTubeId";

export function copyUrlToClipboard(videoId: string) {
  const url = getItemUrl(videoId);
  navigator.clipboard.writeText(url);
  infoToast("Video link copied to clipboard.", "", 1000);
}
