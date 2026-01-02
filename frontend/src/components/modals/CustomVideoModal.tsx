"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useModal,
} from "@/components/modals/Modal";
import { useEffect, useState } from "react";
import errorToast from "../toasts/errorToast";
import { endpointPlaylists } from "@/constants/endpoints";
import { Info } from "lucide-react";

interface CustomVideoModalProps {
  isOpen: boolean;
  closeModal: () => void;
  videoId: string;
  playlistId: string;
}

export const CustomVideoModal = ({ isOpen, closeModal, videoId, playlistId }: CustomVideoModalProps) => {
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const [formData, setFormData] = useState({
    custom_download_path: "",
    custom_title: "",
  });

  useEffect(() => {
    setFormData({
      custom_download_path: "",
      custom_title: "",
    });
  }, []);

  const [validationError, setValidationError] = useState<{
    custom_download_path?: string;
    custom_title?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    let newValue = value;
    let error = "";

    if (name === "custom_title") {
      if (/[<>:"/\\|?*\x00-\x1F]|\.\.\//.test(value)) {
        error = "Invalid characters in title.";
        newValue = value
          .replace(/[<>:"\\|?*\x00-\x1F]/g, "") // Remove invalid characters except /
          .replace(/\.\.\//g, "") // Remove directory traversal attempts
          .replace(/\//g, "⧸"); // Replace / by ⧸
      }
    }

    if (name === "custom_download_path") {
      if (/[<>:"\\|?*\x00-\x1F]|\.\.\//.test(value) || /^\/+/.test(value)) {
        error = "Invalid characters in path.";
        newValue = newValue
          .replace(/[<>:"\\|?*\x00-\x1F]/g, "") // remove invalid characters
          .replace(/\.\.\//g, "") // remove directory traversal attempts
          .replace(/^\/+/, ""); // remove leading forward slashes
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : newValue,
    }));

    setValidationError((prev) => ({
      ...prev,
      [name]: error || undefined,
    }));
  };

  const fetchCustomPath = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${endpointPlaylists}/${playlistId}/videos/${videoId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          custom_download_path: data.custom_download_path || "",
          custom_title: data.custom_title || "",
        });
      }
    } catch (error) {
      console.error("Error fetching custom path:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveCustomPath = async () => {
    setLoading(true);
    formData.custom_download_path = formData.custom_download_path.trim();
    formData.custom_title = formData.custom_title.trim();

    try {
      const response = await fetch(`${endpointPlaylists}/${playlistId}/videos/${videoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        closeModal();
      } else {
        errorToast("Error updating custom path and title.", response.statusText);
      }
    } catch (error) {
      errorToast("Error updating custom path and title.");
      console.error("Error updating custom path and title:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomPath();
  }, [videoId, playlistId]);

  return (
    <Modal isOpen={isOpen} onClose={closeModal}>
      <ModalContent>
        <ModalHeader className="text-lg font-semibold border-b pb-2">Edit Video</ModalHeader>
        <ModalBody>
          <br />
          <div>
            <label htmlFor="custom_title" className="block text-md font-bold text-[goldenrod]">
              Title
            </label>
            <input
              id="custom_title"
              type="text"
              name="custom_title"
              value={formData.custom_title || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded ring focus:ring-blue-300"
            />
            {validationError.custom_title && (
              <p className="text-sm text-red-500 mt-1">{validationError.custom_title}</p>
            )}
          </div>

          <br />

          <div>
            <label
              htmlFor="custom_download_path"
              className="flex items-center cursor-help w-fit text-md font-bold text-[goldenrod]"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
            >
              Download Path <Info size={16} className="ml-1" />
            </label>

            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute z-50 mt-2 ml-2 w-64 bg-gray-800 text-sm text-gray-200 rounded-md px-3 py-2 shadow-lg">
                If nothing is set, the playlist's download path will be used.
                <br />
                If you want to download to the root of the playlist folder and not use the playlist's download path, <strong>enter a dot . only.</strong>
                <br />
                <strong>Note:</strong> Leading slashes will be removed to prevent absolute paths.
              </div>
            )}
            <input
              id="custom_download_path"
              type="text"
              name="custom_download_path"
              value={formData.custom_download_path || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded ring focus:ring-blue-300"
            />
            {validationError.custom_download_path && (
              <p className="text-sm text-red-500 mt-1">{validationError.custom_download_path}</p>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={saveCustomPath}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Edits
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
