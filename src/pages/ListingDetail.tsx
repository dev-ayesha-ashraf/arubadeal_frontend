// ListingDetail.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Mail, Phone, ChevronLeft, ChevronRight, } from "lucide-react";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { ImageZoom } from "@/components/common/ImageZoom";
import { ShareButtons } from "@/components/common/ShareButtons";
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
}

interface CarType {
  _id: string;
  name: string;
  slug: string;
}

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/types/list-types`);
      if (!res.ok) throw new Error("Failed to fetch car types");
      const json = await res.json();
      return json.data;
    },
  });

  const [editableListing, setEditableListing] = useState<CarListing | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [mileageValue, setMileageValue] = useState<number | "">("");
  const [mileageUnit, setMileageUnit] = useState<"miles" | "km">("miles");

  const { data: listing, isLoading, refetch } = useQuery({
    queryKey: ["carDetail", slug],
    queryFn: () => fetchCarDetail(slug!),
    enabled: !!slug,
  });

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
    const imgs = (editableListing ?? listing)?.images ?? [];
    if (!imgs.length) return;
    setSelectedImageIndex((prev) =>
      prev !== null ? (prev > 0 ? prev - 1 : imgs.length - 1) : 0
    );
  };
  const navigateNext = () => {
    const imgs = (editableListing ?? listing)?.images ?? [];
    if (!imgs.length) return;
    setSelectedImageIndex((prev) =>
      prev !== null ? (prev < imgs.length - 1 ? prev + 1 : 0) : 0
    );
  };

  const setPrimaryImage = (imageId: string) => {
    if (!editableListing) return;
    const updatedImages = (editableListing.images ?? []).map((img) => ({ ...img, isPrimary: img._id === imageId }));
    setEditableListing({ ...editableListing, images: updatedImages });
    const newIndex = updatedImages.findIndex((i) => i.isPrimary);
    if (newIndex !== -1) setSelectedImageIndex(newIndex);
  };

  const deleteImage = (imageId: string) => {
    if (!editableListing) return;
    const updatedImages = (editableListing.images ?? []).filter((img) => img._id !== imageId);
    setEditableListing({ ...editableListing, images: updatedImages });
    setSelectedImageIndex(0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editableListing) return;
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const fakeId = `new-${Date.now()}`;
    const fakeUrl = URL.createObjectURL(file);
    const newImage: ImageItem = { _id: fakeId, image: fakeUrl, isPrimary: false };
    setEditableListing({ ...editableListing, images: [...(editableListing.images ?? []), newImage] });
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

const updateFeatureValue = (featureId: string, field: "name" | "value", value: string) => {
  setEditableListing(prev => {
    if (!prev) return prev;
    return {
      ...prev,
      features: prev.features?.map(f =>
        f._id === featureId ? { ...f, [field]: value } : f
      ) ?? []
    };
  });
};
const removeFeature = (featureId: string) => {
  setEditableListing(prev => {
    if (!prev) return prev;
    return {
      ...prev,
      features: prev.features?.filter(f => f._id !== featureId) ?? []
    };
  });
};

const addFeature = () => {
  if (!editableListing) return;
  const tempId = `temp-${Date.now()}`;
  setEditableListing(prev => ({
    ...prev!,
    features: [
      ...(prev?.features ?? []),
      { _id: tempId, name: "", value: "" }
    ]
  }));
};

const saveChanges = async () => {
  if (!editableListing) return;

  try {
    const modelValue =
      editableListing.technicalSpecification?.type?.trim() ||
      listing?.technicalSpecification?.type?.trim() ||
      "";

    if (!modelValue) {
      alert("Model cannot be empty.");
      return;
    }

    const finalMileage =
      mileageValue !== "" ? `${mileageValue} ${mileageUnit}` : editableListing.mileage;

    // ✅ Merge existing and new features
    const featuresPayload = (editableListing.features ?? []).map(f => ({
      _id: f._id.startsWith("temp-") ? undefined : f._id, // remove temp ID for new ones
      name: f.name.trim(),
      value: f.value.trim(),
    }));

    const payload = {
      title: editableListing.title?.trim(),
      model: modelValue,
      description: editableListing.description?.trim(),
      price: Number(editableListing.price || 0),
      mileage: finalMileage,
      images: (editableListing.images ?? []).map(({ _id, image, isPrimary }) => ({
        _id,
        image: image.trim(),
        isPrimary,
      })),
      technicalSpecification: editableListing.technicalSpecification,
      address: editableListing.address?.trim(),
      features: featuresPayload, // send ALL features (existing + new)
    };

    const token = localStorage.getItem("access_token")?.replace(/(^"|"$)/g, "");
    if (!token) {
      alert("You need to login first.");
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/cars/update-car/${editableListing._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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




  if (isLoading) return <div>Loading...</div>;
  if (!listing && !editableListing) return <div>Listing not found</div>;

  // use editableListing if admin editing, otherwise show fetched listing
  const display = isAdmin ? editableListing ?? listing : listing ?? editableListing;
  const listingUrl = `${window.location.origin}/listings/${slug}`;
  const primaryImageId = (editableListing ?? listing)?.images?.find(img => img.isPrimary)?._id ?? null;


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
                <div
                  className="relative h-[300px] md:h-[400px] bg-gray-100 flex items-center justify-center overflow-hidden group"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  {display?.images?.length ? (
                    <>
                      <img
                        src={getImageUrl(display.images[selectedImageIndex ?? 0]?.image ?? display.images[0]?.image)}
                        alt={display?.title}
                        className="w-full h-full object-contain cursor-pointer"
                        onClick={() => {
                          setSelectedImageIndex(selectedImageIndex ?? 0);
                          setIsZoomOpen(true);
                        }}
                      />

                      {display.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigatePrevious();
                            }}
                            aria-label="Previous image"
                            className="
                  absolute top-1/2 left-4 -translate-y-1/2
                  bg-black/40 text-white p-3 rounded-full
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                  hover:bg-black/70
                  z-10
                  flex items-center justify-center
                "
                          >
                            <ChevronLeft size={24} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateNext();
                            }}
                            aria-label="Next image"
                            className="
                  absolute top-1/2 right-4 -translate-y-1/2
                  bg-black/40 text-white p-3 rounded-full
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                  hover:bg-black/70
                  z-10
                  flex items-center justify-center
                "
                          >
                            <ChevronRight size={24} />
                          </button>

                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full select-none">
                            {(selectedImageIndex ?? 0) + 1} / {display.images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-400">No image available</div>
                  )}
                </div>

                {/* Thumbnails */}
                {display?.images?.length > 1 && (
                  <div className="flex overflow-x-auto p-2 gap-2 bg-gray-50">
                    {display.images.map((img, index) => {
                      const isPrimary = img._id === primaryImageId;

                      return (
                        <div
                          key={img._id}
                          className={`relative w-20 h-20 flex-shrink-0 cursor-pointer ${selectedImageIndex === index ? "ring-2 ring-primary" : ""}`}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img
                            src={getImageUrl(img.image)}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {isAdmin && (
                            <>
                              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 md:opacity-0 md:hover:opacity-100 flex flex-col justify-center items-center gap-1 transition-opacity duration-300
                sm:opacity-100 sm:flex">
                                <button
                                  className={`text-xs px-3 py-1 rounded ${isPrimary ? "bg-green-600" : "bg-gray-700"
                                    } text-white hover:bg-green-700 transition w-full`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPrimaryImage(img._id);
                                  }}
                                >
                                  Primary
                                </button>
                                <button
                                  className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition w-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteImage(img._id);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                              {isPrimary && (
                                <div className="absolute top-1 left-1 bg-green-600 text-white text-[10px] font-semibold px-1 rounded select-none pointer-events-none">
                                  PRIMARY
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}

                    {isAdmin && (
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center w-24 h-16 cursor-pointer border-2 border-dashed border-gray-400 text-gray-600 rounded"
                      >
                        +
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

            {/* Vehicle details */}
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
                  {isAdmin ? (
                    <textarea rows={5} className="w-full border rounded p-2" value={display?.description ?? ""} onChange={(e) => updateField("description", e.target.value)} />
                  ) : (
                    <p className="text-gray-600">{display?.description}</p>
                  )}
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Technical Specifications</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Engine */}
                    <div>
                      <p className="font-medium">Engine</p>
                      {isAdmin ? (
                        <input
                          type="text"
                          value={display?.technicalSpecification?.engine ?? ""}
                          onChange={(e) => updateTechnicalSpec("engine", e.target.value)}
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        <p className="text-gray-600">{display?.technicalSpecification?.engine}</p>
                      )}
                    </div>

                    {/* Transmission */}
                    <div>
                      <p className="font-medium">Transmission</p>
                      {isAdmin ? (
                        <input
                          type="text"
                          value={display?.technicalSpecification?.transmission ?? ""}
                          onChange={(e) => updateTechnicalSpec("transmission", e.target.value)}
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        <p className="text-gray-600">{display?.technicalSpecification?.transmission}</p>
                      )}
                    </div>

                    {/* Type */}
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

                    {/* Mileage */}
                    <div>
                      <p className="font-medium">Mileage</p>
                      {isAdmin ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className="border rounded p-1 w-full"
                            value={mileageValue}
                            onChange={(e) =>
                              setMileageValue(e.target.value === "" ? "" : Number(e.target.value))
                            }
                          />
                          <select
                            className="border rounded p-1"
                            value={mileageUnit}
                            onChange={(e) => setMileageUnit(e.target.value as "miles" | "km")}
                          >
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

                    {/* Fuel Types */}
                    <div className="md:col-span-2">
                      <p className="font-medium">Fuel Types</p>
                      {isAdmin ? (
                        <input
                          type="text"
                          className="border rounded p-1 w-full"
                          value={(display?.technicalSpecification?.fuelTypes ?? []).join(", ")}
                          onChange={(e) =>
                            updateTechnicalSpec(
                              "fuelTypes",
                              e.target.value.split(",").map((s) => s.trim())
                            )
                          }
                          placeholder="Comma separated"
                        />
                      ) : (
                        <p className="text-gray-600">
                          {(display?.technicalSpecification?.fuelTypes ?? []).join(", ")}
                        </p>
                      )}
                    </div>

                    {/* Issues */}
                    <div className="md:col-span-2">
                     {isAdmin && <p className="font-medium">Features</p>}

                      {isAdmin ? (
                        <div className="space-y-2">
                          {(display?.features ?? []).map((feature, idx) => (
                            <div key={feature._id || idx} className="flex gap-2">
                              {/* Name Field */}
                              <input
                                type="text"
                                className="border rounded p-1 w-1/2"
                                value={feature.name || ""}
                                onChange={(e) => {
                                  const updatedFeatures = [...(editableListing?.features ?? [])];
                                  updatedFeatures[idx] = {
                                    ...feature,
                                    name: e.target.value,
                                  };
                                  setEditableListing({ ...editableListing!, features: updatedFeatures });
                                }}
                                placeholder="Feature name"
                              />

                              {/* Value Field */}
                              <input
                                type="text"
                                className="border rounded p-1 w-1/2"
                                value={feature.value || ""}
                                onChange={(e) => {
                                  const updatedFeatures = [...(editableListing?.features ?? [])];
                                  updatedFeatures[idx] = {
                                    ...feature,
                                    value: e.target.value,
                                  };
                                  setEditableListing({ ...editableListing!, features: updatedFeatures });
                                }}
                                placeholder="Feature value"
                              />
                            </div>
                          ))}

                          {/* Add New Feature Button */}
                          <Button onClick={addFeature}>+ Add Feature</Button>
                        </div>
                      ) : (
                        <ul className="list-disc ml-5 text-gray-600">
                          {(display?.features ?? []).map((f) => (
                            <li key={f._id}>{`${f.name}: ${f.value}`}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                  </div>
                </Card>


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
                    <Button className="w-full flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {dealer.phoneNo}
                    </Button>
                  )}
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email Dealer
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Form</h2>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Message sent (demo)."); }}>
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
          imageUrl={formattedImages[selectedImageIndex]?.url || ""}
          alt={formattedImages[selectedImageIndex]?.alt || ""}
          images={formattedImages}
          currentIndex={selectedImageIndex}
        />
      )}
    </div>
  );
};

export default ListingDetail;
