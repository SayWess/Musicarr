import { Menu } from "lucide-react";
import { useEffect, useRef, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OptionsFloatingMenuProps {
  children: ReactNode;
}

export const OptionsFloatingMenu = ({ children }: OptionsFloatingMenuProps) => {
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
    <div className="fixed left-1/2 bottom-1 mb-10 md:mb-2 transform -translate-x-1/2 z-50">
      <AnimatePresence>
        {!showOptions && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={() => setShowOptions(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg"
          >
            <Menu size={20} />
          </motion.button>
        )}

        {showOptions && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="text-white rounded-lg shadow-lg gap-2 flex flex-row items-center"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
