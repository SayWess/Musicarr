"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Edit, Trash, Folder, ChevronRight } from "lucide-react";

interface Playlist {
  id: number;
  name: string;
  folder: string;
  thumbnail: string;
  checkEveryDay: boolean;
}

const initialPlaylists: Playlist[] = [
  { id: 1, name: "Chill Lofi", folder: "/downloads/chill-lofi", thumbnail: "/thumbnails/lofi.jpg", checkEveryDay: true },
  { id: 2, name: "EDM Party", folder: "/downloads/edm-party", thumbnail: "/thumbnails/edm.jpg", checkEveryDay: false },
];

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists);
  const router = useRouter();

  const toggleCheckEveryDay = (id: number) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === id ? { ...playlist, checkEveryDay: !playlist.checkEveryDay } : playlist
      )
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-200 mb-6">Manage Playlists</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-gray-900 text-gray-200 p-5 rounded-xl shadow-md cursor-pointer hover:bg-gray-700 transition duration-200"
            onClick={() => router.push(`/playlists/${playlist.id}`)}
          >
            {/* Playlist Thumbnail */}
            <Image
              src={playlist.thumbnail}
              alt={playlist.name}
              width={200}
              height={200}
              className="rounded-lg w-full h-40 object-cover shadow-md"
            />

            {/* Playlist Info */}
            <div className="mt-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">{playlist.name}</h2>
                <div className="text-gray-400 flex items-center text-sm">
                  <Folder size={16} className="mr-2" /> {playlist.folder}
                </div>
              </div>
              <ChevronRight size={24} />
            </div>

            {/* Daily Check Toggle */}
            <div className="mt-4 flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
              <span className="text-sm">{playlist.checkEveryDay ? "Checked Daily ✅" : "Manual Check"}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={playlist.checkEveryDay}
                  onChange={() => toggleCheckEveryDay(playlist.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer-checked:bg-blue-500 transition">
                  <div className={`h-6 w-6 bg-white rounded-full shadow-md transform transition ${playlist.checkEveryDay ? "translate-x-5" : "translate-x-0"}`}></div>
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
