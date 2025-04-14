import { useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { mutate } from "swr";
import { endpointPlaylists } from "@/constants/endpoints";
import { ParamValue } from "next/dist/server/request/params";
import axios from "axios";
import errorToast from "./toasts/errorToast";

type SortField = "title" | "upload_date" | "state";
type SortOrder = "asc" | "desc";

interface SortVideosProps {
  id: ParamValue;
  currentSortBy: SortField;
  setSortBy: (sortBy: SortField) => void;
  currentSortOrder: SortOrder;
  setSortOrder: (sortOrder: SortOrder) => void;
}

export const SortVideos = ({
  id,
  currentSortBy,
  setSortBy,
  currentSortOrder,
  setSortOrder,
}: SortVideosProps) => {
  const [showOptions, setShowOptions] = useState(false); // for mobile toggle

  const updateSort = (newSortBy: SortField) => {
    const newOrder =
      currentSortBy === newSortBy
        ? currentSortOrder === "asc"
          ? "desc"
          : "asc"
        : "asc";

    setSortBy(newSortBy);
    setSortOrder(newOrder);

    // Save sortBy and order in cookies
    document.cookie = `sort_by=${newSortBy}; path=/; max-age=31536000`;
    document.cookie = `order=${newOrder}; path=/; max-age=31536000`;

    async function fetchData() {
      const fetcher = (url: string) =>
        axios
          .get(url + `?sort_by=${newSortBy}&order=${newOrder}`)
          .then((res) => res.data);
      const response = await fetcher(`${endpointPlaylists}/${id}/details`);
      
      if (!response) {
        console.error("No response data");
        errorToast("No response data");
        return;
      }
      // Manually trigger a re-fetch for the new parameters
      mutate(`${endpointPlaylists}/${id}/details`, response, false);
    }

    fetchData().catch((error) => {
      console.error("Error fetching data:", error);
      errorToast("Error fetching data: " + error);
    });

  };

  return (
    <div className="fixed left-1/2 bottom-1 mb-10 md:mb-2 transform -translate-x-1/2 z-25 flex gap-2">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg"
      >
        <ArrowDownUp size={20} />
      </button>

      {showOptions && (
        <div className="bg-gray-800 text-white rounded-lg p-4 absolute bottom-12 left-1/2 transform -translate-x-1/2 w-48 z-50">
          <div className="text-center font-bold mb-2">Sort by:</div>
          {(["title", "upload_date", "state"] as SortField[]).map((field) => (
            <button
              key={field}
              onClick={() => updateSort(field)}
              className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition ${
                currentSortBy === field
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              {field.charAt(0).toUpperCase() + field.slice(1)}
              {currentSortBy === field && (
                <span className="ml-1">
                  {currentSortOrder === "asc" ? "↑" : "↓"}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
