import { useState } from "react";
import axios from "axios";
import { endpointApi } from "@/constants/endpoints";
import errorToast from "@/components/toasts/errorToast";
import infoToast from "@/components/toasts/infoToast";

interface AddSearchItemButtonProps {
  item: any;
}

export function AddSearchItemButton({ item }: AddSearchItemButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const { type, id } = item;

    if (!id || !type) {
      errorToast("Invalid item.");
      return;
    }

    if (type !== "video" && type !== "playlist") {
      errorToast("Only videos or playlists can be added.");
      return;
    }

    setLoading(true);

    try {
      const target = type === "playlist" ? "playlists" : "videos";

      const response = await axios.post(`${endpointApi}/${target}/${id}`);

      if (response.data.error) {
        errorToast(`${type} already exists!`);
        setLoading(false);
        return;
      }

      infoToast(`Fetching data for ${type}: ${id}`);
    } catch (err) {
      console.error(err);
      errorToast("Failed to add item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="
        ml-auto
        shrink-0
        w-8 h-8
        flex items-center justify-center
        rounded-full
        bg-blue-600/80 
        hover:bg-blue-600
        hover:scale-110
        active:scale-95
        transition-all
        shadow-md shadow-blue-500/20
        text-white
        mt-auto
        mb-auto
      "
    >
      {loading ? (
        <span
          className="
          animate-spin 
          w-4 h-4 
          border-2 border-white border-t-transparent 
          rounded-full
        "
        />
      ) : (
        <span className="text-lg leading-none font-bold">+</span>
      )}
    </button>
  );
}
