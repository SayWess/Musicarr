"use client";

import { useRef, useState } from "react";

interface UploadFileProps {
  label: string;
  apiUrl: string;
}

export default function UploadFile({ label, apiUrl }: UploadFileProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUploadFile(evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    evt.preventDefault();

    if (!fileInput?.current?.files?.[0]) return;

    const formData = new FormData();
    formData.append("file", fileInput.current.files[0]);

    setLoading(true);
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log(result);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <label className="w-full">
        <span className="block text-sm font-medium mb-2">{label}</span>
        <div className="flex items-center gap-3">
          {/* input caché */}
          <input
            type="file"
            name="file"
            ref={fileInput}
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
          />

          {/* bouton pour ouvrir le file picker */}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="inline-flex items-center rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            📂 {fileName ? "Changer le fichier" : "Choisir un fichier"}
          </button>

          {/* affiche le nom du fichier */}
          {fileName && <span className="text-sm text-gray-600 truncate max-w-[150px]">{fileName}</span>}
        </div>
      </label>

      {/* bouton submit */}
      <button
        type="submit"
        onClick={handleUploadFile}
        disabled={loading || !fileName}
        className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
          loading || !fileName
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        }`}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Uploading...
          </>
        ) : (
          "Submit"
        )}
      </button>
    </section>
  );
}
