"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Loader2, Download, X } from "lucide-react";
import axios from "axios";
import { endpointApi } from "@/constants/endpoints";
import { extractYouTubeId } from "@/utils/extractYouTubeId";
import { mutate } from "swr";
import { toast } from "sonner";

const AddItem = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // const { connect, disconnect, isConnected } = useWebSocket();
  const actuelRoute = window.location.pathname;
  const itemType = actuelRoute.includes("playlists") ? "Playlist" : "Video";

  const handleDataFetch = async () => {
    if (!url.trim()) return;

    const extracted = extractYouTubeId(url);
    if (!extracted) {
      setOpen(false);
      toast.error("Invalid YouTube URL!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${endpointApi}/${extracted.type}/${extracted.id}`
      );

      if (response.data.error) {
        toast.error(`${itemType} already exists!`);
        setLoading(false);
        return;
      }

      mutate(`${endpointApi}/${extracted.type}`);

      toast.info(
        `Fetching data for ${extracted.type.substring(0, -1)}: ${extracted.id}`
      );
      toast.success(`${itemType} added!`);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
      setOpen(false);
      setUrl("");
    }
  };

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      {/* Floating "Add" Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed z-10 bottom-1 mb-10 md:mb-2 right-0 transform -translate-x-1/2 
             bg-blue-600 hover:bg-blue-700 text-white
             p-4 rounded-full shadow-lg transition"
      >
        <Plus size={24} className="md:size-8" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed z-100 inset-0 flex items-center justify-center bg-black/50 min-h-[105vh] h-[100%]">
          <div
            className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-80 relative"
            ref={menuRef}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3"
            >
              <X size={24} className="text-gray-400 hover:text-white" />
            </button>

            <h2 className="text-xl font-bold mb-4">Add {itemType}</h2>

            <input
              type="url"
              placeholder="Enter YouTube URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 border-2 border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-lg"
              required
            />

            <button
              onClick={handleDataFetch}
              disabled={loading}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition disabled:bg-gray-400 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                <Download size={20} />
              )}
              <span className="ml-2">Add item</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddItem;
