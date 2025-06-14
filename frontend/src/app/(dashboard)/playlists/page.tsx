import { cookies } from "next/headers";
import { endpointPlaylists } from "@/constants/endpoints";
import axios from "axios";
import { SortOrder, SortField } from "@/constants/sortFields";
import Playlists from "@/components/playlists/PlaylistsGrid";
import { COOKIE_KEY_PLAYLISTS_SORT_BY, COOKIE_KEY_PLAYLISTS_ORDER, COOKIE_KEY_PLAYLISTS_GRID_SIZE } from "@/constants/cookies_keys";

export default async function PlaylistsPage() {
  const cookieStore = await cookies();
  const sortBy = (cookieStore.get(COOKIE_KEY_PLAYLISTS_SORT_BY)?.value || "title") as SortField;
  const sortOrder = (cookieStore.get(COOKIE_KEY_PLAYLISTS_ORDER)?.value || "desc") as SortOrder;
  const gridSize = cookieStore.get(COOKIE_KEY_PLAYLISTS_GRID_SIZE)?.value || "false";

  const res = await axios.get(
    `${endpointPlaylists}/?sort_by=${sortBy}&order=${sortOrder}`
  );

  return (
    <Playlists
      initialPlaylists={res.data}
      initialSortBy={sortBy}
      initialSortOrder={sortOrder}
      initialIsGridSmall={gridSize === "true"}
    />
  );
}