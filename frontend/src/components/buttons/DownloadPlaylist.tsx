import { Download } from "lucide-react";

interface DownloadPlaylistButtonProps {
  onClick: () => void;
  isDownloading: boolean;
}

const DownloadPlaylistButton = ({ onClick, isDownloading }: DownloadPlaylistButtonProps) => {
  return (
    <button
        onClick={onClick}
        disabled={isDownloading}
        className="text-green-400 hover:text-green-300 flex items-center"
      >
        <Download size={20} className="mr-2" /> 
        <span className="sm:inline hidden">{ isDownloading ? "Downloading" : "Download" }</span>
      </button>
  );
};

export default DownloadPlaylistButton;
