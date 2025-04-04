import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/modals/Modal";

interface DeleteModalProps {
  isDeleteOpen: boolean;
  closeDelete: () => void;
  handleDeleteConfirm: () => void;
}

export const DeleteModal = ({
  isDeleteOpen,
  closeDelete,
  handleDeleteConfirm,
}: DeleteModalProps) => {
  return (
    <Modal isOpen={isDeleteOpen} onClose={closeDelete}>
      <ModalContent>
        <ModalHeader className="text-lg font-semibold border-b pb-2">
          Confirm Deletion
        </ModalHeader>
        <ModalBody>
          <div className="flex items-center justify-center mb-4 p-4">
            <p className="text-lg text-gray-100">
              Are you sure you want to <span className="text-red-600">delete</span> this playlist? This action <span className="text-red-600">cannot be undone</span>.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={closeDelete}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition"
          >
            Delete
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
