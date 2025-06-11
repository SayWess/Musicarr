"use client";

import { PlaylistItem } from "@/components/playlists/PlaylistItem";
import usePlaylists from "@/hooks/usePlaylists";
import { Playlist } from "@/types/models";
import AddItem from "@/components/floating-options/AddItem";
import { useState } from "react";
import { LayoutPanelTop, LayoutGrid } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { SortVideos } from "@/components/floating-options/SortItems";
import { OptionsFloatingMenu } from "@/components/floating-options/OptionsFloatingMenu";
import { endpointPlaylists } from "@/constants/endpoints";
import { VALID_SORT_FIELDS_PLAYLISTS, SortField, SortOrder } from "@/constants/sortFields";
import { COOKIE_KEY_PLAYLISTS } from "@/constants/cookies_keys";

interface PlaylistsProps {
  initialPlaylists: Playlist[];
  initialSortBy: SortField;
  initialSortOrder: SortOrder;
  initialIsGridSmall: boolean;
}

export default function Playlists(props: PlaylistsProps) {
  const { initialPlaylists, initialSortBy, initialSortOrder, initialIsGridSmall } = props;
  const [sortBy, setSortBy] = useState<SortField>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

  console.log("Playlists", sortBy, sortOrder);
  const { playlists, isLoading, isError, toggleCheckEveryDay } = usePlaylists(
    initialPlaylists,
    sortBy,
    sortOrder
  );

  const [isGridSmall, setIsGridSmall] = useState(initialIsGridSmall);
  const handleGridSizeChange = (size: boolean) => {
    setIsGridSmall(size);
    document.cookie = `${COOKIE_KEY_PLAYLISTS}_grid_size=${size}; path=/; max-age=31536000; SameSite=Lax;`;
  };

  const optionsFloatingMenuParams = {
    SortVideosParams: {
      currentSortBy: sortBy,
      setSortBy,
      currentSortOrder: sortOrder,
      setSortOrder,
      validSortFields: [...VALID_SORT_FIELDS_PLAYLISTS],
      SWR_endpoint: `${endpointPlaylists}/`,
      cookie_key: COOKIE_KEY_PLAYLISTS,
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400 text-lg animate-pulse">Loading playlists...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg font-semibold">Failed to load playlists. 😢</p>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-200">Manage Playlists</h1>

        <button
          className="items-center cursor-pointer pr-2 relative w-6 h-6"
          onClick={() => handleGridSizeChange(!isGridSmall)}
        >
          <div className="absolute inset-0 transition-opacity duration-300 ease-in-out transform" key="grid">
            <LayoutGrid
              size={24}
              className={clsx(
                "text-white transition-all duration-300 ease-in-out absolute inset-0",
                isGridSmall ? "opacity-100 scale-100" : "opacity-0 scale-90"
              )}
            />
            <LayoutPanelTop
              size={24}
              className={clsx(
                "text-white transition-all duration-300 ease-in-out absolute inset-0",
                isGridSmall ? "opacity-0 scale-90" : "opacity-100 scale-100"
              )}
            />
          </div>
        </button>
      </div>

      <OptionsFloatingMenu>
        <SortVideos {...optionsFloatingMenuParams.SortVideosParams} />
        <AddItem />
      </OptionsFloatingMenu>

      <motion.div
        layout
        variants={{
          show: { transition: { staggerChildren: 0.05 } },
          hidden: {},
        }}
        initial="hidden"
        animate="show"
        style={isGridSmall ? styles.grid_small : styles.grid}
      >
        <AnimatePresence mode="popLayout">
          {playlists.map((playlist: Playlist) => (
            <motion.div
              key={playlist.id}
              layout
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1 },
              }}
              transition={{ duration: 0.3 }}
              style={{ willChange: "transform, opacity" }}
            >
              <PlaylistItem
                key={playlist.id}
                playlist={playlist}
                toggleCheckEveryDay={toggleCheckEveryDay}
                isGridSmall={isGridSmall}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(225px, 1fr))",
    gap: "1.5rem",
  },
  grid_small: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "1.5rem",
  },
};
