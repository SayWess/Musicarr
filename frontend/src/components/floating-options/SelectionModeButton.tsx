import { useState, useEffect, useRef } from "react";
import { AlignVerticalJustifyStart, X } from "lucide-react";

export interface SelectionModeProps {
  setIsSelecting: (isSelecting: boolean) => void;
}

export const SelectionModeButton = (props: SelectionModeProps) => {
  const { setIsSelecting } = props;

  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  return (
    <button
      onClick={() => setIsSelecting(true)}
      className="px-4 py-2 bg-blue-600 text-white z-20 rounded-full shadow-lg"
    >
      <AlignVerticalJustifyStart size={20} />
    </button>
  );
};
