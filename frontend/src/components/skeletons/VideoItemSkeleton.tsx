"use client";

import { Skeleton } from "@heroui/react";

export function VideoItemSkeleton() {
  return (
    <div
      className="flex items-center bg-gray-900 p-2 md:p-4 rounded-lg shadow-md"
    >
      {/* Thumbnail */}
      <Skeleton
        className="rounded-md w-20 md:w-[120px] aspect-video"
      />

      {/* Text */}
      <div className="ml-4 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
        <Skeleton className="h-3 w-1/3 rounded-md" />
      </div>
    </div>
  );
}
