import { Pencil } from "lucide-react";


interface EditButtonProps {
    onClick: () => void;
}

const EditButton = ({ onClick }: EditButtonProps) => {
    
    return (
      <button
      onClick={onClick}
      className="text-yellow-400 hover:text-yellow-300 flex items-center cursor-pointer"
    >
      <Pencil size={20} className="mr-2" /> <span className="sm:inline hidden">Edit</span>
    </button>
    )
}

export default EditButton;