import { CheckCircle, Download, Loader2 } from "lucide-react";
import { VideoDetails } from "@/types/models";

interface VideoStatusProps {
  video: VideoDetails;
  progress: number | undefined;
  download_stage: string;
  onDownload: (videoId: string) => void;
  download_status: string;
  error: any;
  isLoading: boolean;
}

const VideoStatus = ({
  video,
  progress,
  download_stage,
  onDownload,
  download_status,
  error,
  isLoading,
}: VideoStatusProps) => {
  if (isLoading) return null;
  if (error) {
    return null;
  }

  const isDownloaded = download_status === "DOWNLOADED";
  const downloading = download_status === "DOWNLOADING";

  return isDownloaded ? (
    <div className="flex items-center gap-2 bg-green-900/20 text-green-400 px-3 py-2 rounded-lg border border-green-500">
      <CheckCircle size={20} />
    </div>
  ) : downloading ? (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-400 text-blue-300 bg-blue-900/20">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-sm">
        {download_stage ?? ""} {progress ?? 0}%
      </span>
    </div>
  ) : (
    <button
      className="text-blue-400 hover:text-blue-300 flex items-center gap-2 px-3 py-2 border border-blue-400 rounded-lg transition"
      onClick={() => onDownload(video.id)}
    >
      <Download size={16} className="md:w-[20px] md:h-auto" />
      <span className="text-sm hidden md:inline">Download</span>
    </button>
  );
};

export default VideoStatus;
