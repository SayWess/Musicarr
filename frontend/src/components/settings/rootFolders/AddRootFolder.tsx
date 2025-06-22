"use client";

import { useRef, useState } from "react";
import { Loader2, Plus, Folder, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { endpointPaths } from "@/constants/endpoints";
import errorToast from "@/components/toasts/errorToast";

interface Props {
  onPathAdded?: () => void;
}

export default function AddRootFolder({ onPathAdded }: Props) {
  const [newPathName, setNewPathName] = useState("");
  const [adding, setAdding] = useState(false);

  const [showMountModal, setShowMountModal] = useState(false);
  const [mountPaths, setMountPaths] = useState<string[]>([]);
  const [currentMountPath, setCurrentMountPath] = useState<string>("");
  const [loadingMounts, setLoadingMounts] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  
  const handleAddPath = async () => {
    if (!newPathName.trim()) {
      errorToast("Path name cannot be empty.");
      setNewPathName("");
      return;
    }

    setAdding(true);
    try {
      const response = await axios.post(endpointPaths, { path: newPathName });
      if ("error" in response.data) {
        errorToast(response.data.error || "Failed to add path");
        return;
      }
      setNewPathName("");
      onPathAdded?.();
    } catch (err) {
      errorToast("Failed to add path.");
    } finally {
      setAdding(false);
    }
  };

  const fetchMountPaths = async (subpath = "") => {
    setLoadingMounts(true);
    try {
      const { data } = await axios.get(endpointPaths + "/mounts", {
        params: { path: subpath },
      });
      setMountPaths(data);
      setCurrentMountPath(subpath);
    } catch (err) {
      errorToast("Failed to fetch mount paths.");
    } finally {
      setLoadingMounts(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      setShowMountModal(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold text-white mb-3">Add Root Folder</h2>

      <div className="flex items-center gap-3">
        <input
          type="text"
          className="flex-1 p-2.5 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={newPathName}
          onChange={(e) => setNewPathName(e.target.value)}
          placeholder="e.g. videos"
        />
        <button
          onClick={handleAddPath}
          disabled={adding}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition disabled:opacity-50"
        >
          {adding ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
        </button>
      </div>

      <div className="mt-3">
        <button
          onClick={() => {
            setShowMountModal(true);
            fetchMountPaths();
          }}
          className="text-sm text-blue-400 hover:underline flex items-center gap-1"
        >
          <Folder size={16} />
          Choose from /Media
        </button>
      </div>

      <AnimatePresence>
        {showMountModal && (
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
                onClick={() => setShowMountModal(false)}
              >
                <X size={24} />
              </button>

              <h3 className="text-lg font-semibold mb-4">Select a mount point</h3>

              {currentMountPath && (
                <button
                  onClick={() => {
                    const parentPath = currentMountPath.split("/").slice(0, -1).join("/");
                    fetchMountPaths(parentPath);
                  }}
                  className="text-sm text-blue-400 hover:underline mb-2"
                >
                  ← Go up
                </button>
              )}

              {loadingMounts ? (
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {mountPaths.map((p) => {
                    const name = p.split("/").pop() || p;
                    return (
                      <li key={p}>
                        <button
                          onClick={() => fetchMountPaths(p.split("/").slice(1).join("/"))}
                          className="w-full text-left bg-gray-800 hover:bg-gray-700 p-3 rounded-lg font-mono flex justify-between items-center"
                        >
                          <span>{name}</span>
                          <Folder size={16} />
                        </button>
                      </li>
                    );
                  })}

                  {mountPaths.length === 0 && (
                    <li className="text-gray-400 text-sm">No mount points found.</li>
                  )}
                </ul>
              )}

              <button
                onClick={() => {
                  setShowMountModal(false);
                  if (currentMountPath) {
                    setNewPathName(currentMountPath);
                  }
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
              >
                Select Path
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
