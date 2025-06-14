import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/modals/Modal";
import { Uploader } from "@/types/models";
import {
  endpointPlaylists,
  endpointUploadersAvatar,
  endpointUploaders,
  endpointWebSocketUploaders,
} from "@/constants/endpoints";
import successToast from "../toasts/successToast";
import errorToast from "../toasts/errorToast";
import { Loader2, User } from "lucide-react";
import { mutate } from "swr";
import infoToast from "../toasts/infoToast";
import { useWebSocket } from "@/hooks/useWebSocket";

interface PlaylistUploaderModalProps {
  isUploaderOpen: boolean;
  closeUploader: () => void;
  uploader: Uploader | null;
  playlistId: string;
}

export const PlaylistUploaderModal = ({
  isUploaderOpen,
  closeUploader,
  uploader,
  playlistId,
}: PlaylistUploaderModalProps) => {
  const [uploaders, setUploaders] = useState<Uploader[]>([]);
  const [selectedUploaderId, setSelectedUploaderId] = useState<string | null>(
    uploader?.id || null
  );
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isRefreshingAvatar, setIsRefreshingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (isUploaderOpen) {
      setLoading(true);
      setLoadError(false);

      axios
        .get(endpointUploaders + "/")
        .then((res) => setUploaders(res.data))
        .catch((err) => {
          setLoadError(true);
          errorToast("Failed to fetch uploaders.");
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [isUploaderOpen]);

  const handleSave = async () => {
    if (!selectedUploaderId) return;

    try {
      await axios.put(`${endpointPlaylists}/${playlistId}/uploader`, {
        uploader_id: selectedUploaderId,
      });

      successToast("Uploader updated successfully");
      mutate(`${endpointPlaylists}/${playlistId}/details`);
      closeUploader();
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        "An error occurred while updating the uploader.";
      errorToast(message);
      console.error("Uploader update error:", err);
    }
  };

  const webSocketKey = `playlist_uploader`;

  const handleMessage = (data: any) => {
    if (data.uploader_id !== uploader?.id) return;
  
    if (data.avatar_downloaded) {
      mutate(`${endpointUploaders}/${data.uploader_id}`);
      successToast("Avatar updated!");
      setIsRefreshingAvatar(false);
      setAvatarError(false);
    }
  
    if (!data.avatar_downloaded) {
      errorToast("Failed to update avatar.");
      setIsRefreshingAvatar(false);
    }
  };

  useWebSocket(
    `${endpointWebSocketUploaders}`,
    handleMessage,
    webSocketKey
  );

  const refreshAvatar = () => {
    if (!uploader) return;

    setAvatarError(false);
    setIsRefreshingAvatar(true);

    axios
      .post(`${endpointUploaders}/${uploader.id}/download_avatar`)
      .then(() => {
        infoToast("Redownloading avatar...");
      })
      .catch((err) => {
        errorToast("Failed to redownload avatar.");
        setIsRefreshingAvatar(false);
        console.error(err);
      });
  };

  useEffect(() => {
    if (!uploader) return;

    console.log("Checking avatar download status...", uploader);

    let isMounted = true; // Prevents running twice due to re-renders

    fetch(`${endpointUploaders}/${uploader.id}/download_avatar/status`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "downloading" && isMounted) {
          setAvatarError(false);
          infoToast("Avatar downloaded successfully");
        }
      })
      .catch((error) => {
        console.error("Error checking playlist refresh status:", error);
      });

    return () => {
      isMounted = false; // Cleanup to avoid state updates on unmounted component
    };
  }, [playlistId]);

  const avatarUrl = uploader
    ? `${endpointUploadersAvatar}/${encodeURIComponent(uploader.id)}.jpg`
    : "";

  return (
    <Modal isOpen={isUploaderOpen} onClose={closeUploader}>
      <ModalContent>
        <ModalHeader>
          <h2 className="text-lg font-semibold text-gray-100">
            Change Uploader
          </h2>
          <p className="text-sm text-gray-400">
            Select a new uploader for this playlist.
          </p>
        </ModalHeader>
        <ModalBody>
          {uploader && (
            <div className="flex items-center gap-3 mb-4">
              {!avatarError ? (
                <div className="relative">
                  <Image
                    src={avatarUrl}
                    onError={() => setAvatarError(true)}
                    width={500}
                    height={500}
                    className="rounded-full h-auto w-[64px] sm:w-[128px] shadow-md"
                    priority
                    quality={100}
                    alt={uploader.name ?? "Uploader avatar"}
                    onClick={refreshAvatar}
                  />
                  {isRefreshingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                      <Loader2 className="animate-spin text-white w-6 h-6" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <User
                    size={64}
                    className="text-gray-500 h-auto sm:w-[128px] rounded-full cursor-pointer"
                    onClick={refreshAvatar}
                  />
                  {isRefreshingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                      <Loader2 className="animate-spin text-white w-6 h-6" />
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="text-gray-100 font-medium">
                  {uploader.name ?? "Unknown"}
                </p>
                {uploader.channel_url && (
                  <Link
                    href={uploader.channel_url}
                    className="text-blue-400 text-sm hover:underline"
                    target="_blank"
                  >
                    Visit channel
                  </Link>
                )}
              </div>
            </div>
          )}

          <label className="block mb-2 text-sm text-gray-400">
            Change uploader:
          </label>

          {loading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="animate-spin text-gray-400 w-5 h-5" />
            </div>
          ) : loadError ? (
            <p className="text-red-500 text-sm">Failed to load uploaders.</p>
          ) : uploaders.length === 0 ? (
            <p className="text-gray-400 text-sm">No uploaders found.</p>
          ) : (
            <select
              value={selectedUploaderId ?? ""}
              onChange={(e) => setSelectedUploaderId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 text-gray-100 px-3 py-2 rounded"
            >
              {uploaders.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          )}
        </ModalBody>

        <ModalFooter>
          <button
            onClick={closeUploader}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedUploaderId || loading || loadError}
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition disabled:opacity-50"
          >
            Save
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
