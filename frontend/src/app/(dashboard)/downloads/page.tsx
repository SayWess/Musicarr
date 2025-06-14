"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import axios from "axios";
import { endpointVideos } from "@/constants/endpoints";
import { extractYouTubeId } from "@/utils/extractYouTubeId";

export default function Downloads() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDataFetch = async () => {
    if (!url.trim()) return;
  
    const extracted = extractYouTubeId(url, "Playlist"); // will be changed later
    if (!extracted) {
      alert("Invalid YouTube URL!");
      return;
    }
  
    setLoading(true);
  
    // try {
    //   const response = await axios.post(`${extracted.type}/${extracted.id}`);
  
    //   console.log("Data fetched:", response.data);
    //   alert(`Fetched ${extracted.type}: ${extracted.id}`);
    // } catch (error) {
    //   console.error("Error fetching data:", error);
    //   alert("Failed to fetch data.");
    // } finally {
    //   setLoading(false);
    // }
    console.log("Will soon disappear")

    setLoading(false);


  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
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
          onClick={handleDataFetch}
          disabled={loading}
          className="flex items-center justify-center px-4 py-3 sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:bg-gray-400"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Download size={20} />}
          <span className="ml-2">Fetch Data</span>
        </button>
      </div>
    </div>
  );
}
