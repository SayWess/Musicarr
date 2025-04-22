import { useState, useEffect, useRef } from "react";
import { ArrowDownUp } from "lucide-react";
import { mutate } from "swr";
import axios from "axios";
import errorToast from "./toasts/errorToast";
import { SortField, SortOrder } from "@/constants/sortFields";

interface SortVideosProps {
  currentSortBy: SortField;
  setSortBy: (sortBy: SortField) => void;
  currentSortOrder: SortOrder;
  setSortOrder: (sortOrder: SortOrder) => void;
  validSortFields: SortField[];
  SWR_endpoint: string;
  cookie_key: string;
}

export const SortVideos = ({
  currentSortBy,
  setSortBy,
  currentSortOrder,
  setSortOrder,
  validSortFields,
  SWR_endpoint,
  cookie_key,
}: SortVideosProps) => {
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  const updateSort = (newSortBy: SortField) => {
    const newOrder =
      currentSortBy === newSortBy
        ? currentSortOrder === "asc"
          ? "desc"
          : "asc"
        : "asc";

    setSortBy(newSortBy);
    setSortOrder(newOrder);

    document.cookie = `${cookie_key}_sort_by=${newSortBy}; path=/; max-age=31536000; SameSite=Lax;`;
    document.cookie = `${cookie_key}_order=${newOrder}; path=/; max-age=31536000; SameSite=Lax;`;

    async function fetchData() {
      try {
        const response = await axios.get(
          `${SWR_endpoint}?sort_by=${newSortBy}&order=${newOrder}`
        );
        mutate(SWR_endpoint, response.data, false);
      } catch (error) {
        console.error("Error fetching data:", error);
        errorToast("Error fetching data: " + error);
      }
    }

    fetchData();
  };

  return (
    <>
      {showOptions && <div className="fixed w-full h-full z-25"></div>}
      <div className="fixed left-1/2 bottom-1 mb-10 md:mb-2 transform -translate-x-1/2 z-25 flex gap-2">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg"
        >
          <ArrowDownUp size={20} />
        </button>

        {showOptions && (
          <div
            ref={menuRef}
            className="bg-gray-800 text-white gap-2 flex flex-col ring-2 ring-gray-600 rounded-lg p-4 absolute bottom-12 left-1/2 transform -translate-x-1/2 w-100 max-w-[80vw] max-h-[80vh] z-50"
          >
            <div className="text-center font-bold mb-2">Sort by:</div>
            <div className="flex flex-wrap justify-center gap-2">
              {validSortFields.map((field) => (
                <button
                  key={field}
                  onClick={() => updateSort(field)}
                  className={`block text-left px-4 py-2 rounded-lg text-sm transition ${
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
          </div>
        )}
      </div>
    </>
  );
};
