import { Download } from "lucide-react";

interface DownloadPlaylistButtonProps {
  onClick: () => void;
  isRefreshing: boolean;
  isDownloading: boolean;
}

const DownloadPlaylistButton = ({ onClick, isRefreshing, isDownloading }: DownloadPlaylistButtonProps) => {
  return (
    <button
        onClick={onClick}
        disabled={isDownloading || isRefreshing}
        className="text-green-400 hover:text-green-300 flex items-center cursor-pointer"
      >
        <Download size={20} className="mr-2" /> 
        <span className="sm:inline hidden">{ isDownloading ? "Downloading" : "Download" }</span>
      </button>
  );
};

export default DownloadPlaylistButton;
