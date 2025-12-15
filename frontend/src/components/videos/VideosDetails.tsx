"use client";

import "./videosDetails.css";
import Image from "next/image";
import useSWR, { mutate } from "swr";
import { Calendar, Video, Film, Captions, FolderDown } from "lucide-react";
import { VideoDetails, DownloadQuality, PlaylistDetails as PlaylistDetailsInterface } from "@/types/models";
import axios from "axios";
import { endpointPlaylists, endpointVideos, endpointWebSocketPlaylists } from "@/constants/endpoints";
import useDownloadProgress from "@/hooks/useDownloadProgress";
import { VideoItem } from "@/components/VideoItem";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useState, useEffect } from "react";
import VideosButton from "@/components/videos/Buttons";
import NumberOfVideosDownloaded from "@/components/playlists/NumberOfVideosDownloaded";
import { formatDate } from "@/utils/formatDate";
import { useThumbnailModal, ThumbnailModal } from "@/components/modals/ThumbnailModal";
import { SortVideos } from "@/components/floating-options/SortItems";
import { VALID_SORT_FIELDS_VIDEOS, SortOrder, SortField } from "@/constants/sortFields";
import successToast from "../toasts/successToast";
import errorToast from "../toasts/errorToast";
import infoToast from "../toasts/infoToast";
import { COOKIE_KEY_VIDEOS } from "@/constants/cookies_keys";
import AddItem from "../floating-options/AddItem";
import SelectingBar from "./SelectingBar";
import { useLongClickHandlers } from "@/hooks/useLongClick";
import { OptionsFloatingMenu } from "../floating-options/OptionsFloatingMenu";
import { SelectionModeButton } from "../floating-options/SelectionModeButton";
import { useModal } from "../modals/Modal";
import { CustomVideoModal } from "../modals/CustomVideoModal";

interface PlaylistDetailsProps {
  id: string;
  initialPlaylist: PlaylistDetailsInterface;
  initialSortBy: SortField;
  initialSortOrder: SortOrder;
}

export default function VideosDetails(props: PlaylistDetailsProps) {
  const { id, initialPlaylist, initialSortBy, initialSortOrder } = props;
  const [currentSortBy, setSortBy] = useState<SortField>(initialSortBy);
  const [currentSortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);
  const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  // Add state to track which video's modal is open
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const handleOpenEditModal = (videoId: string) => {
    setSelectedVideoId(videoId);
    openEditModal();
  };

  const handleCloseEditModal = () => {
    setSelectedVideoId(null);
    mutate(`${endpointPlaylists}/${id}/details`); // Refresh playlist details after closing modal, trigger even if nothing is changed
    closeEditModal();
  };
  
  const fetcher = (url: string) => {
    return axios.get(url + `?sort_by=${currentSortBy}&order=${currentSortOrder}`).then((res) => res.data);
  };

  const {
    data: playlist,
    error,
    isLoading,
  } = useSWR(`${endpointPlaylists}/${id}/details`, fetcher, {
    fallbackData: initialPlaylist,
  });

  const [isDownloading, setIsDownloading] = useState(false);

  const {
    isOpen: isThumbnailOpen,
    thumbnailUrl,
    openModal: openThumbnailModal,
    closeModal: closeThumbnailModal,
  } = useThumbnailModal();

  const { getProgress, getDownloadStage } = useDownloadProgress(String(id));

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  const handleSelect = async (videoId: string) => {
    const status = await fetch(`${endpointPlaylists}/${playlist.id}/videos/${videoId}/download_status`)
      .then((res) => res.json())
      .then((data) => data.status);

    if (status === "DOWNLOADING") {
      errorToast("Video is downloading.");
      return;
    }

    setSelectedVideos((prev) =>
      prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVideos.length === playlist.videos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(playlist.videos.map((video: VideoDetails) => video.id));
    }
  };

  const longClickHandlers = useLongClickHandlers(() => {
    if (isDownloading) {
      errorToast('"Select mode" not available : Playlist is downloading.');
      return;
    }
    setIsSelecting(true);
  });

  const webSocketKey = `playlist-details-${id}`;
  useWebSocket(
    `${endpointWebSocketPlaylists}`,
    (data) => {
      if (data.playlist_id !== id) return;

      if (data.options_updated === true) {
        successToast("Playlist options updated successfully.");
        mutate(`${endpointPlaylists}/${id}/details`);
      }

      if (data.download_success === true) {
        setIsDownloading(false);

        if (data.up_to_date) {
          successToast(data.message || "Playlist is already up to date.");
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
      } else if (data.download_success === false) {
        setIsDownloading(false);
        errorToast("Playlist download failed.", data.message || "An error occurred during the download.");
      }
    },
    webSocketKey
  );

  useEffect(() => {
    if (!id) return;

    let isMounted = true; // Prevents running twice due to re-renders

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

  const handleDownload = async (redownloadAll: boolean) => {
    if (isDownloading) return;
    setIsDownloading(true);
    setIsSelecting(false);

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
      errorToast("Failed to start the download of the videos");
      // console.error("Error downloading playlist:", error);
      setIsDownloading(false);
    }
  };

  const handleVideoDownload = async (videoId: string) => {
    if (isDownloading) return;
    try {
      await axios.post(`${endpointPlaylists}/${id}/videos/${videoId}/download`);
      infoToast("Video download started.");
    } catch (error: any) {
      if (error.response?.data?.detail) {
        errorToast(error.response.data.detail);
      } else {
        errorToast("Failed to delete some selected videos");
      }
      // console.error("Download failed:", error);
    }
  };

  const handleDownloadSelected = async () => {
    if (isDownloading || selectedVideos.length === 0) return;

    try {
      await Promise.all(
        selectedVideos.map((videoId) => axios.post(`${endpointPlaylists}/${id}/videos/${videoId}/download`))
      );
      infoToast("Selected videos download started.");
      setSelectedVideos([]);
      setIsSelecting(false);
    } catch (error) {
      errorToast("Failed to start downloading some selected videos");
      setSelectedVideos([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (isDownloading) return;

    try {
      await Promise.all(selectedVideos.map((videoId) => axios.delete(`${endpointVideos}/${videoId}`)));
      setSelectedVideos([]);
      setIsSelecting(false);
      successToast("Selected videos deleted successfully.");
      mutate(`${endpointPlaylists}/${id}/details`);
    } catch (error: any) {
      if (error.response?.data?.detail) {
        errorToast(error.response.data.detail);
      } else {
        errorToast("Failed to delete some selected videos");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400 text-lg animate-pulse">Loading playlist...</p>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg font-semibold">Failed to load playlist. 😢</p>
      </div>
    );
  }

  const qualityKey = Object.keys(DownloadQuality).find(
    (key) => DownloadQuality[key as keyof typeof DownloadQuality] == playlist.default_quality
  );

  const optionsFloatingMenuParams = {
    SortVideosParams: {
      currentSortBy,
      setSortBy,
      currentSortOrder,
      setSortOrder,
      validSortFields: [...VALID_SORT_FIELDS_VIDEOS],
      SWR_endpoint: `${endpointPlaylists}/${id}/details`,
      cookie_key: COOKIE_KEY_VIDEOS,
    },
    SelectionModeParams: {
      setIsSelecting,
    },
  };

  return (
    <div className="p-3 md:p-5 pb-24">
      {/* Header */}
      <div className="bg-gray-900 text-gray-200 p-4 md:p-6 rounded-lg [&_*_span]:font-medium shadow-md flex flex-col lg:flex-row items-center gap-6">
        {/* [&_*_span] selection tous les span enfants */}

        {/* Thumbnail */}
        <Image
          src={playlist.thumbnail || "/video.jpeg"}
          alt={playlist.title}
          priority={true}
          width={200}
          height={100}
          onClick={() => openThumbnailModal(playlist.thumbnail || "/video.jpeg")}
          className="rounded-lg shadow-lg w-full flex-1 cursor-zoom-in max-w-[400px] min-w-[200px] h-auto aspect-video object-cover
          transition-all duration-300 hover:shadow-xl hover:scale-[1.03]"
        />

        <ThumbnailModal
          isOpen={isThumbnailOpen}
          thumbnailUrl={thumbnailUrl}
          closeModal={closeThumbnailModal}
        />

        {/* Info */}
        <div className="container-playlist-info items-center lg:items-start gap-2">
          <h1 className="break-all line-clamp-2 text-center text-xl md:text-2xl lg:text-left">
            {playlist.title}
          </h1>

          <div className="flex flex-col items-start max-w-[100%] lg:contents gap-2">
            <div className="lg:mt-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="min-w-fit" /> Last update:{" "}
                <span>{formatDate(playlist.last_published) ?? "unknown"}</span>
              </div>
            </div>

            {/* Settings */}
            <div className="hidden lg:grid grid-cols-2 gap-x-6 gap-y-2 max-w-80 min-w-fit ">
              <div className="flex items-center gap-2">
                <Film size={16} className="min-w-fit" />
                Format: <span>{playlist.default_format}</span>
              </div>
              <div className="flex items-center gap-2">
                <Video size={16} className="min-w-fit" />
                Quality: <span>{(qualityKey || "None").replace("q_", "").toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Captions size={16} className="min-w-fit" />
                Subtitles: <span>{playlist.default_subtitles ? "Yes" : "No"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2" style={{ maxWidth: "inherit" }}>
              <FolderDown size={16} className="min-w-fit" />
              Folder: <span className="bg-gray-700 px-2 truncate rounded">{playlist.folder}</span>
            </div>

            <NumberOfVideosDownloaded playlist_id={playlist.id} />
          </div>
        </div>

        <VideosButton
          id={id!.toString()}
          playlist={playlist}
          isDownloading={isDownloading}
          onDownload={handleDownload}
        />
      </div>

      <OptionsFloatingMenu>
        {!isSelecting && (
          <>
            <SortVideos {...optionsFloatingMenuParams.SortVideosParams} />
            <AddItem />
            <SelectionModeButton {...optionsFloatingMenuParams.SelectionModeParams} />
          </>
        )}
      </OptionsFloatingMenu>

      {isSelecting && (
        <SelectingBar
          playlist={playlist}
          setIsSelecting={() => setIsSelecting(!isSelecting)}
          selectedVideos={selectedVideos}
          handleSelectAll={handleSelectAll}
          handleDownloadSelected={handleDownloadSelected}
          handleDeleteSelected={handleDeleteSelected}
        />
      )}

      {/* Video List */}
      <div className="mt-6 mb-6">
        <div className="space-y-2 lg:space-y-4">
          {playlist.videos.map((video: VideoDetails) => (
            <div
              key={video.id}
              {...longClickHandlers}
              onClick={() => (isSelecting && video.available !== false ? handleSelect(video.id) : null)}
            >
              <VideoItem
                playlist_id={playlist.id}
                video={video}
                progress={getProgress(video.id)}
                download_stage={getDownloadStage(video.id)}
                onDownload={handleVideoDownload}
                openThumbnailModal={openThumbnailModal}
                openEditModal={() => handleOpenEditModal(video.id)}
                isSelected={selectedVideos.includes(video.id)}
                isSelectable={isSelecting && video.available !== false}
              />
            </div>
          ))}

          {selectedVideoId && (
            <CustomVideoModal
              isOpen={!!selectedVideoId}
              closeModal={handleCloseEditModal}
              videoId={selectedVideoId!}
              playlistId={playlist.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
