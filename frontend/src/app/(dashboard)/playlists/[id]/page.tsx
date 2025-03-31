"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Pencil, Trash, Calendar, User } from "lucide-react";
import { PlaylistDetails, VideoDetails } from "@/types/models";
import axios from "axios";
import { endpointPlaylists } from "@/constants/endpoints";
import useDownloadProgress from "@/hooks/useDownloadProgress";
import { VideoItem } from "@/components/VideoItem";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function PlaylistDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { data: playlist, error, isLoading, mutate } = useSWR<PlaylistDetails>(`${endpointPlaylists}/${id}/details`, fetcher);

  const { progress, downloading, setDownloading } = useDownloadProgress(String(id), (videoId) => {
    setDownloading((prev) => {
      const updated = new Set(prev);
      updated.delete(videoId);
      return updated;
    });
  });

  console.log("Playlist Details:", playlist);

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
      console.error("Failed to delete playlist:", error);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => router.push("/playlists")}
        className="flex items-center text-gray-300 hover:text-white mb-4"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Playlists
      </button>

      {/* Playlist Header */}
      <div className="bg-gray-900 text-gray-200 p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between">
        <div className="flex items-center space-x-6">
          <Image
            src={playlist.thumbnail}
            alt={playlist.title}
            width={150}
            height={150}
            className="rounded-lg shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-bold">{playlist.title}</h1>
            <div className="text-gray-400 flex items-center mt-2">
              <User size={18} className="mr-2" /> {playlist.uploader.name ?? "Unknown"}
            </div>
            <div className="text-gray-400 flex items-center">
              <Calendar size={18} className="mr-2" /> Last video published: {playlist.last_published ?? "N/A"}
            </div>
            <p className="text-gray-500 text-sm mt-2">{playlist.folder}</p>
          </div>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button className="text-yellow-400 hover:text-yellow-300 flex items-center">
            <Pencil size={20} className="mr-2" /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 flex items-center"
          >
            <Trash size={20} className="mr-2" /> Delete
          </button>
        </div>
      </div>

      {/* Video List */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">Playlist Videos</h2>
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
