"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, Loader2 } from "lucide-react";
import successToast from "@/components/toasts/successToast";
import errorToast from "@/components/toasts/errorToast";

interface UploadFileProps {
  label: string;
  apiUrl: string;
}

export default function UploadFile({ label, apiUrl }: UploadFileProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File | undefined) => {
    if (file) setFileName(file.name);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  async function handleUploadFile(evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    evt.preventDefault();
    if (!fileInput?.current?.files?.[0]) return;

    const formData = new FormData();
    formData.append("file", fileInput.current.files[0]);

    setLoading(true);
    try {
      const response = await fetch(apiUrl, { method: "POST", body: formData });
      const result = await response.json();

      if (!response.ok) {
        errorToast("Upload failed: " + (result?.detail || "Unknown error"));
      } else {
        successToast("Upload successful");
        setFileName(null);
        if (fileInput.current) fileInput.current.value = "";
      }
    } catch (err) {
      errorToast("Upload failed: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 w-fit">
      <label>
        <span className="block text-sm font-medium mb-2">{label}</span>

        {/* Compact Drag & Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex items-center justify-between text-sm text-blue-400 gap-3 rounded-lg border-2 hover:border-blue-600 px-3 py-2 text-sm transition w-fit
        ${dragOver ? "border-blue-600" : "border-blue-400"}
      `}
        >
          {/* Hidden input */}
          <input
            type="file"
            ref={fileInput}
            disabled={loading}
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />

          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <button
              type="button"
              disabled={loading}
              onClick={() => fileInput.current?.click()}
              className="font-medium hover:underline focus:outline-none"
            >
              {fileName ? "Changer" : "Choisir un fichier"}
            </button>
          </div>

          <AnimatePresence>
            {fileName && (
              <motion.span
                key={fileName}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                className="flex items-center gap-1 text-blue-200 truncate max-w-[160px]"
              >
                <File className="h-5 w-5" />
                <span className="truncate">{fileName}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </label>

      {loading && <p>Please wait for the upload to be completed</p>}

      {/* Compact Submit Button */}
      <button
        type="submit"
        onClick={handleUploadFile}
        disabled={loading || !fileName}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-white shadow-sm transition w-fit ${
          loading || !fileName
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" />
            Uploading...
          </>
        ) : (
          "Upload"
        )}
      </button>
    </section>
  );
}
