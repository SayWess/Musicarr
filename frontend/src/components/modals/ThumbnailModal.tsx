import React, { useState } from "react";
import Image from "next/image";

export const useThumbnailModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const openModal = (url: string) => {
    setThumbnailUrl(url);
    setIsOpen(true);
  };

  const closeModal = () => {
    setThumbnailUrl(null);
    setIsOpen(false);
  };

  return { isOpen, thumbnailUrl, openModal, closeModal };
};

interface ThumbnailModalProps {
  isOpen: boolean;
  thumbnailUrl: string | null;
  closeModal: () => void;
}

export const ThumbnailModal = ({
  isOpen,
  thumbnailUrl,
  closeModal,
}: ThumbnailModalProps) => {
  if (!isOpen || !thumbnailUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={closeModal}
    >
      <Image
        src={thumbnailUrl || "/404_page-not-found.webp"}
        alt="Full screen thumbnail"
        width={1280}
        height={720}
        priority={true}
        className="max-w-full max-h-full object-contain cursor-zoom-out rounded-lg"
      />
    </div>
  );
};
