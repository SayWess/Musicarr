"use client";
import Image from "next/image";
import { VideoDetails } from "@/types/models";
import VideoStatus from "./buttons/VideoStatus";
import useSWR from "swr";
import { endpointPlaylists } from "@/constants/endpoints";
import axios from "axios";
import { formatDate } from "@/utils/formatDate";
import { useState } from "react";

type VideoItemProps = {
  playlist_id: string;
  video: VideoDetails;
  progress: number | undefined;
  download_stage: string;
  onDownload: (videoId: string) => void;
  openThumbnailModal: (url: string) => void;
};

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const VideoItem = ({
  playlist_id,
  video,
  progress,
  download_stage,
  onDownload,
  openThumbnailModal,
}: VideoItemProps) => {

  const { data: download_status, error, isLoading } = useSWR(`${endpointPlaylists}/${playlist_id}/videos/${video.id}/download_status`, fetcher);
    
  const isDownloaded = download_status?.status === "DOWNLOADED";
  const downloading = download_status?.status === "DOWNLOADING";
  const isError = download_status?.status === "ERROR";

  return (
    <div
      className={`flex items-center bg-gray-900 text-gray-200 p-2 md:p-4 rounded-lg shadow-md transition-all duration-300
      hover:shadow-xl hover:scale-[1.01] hover:ring-2 hover:ring-blue-500/50
      ${isDownloaded ? "bg-green-900/20" : ""}
      ${downloading ? "bg-blue-900/20" : ""}
      ${isError ? "bg-red-900/20" : ""}
      `}
    >
      <Image
        src={video.thumbnail}
        alt={video.title}
        width={120}
        height={68}
        className="rounded-md h-auto shadow-md cursor-zoom-in transition-all duration-300 hover:shadow-xl hover:scale-[1.05]"
        onClick={() => openThumbnailModal(video.thumbnail)}
        priority={true}
      />

      <div className="ml-4 flex-1">
        <h3 className="text-sm md:text-lg font-semibold line-clamp-2">
          {video.title}
        </h3>

        <p className="text-gray-400 text-xs md:text-sm mt-1">
          ⏳ {video.duration} • 📺 {video.quality}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Published: {formatDate(video.upload_date)}
        </p>
      </div>

      <VideoStatus
        video={video}
        progress={progress}
        download_stage={download_stage}
        onDownload={onDownload}
        download_status={download_status?.status}
        error={error}
        isLoading={isLoading}
      />
    </div>
  );
};
