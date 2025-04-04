import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { useState } from "react";

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 50 },
};

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal,
  };
}

export const Modal = ({ children, isOpen, onClose }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-center items-center min-h-[100vh] h-[100%] z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-900 p-6 rounded-lg shadow-lg w-[90vw] md:w-[60vw] max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ModalContent = ({ children }: { children: ReactNode }) => {
  return <> {children} </>;
};

export const ModalHeader = ({ children, ...props }: { children: ReactNode; [key: string]: any }) => {
  return <div className="text-lg font-semibold mb-4 border-b pb-2" {...props} >{children}</div>;
};

export const ModalBody = ({ children }: { children: ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};

export const ModalFooter = ({ children, ...props }: { children: ReactNode ; [key: string]: any}) => {
  return <div className="flex justify-between space-x-2" {...props} >{children}</div>;
};
