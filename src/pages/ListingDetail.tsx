// ListingDetail.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Mail, Phone, ChevronLeft, ChevronRight, Trash2, Upload, Move, Check, Star, X, Download } from "lucide-react";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { ImageZoom } from "@/components/common/ImageZoom";
import { ShareButtons } from "@/components/common/ShareButtons";
import { trackCustomEvent } from "@/lib/init-pixel";
import { toast } from "sonner";

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
  seats?: number;
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
  badge?: { id: string; name: string };
  seats?: number;
  is_sold?: boolean;
  is_active?: boolean;
  isThirdParty?: boolean;
}

interface CarType {
  _id: string;
  name: string;
  slug: string;
}

const fetchCarDetail = async (slug: string): Promise<CarListing> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/car_listing/get_car/${slug}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch internal car detail");
    const res = await response.json();

    const sortedImages = (res.images ?? [])
      .filter((img: any) => img.is_display !== false)
      .sort((a: any, b: any) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (a.position || 0) - (b.position || 0);
      })
      .map((img: any, index: number) => ({
        _id: img.id,
        image: img.image_url,
        isPrimary: img.is_primary,
        isDisplay: img.is_display,
        position: img.position,
      }));

    const mapped: CarListing = {
      _id: res.id,
      title: res.title,
      description: res.condition,
      price: res.price,
      mileage: res.mileage,
      vehicleId: res.vehical_id,
      seats: res.seats,
      is_sold: res.is_sold,
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
      images: sortedImages,
      technicalSpecification: {
        make: res.make?.name,
        type: res.body_type?.name,
        engine: res.engine_type,
        transmission: res.transmission?.name,
        fuelTypes: res.fuel_type?.name ? [res.fuel_type.name] : [],
        seats: res.seats,
      },
      slug: res.slug,
      badge: res.badge,
      badges: res.badge ? [res.badge.name] : [],
    };

    return mapped;
  } catch (error) {
    // Try third-party API
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api_listing/public/${slug}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch third-party car detail");
      const res = await response.json();

      const sortedImages = (res.images ?? [])
        .sort((a: any, b: any) => {
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return (a.position || 0) - (b.position || 0);
        })
        .map((img: any) => ({
          _id: img.id,
          image: img.image_url,
          isPrimary: img.is_primary,
          isDisplay: img.is_display ?? true,
          position: img.position,
        }));

      const cleanText = (text: string) => text ? text.replace(/\s*\b(lhd|rhd)\b\s*/gi, "").trim() : "";

      const mapped: CarListing = {
        _id: res.id,
        title: cleanText(`${res.year} ${res.meta_data?.make || ""} ${res.model}`),
        description: cleanText(res.history ? `Used ${res.history.usageType || "Car"}` : "Used Car"), // Basic description
        price: res.price,
        mileage: res.miles,
        vehicleId: res.vehical_id,
        seats: res.seats,
        is_sold: false, // Default to false/active for now unless 'used' means something else but user said implement 'our cars + these'
        is_active: res.is_active !== false, // Default to true if not specified
        isThirdParty: true,
        dealer: {
          _id: "tp-dealer",
          name: res.dealer,
          address: `${res.city}, ${res.state} ${res.zip}`,
        },
        address: `${res.city}, ${res.state} ${res.zip}`,
        features: [], // Third party might not have features list in same format
        images: sortedImages,
        technicalSpecification: {
          make: res.meta_data?.make,
          type: res.meta_data?.bodyType,
          engine: res.engine,
          transmission: cleanText(res.meta_data?.transmission || "N/A"),
          fuelTypes: res.meta_data?.fuelType ? [res.meta_data.fuelType] : ["N/A"],
          seats: res.seats,
        },
        slug: res.id, // Using ID as slug
        badge: undefined,
        badges: [],
      };
      return mapped;

    } catch (tpError) {
      throw tpError; // Re-throw if both fail
    }
  }
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

const ListingDetail: React.FC<ListingDetailProps> = ({ isAdmin: isAdminProp = false }) => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  
  // Determine admin mode from prop or query parameter
  const isAdminFromQuery = searchParams.get('admin') === 'true';
  const isAdmin = isAdminProp || isAdminFromQuery;
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
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAccessDenied, setIsAccessDenied] = useState(false);

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
    badges: [] as any[]
  });
  const getFilename = (url: string, alt: string, index?: number) => {
    try {
      const parts = url.split("/");
      const rawName = parts[parts.length - 1].split("?")[0];
      const ext = rawName.includes(".") ? rawName.split(".").pop() : "jpg";

      const imageIndex = index !== undefined ? index + 1 :
        (rawName.match(/-(\d+)\./) ? rawName.match(/-(\d+)\./)![1] : "1");

      const carId = rawName.split("-")[0] || listing?._id?.slice(-8) || "car";
      const cleanAlt = alt.replace(/\s+/g, '-').toLowerCase().slice(0, 20);

      return `${cleanAlt}-${carId}-image-${imageIndex}.${ext}`;
    } catch {
      return index !== undefined ? `car-image-${index + 1}.jpg` : "car-image.jpg";
    }
  };
  const downloadAllImages = async () => {
    if (!displayImages.length) return;

    try {
      setIsDownloading(true);

      trackCustomEvent("BulkImageDownload", {
        listing_id: listing?._id,
        total_images: displayImages.length,
        listing_title: listing?.title,
      });

      const downloadPromises = displayImages.map(async (img, index) => {
        try {
          const imageUrl = getImageUrl(img.image);
          const imageAlt = display?.title || "Vehicle image";

          const response = await fetch(imageUrl, { mode: "cors" });
          if (!response.ok) throw new Error(`Failed to fetch image ${index + 1}`);

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = getFilename(imageUrl, imageAlt);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(blobUrl);

          return { success: true, index };
        } catch (error) {
          console.error(`Failed to download image ${index + 1}:`, error);
          return { success: false, index, error };
        }
      });

      const results = await Promise.all(downloadPromises);
      const successfulDownloads = results.filter(result => result.success);
      const failedDownloads = results.filter(result => !result.success);
      if (failedDownloads.length > 0) {
        toast.error(`Successfully downloaded ${successfulDownloads.length} out of ${displayImages.length} images. ${failedDownloads.length} failed.`);
      } else {
        toast.success(`Successfully downloaded all ${displayImages.length} images!`);
      }

    } catch (error) {
      console.error("Bulk download failed:", error);
      toast.error("Failed to download images. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };
  const handleDownload = async (e: React.MouseEvent, bulkDownload: boolean = false) => {
    e.stopPropagation();

    if (bulkDownload) {
      await downloadAllImages();
      return;
    }

    if (!displayImages.length || selectedImageIndex === null) return;

    try {
      setIsDownloading(true);
      const currentImageUrl = getImageUrl(displayImages[selectedImageIndex]?.image);
      const currentImageAlt = display?.title || "Vehicle image";

      const response = await fetch(currentImageUrl, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = getFilename(currentImageUrl, currentImageAlt, selectedImageIndex);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      trackCustomEvent("ImageDownloaded", {
        listing_id: listing?._id,
        image_index: selectedImageIndex,
        image_url: currentImageUrl,
      });
    } catch (err) {
      console.error("Failed to download image:", err);
      toast.error("Sorry, the image could not be downloaded.");
    } finally {
      setIsDownloading(false);
    }
  };
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

  // Check access control for inactive listings (both internal and third-party)
  useEffect(() => {
    if (listing && listing.is_active === false && !isAdmin) {
      setIsAccessDenied(true);
    }
  }, [listing, isAdmin]);

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const endpoints = [
          '/make/get_all',
          '/bodytype/get_all',
          '/fueltype/get_all',
          '/transmission/get_all',
          '/badge/get_all'
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
          badges: responses[4] || [],
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

  const handleDeselectAll = () => {
    setSelectedImages([]);
  };

  const setImageAsPrimary = async (imageId: string) => {
    if (!editableListing || !editableListing.images) return;
    try {
      const token = localStorage.getItem("access_token")?.replace(/(^"|"$)/g, "");
      if (!token) throw new Error("Login required");

      const endpoint = listing?.isThirdParty 
        ? `${import.meta.env.VITE_API_URL}/car_listing/update_images?image_id=${imageId}&make_primary=true`
        : `${import.meta.env.VITE_API_URL}/car_listing/update_images?image_id=${imageId}&make_primary=true`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to set primary image");

      const newImages = [...editableListing.images];
      const imageIndex = newImages.findIndex(img => img._id === imageId);
      if (imageIndex === -1) return;

      const [primaryImage] = newImages.splice(imageIndex, 1);

      const updatedImages = newImages.map(img => ({
        ...img,
        isPrimary: false
      }));

      updatedImages.unshift({
        ...primaryImage,
        isPrimary: true
      });

      setEditableListing({
        ...editableListing,
        images: updatedImages
      });

      if (selectedImageIndex === imageIndex) {
        setSelectedImageIndex(0);
      } else if (selectedImageIndex !== null && selectedImageIndex > imageIndex) {
        setSelectedImageIndex(selectedImageIndex - 1);
      }

      toast.success("Primary image updated successfully!");
    } catch (error) {
      console.error("Error setting primary image:", error);
      toast.error("Failed to set primary image");
    }
  };

  const deleteSelectedImages = async () => {
    if (!editableListing || selectedImages.length === 0) return;

    try {
      const token = localStorage.getItem("access_token")?.replace(/(^"|"$)/g, "");
      if (!token) throw new Error("Login required");

      // Use appropriate endpoint based on listing type
      const endpoint = (imageId: string) => {
        const baseEndpoint = `image_id=${imageId}&mark_not_to_show=true&make_primary=false`;
        return listing?.isThirdParty
          ? `${import.meta.env.VITE_API_URL}/car_listing/update_images?${baseEndpoint}`
          : `${import.meta.env.VITE_API_URL}/car_listing/update_images?${baseEndpoint}`;
      };

      const deletePromises = selectedImages.map(imageId =>
        fetch(endpoint(imageId), {
          method: "PUT",
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })
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

      toast.success("Selected images deleted successfully!");
    } catch (err) {
      console.error("Error deleting images:", err);
      toast.error("Failed to delete some images. Check console for details.");
    }
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editableListing || !e.target.files?.length || !editableListing.vehicleId) return;

    const files = Array.from(e.target.files);

    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024;

      if (!isValidType) {
        alert(`File ${file.name} is not a valid image type`);
        return false;
      }
      if (!isValidSize) {
        alert(`File ${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      const token = localStorage.getItem("access_token")?.replace(/(^"|"$)/g, "");
      if (!token) throw new Error("Login required");

      const formData = new FormData();
      validFiles.forEach((file) => formData.append("images", file));

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/car_listing/upload-images?vehical_id=${editableListing.vehicleId}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload error response:", errorText);
        throw new Error(`Failed to upload images: ${response.status}`);
      }

      const resData = await response.json();
      console.log("Upload successful:", resData);

      await refetch();

      alert(`Successfully uploaded ${validFiles.length} image(s)!`);

    } catch (err) {
      console.error("Image upload error:", err);
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
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
        badge_id: findIdByName(lookupData.badges, editableListing.badge?.name),
        color: null,
        mileage: mileageValue !== "" ? `${mileageValue} ${mileageUnit}` : null,
        price: Number(editableListing.price || 0),
        description: editableListing.description?.trim() || null,
        location: editableListing.address?.trim() || null,
        seats: editableListing.seats || editableListing.technicalSpecification?.seats || null,
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
  if (isAccessDenied) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-16 md:mt-0 flex flex-col items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">This third-party listing is currently inactive and cannot be viewed by regular users. Please contact an administrator if you have questions.</p>
            <Button onClick={() => window.history.back()} className="bg-dealership-primary text-white">
              Go Back
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

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
                      <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="absolute top-4 right-4 bg-black/40 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 z-10 flex items-center justify-center"
                        aria-label="Download image"
                      >
                        <Download size={20} />
                        {isDownloading && (
                          <span className="absolute -bottom-6 text-xs text-white bg-black/70 px-2 py-1 rounded">
                            Downloading...
                          </span>
                        )}
                      </button>

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
                        checked={selectedImages.length === editableListing.images.length && editableListing.images.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-dealership-primary focus:ring-dealership-primary"
                      />
                      <label htmlFor="select-all-images" className="text-sm text-gray-700">
                        Select all ({selectedImages.length}/{editableListing.images.length})
                      </label>

                      {selectedImages.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleDeselectAll}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X size={14} />
                          Deselect All
                        </Button>
                      )}
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
                              {img.isPrimary && (
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
                        className={`flex flex-col items-center justify-center w-24 h-16 cursor-pointer border-2 border-dashed border-gray-400 text-gray-600 rounded hover:border-dealership-primary hover:text-dealership-primary transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-dealership-primary"></div>
                        ) : (
                          <>
                            <Upload size={20} />
                            <span className="text-xs mt-1 text-center">Add Images</span>
                          </>
                        )}
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={isUploading}
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

                  <h1 className="text-3xl font-bold text-dealership-navy">{display?.title}</h1>

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
                      {display?.dealer?._id === "tp-dealer" ? "USD" : "AWG"} {Number(display?.price || 0).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <ShareButtons
                    title={display?.title ?? ""}
                    url={listingUrl}
                    isThirdParty={display?.dealer?._id === "tp-dealer"}
                  />
                  <button
                    onClick={(e) => handleDownload(e, true)}
                    disabled={isDownloading || !displayImages.length}
                    className="flex justify-center items-center text-center bg-dealership-primary text-white p-2 rounded-md hover:bg-dealership-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Download all images"
                    title="Download all images"
                  >
                    <span className="pr-2">
                      {isDownloading ? "Downloading..." : `Download All (${displayImages.length})`}
                    </span>
                    <Download size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Overview</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Vehicle ID: {display?.vehicleId || "N/A"}
                  </p>


                  <div className="flex flex-wrap items-center gap-2 mt-5">
                    {display?.is_sold && (
                      <span className="inline-flex items-center bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm">
                        SOLD
                      </span>
                    )}

                    {display?.badge && (
                      <span className="inline-flex items-center bg-dealership-primary text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm">
                        {display.badge.name.toUpperCase()}
                      </span>
                    )}

                    {display?.description && (
                      <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
                        {display.description}
                      </span>
                    )}
                  </div>
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
                        <p className="text-gray-600">{display?.technicalSpecification?.transmission || "N/A"}</p>
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
                          <input
                            type="number"
                            className="border rounded p-1 w-32"
                            value={mileageValue}
                            onChange={(e) => setMileageValue(e.target.value === "" ? "" : Number(e.target.value))}
                          />
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

                    <div>
                      <p className="font-medium">Seats</p>
                      {isAdmin ? (
                        <input
                          type="number"
                          value={display?.seats || display?.technicalSpecification?.seats || ""}
                          onChange={(e) => {
                            const seatsValue = e.target.value === "" ? undefined : Number(e.target.value);
                            setEditableListing({
                              ...editableListing!,
                              seats: seatsValue,
                              technicalSpecification: {
                                ...editableListing!.technicalSpecification,
                                seats: seatsValue
                              }
                            });
                          }}
                          className="border rounded p-1 w-full"
                          placeholder="Enter number of seats"
                        />
                      ) : (
                        <p className="text-gray-600">{display?.seats || display?.technicalSpecification?.seats || "N/A"}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <p className="font-medium">Fuel Types</p>
                      {isAdmin ? (
                        <input type="text" className="border rounded p-1 w-full" value={(display?.technicalSpecification?.fuelTypes ?? []).join(", ")} onChange={(e) => updateTechnicalSpec("fuelTypes", e.target.value.split(",").map(s => s.trim()))} placeholder="Comma separated" />
                      ) : (
                        <p className="text-gray-600">{(display?.technicalSpecification?.fuelTypes?.length ? display.technicalSpecification.fuelTypes.join(", ") : "N/A")}</p>
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
                  <Card className="p-6 border-2 border-blue-300 bg-blue-50">
                    <h2 className="text-xl font-semibold mb-4 text-blue-800">Features</h2>
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
                  </Card>
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
            {display?.dealer?._id !== "tp-dealer" && (
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
            )}

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