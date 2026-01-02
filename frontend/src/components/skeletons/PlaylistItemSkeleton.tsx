"use client";

import { Skeleton } from '@heroui/react';

export function PlaylistItemSkeleton({ isGridSmall }: { isGridSmall: boolean }) {
  return (
    <div className="space-y-3">
      <Skeleton
        className={isGridSmall ? "h-21 rounded-xl" : "h-37 rounded-xl"}
      />
    </div>
  );
}
