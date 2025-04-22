import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  onClick: () => void;
  isRefreshing: boolean;
  isDownloading: boolean;
}

const RefreshButton = ({ onClick, isRefreshing, isDownloading }: RefreshButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="text-blue-400 hover:text-blue-300 flex items-center cursor-pointer"
      disabled={isRefreshing || isDownloading}
    >
      <RefreshCw
        size={20}
        className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}
      />
      <span className="sm:inline hidden">
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </span>
    </button>
  );
};

export default RefreshButton;
