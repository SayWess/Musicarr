import React from "react";
import useSWR from "swr";
import { endpointPlaylists } from "@/constants/endpoints";
import axios from "axios";
import { Download } from "lucide-react";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const NumberOfVideosDownloaded = ({ playlist_id }: { playlist_id: string }) => {
  const { data: data, isLoading } = useSWR(
    `${endpointPlaylists}/${playlist_id}/number_of_videos_downloaded`,
    fetcher
  );

  return (
    <div className="flex items-center gap-2">
      <Download size={16} />
      Videos:{" "}

      { !isLoading && data ? (
        <span className="font-medium">
            {data.downloaded_videos} / {data.total_videos}
        </span>
        ) : (
            <span className="text-gray-400">
                Loading...
            </span>
            )
        } 
    </div>
  );
};


export default NumberOfVideosDownloaded;