"use client";

import { PlaylistItem } from "@/components/playlists/PlaylistItem";
import usePlaylists from "@/hooks/usePlaylists";
import { Playlist } from "@/types/models";
import AddItem from "@/components/AddItem";

export default function Playlists() {
  const { playlists, isLoading, isError } = usePlaylists();


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400 text-lg animate-pulse">
          Loading playlists...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg font-semibold">
          Failed to load playlists. 😢
        </p>
      </div>
    );
  }


  return (
    <div className="p-6 pb-24">
      <h1 className="text-3xl font-bold text-gray-200 mb-6">
        Manage Playlists
      </h1>

      <AddItem />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists?.map((playlist: Playlist) => (
          <PlaylistItem key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </div>
  );
}
