"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function Downloads() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    if (!url.trim()) return;
    setLoading(true);

    // Simulation d'un download (remplacera plus tard l'appel au backend)
    setTimeout(() => {
      setLoading(false);
      alert("Download started! (Backend integration needed)");
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Download Videos or Playlists</h1>

      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 max-w-lg">
        <input
          type="url"
          placeholder="Enter YouTube URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="p-3 border-2 border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-lg text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400"
          required
        />
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex items-center justify-center px-4 py-3 sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:bg-gray-400"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Download size={20} />}
          <span className="ml-2">Download</span>
        </button>
      </div>
    </div>
  );
}
