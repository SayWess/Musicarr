import { User } from "lucide-react";
import { useModal } from "../modals/Modal";
import { PlaylistUploaderModal } from "../modals/PlaylistUploaderModal";
import { Uploader } from "@/types/models";

interface PlaylistUploaderProps {
  playlist: {
    uploader: Uploader;
    id: string;
  };
  isRefreshing: boolean;
}

export default function PlaylistUploader({
  playlist,
  isRefreshing,
}: PlaylistUploaderProps) {
  const {
    isOpen: isUploaderOpen,
    openModal: openUploader,
    closeModal: closeUploader,
  } = useModal();

  return (
    <>
      <div
        className="flex items-center clamp gap-2 cursor-pointer"
        onClick={() => {
          if (isRefreshing) return;
          openUploader();
        }}
      >
        <User size={16} className="min-w-fit" />
        {playlist.uploader ? playlist.uploader.name : "Unknown"}
      </div>

      <PlaylistUploaderModal
        isUploaderOpen={isUploaderOpen}
        closeUploader={closeUploader}
        uploader={playlist.uploader}
        playlistId={playlist.id}
      />
    </>
  );
}
