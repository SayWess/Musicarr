"use client";

import { useState, useImperativeHandle, forwardRef, useEffect } from "react";

export interface MusicSearchOverlayHandle {
  openSearch: () => void;
}

const MusicSearchOverlay = forwardRef<MusicSearchOverlayHandle>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Expose openSearch() to parent via ref
  useImperativeHandle(ref, () => ({
    openSearch: () => {
      setOpen((prev) => {
        const next = !prev;
        localStorage.setItem("musicSearchOpen", String(next));
        return next;
      });
    },
  }));

  // Load open state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("musicSearchOpen");
    if (stored === "true") setOpen(true);
  }, []);

  // Close handler
  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("musicSearchOpen", "false");
  };

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.length > 0) setResults([`${q} Song 1`, `${q} Song 2`, `${q} Song 3`]);
    else setResults([]);
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 flex flex-col justify-end items-center z-[70] pointer-events-none">
      {/* Results */}
      {results.length !== 0 && (
        <div
          className={`pointer-events-auto w-full max-w-md mb-5 bg-gray-800 rounded-lg shadow-lg p-2 space-y-1 transition-all duration-300 ease-in-out transform ${
            open ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {results.map((r, i) => (
            <div key={i} className="p-2 rounded hover:bg-gray-700 cursor-pointer">
              {r}
            </div>
          ))}
        </div>
      )}

      {/* Search Bar */}
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
