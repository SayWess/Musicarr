import axios from "axios";
import useSWR, { mutate } from "swr";
import { Playlist } from "@/types/models";
import { endpointPlaylists } from "@/constants/endpoints";

const usePlaylists = () => {
  const fetcher = (url: string) => axios.get(url).then((res) => res.data);
  const { data: playlists, error, isLoading } = useSWR(endpointPlaylists, fetcher);

  // ✅ Optimistic Update: Toggle Check
  const toggleCheckEveryDay = async (id: string) => {
    if (!playlists) return;
  
    // 1️⃣ Récupérer la playlist et la modifier en local
    const updatedPlaylist: Playlist = playlists.find((p: Playlist) => p.id === id);
    if (!updatedPlaylist) return;
  
    const newPlaylist: Playlist = { ...updatedPlaylist, check_every_day: !updatedPlaylist.check_every_day };
  
    // 2️⃣ Mise à jour optimiste (UI change immédiatement)
    const updatedPlaylists = playlists.map((p: Playlist) => (p.id === id ? newPlaylist : p));
    mutate(endpointPlaylists, updatedPlaylists, false);
  
    try {
      // 3️⃣ Envoi de la playlist complète au serveur
      await axios.put(`${endpointPlaylists}/${id}`, {"check_every_day": newPlaylist.check_every_day});
      
      // 4️⃣ Revalidation après succès (pour être sûr d'avoir les bonnes données)
      mutate(endpointPlaylists);
    } catch (error) {
      console.error("Error updating playlist", error);
      mutate(endpointPlaylists, playlists, false); // Revert en cas d'échec
    }
  };

  return {
    playlists,
    isLoading,
    isError: error,
    toggleCheckEveryDay,
  };
};

export default usePlaylists;
