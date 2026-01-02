"use client";

import { Skeleton } from "@heroui/react";
import { Calendar, Captions, Download, Film, FolderDown, User, Video } from "lucide-react";
import { VideoItemSkeleton } from "./VideoItemSkeleton";

export function PlaylistDetailsSkeleton() {
  return (
    <div className="p-3 md:p-12 pb-24">
      {/* Playlist Header */}
      <div className="bg-gray-900 text-gray-200 p-4 md:p-6 rounded-lg shadow-md flex flex-col lg:flex-row items-center gap-6">
        {/* Thumbnail */}
        <Skeleton
          className="rounded-lg shadow-lg flex-1 max-w-[400px] min-w-[220px]
                     aspect-video"
        />

        {/* Playlist Info */}
        <div className="container-playlist-info items-center lg:items-start gap-2">
          {/* Title */}
          <Skeleton className="h-7 w-3/4 rounded-lg" />

          {/* Meta info */}
          <div className="flex flex-col items-start max-w-[100%] lg:contents gap-2">
            <div className="lg:mt-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <User size={16} className="min-w-fit" />
                <Skeleton className="h-4 w-40 rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <Skeleton className="h-4 w-40 rounded-md" />
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-x-6 gap-y-2 max-w-80 min-w-fit ">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Film size={16} />
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Video size={16} />
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Captions size={16} />
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FolderDown size={16} />
              <Skeleton className="h-4 w-56 rounded-md" />
            </div>

            <div className="flex items-center gap-2">
              <Download size={16} />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex lg:flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-5 w-20 rounded-lg sm:inline hidden" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-5 w-20 rounded-lg sm:inline hidden" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-5 w-20 rounded-lg sm:inline hidden" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-5 w-20 rounded-lg sm:inline hidden" />
          </div>
        </div>
      </div>

      {/* Video list */}
      <div className="mt-6 space-y-2 lg:space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <VideoItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
