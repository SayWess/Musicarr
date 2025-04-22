import axios from "axios";
import useSWR, { mutate } from "swr";
import { Playlist } from "@/types/models";
import { endpointPlaylists } from "@/constants/endpoints";
import { SortOrder, SortField } from "@/constants/sortFields";


const usePlaylists = (initialPlaylist: Playlist[], sortBy: SortField, sortOrder: SortOrder) => {

  const fetcher = (url: string) => {
    return axios
      .get(url + `?sort_by=${sortBy}&order=${sortOrder}`)
      .then((res) => res.data);
  };

  const { data: playlists, error, isLoading } = useSWR(endpointPlaylists, fetcher, { fallbackData: initialPlaylist });

  // Optimistic Update: Toggle Check
  const toggleCheckEveryDay = async (id: string) => {
    if (!playlists) return;
  
    // Récupérer la playlist et la modifier en local
    const updatedPlaylist: Playlist = playlists.find((p: Playlist) => p.id === id);
    if (!updatedPlaylist) return;
  
    const newPlaylist: Playlist = { ...updatedPlaylist, check_every_day: !updatedPlaylist.check_every_day };
  
    // Mise à jour optimiste (UI change immédiatement)
    const updatedPlaylists = playlists.map((p: Playlist) => (p.id === id ? newPlaylist : p));
    mutate(endpointPlaylists, updatedPlaylists, false);
  
    try {
      // Envoi de la playlist complète au serveur
      await axios.put(`${endpointPlaylists}/${id}`, {"check_every_day": newPlaylist.check_every_day});
      
      // Revalidation après succès (pour être sûr d'avoir les bonnes données)
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
