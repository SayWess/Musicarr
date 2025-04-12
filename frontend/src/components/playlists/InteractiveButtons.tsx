import {
  useModal,
} from "@/components/modals/Modal";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { endpointPlaylists } from "@/constants/endpoints";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import DownloadPlaylistModal from "../modals/DownloadPlaylistModal";
import EditModal from "../modals/EditModal";
import { PlaylistDetails } from "@/types/models";
import EditButton from "@/components/buttons/Edit";
import DeleteButton from "../buttons/Delete";
import RefreshButton from "../buttons/Refresh";
import DownloadPlaylistButton from "../buttons/DownloadPlaylist";


interface InteractiveButtonsProps {
  id: string;
  isRefreshing: boolean;
  playlist: PlaylistDetails;
  onRefresh: () => Promise<void>;
  isDownloading: boolean;
  onDownload: (redownloadAll: boolean) => Promise<void>;
}

const InteractiveButtons = ({
  id, playlist, isRefreshing, onRefresh, isDownloading, onDownload }: InteractiveButtonsProps) => {
  const { isOpen: isEditOpen, openModal: openEdit, closeModal: closeEdit } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDelete, closeModal: closeDelete } = useModal();
  const { isOpen: isDownloadOpen, openModal: openDownload, closeModal: closeDownload } = useModal();
  const [redownloadAll, setRedownloadAll] = useState(false);
  const router = useRouter();

  const handleDeleteConfirm = async () => {
    closeDelete();
    try {
      await axios.delete(`${endpointPlaylists}/${id}`);
      router.push("/playlists");
      toast.success("Playlist deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete playlist: " + error);
    }
  };

  const handleDownloadMissing = async () => {
    closeDownload();
    onDownload(redownloadAll);
  };

  return (
    <div className="flex lg:flex-col gap-4 justify-around self-center">


      <EditButton onClick={openEdit} />
      <DeleteButton onClick={openDelete} isDownloading={isDownloading} />
      <RefreshButton onClick={onRefresh} isRefreshing={isRefreshing} isDownloading={isDownloading} />
      <DownloadPlaylistButton onClick={openDownload} isDownloading={isDownloading} />

      <DeleteModal
        isDeleteOpen={isDeleteOpen}
        closeDelete={closeDelete}
        handleDeleteConfirm={handleDeleteConfirm}
      />

      <DownloadPlaylistModal
        isDownloadOpen={isDownloadOpen}
        closeDownload={closeDownload}
        handleDownloadMissing={handleDownloadMissing}
        redownloadAll={redownloadAll}
        setRedownloadAll={setRedownloadAll}
      />

      <EditModal
        isEditOpen={isEditOpen}
        closeEdit={closeEdit}
        playlist={playlist}
      />

    </div>
  );
};

export default InteractiveButtons;
