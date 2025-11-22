"use client";

import { useState, useImperativeHandle, forwardRef, useEffect, useRef } from "react";
import { endpointSearchMusic } from "@/constants/endpoints";
import { AddSearchItemButton } from "@/components/buttons/AddSearchedItem";

export interface MusicSearchOverlayHandle {
  openSearch: () => void;
}

const MusicSearchOverlay = forwardRef<MusicSearchOverlayHandle>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [source, setSource] = useState<"youtube" | "ytmusic">("youtube");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "song" | "album" | "artist" | "video" | "playlist" | "channel"
  >("all");
  const [channelFilter, setChannelFilter] = useState("");
  const [mounted, setMounted] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Expose openSearch() to parent
  useImperativeHandle(ref, () => ({
    openSearch: () => {
      setOpen((prev) => {
        const next = !prev;
        localStorage.setItem("musicSearchOpen", String(next));
        return next;
      });
    },
  }));

  // Load open state on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("musicSearchOpen");
    if (stored === "true") setOpen(true);
  }, []);

  // Re-run search when filters change
  useEffect(() => {
    if (query.trim().length === 0) return;

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchBackend(query);
    }, 300);
  }, [source, typeFilter, channelFilter]);

  // Ensure the filter is valid when source changes
  useEffect(() => {
    if (source === "ytmusic") {
      if (!["all", "song", "album", "artist"].includes(typeFilter)) {
        setTypeFilter("all");
      }
    } else {
      if (!["video", "playlist", "channel"].includes(typeFilter)) {
        setTypeFilter("video");
      }
    }
  }, [source]);

  // Close handler
  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("musicSearchOpen", "false");
  };

  // -----------------------------
  // MAIN SEARCH FUNCTION
  // -----------------------------
  const searchBackend = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(`${endpointSearchMusic}/search?query=${encodeURIComponent(q)}&source=${source}&type_filter=${typeFilter}${channelFilter.trim().length > 0 ? `&channel_name=${encodeURIComponent(channelFilter)}` : ''}`);
      const data = await res.json();
      setResults(data || []);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    }
  };

  const handleSearch = (q: string) => {
    setQuery(q);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchBackend(q);
    }, 300); // delay before sending the request
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 flex flex-col justify-end items-center z-[70] pointer-events-none">
      {/* -------------------- RESULTS -------------------- */}
      {results.length !== 0 && (
        <div
          className={`pointer-events-auto w-full max-w-md max-h-[75vh] overflow-y-auto mb-5 bg-gray-800 rounded-lg shadow-lg p-2 space-y-1 transition-all duration-300 ease-in-out transform ${
            open ? "opacity-100 scale-100" : "opacity-0 scale-0"
          }`}
        >
          {results.map((r, i) => (
            <div key={i} className="p-2 rounded hover:bg-gray-700 cursor-pointer flex gap-2">
              {r.thumbnail && <img src={r.thumbnail} className="w-12 h-12 rounded object-cover" />}
              <div className="flex flex-col">
                <span className="font-medium">{r.title}</span>
                <span className="text-xs text-gray-400">
                  {r.type} — {r.channel || r.artist}
                </span>
              </div>

              <AddSearchItemButton item={r} />
            </div>
          ))}
        </div>
      )}

      {/* -------------------- FILTERS -------------------- */}

      <div
        className={`
      pointer-events-auto
      w-full max-w-md mb-3 px-4
      flex flex-wrap sm:flex-nowrap gap-2
      justify-center
      text-white
      transition-all duration-300 ease-in-out transform
      ${open ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}
    `}
        style={{ transformOrigin: "center" }}
      >
        {/* Source selector */}
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as any)}
          className="
        bg-gray-700 rounded px-2 py-1
      "
        >
          <option value="youtube">YouTube</option>
          <option value="ytmusic">YouTube Music</option>
        </select>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="
        bg-gray-700 rounded px-2 py-1
      "
        >
          <option value="all">All</option>
          <option value="video">Video</option>
          <option value="playlist">Playlist</option>
          {source === "ytmusic" ? (
            <>
              <option value="song">Song</option>
              <option value="album">Album</option>
              <option value="artist">Artist</option>
            </>
          ) : (
            <option value="channel">Channel</option>
          )}
        </select>

        {/* Channel fuzzy filter */}
        <input
          type="text"
          placeholder="Channel..."
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="
        bg-gray-700 rounded px-2 py-1 text-sm
      "
        />
      </div>

      {/* -------------------- SEARCH BAR -------------------- */}
      <div
        className={`pointer-events-auto w-full max-w-md mb-10 md:mb-3 px-4 relative transition-all duration-300 ease-in-out transform ${
          open ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
        }`}
        style={{ transformOrigin: "center" }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for music..."
          className="w-full p-3 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleClose}
          className="absolute top-0 right-0 mt-3 mr-6 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
});

MusicSearchOverlay.displayName = "MusicSearchOverlay";
export default MusicSearchOverlay;
