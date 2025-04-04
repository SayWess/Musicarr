import { Download } from "lucide-react";

interface DownloadPlaylistButtonProps {
  onClick: () => void;
}

const DownloadPlaylistButton = ({ onClick }: DownloadPlaylistButtonProps) => {
  return (
    <button
        onClick={onClick}
        className="text-green-400 hover:text-green-300 flex items-center"
      >
        <Download size={20} className="mr-2" /> 
        <span className="sm:inline hidden">Download</span>
      </button>
  );
};

export default DownloadPlaylistButton;
