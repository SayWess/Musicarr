import { CheckCircle, Download, Loader2, X } from "lucide-react";
import { VideoDetails } from "@/types/models";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showConfirm, setShowConfirm] = useState(false);

  if (isLoading || error) return null;

  const isDownloaded = download_status === "DOWNLOADED";
  const downloading = download_status === "DOWNLOADING";

  if (isDownloaded) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        {!showConfirm ? (
          <motion.button
            key="check"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 bg-green-900/20 text-green-400 hover:text-green-300 px-3 py-2 rounded-lg border border-green-500"
            onClick={() => setShowConfirm(true)}
          >
            <CheckCircle size={16} className="md:w-[20px] md:h-auto" />
            <span className="text-sm hidden md:inline">Downloaded</span>
          </motion.button>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-1 md:gap-2"
          >
            <button
              onClick={() => {
                onDownload(video.id);
                setShowConfirm(false);
              }}
              className="flex items-center gap-2 bg-green-900/20 text-green-400 hover:text-green-300 px-3 py-1 rounded-lg border border-green-500 transition"
            >
              <Download size={16} />
              <span className="text-sm hidden md:inline">Redownload</span>
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex items-center gap-2 bg-red-900/20 text-red-400 hover:text-red-300 px-3 py-1 border border-red-500 rounded-lg transition"
            >
              <X size={16} />
              <span className="text-sm hidden md:inline">Cancel</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (downloading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-400 text-blue-300 bg-blue-900/20">
        <Loader2 size={16} className="md:w-[20px] md:h-auto animate-spin" />
        <span className="text-sm">
          {download_stage ?? ""} {progress ?? 0}%
        </span>
      </div>
    );
  }

  return (
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
