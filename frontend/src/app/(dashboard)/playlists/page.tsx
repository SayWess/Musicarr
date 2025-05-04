import { cookies } from "next/headers";
import { endpointPlaylists } from "@/constants/endpoints";
import axios from "axios";
import { SortOrder, SortField } from "@/constants/sortFields";
import Playlists from "@/components/playlists/PlaylistsGrid";

export default async function PlaylistsPage() {
  const cookieStore = await cookies();
  const sortBy = (cookieStore.get("playlists_sort_by")?.value || "title") as SortField;
  const sortOrder = (cookieStore.get("playlists_order")?.value || "desc") as SortOrder;
  const gridSize = cookieStore.get("playlists_grid_size")?.value || "false";

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