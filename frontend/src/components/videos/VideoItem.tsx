"use client";
import Image from "next/image";
import { VideoDetails } from "@/types/models";
import VideoStatus from "../buttons/VideoStatus";
import useSWR from "swr";
import { endpointPlaylists } from "@/constants/endpoints";
import { formatDate } from "@/utils/formatDate";
import { fetcher } from "@/utils/fetcher";
import React from "react";
import { CheckCircle2, Pencil } from "lucide-react";
import { copyUrlToClipboard } from "@/utils/copyToClipboard";

type VideoItemProps = {
  playlist_id: string;
  video: VideoDetails;
  progress: number | undefined;
  download_stage: string;
  onDownload: (videoId: string) => void;
  openThumbnailModal: (url: string) => void;
  openEditModal?: () => void;
  isSelected?: boolean;
  isSelectable?: boolean;
};

export const VideoItem = ({
  playlist_id,
  video,
  progress,
  download_stage,
  onDownload,
  openThumbnailModal,
  openEditModal,
  isSelected = false,
  isSelectable = false,
}: VideoItemProps) => {
  const {
    data: download_status,
    error,
    isLoading,
  } = useSWR(`${endpointPlaylists}/${playlist_id}/videos/${video.id}/download_status`, fetcher);
  const isDownloaded = download_status?.status === "DOWNLOADED";
  const downloading = download_status?.status === "DOWNLOADING";
  const isError = download_status?.status === "ERROR";
  const isUnavailable = video.available === false;

  return (
    <div
      className={`flex items-center bg-gray-900 text-gray-200 p-2 md:p-4 rounded-lg shadow-md transition-all duration-300
      hover:shadow-xl hover:scale-[1.01] hover:ring-2 hover:ring-blue-500/50
      ${isDownloaded ? "bg-green-900/20" : ""}
      ${downloading ? "bg-blue-900/20" : ""}
      ${isError ? "bg-red-900/20" : ""}
      ${!downloading && isSelectable && isSelected ? "ring-2 ring-green-500/50 hover:ring-green-500/50" : ""}
      ${downloading && isSelectable ? "select-blocked" : ""}
      ${isUnavailable ? "bg-yellow-900/20 cursor-not-allowed select-blocked not-available" : ""}
      `}
    >
      <Image
        src={video.thumbnail || "/video.jpeg"}
        alt={video.title}
        width={120}
        height={68}
        className="rounded-md h-auto w-20 md:w-auto max-w-[130px] shadow-md aspect-video object-cover cursor-zoom-in transition-all duration-300 hover:shadow-xl hover:scale-[1.05]"
        onClick={(e) => {
          openThumbnailModal(video.thumbnail);
          e.preventDefault();
          e.stopPropagation();
        }}
        priority={true}
      />

      <div className="ml-4 flex-1">
        <h3
          className="text-xs md:text-lg font-semibold line-clamp-2 w-fit cursor-pointer"
          onClick={() => copyUrlToClipboard(video.id)}
        >
          {video.title}
        </h3>

        <p className="text-gray-400 text-xs md:text-sm mt-1">
          ⏳ {video.duration || "00:00"} • 📺 {video.quality || "Default"}
        </p>
        <p className="text-gray-500 text-xs mt-1">Published: {formatDate(video.upload_date)}</p>
      </div>

      {(downloading || !isSelectable) && (
        <VideoStatus
          video={video}
          progress={progress}
          download_stage={download_stage}
          onDownload={onDownload}
          download_status={download_status?.status}
          error={error}
          isLoading={isLoading}
        />
      )}

      {!downloading && isSelectable && (
        <div className="text-blue-400 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openEditModal?.();
            }}
            className="flex mb-4 px-1 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
          >
            <Pencil size={15} className="" /> <span className="sm:inline hidden"></span>
          </button>
          {isSelected ? (
            <CheckCircle2 size={24} />
          ) : (
            <div className="w-6 h-6 rounded-full border border-gray-500" />
          )}
        </div>
      )}
    </div>
  );
};
