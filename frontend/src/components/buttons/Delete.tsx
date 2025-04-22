import { Trash } from "lucide-react";

interface DeleteButtonProps {
  onClick: () => void;
  isRefreshing: boolean;
  isDownloading: boolean;
}

const DeleteButton = ({ onClick, isRefreshing, isDownloading }: DeleteButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isDownloading || isRefreshing}
      className="text-red-400 hover:text-red-300 flex items-center cursor-pointer"
    >
      <Trash size={20} className="mr-2" />{" "}
      <span className="sm:inline hidden">Delete</span>
    </button>
  );
};

export default DeleteButton;
