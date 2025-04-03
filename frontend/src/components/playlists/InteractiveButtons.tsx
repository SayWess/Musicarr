// import { useState } from "react";
// import { Pencil, Trash, RefreshCw, Download } from "lucide-react";
// import { toast } from "sonner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter, 
  useDisclosure,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { endpointPlaylists } from "@/constants/endpoints";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash, RefreshCw, Download } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";


const InteractiveButtons = ({
  id,
  isRefreshing,
//   setIsRefreshing,
  onRefresh,
}: {
  id: string;
  isRefreshing: boolean;
//   setIsRefreshing: (isRefreshing: boolean) => void;
  onRefresh: () => Promise<void>;
}) => {
  const { isOpen: isDeleteOpen, onOpen: openDelete, onClose: closeDelete } = useDisclosure();
  const { isOpen: isDownloadOpen, onOpen: openDownload, onClose: closeDownload } = useDisclosure();
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
    <div className="flex space-x-4 mt-4 md:mt-0">
      {/* Edit Button */}
      <button
        onClick={openDownload}
        className="text-yellow-400 hover:text-yellow-300 flex items-center"
      >
        <Pencil size={20} className="mr-2" /> Edit
      </button>

      {/* Delete Button with Confirmation */}
      <button
        onClick={openDelete}
        className="text-red-400 hover:text-red-300 flex items-center"
      >
        <Trash size={20} className="mr-2" /> Delete
      </button>

      {/* Refresh Button */}
      <button
        onClick={onRefresh
    
        }
        className="text-blue-400 hover:text-blue-300 flex items-center"
        disabled={isRefreshing}
      >
        <RefreshCw
          size={20}
          className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}
        />
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </button>

      {/* Download Missing Videos Button */}
      <button
        onClick={openDownload}
        className="text-green-400 hover:text-green-300 flex items-center"
      >
        <Download size={20} className="mr-2" /> Download Missing
      </button>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onOpenChange={closeDelete} backdrop="opaque">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Confirm Deletion</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this playlist?</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDeleteConfirm}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Download Options Modal */}
      <Modal
        isOpen={isDownloadOpen}
        onOpenChange={closeDownload}
        backdrop="opaque"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Download Options</ModalHeader>
              <ModalBody>
                <label className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    checked={redownloadAll}
                    onChange={(e) => setRedownloadAll(e.target.checked)}
                    className="mr-2"
                  />
                  Redownload all videos (even existing ones)
                </label>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleDownloadMissing}>
                  Start Download
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default InteractiveButtons;
