import { Trash } from "lucide-react";

interface DeleteButtonProps {
  onClick: () => void;
  isDownloading: boolean;
}

const DeleteButton = ({ onClick, isDownloading }: DeleteButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isDownloading}
      className="text-red-400 hover:text-red-300 flex items-center"
    >
      <Trash size={20} className="mr-2" />{" "}
      <span className="sm:inline hidden">Delete</span>
    </button>
  );
};

export default DeleteButton;
