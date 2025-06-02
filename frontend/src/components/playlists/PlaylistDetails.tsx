"use client";

import "./playlistDetails.css";
import Image from "next/image";
import useSWR, { mutate } from "swr";
import { Calendar, Video, Film, Captions, FolderDown } from "lucide-react";
import {
  VideoDetails,
  DownloadQuality,
  PlaylistDetails as PlaylistDetailsInterface,
} from "@/types/models";
import axios from "axios";
import {
  endpointPlaylists,
  endpointWebSocketPlaylists,
} from "@/constants/endpoints";
import useDownloadProgress from "@/hooks/useDownloadProgress";
import { VideoItem } from "@/components/VideoItem";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useState } from "react";
import { useEffect } from "react";
import InteractiveButtons from "@/components/playlists/InteractiveButtons";
import NumberOfVideosDownloaded from "@/components/playlists/NumberOfVideosDownloaded";
import { formatDate } from "@/utils/formatDate";
import {
  useThumbnailModal,
  ThumbnailModal,
} from "@/components/modals/ThumbnailModal";
import { SortVideos } from "@/components/SortItems";
import {
  VALID_SORT_FIELDS_VIDEOS,
  SortOrder,
  SortField,
} from "@/constants/sortFields";
import successToast from "../toasts/successToast";
import errorToast from "../toasts/errorToast";
import infoToast from "../toasts/infoToast";
import PlaylistUploader from "./PlaylistUploader";
import { COOKIE_KEY_VIDEOS } from "@/constants/cookies_keys";
import { copyUrlToClipboard } from "@/utils/copyToClipboard";

interface PlaylistDetailsProps {
  id: string;
  initialPlaylist: PlaylistDetailsInterface;
  initialSortBy: SortField;
  initialSortOrder: SortOrder;
}

export default function PlaylistDetails({
  id,
  initialPlaylist,
  initialSortBy,
  initialSortOrder,
}: PlaylistDetailsProps) {
  // Local state to manage sorting
  const [currentSortBy, setSortBy] = useState<SortField>(initialSortBy);
  const [currentSortOrder, setSortOrder] =
    useState<SortOrder>(initialSortOrder);

  const fetcher = (url: string) => {
    return axios
      .get(url + `?sort_by=${currentSortBy}&order=${currentSortOrder}`)
      .then((res) => res.data);
  };

  const {
    data: playlist,
    error,
    isLoading,
  } = useSWR(`${endpointPlaylists}/${id}/details`, fetcher, {
    fallbackData: initialPlaylist,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    isOpen: isThumbnailOpen,
    thumbnailUrl,
    openModal: openThumbnailModal,
    closeModal: closeThumbnailModal,
  } = useThumbnailModal();

  const { getProgress, getDownloadStage } = useDownloadProgress(String(id));

  const webSocketKey = `playlist-details-${id}`;
  useWebSocket(
    `${endpointWebSocketPlaylists}`,
    (data) => {
      if (data.playlist_id !== id) return;

      if (data.fetch_success === true) {
        mutate(`${endpointPlaylists}/${id}/number_of_videos_downloaded`);
        mutate(`${endpointPlaylists}/${id}/details`);
        setIsRefreshing(false);
      } else if (data.fetch_success === false) {
        setIsRefreshing(false);
      }

      if (data.options_updated === true) {
        successToast("Playlist options updated successfully.");
        mutate(`${endpointPlaylists}/${id}/details`);
      }

      if (data.download_success === true) {
        setIsDownloading(false);

        if (data.up_to_date) {
          successToast("Playlist is already up to date.");
        } else {
          if (data.nb_download_failed === 0) {
            successToast("Playlist downloaded successfully.");
          } else {
            errorToast(
              `Playlist downloaded with ${data.nb_download_failed}${
                data.total_to_download ? "/" + data.total_to_download : ""
              } fails.`
            );
          }
        }

        console.log("Playlist downloaded successfully.");
      } else if (data.download_success === false) {
        setIsDownloading(false);
        errorToast("Playlist download failed.");
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
        // console.log("Playlist refresh status:", data);
        if (data.is_fetching && isMounted) {
          infoToast(`Playlist is being refreshed.`);
          setIsRefreshing(true);
        }
      })
      .catch((error) => {
        console.error("Error checking playlist refresh status:", error);
      });

    fetch(`${endpointPlaylists}/${id}/download_status`)
      .then((res) => res.json())
      .then((data) => {
        if (data.is_downloading && isMounted) {
          infoToast(`Playlist is being downloaded.`);
          setIsDownloading(true);
        }
      })
      .catch((error) => {
        console.error("Error checking playlist download status:", error);
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
    } catch (error) {
      errorToast("Failed to refresh playlist");
      console.error("Error refreshing playlist:", error);
      setIsRefreshing(false);
    }
  };

  const handleDownload = async (redownloadAll: boolean) => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const response = await fetch(`${endpointPlaylists}/${id}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ redownload_all: redownloadAll }),
      });

      if (!response.ok) throw new Error("Failed to download playlist");
    } catch (error) {
      errorToast("Failed to start the download of the playlist");
      console.error("Error downloading playlist:", error);
      setIsDownloading(false);
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

  const handleVideoDownload = async (videoId: string) => {
    if (isDownloading) return;
    try {
      await axios.post(`${endpointPlaylists}/${id}/videos/${videoId}/download`);
      infoToast("Video download started.");
    } catch (error) {
      console.error("Download failed:", error);
      errorToast("Failed to start downloading video");
    }
  };

  const qualityKey = Object.keys(DownloadQuality).find(
    (key) =>
      DownloadQuality[key as keyof typeof DownloadQuality] ==
      playlist.default_quality
  );

  return (
    <div className="p-3 md:p-12 pb-24">
      {/* Playlist Header */}
      <div className="bg-gray-900 text-gray-200 p-4 md:p-6 rounded-lg [&_*_span]:font-medium shadow-md flex flex-col lg:flex-row items-center gap-6">
        {/* [&_*_span] selection tous les span enfants */}

        {/* Playlist Thumbnail */}
        <Image
          src={playlist.thumbnail || "/404_page-not-found.webp"}
          alt={playlist.title}
          priority={true}
          width={200}
          height={100}
          onClick={() =>
            openThumbnailModal(playlist.thumbnail || "/404_page-not-found.webp")
          }
          className="rounded-lg shadow-lg w-full flex-1 cursor-zoom-in max-w-[400px] min-w-[200px] h-auto aspect-video object-cover
          transition-all duration-300 hover:shadow-xl hover:scale-[1.03]"
        />

        <ThumbnailModal
          isOpen={isThumbnailOpen}
          thumbnailUrl={thumbnailUrl}
          closeModal={closeThumbnailModal}
        />

        {/* Playlist Info */}
        <div className="container-playlist-info items-center lg:items-start gap-2">
          <h1 className="break-all line-clamp-2 text-center text-xl md:text-2xl lg:text-left cursor-pointer" onClick={() => copyUrlToClipboard(playlist.id)}>
            {playlist.title}
          </h1>

          <div className="flex flex-col items-start max-w-[100%] lg:contents gap-2">
            <div className="lg:mt-2 flex flex-col gap-2">
              {playlist.id !== "0" && (
                <PlaylistUploader
                  playlist={playlist}
                  isRefreshing={isRefreshing}
                />
              )}
              <div className="flex items-center gap-2">
                <Calendar size={16} className="min-w-fit" /> Last video
                published:{" "}
                <span>{formatDate(playlist.last_published) ?? "unknown"}</span>
              </div>
            </div>

            {/* Playlist Settings */}
            <div className="hidden lg:grid grid-cols-2 gap-x-6 gap-y-2 max-w-80 min-w-fit ">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="min-w-fit" />
                Check:{" "}
                <span>{playlist.check_every_day ? "Every day" : "Never"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Film size={16} className="min-w-fit" />
                Format: <span>{playlist.default_format}</span>
              </div>
              <div className="flex items-center gap-2">
                <Video size={16} className="min-w-fit" />
                Quality:{" "}
                <span>
                  {(qualityKey || "None").replace("q_", "").toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Captions size={16} className="min-w-fit" />
                Subtitles:{" "}
                <span>{playlist.default_subtitles ? "Yes" : "No"}</span>
              </div>
            </div>

            <div
              className="flex items-center gap-2"
              style={{ maxWidth: "inherit" }}
            >
              <FolderDown size={16} className="min-w-fit" />
              Folder:{" "}
              <span className="bg-gray-700 px-2 truncate rounded">
                {playlist.folder}
              </span>
            </div>

            <NumberOfVideosDownloaded playlist_id={playlist.id} />
          </div>
        </div>

        <InteractiveButtons
          id={id!.toString()}
          playlist={playlist}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          isDownloading={isDownloading}
          onDownload={handleDownload}
        />
      </div>

      <SortVideos
        currentSortBy={currentSortBy}
        setSortBy={setSortBy}
        currentSortOrder={currentSortOrder}
        setSortOrder={setSortOrder}
        validSortFields={[...VALID_SORT_FIELDS_VIDEOS]}
        SWR_endpoint={`${endpointPlaylists}/${id}/details`}
        cookie_key={COOKIE_KEY_VIDEOS}
      />

      {/* Video List */}
      <div className="mt-6">
        <div className="space-y-2 lg:space-y-4">
          {playlist.videos.map((video: VideoDetails) => (
            <VideoItem
              key={video.id}
              playlist_id={playlist.id}
              video={video}
              progress={getProgress(video.id)}
              download_stage={getDownloadStage(video.id)}
              onDownload={handleVideoDownload}
              openThumbnailModal={openThumbnailModal}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
