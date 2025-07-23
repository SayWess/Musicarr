"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Loader2, Download, X } from "lucide-react";
import axios from "axios";
import { endpointApi } from "@/constants/endpoints";
import { extractYouTubeId } from "@/utils/extractYouTubeId";
import { mutate } from "swr";
import errorToast from "@/components/toasts/errorToast";
import infoToast from "@/components/toasts/infoToast";

const AddItem = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const actuelRoute = window.location.pathname;
  const itemType = actuelRoute.includes("videos") ? "Video" : "Playlist";

  const handleDataFetch = async () => {
    if (!url.trim()) {
      errorToast("Please enter a valid URL!");
      return;
    }

    const extracted = extractYouTubeId(url, itemType);
    if (!extracted) {
      setOpen(false);
      errorToast(`Not a ${itemType} or is an invalid URL!`);
      return;
    }

    if (extracted.type === "playlists" && itemType === "Video") {
      setOpen(false);
      errorToast("You cannot add a playlist as a video!");
      return;
    }

    if (extracted.type === "videos" && itemType === "Playlist") {
      setOpen(false);
      errorToast("You cannot add a video as a playlist!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${endpointApi}/${extracted.type}/${extracted.id}`);

      if (response.data.error) {
        errorToast(`${itemType} already exists!`);
        setLoading(false);
        return;
      }

      infoToast(`Fetching data for ${extracted.type.substring(0, -1)}: ${extracted.id}`);
    } catch (error) {
      console.error("Error fetching data:", error);
      errorToast("Failed to fetch data.");
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
      <button
        onClick={() => setOpen(true)}
        className="
          px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg"
      >
        <Plus size={20} />
      </button>

      {open && <div className="fixed w-full h-full z-25"></div>}

      {open && (
        <div
          ref={menuRef}
          className="bg-gray-900 text-white gap-2 flex flex-col ring-2 ring-gray-600 rounded-lg p-4 absolute bottom-12 left-1/2 transform -translate-x-1/2 w-100 max-w-[80vw] max-h-[80vh] z-50"
        >
          <button onClick={() => setOpen(false)} className="absolute top-3 right-3">
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
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Download size={20} />}
            <span className="ml-2">Add item</span>
          </button>
        </div>
      )}
    </>
  );
};

export default AddItem;
