"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Pencil, Trash, Calendar, User } from "lucide-react";
import { PlaylistDetails, VideoDetails } from "@/types/models";
import axios from "axios";
import {
  endpointPlaylists,
  endpointWebSocketPlaylists,
} from "@/constants/endpoints";
import useDownloadProgress from "@/hooks/useDownloadProgress";
import { VideoItem } from "@/components/VideoItem";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useState } from "react";
import { useEffect } from "react";
import InteractiveButtons from "@/components/playlists/InteractiveButtons";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function PlaylistDetail() {
  const { id } = useParams();
  const router = useRouter();
  const {
    data: playlist,
    error,
    isLoading,
  } = useSWR<PlaylistDetails>(`${endpointPlaylists}/${id}/details`, fetcher);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const { progress, downloading, setDownloading } = useDownloadProgress(
    String(id),
    (videoId) => {
      setDownloading((prev) => {
        const updated = new Set(prev);
        updated.delete(videoId);
        return updated;
      });
    }
  );

  const webSocketKey = `playlist-details-${id}`;
  useWebSocket(
    `${endpointWebSocketPlaylists}`,
    (data) => {
      if (data.playlist_id === id && data.fetch_success === true) {
        console.log("WebSocket message received from Playlist Details:", data);
        setIsRefreshing(false);
      } else if (data.playlist_id === id && data.fetch_success === false) {
        setIsRefreshing(false);
      }
    },
    webSocketKey
  );

  useEffect(() => {
    if (!id) return;

    let isMounted = true; // Prevents running twice due to re-renders

    fetch(`${endpointPlaylists}/${id}/is_fetching`)
      .then((res) => res.json())
      .then((data) => {
        if (data.is_fetching && isMounted) {
          toast.info(`Playlist ${playlist?.title} is being refreshed.`);
          setIsRefreshing(true);
        }
      })
      .catch((error) => {
        console.error("Error checking playlist refresh status:", error);
      });

    return () => {
      isMounted = false; // Cleanup to avoid state updates on unmounted component
    };
  }, [id]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      const response = await fetch(`${endpointPlaylists}/${id}/refresh`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to refresh playlist");

      // mutate(`${endpointPlaylists}/${id}/details`);
    } catch (error) {
      toast.error("Failed to refresh playlist");
      console.error("Error refreshing playlist:", error);
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400 text-lg animate-pulse">
          Loading playlist...
        </p>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg font-semibold">
          Failed to load playlist. 😢
        </p>
      </div>
    );
  }

  const handleDownload = async (videoId: string) => {
    setDownloading((prev) => new Set(prev).add(videoId));
    try {
      await axios.post(`${endpointPlaylists}/${id}/videos/${videoId}/download`);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading((prev) => {
        const updated = new Set(prev);
        updated.delete(videoId);
        return updated;
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${endpointPlaylists}/${id}`);
      router.push("/playlists");
    } catch (error) {
      toast.error("Failed to delete playlist: " + error);
    }
  };

  

  return (
    <div className="p-3 md:p-6 pb-24">
      <button
        onClick={() => router.push("/playlists")}
        className="flex items-center text-gray-300 hover:text-white mb-4"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Playlists
      </button>

      {/* Playlist Header */}
      <div className="bg-gray-900 text-gray-200 p-6 rounded-lg shadow-md flex flex-col lg:flex-row items-center lg:items-start">
        {/* Playlist Thumbnail */}
        <Image
          src={playlist.thumbnail || "/404_page-not-found.webp"}
          alt={playlist.title}
          width={200}
          height={100}
          className="rounded-lg shadow-lg mb-4 md:mb-0 md:mr-6 w-full max-w-[400px] h-auto aspect-video object-cover"
        />

        {/* Playlist Info */}
        <div className="flex-1 text-center md:text-left md:mt-2">
          <h1 className="text-xl md:text-2xl font-bold">{playlist.title}</h1>
          <div className="text-gray-400 flex items-center justify-center md:justify-start mt-2">
            <User size={18} className="mr-2" />{" "}
            {playlist.uploader.name ?? "Unknown"}
          </div>
          <div className="text-gray-400 flex items-center justify-center md:justify-start">
            <Calendar size={18} className="mr-2" /> Last video published:{" "}
            {playlist.last_published ?? "N/A"}
          </div>
          <p className="text-gray-500 text-sm mt-2">{playlist.folder}</p>
        </div>

        {/* Action Buttons */}
        {/* <div className="flex space-x-4 mt-4 md:mt-0">
          <button className="text-yellow-400 hover:text-yellow-300 flex items-center">
            <Pencil size={20} className="mr-2" /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 flex items-center"
            disabled={isRefreshing}
          >
            <Trash size={20} className="mr-2" /> Delete
          </button>
          {/* Refresh Button */} 
          {/* <button
            onClick={handleRefresh}
            className="text-blue-400 hover:text-blue-300 flex items-center"
            disabled={isRefreshing}
          >
            <RefreshCw
              size={20}
              className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div> */}

        <InteractiveButtons
          id={id!.toString()}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          />
      </div>

      {/* Video List */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">
          Playlist Videos
        </h2>
        <div className="space-y-4">
          {playlist.videos.map((video: VideoDetails) => (
            <VideoItem
              key={video.id}
              video={video}
              progress={progress[video.id]}
              onDownload={handleDownload}
              isDownloading={downloading.has(video.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
