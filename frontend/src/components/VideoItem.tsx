"use client";
import Image from "next/image";
import { Download, CheckCircle } from "lucide-react";
import { VideoDetails } from "@/types/models";

type VideoItemProps = {
  video: VideoDetails;
  progress: number | undefined;
  onDownload: (videoId: string) => void;
  isDownloading: boolean;
};

export const VideoItem = ({ video, progress, onDownload, isDownloading }: VideoItemProps) => {
  return (
    <div className="flex items-center bg-gray-900 text-gray-200 p-4 rounded-lg shadow-md hover:bg-gray-800 transition duration-200">
      <Image src={video.thumbnail} alt={video.title} width={120} height={68} className="rounded-md shadow-md" />

      <div className="ml-4 flex-1">
        <h3 className="text-lg font-semibold">{video.title}</h3>
        <p className="text-gray-400 text-sm">
          ⏳ {video.duration} • 📺 {video.quality}
        </p>
        <p className="text-gray-500 text-xs mt-1">Published: {video.upload_date}</p>
      </div>

      {video.downloaded ? (
        <button className="px-3 py-2 border border-green-400 rounded-lg text-green-400" disabled>
          <CheckCircle size={24} />
        </button>
      ) : (
        <button
          className="text-blue-400 hover:text-blue-300 flex items-center px-3 py-2 border border-blue-400 rounded-lg"
          onClick={() => onDownload(video.id)}
          disabled={isDownloading}
        >
          {isDownloading ? `${progress ?? 0}%` : <Download size={20} />}
        </button>
      )}
    </div>
  );
};
