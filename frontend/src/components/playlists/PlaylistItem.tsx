"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, Download, Loader } from "lucide-react";
import { Playlist } from "@/types/models";
import usePlaylists from "@/hooks/usePlaylists";

export const PlaylistItem = ({ playlist }: { playlist: Playlist }) => {
  const router = useRouter();
  const { toggleCheckEveryDay } = usePlaylists();
  // const isDownloading = downloading.has(playlist.id);

  console.log(playlist.thumbnail);

  return (
    <div className="bg-gray-900 text-gray-200 rounded-xl shadow-md hover:bg-gray-700 transition duration-200">
      {/* Thumbnail */}
      <Image
        src={
          playlist.thumbnail ? playlist.thumbnail : "/404_page-not-found.webp"
        }
        alt={playlist.title}
        width={200}
        height={200}
        className="w-full min-h-40 object-cover rounded-xl shadow-md cursor-pointer"
        onClick={() => router.push(`/playlists/${playlist.id}`)}
      />

      <div className="p-5">
        {/* Info */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">{playlist.title}</h2>
          <ChevronRight
            size={24}
            className="cursor-pointer"
            onClick={() => router.push(`/playlists/${playlist.id}`)}
          />
        </div>

        {/* Download Button */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">
            {playlist.missing_videos} missing videos
          </span>
        </div>

        {/* Daily Check Toggle */}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm">
            {playlist.check_every_day ? "Checked Daily ✅" : "Manual Check"}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={playlist.check_every_day}
              onChange={() => toggleCheckEveryDay(playlist.id)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer-checked:bg-blue-500 transition">
              <div
                className={`h-6 w-6 bg-white rounded-full shadow-md transform transition ${
                  playlist.check_every_day ? "translate-x-5" : "translate-x-0"
                }`}
              ></div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
