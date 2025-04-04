// import { Pencil, Trash, RefreshCw, Download } from "lucide-react";

import {
  useModal,
} from "@/components/modals/Modal";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { endpointPlaylists } from "@/constants/endpoints";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash, RefreshCw, Download } from "lucide-react";
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
}

const InteractiveButtons = ({
  id, isRefreshing, playlist, onRefresh }: InteractiveButtonsProps) => {
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
      
    } catch (error) {
      toast.error("Failed to delete playlist: " + error);
    }
  };

  const handleDownloadMissing = async () => {
    try {
      await axios.post(`${endpointPlaylists}/${id}/download-missing`, {
        redownload: redownloadAll,
      });
      toast.success("Download started!");
      closeDownload();
    } catch (error) {
      toast.error("Download failed: " + error);
    }
  };

  return (
    <div className="flex lg:flex-col gap-4 justify-around self-center mt-4">

      {/* Edit Button */}
      <EditButton onClick={openEdit} />

      {/* Delete Button with Confirmation */}
      <DeleteButton onClick={openDelete} />

      {/* Refresh Button */}
      <RefreshButton onClick={onRefresh} isRefreshing={isRefreshing} />

      {/* Download Missing Videos Button */}
      <DownloadPlaylistButton onClick={openDownload} />


      {/* Delete Confirmation Modal */}
      <DeleteModal
        isDeleteOpen={isDeleteOpen}
        closeDelete={closeDelete}
        handleDeleteConfirm={handleDeleteConfirm}
      />

      {/* Download Modal */}
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
