import { Trash } from "lucide-react";

interface DeleteButtonProps {
  onClick: () => void;
}

const DeleteButton = ({ onClick }: DeleteButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="text-red-400 hover:text-red-300 flex items-center"
    >
      <Trash size={20} className="mr-2" />{" "}
      <span className="sm:inline hidden">Delete</span>
    </button>
  );
};

export default DeleteButton;
