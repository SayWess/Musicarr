"use client";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Circle } from "lucide-react";
import { Playlist } from "@/types/models";
import usePlaylists from "@/hooks/usePlaylists";
import { endpointPlaylists } from "@/constants/endpoints";
import { useEffect } from "react";
import { useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { endpointWebSocketPlaylists } from "@/constants/endpoints";

export const PlaylistItem = ({ playlist }: { playlist: Playlist }) => {
  const { toggleCheckEveryDay } = usePlaylists();
  const hasMissingVideos = playlist.missing_videos > 0;

  const [isRefreshing, setIsRefreshing] = useState(false);

  useWebSocket(`${endpointWebSocketPlaylists}`, (data) => {
    if (data.playlist_id === playlist.id && data.fetch_success === true) {
      console.log("WebSocket message received from Item:", data);
      setIsRefreshing(false);
    } else if (
      data.playlist_id === playlist.id &&
      data.fetch_success === false
    ) {
      setIsRefreshing(false);
    }
  },
  `playlist-item-${playlist.id}`);

  useEffect(() => {
    fetch(`${endpointPlaylists}/${playlist.id}/is_fetching`)
      .then((res) => res.json())
      .then((data) => {
        if (data.is_fetching) {
          setIsRefreshing(true);
        }
      })
      .catch((error) => {
        console.error("Error checking playlist refresh status:", error);
      });
  }, []);


  return (
    <Link
      href={`/playlists/${playlist.id}`}
      prefetch={true}
      className={`block bg-gray-900 text-gray-200 rounded-xl shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 hover:ring-2 hover:ring-blue-500/50 ${
        isRefreshing ? "animate-pulse" : ""
      }`}
    >
      {/* Thumbnail Container */}
      <div className="relative group overflow-hidden rounded-xl">
        {/* Image */}
        <Image
          src={playlist.thumbnail || "/404_page-not-found.webp"}
          alt={playlist.title}
          width={200}
          height={100}
          className="w-full min-h-40 object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Stronger Gradient Overlay & Title */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent pl-2 pt-3 pr-2 pb-1">
          <h2
            className="text-white font-bold truncate drop-shadow-xl"
            style={styles.title}
          >
            {playlist.title}
          </h2>
        </div>

        {/* Daily Check Toggle (Top-Right Corner) */}
        <button
          className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 rounded-full p-1 hover:bg-gray-800 transition duration-200"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCheckEveryDay(playlist.id);
          }}
        >
          {playlist.check_every_day ? (
            <CheckCircle size={20} className="text-blue-500" />
          ) : (
            <Circle size={20} className="text-gray-400" />
          )}
        </button>

        {/* Missing Videos Indicator (Bottom-Left) */}
        <span
          className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-md transition-all duration-300 ${
            hasMissingVideos
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {hasMissingVideos ? `${playlist.missing_videos}` : ""}
        </span>
      </div>
    </Link>
  );
};

const styles = {
  title: {
    fontSize: "1.1rem",
    color: "#E5E7EB",
  },
};
