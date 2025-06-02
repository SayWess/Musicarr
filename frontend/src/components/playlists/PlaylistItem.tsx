"use client";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Circle, User } from "lucide-react";
import { Playlist } from "@/types/models";
import usePlaylists from "@/hooks/usePlaylists";
import { endpointPlaylists } from "@/constants/endpoints";
import { useEffect } from "react";
import { useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  endpointWebSocketPlaylists,
  endpointUploadersAvatar,
} from "@/constants/endpoints";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { motion } from "framer-motion";
import clsx from "clsx";

export const PlaylistItem = ({
  playlist,
  toggleCheckEveryDay,
  isGridSmall,
}: {
  playlist: Playlist;
  toggleCheckEveryDay: (id: string) => void;
  isGridSmall: boolean;
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const { data: data, isLoading } = useSWR(
    `${endpointPlaylists}/${playlist.id}/number_of_videos_downloaded`,
    fetcher
  );

  useWebSocket(
    `${endpointWebSocketPlaylists}`,
    (data) => {
      if (data.playlist_id !== playlist.id) return;

      if (data.fetch_success === true) {
        console.log("WebSocket message received from Item:", data);
        setIsRefreshing(false);
      } else if (data.fetch_success === false) {
        setIsRefreshing(false);
      }

      if (data.download_success === true) {
        setIsDownloading(false);
      }
    },
    `playlist-item-${playlist.id}`
  );

  useEffect(() => {
    if (!playlist.id) return;

    let isMounted = true; // Prevents running twice due to re-renders

    fetch(`${endpointPlaylists}/${playlist.id}/is_fetching`)
      .then((res) => res.json())
      .then((data) => {
        if (data.is_fetching && isMounted) {
          setIsRefreshing(true);
        }
      })
      .catch((error) => {
        console.error("Error checking playlist refresh status:", error);
      });

    fetch(`${endpointPlaylists}/${playlist.id}/download_status`)
      .then((res) => res.json())
      .then((data) => {
        if (data.is_downloading && isMounted) {
          toast.info(`Playlist ${playlist.title} is being downloaded.`);
          setIsDownloading(true);
        }
      })
      .catch((error) => {
        console.error("Error checking playlist download status:", error);
      });
    return () => {
      isMounted = false; // Cleanup to avoid state updates on unmounted component
    };
  }, [playlist.id]);

  const avatarUrl = playlist.uploader_id
    ? `${endpointUploadersAvatar}/${encodeURIComponent(
        playlist.uploader_id
      )}.jpg`
    : "";

  const styles = {
    title: {
      fontSize: `${isGridSmall ? "0.8rem" : "1.1rem"}`,
      color: "#E5E7EB",
    },
  };

  return (
    <Link
      href={`/playlists/${playlist.id}`}
      prefetch={true}
      className={clsx(
        "block bg-gray-900 text-gray-200 rounded-xl shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 hover:ring-2 hover:ring-blue-500/50 ",
        {
          "border-glow-blue": isRefreshing,
          "border-glow-green": isDownloading && !isRefreshing,
        }
      )}
    >
      {/* Thumbnail Container */}
      <div className="relative group overflow-hidden rounded-xl">
        {/* Image */}
        <Image
          src={playlist.thumbnail || "/404_page-not-found.webp"}
          alt={playlist.title}
          priority={true}
          width={200}
          height={100}
          className="w-full min-h-25 object-cover transition-transform duration-300 group-hover:scale-105"
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

        {/* Daily Check Toggle (Bottom-Right Corner) */}
        <button
          className="absolute bottom-1 right-2 bg-gray-900 bg-opacity-75 rounded-full p-1 hover:bg-gray-800 transition duration-200"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCheckEveryDay(playlist.id);
          }}
        >
          <motion.div
            key={playlist.check_every_day ? "checked" : "unchecked"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {playlist.check_every_day ? (
              <CheckCircle
                size={isGridSmall ? 15 : 20}
                className="text-blue-500"
              />
            ) : (
              <Circle size={isGridSmall ? 15 : 20} className="text-gray-400" />
            )}
          </motion.div>
        </button>

        {/* Uploader Avatar */}
        <div className="absolute top-2 right-2 rounded-full ring-4 ring-gray-800 bg-gray-800 transition-transform duration-300 group-hover:scale-0">
          {!avatarError && avatarUrl !== "" ? (
            <Image
              className={`bg-gray-900 rounded-full h-auto ${
                isGridSmall ? "w-[24px]" : "w-[40px]"
              } ring-2 ${
                playlist.check_every_day ? "ring-blue-500" : "ring-white"
              }
             bg-gray-800 shadow-md`}
              src={avatarUrl}
              onError={() => setAvatarError(true)}
              width={64}
              height={64}
              priority
              alt={"Uploader avatar"}
            />
          ) : (
            <User
              size={64}
              className={`bg-gray-900 rounded-full h-auto ${
                isGridSmall ? "w-[24px]" : "w-[40px]"
              } ring-2 ${
                playlist.check_every_day ? "ring-blue-500" : "ring-white"
              } bg-gray-800 shadow-md`}
            />
          )}
        </div>

        {/* Missing Videos Indicator (Bottom-Left) */}
        <span
          className={`absolute top-2 left-2 py-1 text-sm text-white font-semibold shadow-[0px_0px_4px_2px_#444444] rounded-md transition-all duration-300 ${
            !isLoading && data && data.total_videos === data.downloaded_videos
              ? "bg-green-500"
              : "bg-red-500"
          }
          ${isGridSmall ? "text-[12px] px-[0.4rem]" : "px-2"}
          `}
        >
          {isLoading ? (
            <span className="animate-pulse"></span>
          ) : (
            <span className={"drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]"}>
              {data.total_videos !== data.downloaded_videos
                ? data.total_videos - data.downloaded_videos
                : ""}
            </span>
          )}
        </span>
      </div>
    </Link>
  );
};
