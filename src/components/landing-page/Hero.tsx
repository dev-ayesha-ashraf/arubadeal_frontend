import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface BannerImage {
  id: string;
  image_url: string;
  name: string;
  is_display: number;
}

const fetchBannerImages = async (): Promise<BannerImage[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/banner/get_all`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch banner images");

  const res: BannerImage[] = await response.json();

  return res.sort((a, b) => a.is_display - b.is_display);
};


export const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    data: bannerImages,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bannerImages"],
    queryFn: fetchBannerImages,
  });

  const nextImage = () => {
    if (!bannerImages || bannerImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % bannerImages.length);
  };

  const prevImage = () => {
    if (!bannerImages || bannerImages.length === 0) return;
    setCurrentImageIndex(
      (prev) => (prev - 1 + bannerImages.length) % bannerImages.length
    );
  };

  return (
    <div className="relative h-[70px] lg:mt-0 sm:h-[95px] md:h-[95px] w-full">
      <div className="absolute inset-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : error || !bannerImages || bannerImages.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <p className="text-white text-lg">No banner images available</p>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <img
              src={`${import.meta.env.VITE_MEDIA_URL}${bannerImages[currentImageIndex].image_url}`}
              alt={bannerImages[currentImageIndex].name}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}
      </div>

      {bannerImages && bannerImages.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 sm:left-6 md:left-20 top-1/2 -translate-y-1/2 bg-dealership-primary/20 p-2 rounded-full transition-colors hover:bg-dealership-primary/40 z-10"
            aria-label="Previous image"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 sm:right-6 md:right-20 top-1/2 -translate-y-1/2 bg-dealership-primary/20 p-2 rounded-full transition-colors hover:bg-dealership-primary/40 z-10"
            aria-label="Next image"
          >
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-0 text-center">
          Find Your Perfect Drive
        </h1>


      </div>
    </div>
  );
};