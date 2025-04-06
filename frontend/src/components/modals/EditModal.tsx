import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/modals/Modal";
import { endpointPlaylists } from "@/constants/endpoints";
import { mutate } from "swr";
import {
  PlaylistDetails,
  DownloadFormat,
  DownloadQuality,
} from "@/types/models";
import successToast from "../toasts/successToast";
import errorToast from "../toasts/errorToast";

interface EditModalProps {
  isEditOpen: boolean;
  closeEdit: () => void;
  playlist: PlaylistDetails;
}

const EditModal = ({ isEditOpen, closeEdit, playlist }: EditModalProps) => {
  // We receive the value of DownloadQuality from the backend, so we need to recover the key
  // (cause it's what we send to the backend when saving the form)
  const qualityKey = Object.keys(DownloadQuality).find(
    (key) =>
      DownloadQuality[key as keyof typeof DownloadQuality] ==
      playlist.default_quality
  );

  const [formData, setFormData] = useState({
    title: playlist.title,
    folder: playlist.folder,
    check_every_day: playlist.check_every_day,
    default_format: playlist.default_format,
    default_quality: qualityKey || "q_best",
    default_subtitles: playlist.default_subtitles,
  });

  useEffect(() => {
    setFormData({
      title: playlist.title,
      folder: playlist.folder,
      check_every_day: playlist.check_every_day,
      default_format: playlist.default_format,
      default_quality: qualityKey || "q_best",
      default_subtitles: playlist.default_subtitles,
    });
  }, [playlist]);

  const [validationError, setValidationError] = useState<{
    title?: string;
    folder?: string;
  }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    let newValue = value;
    let error = "";

    if (name === "title") {
      if (/[<>:"/\\|?*\x00-\x1F]/.test(value)) {
        error =
          "Le titre contient des caractères invalides pour un nom de fichier.";
        newValue = value
          .replace(/[<>:"\\|?*\x00-\x1F]/g, "") // on supprime les caractères invalides sauf /
          .replace(/\//g, "-"); // on remplace les / par des -
      }
    }

    if (name === "folder") {
      if (!value.startsWith("/")) {
        error = "Le chemin du dossier doit commencer par '/'.";
      }
      if (/[<>:"\\|?*\x00-\x1F]/.test(value)) {
        error = "Le dossier contient des caractères invalides.";
        newValue = newValue.replace(/[<>:"\\|?*\x00-\x1F]/g, "");
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

  const saveEdits = async () => {
    formData.title = formData.title.trim();
    formData.folder = formData.folder.trim();
    try {
      const response = await fetch(
        `${endpointPlaylists}/${playlist.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to save options");
      }
      mutate(`${endpointPlaylists}/${playlist.id}/details`);
      // successToast({
      //   title: "Options saved",
      //   description: "Your changes have been saved.",
      // });
      closeEdit();
    } catch (error) {
      console.error("Error saving options:", error);
      errorToast({ title: "Error", description: "Failed to save options." });
    }
  };

  return (
    <Modal isOpen={isEditOpen} onClose={closeEdit}>
      <ModalContent>
        <ModalHeader className="border-b pb-2 text-lg text-[goldenrod] font-semibold mb-4">
          Download Options
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4 p-4 lg:flex justify-between gap-6">
            <div className="flex-2 space-y-4 max-w-[500px]">
              <div>
                <label className="block text-md font-bold text-[goldenrod]">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                />
                {validationError.title && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationError.title}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-md font-bold text-[goldenrod]">Folder</label>
                <input
                  type="text"
                  name="folder"
                  value={formData.folder || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                />
                {validationError.folder && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationError.folder}
                  </p>
                )}
              </div>
              <div className="flex justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="check_every_day"
                    checked={formData.check_every_day || false}
                    onChange={handleChange}
                    className="h-5 w-5"
                  />
                  <span className="text-md font-medium text-[goldenrod]">Check Every Day</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="default_subtitles"
                    checked={formData.default_subtitles || false}
                    onChange={handleChange}
                    className="h-5 w-5"
                  />
                  <span className="text-md font-medium text-[goldenrod]">Subtitles</span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <span className="block text-md font-bold text-[goldenrod]">
                  Default Format
                </span>
                <div className="flex space-x-4 mt-1">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="default_format"
                      value={DownloadFormat.AUDIO}
                      checked={formData.default_format === DownloadFormat.AUDIO}
                      onChange={handleChange}
                    />
                    <span>Audio Only</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="default_format"
                      value={DownloadFormat.VIDEO}
                      checked={formData.default_format === DownloadFormat.VIDEO}
                      onChange={handleChange}
                    />
                    <span>Video</span>
                  </label>
                </div>
              </div>
              <div>
                <span className="block text-md font-bold text-[goldenrod]">
                  Default Quality
                </span>
                <div className="flex flex-wrap gap-4 mt-1">
                  {Object.entries(DownloadQuality).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex space-x-2" // Fixed width
                    >
                      <input
                        type="radio"
                        name="default_quality"
                        value={key}
                        checked={formData.default_quality == key}
                        onChange={handleChange}
                      />
                      <span>{key.replace("q_", "").toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={closeEdit}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={saveEdits}
            disabled={!!validationError.title || !!validationError.folder}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Edits
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditModal;
