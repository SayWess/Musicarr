import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useModal,
} from "@/components/modals/Modal";
import { Button } from "@heroui/button";

interface DownloadPlaylistModalProps {
  isDownloadOpen: boolean;
  closeDownload: () => void;
  handleDownloadMissing: () => Promise<void>;
  redownloadAll: boolean;
  setRedownloadAll: (value: boolean) => void;
}

const DownloadPlaylistModal = ({
  isDownloadOpen,
  closeDownload,
  handleDownloadMissing,
  redownloadAll,
  setRedownloadAll,
}: DownloadPlaylistModalProps) => {
  return (
    <Modal isOpen={isDownloadOpen} onClose={closeDownload}>
      <ModalContent>
        <ModalHeader>Download Playlist</ModalHeader>
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
          <button
            onClick={closeDownload}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDownloadMissing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Download
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DownloadPlaylistModal;
