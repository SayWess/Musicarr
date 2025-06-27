"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  path: string;
  onCancel: () => void;
  onConfirm: (deleteFiles: boolean) => void;
}

export default function ConfirmDeleteModal({ path, onCancel, onConfirm }: Props) {
  const [deleteEnabled, setDeleteEnabled] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setDeleteEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      onCancel();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={backdropRef}
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-gray-900 text-white rounded-xl shadow-xl p-6 w-full max-w-md relative"
        >
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-white"
            onClick={onCancel}
          >
            <X size={24} />
          </button>

          <h3 className="text-lg font-semibold mb-4">Delete Root Folder</h3>
          <p className="mb-4 text-md text-gray-300">
            Are you sure you want to delete <span className="font-bold">{path}</span>?
          </p>

          <div className="space-y-2">
            {!confirmingDelete ? (
              <>
                <button
                  onClick={() => onConfirm(false)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Remove from database only
                </button>

                <button
                  onClick={() => deleteEnabled && setConfirmingDelete(true)}
                  disabled={!deleteEnabled}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {deleteEnabled
                    ? "Delete folder and all contents"
                    : `Delete folder in ${countdown}s`}
                </button>
              </>
            ) : (
              <>
                <div className="text-md text-gray-300 text-center">
                  This will permanently delete the folder and its files.<br />
                  Are you absolutely sure? <br />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onConfirm(true)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="flex-1 border border-gray-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
