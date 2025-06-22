"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Trash2 } from "lucide-react";
import clsx from "clsx";
import { endpointPaths } from "@/constants/endpoints";
import axios from "axios";
import errorToast from "@/components/toasts/errorToast";
import ConfirmDeleteModal from "@/components/settings/rootFolders/ConfirmDeleteModal";

interface Props {
  fetchPaths: () => Promise<void>;
  paths: { path: string; default: boolean }[];
}

export default function ListRootFolder({ fetchPaths, paths }: Props) {
  const [changingDefault, setChangingDefault] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  async function handleSetDefault(path: string) {
    setChangingDefault(path);
    try {
      await axios.put(`${endpointPaths}/default`, { path });
      await fetchPaths();
    } catch (error) {
      console.error("Error setting default path:", error);
      errorToast("Failed to set default path. Please check the console for details.");
    }
    setChangingDefault(null);
  }

  async function handleDeletePath(path: string, deleteFiles: boolean) {
    try {
      await axios.delete(`${endpointPaths}/`, {
        params: { path, delete_files: deleteFiles },
      });
      await fetchPaths();
    } catch (error) {
      console.error("Failed to delete path:", error);
      errorToast("Failed to delete path");
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold text-white mb-4">Root Folders</h2>

      <div className="space-y-3">
        {paths.map((p) => (
          <div
            key={p.path}
            className={clsx(
              "flex justify-between items-center px-4 py-3 rounded-xl border transition-all duration-200",
              p.default
                ? "bg-blue-900/30 border-blue-600"
                : "bg-gray-800 border-gray-700 hover:border-blue-500"
            )}
          >
            <div className="font-mono text-sm text-white">{p.path}</div>

            <div className="flex gap-2 items-center">
              {p.default ? (
                <CheckCircle className="text-blue-500" size={22} />
              ) : (
                <button
                  onClick={() => handleSetDefault(p.path)}
                  disabled={changingDefault === p.path}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {changingDefault === p.path ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Set Default"
                  )}
                </button>
              )}
              <button
                onClick={() => setPendingDelete(p.path)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {paths.length === 0 && (
          <div className="text-gray-400 text-sm">No root folders found. Add a new one below.</div>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDeleteModal
          path={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={(deleteFiles) => handleDeletePath(pendingDelete, deleteFiles)}
        />
      )}
    </section>
  );
}
