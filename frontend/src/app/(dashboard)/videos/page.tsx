import { cookies } from "next/headers";
import { endpointPlaylists } from "@/constants/endpoints";
import VideosDetails from "@/components/videos/VideosDetails";
import axios from "axios";
import { VALID_SORT_FIELDS_VIDEOS, SortOrder } from "@/constants/sortFields";

type SortField = (typeof VALID_SORT_FIELDS_VIDEOS)[number];

export default async function VideosPage() {
  const cookieStore = await cookies();
  const id = "0";
  const sortBy = (cookieStore.get("sort_by")?.value || "upload_date") as SortField;
  const sortOrder = (cookieStore.get("order")?.value || "desc") as SortOrder;

  const res = await axios.get(
    `${endpointPlaylists}/${id}/details?sort_by=${sortBy}&order=${sortOrder}`
  );

  console.log(res.data)

  return (
    <VideosDetails
      id={id}
      initialPlaylist={res.data}
      initialSortBy={sortBy}
      initialSortOrder={sortOrder}
    />
  );
}
