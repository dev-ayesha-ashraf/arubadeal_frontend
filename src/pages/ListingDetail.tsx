import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Mail, Phone, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { ListingCard } from "@/components/common/ListingCard";
import { useState, useRef, useEffect, TouchEvent, useMemo } from "react";
import { ImageZoom } from "@/components/common/ImageZoom";
import { ShareButtons } from "@/components/common/ShareButtons";

interface Feature {
  _id: string;
  name: string;
  value: string;
}

interface Dealer {
  _id: string;
  name: string;
  image: string | null;
  email: string;
  phoneNo: string | null;
  address: string | null;
}

interface Image {
  _id: string;
  image: string;
  isPrimary: boolean;
}

interface TechnicalSpecification {
  make: string;
  type: string;
  engine: string;
  transmission: string;
  fuelTypes: string[];
}

interface CarListing {
  _id: string;
  title: string;
  description: string;
  price: string;
  mileage: number;
  dear: Dealer;
  features: Feature[];
  images: Image[];
  badges: string[];
  address: string;
  technicalSpecification: TechnicalSpecification;
  slug: string;
}

// Fetch function for car detail
const fetchCarDetail = async (slug: string): Promise<CarListing> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cars/get-car-by-slug/${slug}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch car detail");
  const res = await response.json();
  return res.data;
};

const ListingDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["carDetail", slug],
    queryFn: () => fetchCarDetail(slug!),
    enabled: !!slug,
  });
  useEffect(() => {
    if (listing?.images?.length) {
      setSelectedImageIndex(0);
    }
  }, [listing?.images]);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchDiff = touchStartX.current - touchEndX;
    const minSwipeDistance = 50;

    if (Math.abs(touchDiff) > minSwipeDistance) {
      if (touchDiff > 0) {
        navigateNext();
      } else {
        navigatePrevious();
      }
    }

    touchStartX.current = null;
  };

  // Navigation functions for gallery
  const navigatePrevious = () => {
    if (!listing?.images?.length) return;
    setSelectedImageIndex((prev) =>
      prev !== null ? (prev > 0 ? prev - 1 : listing.images.length - 1) : 0
    );
  };

  const navigateNext = () => {
    if (!listing?.images?.length) return;
    setSelectedImageIndex((prev) =>
      prev !== null ? (prev < listing.images.length - 1 ? prev + 1 : 0) : 0
    );
  };

  // Function to handle keyboard navigation
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        navigatePrevious();
      } else if (e.key === "ArrowRight") {
        navigateNext();
      }
    };

    if (listing?.images?.length) {
      document.addEventListener("keydown", handleKeydown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [listing?.images]);

  // Format images for ImageZoom
  const formattedImages = useMemo(() => {
    if (!listing?.images) return [];
    return listing.images.map((img) => ({
      url: img.image,
      alt: listing.title || 'Vehicle image'
    }));
  }, [listing?.images, listing?.title]);

  // Open zoom view with the selected image
  const openZoomView = (index: number) => {
    setSelectedImageIndex(index);
    setIsZoomOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!listing) return <div>Listing not found</div>;

  const listingUrl = `${window.location.origin}/listings/${slug}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16 md:mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card className="overflow-hidden relative">
              <div className="relative">
                <div
                  className="relative h-[300px] md:h-[400px] bg-gray-100 flex items-center justify-center overflow-hidden"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {listing?.images?.length > 0 ? (
                    <>
                      <img
                        src={`${import.meta.env.VITE_MEDIA_URL}/${listing.images[selectedImageIndex]?.image ?? listing.images[0]?.image}`}
                        alt={listing.title}
                        className="w-full h-full object-contain cursor-pointer"
                        onClick={() => openZoomView(selectedImageIndex ?? 0)}
                      />

                      {/* Navigation arrows */}
                      {listing.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigatePrevious();
                            }}
                            className="absolute left-4 text-white z-10 bg-black/30 hover:bg-black/50 p-2 rounded-full"
                            aria-label="Previous image"
                          >
                            <ChevronLeft size={24} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateNext();
                            }}
                            className="absolute right-4 text-white z-10 bg-black/30 hover:bg-black/50 p-2 rounded-full"
                            aria-label="Next image"
                          >
                            <ChevronRight size={24} />
                          </button>

                          {/* Image counter */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                            {(selectedImageIndex ?? 0) + 1} / {listing.images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-400">No image available</div>
                  )}
                </div>

                {/* Thumbnails */}
                {listing?.images?.length > 1 && (
                  <div className="flex overflow-x-auto p-2 gap-2 bg-gray-50">
                    {listing.images.map((img, index) => (
                      <div
                        key={img._id}
                        className={`w-20 h-20 flex-shrink-0 cursor-pointer ${selectedImageIndex === index ? "ring-2 ring-primary" : ""
                          }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={`${import.meta.env.VITE_MEDIA_URL}/${img.image}`}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Vehicle Details */}
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-dealership-navy">
                    {listing.title}
                  </h1>
                  <p className="text-3xl font-bold text-dealership-primary">
                    AWG {Number(listing.price).toLocaleString()}
                  </p>
                </div>
                <ShareButtons title={listing.title} url={listingUrl} />
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Overview</h2>
                  <p className="text-gray-600">
                    {listing.description}
                  </p>
                </Card>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Technical Specifications</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Engine</p>
                      <p className="text-gray-600">{listing.technicalSpecification.engine}</p>
                    </div>
                    <div>
                      <p className="font-medium">Transmission</p>
                      <p className="text-gray-600">{listing.technicalSpecification.transmission}</p>
                    </div>
                    <div>
                      <p className="font-medium">Type</p>
                      <p className="text-gray-600">{listing.technicalSpecification.type}</p>
                    </div>
                    <div>
                      <p className="font-medium">Mileage</p>
                      <p className="text-gray-600">{listing.mileage.toLocaleString()} miles</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Features & Options</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {listing.features.map((feature) => (
                      <li key={feature._id} className="list-none">
                        {feature.name}: {feature.value}
                      </li>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Vehicle Location</h2>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-dealership-primary" />
                    <span>{listing.address}</span>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dealer Info */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Dealer Information</h2>
              <div className="space-y-4">
                <div className="flex flex-col items-center text-center">
                  {listing.dear.image && (
                    <img
                      src={`${import.meta.env.VITE_MEDIA_URL}/${listing.dear.image}`}
                      alt={listing.dear.name}
                      className="w-20 h-20 object-cover rounded-full mb-3"
                    />
                  )}
                  <p className="font-medium">{listing.dear.name}</p>
                  <p className="text-gray-600">{listing.dear.address}</p>
                </div>
                <div className="space-y-2">
                  {listing.dear.phoneNo && (
                    <Button className="w-full flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {listing.dear.phoneNo}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email Dealer
                  </Button>
                </div>
              </div>
            </Card>

            {/* Contact Form */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Form</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input type="text" className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input type="tel" className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={4}
                  ></textarea>
                </div>
                <Button className="w-full">Send Message</Button>
              </form>
            </Card>
          </div>
        </div>

        {/* More Vehicles */}
        {/* <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">More Vehicles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Link key={item} to={`/listings/${item}`}>
                <ListingCard />
              </Link>
            ))}
          </div>
        </div> */}
      </div>
      <Footer />

      {/* Image Zoom Modal */}
      {isZoomOpen && (
        <ImageZoom
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
          imageUrl={formattedImages[selectedImageIndex ?? 0]?.url || ''}
          alt={formattedImages[selectedImageIndex ?? 0]?.alt || ''}
          images={formattedImages}
          currentIndex={selectedImageIndex ?? 0}
        />
      )}
    </div>
  );
};

export default ListingDetail;
