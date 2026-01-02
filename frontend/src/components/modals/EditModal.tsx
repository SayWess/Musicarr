import { useState, useEffect, use } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@/components/modals/Modal";
import { endpointPaths, endpointPlaylists } from "@/constants/endpoints";
import { mutate } from "swr";
import { PlaylistDetails, DownloadFormat, DownloadQuality } from "@/types/models";
import errorToast from "../toasts/errorToast";
import { Info } from "lucide-react";
import axios from "axios";

interface PathItem {
  path: string;
  default: boolean;
}

interface EditModalProps {
  isEditOpen: boolean;
  closeEdit: () => void;
  playlist: PlaylistDetails;
}

const EditModal = ({ isEditOpen, closeEdit, playlist }: EditModalProps) => {
  // We receive the value of DownloadQuality from the backend, so we need to recover the key
  // (cause it's what we send to the backend when saving the form)
  const qualityKey = Object.keys(DownloadQuality).find(
    (key) => DownloadQuality[key as keyof typeof DownloadQuality] == playlist.default_quality
  );

  const [formData, setFormData] = useState({
    title: playlist.title,
    folder: playlist.folder,
    download_path: playlist.download_path,
    check_every_day: playlist.check_every_day,
    default_format: playlist.default_format,
    default_quality: qualityKey || "q_best",
    default_subtitles: playlist.default_subtitles,
  });

  useEffect(() => {
    setFormData({
      title: playlist.title,
      folder: playlist.folder,
      download_path: playlist.download_path,
      check_every_day: playlist.check_every_day,
      default_format: playlist.default_format,
      default_quality: qualityKey || "q_best",
      default_subtitles: playlist.default_subtitles,
    });
  }, [playlist]);

  const [validationError, setValidationError] = useState<{
    title?: string;
    folder?: string;
    download_path?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    let newValue = value;
    let error = "";

    if (name === "title") {
      if (/[<>:"/\\|?*\x00-\x1F]/.test(value)) {
        error = "Le titre contient des caractères invalides pour un nom de fichier.";
        newValue = value
          .replace(/[<>:"\\|?*\x00-\x1F]/g, "") // on supprime les caractères invalides sauf /
          .replace(/\//g, "-"); // on remplace les / par des -
      }
    }

    if (name === "folder" || name === "download_path") {
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
    formData.download_path = formData.download_path.trim();

    if (!paths.some((p) => p.path === formData.folder)) {
      setValidationError((prev) => ({
        ...prev,
        folder: "Le dossier sélectionné n'est pas un chemin valide.",
      }));
      return;
    }

    try {
      const response = await fetch(`${endpointPlaylists}/${playlist.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Failed to save options");
      }
      mutate(`${endpointPlaylists}/${playlist.id}/details`);
      closeEdit();
    } catch (error) {
      console.error("Error saving options:", error);
      errorToast("Error", "Failed to save options.");
    }
  };

  const [showTooltip, setShowTooltip] = useState(false);

  const [paths, setPaths] = useState<PathItem[]>([]);
  const [loadingPaths, setLoadingPaths] = useState(false);

  useEffect(() => {
    setLoadingPaths(true);
    fetchPaths();
    setLoadingPaths(false);
  }, []);

  async function fetchPaths() {
    try {
      const res = await axios.get<PathItem[]>(`${endpointPaths}/`);
      setPaths(res.data);
    } catch (error) {
      console.error("Error fetching paths:", error);
      errorToast("Failed to fetch paths. Please check the console for details.");
    }
  }

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
                <label htmlFor="title" className="block text-md font-bold text-[goldenrod]">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  className="w-full p-2 border ring rounded focus:ring-blue-300"
                />
                {validationError.title && (
                  <p className="text-sm text-red-500 mt-1">{validationError.title}</p>
                )}
              </div>
              <div>
                <label htmlFor="folder" className="block text-md font-bold text-[goldenrod]">
                  Root Folder
                </label>

                {loadingPaths ? (
                  <div className="text-sm text-gray-400">Loading paths...</div>
                ) : (
                  <select
                    id="folder"
                    name="folder"
                    value={paths.some((p) => p.path === formData.folder) ? formData.folder : ""}
                    onChange={handleChange}
                    className="w-full p-2 border ring rounded bg-gray-900 text-white"
                  >
                    <option value="" disabled>
                      Select a root path
                    </option>
                    {paths.map((p, idx) => (
                      <option key={idx} value={p.path}>
                        {p.path}
                      </option>
                    ))}
                  </select>
                )}

                {validationError.folder && (
                  <p className="text-sm text-red-500 mt-1">{validationError.folder}</p>
                )}
              </div>

              <div>
                <label htmlFor="download_path" className="block text-md font-bold text-[goldenrod]">
                  Download Path
                </label>
                <input
                  id="download_path"
                  type="text"
                  name="download_path"
                  value={formData.download_path || ""}
                  onChange={handleChange}
                  className="w-full p-2 border ring rounded focus:ring-blue-300"
                />
                {validationError.download_path && (
                  <p className="text-sm text-red-500 mt-1">{validationError.download_path}</p>
                )}
              </div>

              <div className="flex justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <input
                    id="check_every_day"
                    type="checkbox"
                    name="check_every_day"
                    checked={formData.check_every_day || false}
                    onChange={handleChange}
                    className="h-5 w-5"
                  />
                  <label htmlFor="check_every_day" className="text-md font-medium text-[goldenrod]">
                    Check Every Day
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="default_subtitles"
                    type="checkbox"
                    name="default_subtitles"
                    checked={formData.default_subtitles || false}
                    onChange={handleChange}
                    className="h-5 w-5"
                  />
                  <label htmlFor="default_subtitles" className="text-md font-medium text-[goldenrod]">
                    Subtitles
                  </label>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <span className="block text-md font-bold text-[goldenrod]">Default Format</span>
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
                <div className="relative">
                  <button
                    className="block text-md font-medium text-[goldenrod] flex items-center cursor-help"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={() => setShowTooltip(!showTooltip)}
                  >
                    Default Quality <Info size={16} className="ml-1" />
                  </button>

                  {/* Tooltip */}
                  {showTooltip && (
                    <div className="absolute z-50 mt-2 ml-2 w-64 bg-gray-800 text-sm text-gray-200 rounded-md px-3 py-2 shadow-lg">
                      The video quality selected may not be available, it will however use the nearest quality
                      from the one you selected.
                    </div>
                  )}
                </div>
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
