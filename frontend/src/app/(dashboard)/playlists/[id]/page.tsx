"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Download, CheckCircle, Pencil, Trash, ArrowLeft, Calendar, User } from "lucide-react";

interface Video {
  id: number;
  title: string;
  duration: string;
  quality: string;
  thumbnail: string;
  downloaded: boolean;
  publishedAt: string;
}

interface Playlist {
  id: number;
  name: string;
  author: string;
  lastPublished: string;
  folder: string;
  thumbnail: string;
  checkEveryDay: boolean;
  videos: Video[];
}

const samplePlaylist: Playlist = {
  id: 1,
  name: "Chill Lofi",
  author: "Lofi Records",
  lastPublished: "March 5, 2025",
  folder: "/downloads/chill-lofi",
  thumbnail: "/thumbnails/lofi.jpg",
  checkEveryDay: true,
  videos: [
    { id: 1, title: "Lofi Chill Beats - 1 Hour", duration: "1:00:15", quality: "1080p", thumbnail: "/videos/lofi1.jpg", downloaded: true, publishedAt: "March 2, 2025" },
    { id: 2, title: "Relaxing Study Music", duration: "45:32", quality: "720p", thumbnail: "/videos/lofi2.jpg", downloaded: false, publishedAt: "March 4, 2025" },
  ],
};

export default function PlaylistDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist>(samplePlaylist);
  const [downloading, setDownloading] = useState<number | null>(null);

  const handleDownload = (videoId: number) => {
    setDownloading(videoId);
    setTimeout(() => {
      setPlaylist((prev) => ({
        ...prev,
        videos: prev.videos.map((video) =>
          video.id === videoId ? { ...video, downloaded: true } : video
        ),
      }));
      setDownloading(null);
    }, 2000);
  };

  return (
    <div className="p-6">
      {/* Back Button */}
      <button onClick={() => router.push("/playlists")} className="flex items-center text-gray-300 hover:text-white mb-4">
        <ArrowLeft size={20} className="mr-2" /> Back to Playlists
      </button>

      {/* Playlist Header */}
      <div className="bg-gray-900 text-gray-200 p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between">
        <div className="flex items-center space-x-6">
          <Image src={playlist.thumbnail} alt={playlist.name} width={150} height={150} className="rounded-lg shadow-lg" />
          <div>
            <h1 className="text-3xl font-bold">{playlist.name}</h1>
            <div className="text-gray-400 flex items-center mt-2">
              <User size={18} className="mr-2" /> {playlist.author}
            </div>
            <div className="text-gray-400 flex items-center">
              <Calendar size={18} className="mr-2" /> Last video published: {playlist.lastPublished}
            </div>
            <p className="text-gray-500 text-sm mt-2">{playlist.folder}</p>
          </div>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button className="text-yellow-400 hover:text-yellow-300 flex items-center">
            <Pencil size={20} className="mr-2" /> Edit
          </button>
          <button className="text-red-400 hover:text-red-300 flex items-center">
            <Trash size={20} className="mr-2" /> Delete
          </button>
        </div>
      </div>

      {/* Video List */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">Playlist Videos</h2>
        <div className="space-y-4">
          {playlist.videos.map((video) => (
            <div key={video.id} className="flex items-center bg-gray-900 text-gray-200 p-4 rounded-lg shadow-md hover:bg-gray-800 transition duration-200">
              <Image src={video.thumbnail} alt={video.title} width={120} height={68} className="rounded-md shadow-md" />

              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold">{video.title}</h3>
                <p className="text-gray-400 text-sm">
                  ⏳ {video.duration} • 📺 {video.quality}
                </p>
                <p className="text-gray-500 text-xs mt-1">Published: {video.publishedAt}</p>
              </div>

              {video.downloaded ? (
                <button className="px-3 py-2 border border-green-400 rounded-lg text-green-400" disabled>
                  <CheckCircle size={24} />
                </button>
              ) : (
                <button
                  className="text-blue-400 hover:text-blue-300 flex items-center px-3 py-2 border border-blue-400 rounded-lg"
                  onClick={() => handleDownload(video.id)}
                  disabled={downloading === video.id}
                >
                  {downloading === video.id ? "Downloading..." : <Download size={20} />}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
