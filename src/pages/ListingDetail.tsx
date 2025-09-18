// ListingDetail.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Mail, Phone, ChevronLeft, ChevronRight, Trash2, Upload, Move, Check, Star } from "lucide-react";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { ImageZoom } from "@/components/common/ImageZoom";
import { ShareButtons } from "@/components/common/ShareButtons";
import { trackCustomEvent } from "@/lib/init-pixel";

interface Feature {
  _id: string;
  name: string;
  value: string;
}

interface Dealer {
  _id?: string;
  name?: string;
  image?: string | null;
  email?: string;
  phoneNo?: string | null;
  address?: string | null;
}

interface ImageItem {
  _id: string;
  image: string;
  isPrimary?: boolean;
  isDisplay?: boolean;
}

interface TechnicalSpecification {
  make?: string;
  type?: string;
  engine?: string;
  transmission?: string;
  fuelTypes?: string[];
}

interface CarListing {
  _id: string;
  title?: string;
  description?: string;
  price?: string | number;
  mileage?: number | string;
  dear?: Dealer;
  dealer?: Dealer;
  features?: Feature[];
  images?: ImageItem[];
  badges?: string[];
  address?: string;
  technicalSpecification?: TechnicalSpecification;
  slug?: string;
  vehicleId?: string;
}

interface CarType {
  _id: string;
  name: string;
  slug: string;
}

const fetchCarDetail = async (slug: string): Promise<CarListing> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/car_listing/get_car/${slug}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch car detail");
  const res = await response.json();

  const mapped: CarListing = {
    _id: res.id,
    title: res.title,
    description: res.condition,
    price: res.price,
    mileage: res.mileage,
    vehicleId: res.vehical_id,
    dealer: {
      _id: res.dealer?.id,
      name: [res.dealer?.first_name, res.dealer?.last_name].filter(Boolean).join(" "),
      address: res.location,
    },
    address: res.location,
    features: (res.features ?? []).map((f: any, i: number) => ({
      _id: `${i}`,
      name: f.name,
      value: f.reason ?? "",
    })),
    images: (res.images ?? [])
      .filter((img: any) => img.is_display !== false)
      .map((img: any) => ({
        _id: img.id,
        image: img.image_url,
        isPrimary: img.is_primary,
        isDisplay: img.is_display,
      })),
    technicalSpecification: {
      make: res.make?.name,
      type: res.body_type?.name,
      engine: res.engine_type,
      transmission: res.transmission?.name,
      fuelTypes: res.fuel_type?.name ? [res.fuel_type.name] : [],
    },
    slug: res.slug,
  };

  return mapped;
};

interface ListingDetailProps {
  isAdmin?: boolean;
}

const getImageUrl = (imgPath: string) =>
  imgPath?.startsWith?.("http")
    ? imgPath
    : `${import.meta.env.VITE_MEDIA_URL}/${imgPath}`;

const parseMileage = (m: number | string | undefined): { value: number | ""; unit: "miles" | "km" } => {
  if (typeof m === "number") return { value: m, unit: "miles" };
  if (typeof m === "string") {
    const trimmed = m.trim();
    const numMatch = trimmed.match(/^([\d,.]+)/);
    const value = numMatch ? Number(numMatch[1].replace(/,/g, "")) : "";
    const unit = trimmed.toLowerCase().includes("km") ? "km" : "miles";
    return { value: value === "" ? "" : value, unit };
  }
  return { value: "", unit: "miles" };
};

const ListingDetail: React.FC<ListingDetailProps> = ({ isAdmin = false }) => {
  const { slug } = useParams<{ slug: string }>();
  const { data: carTypes = [], isLoading: typesLoading } = useQuery<CarType[]>({
    queryKey: ["carTypes"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bodytype/get_all`);
      if (!res.ok) throw new Error("Failed to fetch car types");
      const json = await res.json();
      return json.map((item: any) => ({
        _id: item.id,
        name: item.name,
        slug: item.slug,
      }));
    },
  });

  const [editableListing, setEditableListing] = useState<CarListing | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [mileageValue, setMileageValue] = useState<number | "">("");
  const [mileageUnit, setMileageUnit] = useState<"miles" | "km">("miles");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  const { data: listing, isLoading, refetch } = useQuery({
    queryKey: ["carDetail", slug],
    queryFn: () => fetchCarDetail(slug!),
    enabled: !!slug,
  });

  const [lookupData, setLookupData] = useState({
    makes: [] as any[],
    bodytypes: [] as any[],
    fueltypes: [] as any[],
    transmissions: [] as any[],
  });
  useEffect(() => {
    if (listing) {
      trackCustomEvent("ListingDetailViewed", {
        listing_id: listing._id,
        listing_title: listing.title,
        price: listing.price,
        make: listing.technicalSpecification?.make,
        vehicle_id: listing.vehicleId,
      });
    }
  }, [listing]);
  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const endpoints = [
          '/make/get_all',
          '/bodytype/get_all',
          '/fueltype/get_all',
          '/transmission/get_all'
        ];

        const responses = await Promise.all(
          endpoints.map(endpoint =>
            fetch(`${import.meta.env.VITE_API_URL}${endpoint}`).then(res => res.json())
          )
        );

        setLookupData({
          makes: responses[0] || [],
          bodytypes: responses[1] || [],
          fueltypes: responses[2] || [],
          transmissions: responses[3] || [],
        });
      } catch (error) {
        console.error("Failed to fetch lookup data:", error);
      }
    };

    fetchLookupData();
  }, []);

  useEffect(() => {
    if (listing) {
      console.log("Fetched listing data:", listing);
    }
  }, [listing]);

  useEffect(() => {
    if (!listing) return;

    setEditableListing((prev) => {
      if (!prev || prev._id !== listing._id) {
        return {
          ...listing,
          features: [...(listing.features ?? [])],
          images: [...(listing.images ?? [])],
          technicalSpecification: { ...(listing.technicalSpecification || {}) },
        };
      }
      return {
        ...listing,
        ...prev,
        features: prev.features && prev.features.length
          ? [...prev.features]
          : [...(listing.features ?? [])],
        images: prev.images && prev.images.length
          ? [...prev.images]
          : [...(listing.images ?? [])],
        technicalSpecification: {
          ...(listing.technicalSpecification || {}),
          ...(prev.technicalSpecification || {}),
        },
      };
    });

    const parsed = parseMileage(listing.mileage);
    setMileageValue((old) => (old === "" ? parsed.value : old));
    setMileageUnit((old) => (old ? old : parsed.unit));

    if (listing.images?.length && selectedImageIndex === null) {
      setSelectedImageIndex(0);
    }
  }, [listing]);

  const displayImages = useMemo(() => {
    const images = (editableListing?.images ?? listing?.images ?? []);
    return images.filter(img => img.isDisplay !== false);
  }, [editableListing?.images, listing?.images]);

  const formattedImages = useMemo(() => {
    const imgs = (editableListing ?? listing)?.images ?? [];
    return imgs.map((img) => ({
      url: getImageUrl(img.image),
      alt: (editableListing ?? listing)?.title ?? "Vehicle image",
      _id: img._id,
    }));
  }, [editableListing?.images, listing?.images, editableListing?.title, listing?.title]);

  const dealer = useMemo<Dealer | undefined>(() => {
    const base = editableListing ?? listing;
    if (base?.dealer?.name) return base.dealer;
    if (base?.dear?.name) return base.dear;
    return base?.dealer ?? base?.dear;
  }, [editableListing, listing]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigatePrevious();
      if (e.key === "ArrowRight") navigateNext();
    };
    if ((editableListing ?? listing)?.images?.length) {
      document.addEventListener("keydown", handler);
    }
    return () => document.removeEventListener("keydown", handler);
  }, [editableListing?.images, listing?.images]);

  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const min = 50;
    if (Math.abs(diff) > min) {
      if (diff > 0) navigateNext();
      else navigatePrevious();
    }
    touchStartX.current = null;
  };

  const navigatePrevious = () => {
    if (!displayImages.length) return;
    setSelectedImageIndex((prev) =>
      prev !== null ? (prev > 0 ? prev - 1 : displayImages.length - 1) : 0
    );
  };

  const navigateNext = () => {
    if (!displayImages.length) return;
    setSelectedImageIndex((prev) => {
      const newIndex = prev !== null ? (prev < displayImages.length - 1 ? prev + 1 : 0) : 0;
      trackCustomEvent("ImageNavigation", {
        listing_id: listing?._id,
        direction: "next",
        new_index: newIndex,
      });
      return newIndex;
    });
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleSelectAll = () => {
    if (!editableListing?.images) return;

    if (selectedImages.length === editableListing.images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(editableListing.images.map(img => img._id));
    }
  };

  const setImageAsPrimary = async (imageId: string) => {
    if (!editableListing || !editableListing.images) return;
    try {
      const token = localStorage.getItem("access_token")?.replace(/(^"|"$)/g, "");
      if (!token) throw new Error("Login required");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/car_listing/update_images?image_id=${imageId}&make_primary=true`,
        {
          method: "PUT",
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to set primary image");

      // update local state after successful API call
      const imageIndex = editableListing.images.findIndex(img => img._id === imageId);
      if (imageIndex === -1) return;

      const newImages = [...editableListing.images];
      const [movedImage] = newImages.splice(imageIndex, 1);
      newImages.unshift(movedImage);

      setEditableListing({
        ...editableListing,
        images: newImages
      });

      if (selectedImageIndex === imageIndex) {
        setSelectedImageIndex(0);
      } else if (selectedImageIndex !== null && selectedImageIndex < imageIndex) {
        setSelectedImageIndex(selectedImageIndex + 1);
      }

      alert("Primary image updated successfully!");
    } catch (error) {
      console.error("Error setting primary image:", error);
      alert("Failed to set primary image");
    }
  };


  const deleteSelectedImages = async () => {
    if (!editableListing || selectedImages.length === 0) return;

    try {
      const token = localStorage.getItem("access_token")?.replace(/(^"|"$)/g, "");
      if (!token) throw new Error("Login required");

      const deletePromises = selectedImages.map(imageId =>
        fetch(
          `${import.meta.env.VITE_API_URL}/car_listing/update_images?image_id=${imageId}&mark_not_to_show=true&make_primary=false`,
          {
            method: "PUT",
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          }
        )
      );

      const responses = await Promise.all(deletePromises);
      const failedDeletes = responses.filter(response => !response.ok);

      if (failedDeletes.length > 0) {
        throw new Error(`Failed to delete ${failedDeletes.length} images`);
      }
      const updatedImages = editableListing.images.filter(img => !selectedImages.includes(img._id));
      setEditableListing({ ...editableListing, images: updatedImages });

      setSelectedImages([]);
      if (selectedImageIndex !== null && selectedImages.includes(editableListing.images[selectedImageIndex]._id)) {
        setSelectedImageIndex(updatedImages.length > 0 ? 0 : null);
      }

      alert("Selected images deleted successfully!");
    } catch (err) {
      console.error("Error deleting images:", err);
      alert("Failed to delete some images. Check console for details.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editableListing || !e.target.files?.length) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("access_token")?.replace(/(^"|"$)/g, "");
      if (!token) throw new Error("Login required");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/car_listing/upload_image/${editableListing._id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to upload image");
      const resData = await response.json();
      const newImage: ImageItem = {
        _id: resData.id,
        image: resData.image_url,
        isPrimary: resData.is_primary ?? false,
      };

      setEditableListing({
        ...editableListing,
        images: [...(editableListing.images ?? []), newImage],
      });

    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    }

    e.target.value = "";
  };

  const updateField = (field: keyof CarListing, value: any) => {
    if (!editableListing) return;
    setEditableListing({ ...editableListing, [field]: value });
  };

  const updateTechnicalSpec = (field: keyof TechnicalSpecification, value: any) => {
    if (!editableListing) return;
    setEditableListing({
      ...editableListing,
      technicalSpecification: {
        ...(editableListing.technicalSpecification || {}),
        [field]: value,
      },
    });
  };

  const addFeature = () => {
    if (!editableListing) return;
    const newFeature: Feature = { _id: `new-${Date.now()}`, name: "", value: "" };
    setEditableListing({
      ...editableListing,
      features: [...(editableListing.features ?? []), newFeature],
    });
  };

  const updateFeature = (id: string, field: "name" | "value", value: string) => {
    if (!editableListing) return;
    setEditableListing({
      ...editableListing,
      features: editableListing.features?.map((f) =>
        f._id === id ? { ...f, [field]: value } : f
      ) ?? [],
    });
  };

  const deleteFeature = (id: string) => {
    if (!editableListing) return;
    setEditableListing({
      ...editableListing,
      features: editableListing.features?.filter((f) => f._id !== id) ?? [],
    });
  };

  const saveChanges = async () => {
    if (!editableListing) return;
    try {
      const findIdByName = (items: any[], name: string | undefined) => {
        if (!name) return null;
        const item = items.find(item => item.name.toLowerCase() === name.toLowerCase());
        return item?._id || null;
      };

      const payload = {
        make_id: findIdByName(lookupData.makes, editableListing.technicalSpecification?.make),
        model: editableListing.technicalSpecification?.type?.trim() || null,
        fuel_type_id: findIdByName(lookupData.fueltypes, editableListing.technicalSpecification?.fuelTypes?.[0]),
        transmission_id: findIdByName(lookupData.transmissions, editableListing.technicalSpecification?.transmission),
        engine_type: editableListing.technicalSpecification?.engine || null,
        body_type_id: findIdByName(lookupData.bodytypes, editableListing.technicalSpecification?.type),
        badge_id: null,
        color: null,
        mileage: mileageValue !== "" ? `${mileageValue} ${mileageUnit}` : null,
        price: Number(editableListing.price || 0),
        description: editableListing.description?.trim() || null,
        location: editableListing.address?.trim() || null,
        seats: null,
        condition: "used",
        features: (editableListing.features ?? [])
          .filter(f => f.name?.trim() && f.value?.trim())
          .map(f => ({
            name: f.name.trim(),
            reason: f.value.trim(),
          })),
      };

      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== null && v !== undefined)
      );

      console.log("Sending payload:", cleanPayload);

      const token = localStorage.getItem("access_token")?.replace(/(^"|"$)/g, "");
      if (!token) {
        alert("You need to login first.");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/car_listing/update/${editableListing._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(cleanPayload),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("Server response:", errText);
        throw new Error("Failed to save changes");
      }

      alert("Listing updated successfully!");
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Error saving changes. Check console.");
    }
  };

  useEffect(() => {
    console.log("Lookup data loaded:", lookupData);
  }, [lookupData]);

  if (isLoading) return <div>Loading...</div>;
  if (!listing && !editableListing) return <div>Listing not found</div>;

  const display = isAdmin ? editableListing ?? listing : listing ?? editableListing;
  const listingUrl = `${window.location.origin}/listings/${slug}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16 md:mt-0">
        <div className="flex justify-end mb-4">
          {isAdmin && (
            <Button onClick={saveChanges} className="bg-dealership-primary text-white">
              Save Changes
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden relative">
              <div className="relative">
                <div className="relative h-[300px] md:h-[400px] bg-gray-100 flex items-center justify-center overflow-hidden group"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  {displayImages.length ? (
                    <>
                      <img
                        src={getImageUrl(displayImages[selectedImageIndex ?? 0]?.image)}
                        alt={display?.title}
                        className="w-full h-full object-contain cursor-pointer"
                        onClick={() => {
                          setSelectedImageIndex(selectedImageIndex ?? 0);
                          setIsZoomOpen(true);
                          trackCustomEvent("ImageZoomOpened", {
                            listing_id: listing?._id,
                            image_index: selectedImageIndex ?? 0,
                            total_images: displayImages.length,
                          });
                        }}
                      />

                      {displayImages.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigatePrevious();
                            }}
                            aria-label="Previous image"
                            className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 z-10 flex items-center justify-center"
                          >
                            <ChevronLeft size={24} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateNext();
                            }}
                            aria-label="Next image"
                            className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 z-10 flex items-center justify-center"
                          >
                            <ChevronRight size={24} />
                          </button>

                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full select-none">
                            {(selectedImageIndex ?? 0) + 1} / {displayImages.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-400">No image available</div>
                  )}
                </div>

                {isAdmin && editableListing?.images && editableListing.images.length > 0 && (
                  <div className="p-3 bg-gray-100 border-t flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="select-all-images"
                        checked={selectedImages.length === editableListing.images.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-dealership-primary focus:ring-dealership-primary"
                      />
                      <label htmlFor="select-all-images" className="text-sm text-gray-700">
                        Select all ({selectedImages.length}/{editableListing.images.length})
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={isReordering ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsReordering(!isReordering)}
                        className="flex items-center gap-1"
                      >
                        <Move size={16} />
                        {isReordering ? "Done Rearranging" : "Rearrange Images"}
                      </Button>

                      {selectedImages.length > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={deleteSelectedImages}
                          className="flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete Selected ({selectedImages.length})
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {display?.images?.length > 1 && (
                  <div className="flex overflow-x-auto p-2 gap-2 bg-gray-50">
                    {displayImages.map((img, index) => {
                      const isSelected = selectedImages.includes(img._id);
                      const isPrimary = index === 0;

                      return (
                        <div
                          key={img._id}
                          className={`relative w-20 h-20 flex-shrink-0 cursor-pointer ${selectedImageIndex === index ? "ring-2 ring-primary" : ""} ${isReordering ? "cursor-move" : ""}`}
                          onClick={() => {
                            if (isReordering) return;
                            setSelectedImageIndex(index);
                          }}
                          draggable={isReordering}
                          onDragStart={(e) => {
                            if (!isReordering) return;
                            e.dataTransfer.setData("text/plain", index.toString());
                          }}
                          onDragOver={(e) => {
                            if (!isReordering) return;
                            e.preventDefault();
                          }}
                          onDrop={async (e) => {
                            if (!isReordering) return;
                            e.preventDefault();

                            const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
                            const newImages = [...displayImages];
                            const [movedImage] = newImages.splice(fromIndex, 1);
                            newImages.splice(index, 0, movedImage);

                            if (editableListing) {
                              setEditableListing({
                                ...editableListing,
                                images: newImages
                              });
                            }

                            try {
                              const token = localStorage.getItem("access_token")?.replace(/(^"|"$)/g, "");
                              if (!token) throw new Error("Login required");

                              await fetch(
                                `${import.meta.env.VITE_API_URL}/car_listing/update_images?image_id=${movedImage._id}&new_position=${index}`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "accept": "application/json",
                                    "Authorization": `Bearer ${token}`,
                                  },
                                }
                              );
                            } catch (err) {
                              console.error("Failed to update image position:", err);
                              alert("Failed to save image order on server");
                            }
                          }}

                        >
                          <img
                            src={getImageUrl(img.image)}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {isAdmin && (
                            <>
                              {isPrimary && (
                                <div className="absolute top-1 left-1 bg-green-600 text-white text-[10px] font-semibold px-1 rounded select-none pointer-events-none">
                                  PRIMARY
                                </div>
                              )}

                              {isReordering ? (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                                  <Move size={16} />
                                </div>
                              ) : (
                                <>
                                  <div className="absolute top-1 right-1">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleImageSelect(img._id)}
                                      className="h-4 w-4 rounded border-gray-300 text-dealership-primary focus:ring-dealership-primary"
                                    />
                                  </div>

                                  {isSelected && (
                                    <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                                      <Check className="text-white bg-blue-500 rounded-full p-0.5" size={16} />
                                    </div>
                                  )}

                                  {!isPrimary && (
                                    <button
                                      className="absolute bottom-1 right-1 bg-yellow-500 text-white p-1 rounded-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setImageAsPrimary(img._id);
                                      }}
                                      title="Set as primary image"
                                    >
                                      <Star size={12} fill="currentColor" />
                                    </button>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}

                    {isAdmin && !isReordering && (
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center w-24 h-16 cursor-pointer border-2 border-dashed border-gray-400 text-gray-600 rounded"
                      >
                        <Upload size={20} />
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                )}

              </div>
            </Card>

            <div className="space-y-6">
              <div className="justify-between items-start">
                <div>
                  {isAdmin ? (
                    <div className="w-full">
                      <label
                        htmlFor="listing-title"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Title
                      </label>
                      <input
                        id="listing-title"
                        type="text"
                        value={display?.title ?? ""}
                        onChange={(e) => updateField("title", e.target.value)}
                        placeholder="Enter title"
                        className="w-full border border-gray-300 focus:border-dealership-navy focus:ring-2 focus:ring-dealership-navy/20 rounded-lg px-4 py-2 text-dealership-navy font-bold text-lg sm:text-2xl transition-colors duration-200"
                      />
                    </div>

                  ) : (
                    <h1 className="text-3xl font-bold text-dealership-navy">{display?.title}</h1>
                  )}
                  {isAdmin ? (
                    <div className="w-full mt-3">
                      <label
                        htmlFor="listing-price"
                        className="block text-sm font-medium text-gray-600 mb-1"
                      >
                        Price
                      </label>
                      <input
                        id="listing-price"
                        type="text"
                        value={String(display?.price ?? "")}
                        onChange={(e) => updateField("price", e.target.value)}
                        className="w-full border rounded p-2 font-semibold text-dealership-primary text-lg sm:text-xl"
                        placeholder="Enter price"
                      />
                    </div>

                  ) : (
                    <p className="text-xl font-semibold text-dealership-primary">
                      AWG {Number(display?.price || 0).toLocaleString()}
                    </p>
                  )}
                </div>
                <ShareButtons title={display?.title ?? ""} url={listingUrl} />
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Overview</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Vehicle ID: {display?.vehicleId || "N/A"}
                  </p>
                  {isAdmin ? (
                    <textarea rows={5} className="w-full border rounded p-2" value={display?.description ?? ""} onChange={(e) => updateField("description", e.target.value)} />
                  ) : (
                    <p className="text-gray-600">{display?.description}</p>
                  )}
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Technical Specifications</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Engine</p>
                      {isAdmin ? (
                        <input type="text" value={display?.technicalSpecification?.engine ?? ""} onChange={(e) => updateTechnicalSpec("engine", e.target.value)} className="border rounded p-1 w-full" />
                      ) : (
                        <p className="text-gray-600">{display?.technicalSpecification?.engine}</p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Transmission</p>
                      {isAdmin ? (
                        <input type="text" value={display?.technicalSpecification?.transmission ?? ""} onChange={(e) => updateTechnicalSpec("transmission", e.target.value)} className="border rounded p-1 w-full" />
                      ) : (
                        <p className="text-gray-600">{display?.technicalSpecification?.transmission}</p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Type</p>
                      {isAdmin ? (
                        typesLoading ? (
                          <p>Loading types...</p>
                        ) : (
                          <select
                            value={display?.technicalSpecification?.type ?? ""}
                            onChange={(e) => updateTechnicalSpec("type", e.target.value)}
                            className="border rounded p-1 w-full"
                          >
                            <option value="">Select a type</option>
                            {carTypes.map((t) => (
                              <option key={t._id} value={t.name}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        )
                      ) : (
                        <p className="text-gray-600">{display?.technicalSpecification?.type}</p>
                      )}
                    </div>

                    <div>
                      <p className="font-medium">Mileage</p>
                      {isAdmin ? (
                        <div className="flex gap-2">
                          <input type="number" className="border rounded p-1 w-full" value={mileageValue} onChange={(e) => setMileageValue(e.target.value === "" ? "" : Number(e.target.value))} />
                          <select className="border rounded p-1" value={mileageUnit} onChange={(e) => setMileageUnit(e.target.value as "miles" | "km")}>
                            <option value="miles">Miles</option>
                            <option value="km">Kilometers</option>
                          </select>
                        </div>
                      ) : (
                        <p className="text-gray-600">
                          {typeof display?.mileage === "number"
                            ? `${display.mileage.toLocaleString()} miles`
                            : display?.mileage ?? "N/A"}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <p className="font-medium">Fuel Types</p>
                      {isAdmin ? (
                        <input type="text" className="border rounded p-1 w-full" value={(display?.technicalSpecification?.fuelTypes ?? []).join(", ")} onChange={(e) => updateTechnicalSpec("fuelTypes", e.target.value.split(",").map(s => s.trim()))} placeholder="Comma separated" />
                      ) : (
                        <p className="text-gray-600">{(display?.technicalSpecification?.fuelTypes ?? []).join(", ")}</p>
                      )}
                    </div>
                    {!isAdmin && (display?.features?.length ?? 0) > 0 && (
                      <div className="md:col-span-2">
                        <ul className="list-disc pl-4 text-gray-600">
                          {display?.features?.map((f) => (
                            <li key={f._id}>
                              <span className="font-medium">{f.name}:</span> {f.value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
                {isAdmin && (
                  <div className="md:col-span-2">
                    <p className="font-medium mb-2">Features</p>
                    <div className="space-y-2">
                      {(display?.features ?? []).map((f) => (
                        <div key={f._id} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={f.name}
                            onChange={(e) => updateFeature(f._id, "name", e.target.value)}
                            placeholder="Feature name"
                            className="border rounded p-1 w-1/3"
                          />
                          <input
                            type="text"
                            value={f.value}
                            onChange={(e) => updateFeature(f._id, "value", e.target.value)}
                            placeholder="Feature value"
                            className="border rounded p-1 w-1/2"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteFeature(f._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                      <Button onClick={addFeature} variant="secondary" size="sm">
                        + Add Feature
                      </Button>
                    </div>
                  </div>
                )}

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Vehicle Location</h2>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-dealership-primary" />
                    {isAdmin ? (
                      <input type="text" value={display?.address ?? ""} onChange={(e) => updateField("address", e.target.value)} className="w-full border rounded p-2" />
                    ) : (
                      <span>{display?.address ?? "N/A"}</span>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Dealer Information</h2>
              <div className="space-y-4">
                <div className="flex flex-col items-center text-center">
                  <p className="font-medium">{dealer?.name}</p>
                  <p className="text-gray-600">{dealer?.address}</p>
                </div>

                <div className="space-y-2">
                  {dealer?.phoneNo && (
                    <Button
                      className="w-full flex items-center gap-2"
                      onClick={() => {
                        trackCustomEvent("DealerContactClicked", {
                          contact_method: "phone",
                          dealer_name: dealer?.name,
                          listing_id: listing?._id,
                          listing_title: listing?.title,
                        });
                      }}
                    >
                      <Phone className="w-4 h-4" />
                      {dealer.phoneNo}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={() => {
                      trackCustomEvent("DealerContactClicked", {
                        contact_method: "email",
                        dealer_name: dealer?.name,
                        listing_id: listing?._id,
                        listing_title: listing?.title,
                      });
                    }}
                  >
                    <Mail className="w-4 h-4" /> Email Dealer
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Form</h2>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                trackCustomEvent("ContactFormSubmitted", {
                  listing_id: listing?._id,
                  listing_title: listing?.title,
                  dealer_name: dealer?.name,
                });
                alert("Message sent (demo).");
              }}>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input type="text" className="w-full p-2 border rounded-md" name="name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" className="w-full p-2 border rounded-md" name="email" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="tel" className="w-full p-2 border rounded-md" name="phone" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea className="w-full p-2 border rounded-md" rows={4} name="message"></textarea>
                </div>
                <Button className="w-full" type="submit">Send Message</Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
      {isZoomOpen && (selectedImageIndex !== null) && (
        <ImageZoom
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
          imageUrl={getImageUrl(displayImages[selectedImageIndex]?.image || "")}
          alt={display?.title || ""}
          images={displayImages.map(img => ({
            url: getImageUrl(img.image),
            alt: display?.title || "Vehicle image",
            _id: img._id,
          }))}
          currentIndex={selectedImageIndex}
        />
      )}
    </div>
  );
};

export default ListingDetail;