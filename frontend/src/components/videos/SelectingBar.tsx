import errorToast from "../toasts/errorToast";

interface SelectingBarProps {
  selectedVideos: string[];
  setIsSelecting: (value: boolean) => void;
  playlist: {
    videos: { id: string }[];
  };
  handleSelectAll: () => void;
  handleDownloadSelected: () => void;
  handleDeleteSelected: () => void;
}

const SelectingBar = ({
  selectedVideos,
  setIsSelecting,
  playlist,
  handleDeleteSelected,
  handleDownloadSelected,
  handleSelectAll,
}: SelectingBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 text-white px-4 py-3 flex justify-center gap-4 items-center z-50">
      {/* Cancel selection */}
      <button
        className="text-sm px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded"
        onClick={() => setIsSelecting(false)}
      >
        Cancel
      </button>

      {/* Select All / Unselect All */}
      <button
        className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
        onClick={handleSelectAll}
      >
        {selectedVideos.length === playlist.videos.length
          ? "Unselect All"
          : "Select All"}
      </button>

      {/* Actions */}
        <button
          className="text-sm px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
          onClick={() => {
            if (selectedVideos.length === 0) {
              errorToast("Please select at least one video to delete.");
              return;
            }
            handleDeleteSelected();
          }}
        >
          Delete
        </button>
        <button
          className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 rounded"
          onClick={handleDownloadSelected}
        >
          Download
        </button>
    </div>
  );
};

export default SelectingBar;
