import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useEffect, useState, useRef, TouchEvent } from "react";

interface ImageZoomProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
  images?: Array<{ url: string; alt: string }>;
  currentIndex?: number;
}

export const ImageZoom = ({
  isOpen,
  onClose,
  imageUrl,
  alt,
  images,
  currentIndex = 0
}: ImageZoomProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [isDownloading, setIsDownloading] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (images?.length) {
      setCurrentImageIndex(currentIndex);
    }
  }, [currentIndex, images]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && images?.length) {
        navigatePrevious();
      } else if (e.key === "ArrowRight" && images?.length) {
        navigateNext();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeydown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, currentImageIndex, images]);

  if (!isOpen) return null;

  const navigatePrevious = () => {
    if (!images?.length) return;
    setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const navigateNext = () => {
    if (!images?.length) return;
    setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const touchDiff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(touchDiff) > minSwipeDistance && images?.length) {
      if (touchDiff > 0) {
        navigateNext();
      } else {
        navigatePrevious();
      }
    }
  };

  const currentImageUrl = images?.length ? images[currentImageIndex].url : imageUrl;
  const currentImageAlt = images?.length ? images[currentImageIndex].alt : alt;

  const getFilename = (url: string) => {
    try {
      const parts = url.split("/");
      const rawName = parts[parts.length - 1].split("?")[0];
      const ext = rawName.includes(".") ? rawName.split(".").pop() : "jpg";

      const match = rawName.match(/-(\d+)\./);
      const index = match ? match[1] : "1";

      const carId = rawName.split("-")[0];

      return `car-${carId}-image-${index}.${ext}`;
    } catch {
      return "car-image.jpg";
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsDownloading(true);
      const response = await fetch(currentImageUrl, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = getFilename(currentImageUrl);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download image:", err);
      alert("Sorry, the image could not be downloaded.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-7xl w-full h-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="absolute top-4 right-14 text-white hover:text-gray-300 z-10"
          aria-label="Download image"
        >
          <Download size={24} />
          {isDownloading && (
            <span className="ml-1 text-xs">...</span>
          )}
        </button>

        {images && images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePrevious();
              }}
              className="absolute left-4 md:left-8 text-white hover:text-gray-300 z-10 bg-black/30 hover:bg-black/50 p-2 rounded-full"
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateNext();
              }}
              className="absolute right-4 md:right-8 text-white hover:text-gray-300 z-10 bg-black/30 hover:bg-black/50 p-2 rounded-full"
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}

        <img
          src={currentImageUrl}
          alt={currentImageAlt}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};