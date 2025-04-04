import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  onClick: () => void;
  isRefreshing: boolean;
}

const RefreshButton = ({ onClick, isRefreshing }: RefreshButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="text-blue-400 hover:text-blue-300 flex items-center"
      disabled={isRefreshing}
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
