import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { ListingsFilter } from "@/components/common/ListingsFilter";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { ShareButtons } from "@/components/common/ShareButtons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Type definitions
interface CarType {
  _id: string;
  name: string;
  image: string;
  banner?: string;
  totalCars?: number;
  slug: string;
}

interface Car {
  _id: string;
  title: string;
  price: string;
  mileage: number;
  make: string;
  transmission: string;
  type: string;
  image: string;
  address: string;
  status: number;
  slug: string;
}

// Fetch functions
const fetchAllTypes = async (): Promise<CarType[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/types/v1/list-types`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch types");
  const res = await response.json();
  return res.data;
};

const fetchCars = async (params: URLSearchParams): Promise<Car[]> => {
  // Get access token if available
  const accessToken = localStorage.getItem("access_token")
    ? JSON.parse(localStorage.getItem("access_token") || "")
    : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add authorization header if we have a token
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cars/v1/list-cars-for-home-page?${params.toString()}`,
    {
      method: "GET",
      headers,
    }
  );
  if (!response.ok) throw new Error("Failed to fetch cars");
  const res = await response.json();
  return res.data;
};

const TypeDetail = () => {
  const navigate = useNavigate();
  const { typeSlug } = useParams<{ typeSlug: string }>();
  const [sortBy, setSortBy] = useState("date-desc");
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentType, setCurrentType] = useState<CarType | null>(null);

  // Fetch all types to find the current one by slug
  const { data: allTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ["allTypes"],
    queryFn: fetchAllTypes,
  });

  // Find the current type from the list
  useEffect(() => {
    if (allTypes.length > 0 && typeSlug) {
      const type = allTypes.find(t => t.slug === typeSlug);
      if (type) {
        setCurrentType(type);
      } else {
        // If type not found, redirect to listings page
        navigate('/listings');
      }
    }
  }, [allTypes, typeSlug, navigate]);

  // Clean up search params and ensure typeId is properly set
  useEffect(() => {
    if (currentType?._id) {
      // Create new URLSearchParams to avoid duplicates
      const newSearchParams = new URLSearchParams();

      // Add typeId and typeSlug
      // newSearchParams.set("typeId", currentType._id);
      newSearchParams.set("slug", currentType.slug);

      // Preserve other existing params (like sort, filters, etc.)
      searchParams.forEach((value, key) => {
        if (key !== "typeId" && key !== "slug") {
          newSearchParams.set(key, value);
        }
      });

      // Only update if the params have actually changed
      if (newSearchParams.toString() !== searchParams.toString()) {
        setSearchParams(newSearchParams);
      }
    }
  }, [currentType, searchParams, setSearchParams]);

  // Fetch cars filtered by this type
  const { data: cars = [], isLoading: carsLoading } = useQuery({
    queryKey: ["cars", searchParams.toString()],
    queryFn: () => fetchCars(searchParams),
    enabled: !!currentType?._id,
  });

  const sortedCars = [...cars].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return Number(a.price) - Number(b.price);
      case "price-desc":
        return Number(b.price) - Number(a.price);
      case "date-asc":
        return a._id.localeCompare(b._id);
      case "date-desc":
      default:
        return b._id.localeCompare(a._id);
    }
  });

  const isLoading = typesLoading || !currentType;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navbar />

      {/* Type Banner */}
      {isLoading ? (
        <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
      ) : (
        <div className="relative w-full h-64 md:h-96">

          {/* Banner Image */}
          <img
            src={`${import.meta.env.VITE_MEDIA_URL}/${currentType?.banner || currentType?.image}`}
            alt={currentType?.name}
            className="w-full h-full object-cover"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50">
            {/* Content Container Using Same Margin as Tab */}
            <div className="container mx-auto h-full flex flex-col justify-center">
              {/* Breadcrumb Text Above Main Title */}
              <span className="text-white text-sm md:text-base uppercase tracking-wide mb-2">
                Home / {currentType?.name.toUpperCase()}
              </span>
              {/* Main Title and Share Button */}
              <div className="flex justify-between items-center">
                <h1 className="text-white text-3xl md:text-6xl lg:text-7xl font-extrabold uppercase">
                  {currentType?.name}
                </h1>
                <ShareButtons
                  title={`${currentType?.name} Vehicles`}
                  url={window.location.href}
                  imageUrl={currentType?.banner || currentType?.image ?
                    `${import.meta.env.VITE_MEDIA_URL}/${currentType?.banner || currentType?.image}` :
                    undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dealership-navy">
            Available {currentType?.name} Vehicles
          </h2>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">

          <div className="w-full lg:w-3/4">
            {carsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-72 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : sortedCars.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="text-xl font-semibold text-gray-600">
                  No vehicles available in this category
                </h3>
                <p className="mt-2 text-gray-500">
                  Try adjusting your filters or check back later
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCars.map((car) => (
                  <Link key={car._id} to={`/listings/${car.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative w-full h-48">
                        <img
                          src={`${import.meta.env.VITE_MEDIA_URL}/${car.image}`}
                          alt={car.make}
                          className="w-full h-full object-cover"
                        />
                        {car.status === 3 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                            Sold
                          </div>  
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="p-4">
                          <h3 className="text-xl font-semibold text-dealership-navy">
                            {car.title}
                          </h3>
                          <p className="text-2xl font-bold text-dealership-primary mt-2">
                            AWG {Number(car.price).toLocaleString()}
                          </p>
                          <div className="flex items-center text-gray-600 mt-2">
                            <MapPin size={16} className="mr-1" />
                            <span className="text-sm">{car.address}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-gray-100 text-sm rounded">
                              {car.transmission}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-sm rounded">
                              {car.mileage.toLocaleString()} mi
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-sm rounded">
                              {car.make}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TypeDetail; 