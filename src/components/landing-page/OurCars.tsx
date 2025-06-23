import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const filters = ["All", "Best Seller", "New Arrival", "Popular", "Used Cars"];

interface Car {
  _id: string;
  title: string;
  price: string;
  mileage: number;
  make: string;
  model?: string;
  transmission: string;
  type: string;
  image: string;
  address: string;
  viewCount?: number;
  listedAt?: string;
  condition?: number;
  status?: number;
  slug?: string;
}

interface FullCar {
  _id: string;
  engineId?: string;
}

interface Engine {
  _id: string;
  name: string;
}

export const OurCars = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(() =>
    window.innerWidth >= 1024 ? 8 : 9
  );
  const api = useApi();

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth >= 1024 ? 8 : 9);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    data: allCars = [],
    isLoading: isAllCarsLoading,
  } = useQuery({
    queryKey: ["all-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: Car[] }>("/cars/list-cars-for-home-page");
      return response.data;
    },
    enabled: selectedFilter === "All",
  });

  const { data: bestSellerCars = [], isLoading: isBestSellerLoading } = useQuery({
    queryKey: ["best-seller-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: Car[] }>("/cars/best-sellers");
      return response.data;
    },
    enabled: selectedFilter === "Best Seller",
  });

  const { data: newArrivalCars = [], isLoading: isNewArrivalLoading } = useQuery({
    queryKey: ["new-arrival-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: Car[] }>("/cars/new-arrivals");
      return response.data;
    },
    enabled: selectedFilter === "New Arrival",
  });

  const { data: popularCars = [], isLoading: isPopularLoading } = useQuery({
    queryKey: ["popular-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: Car[] }>("/cars/popular-cars");
      return response.data;
    },
    enabled: selectedFilter === "Popular",
  });

  const { data: usedCars = [], isLoading: isUsedCarsLoading } = useQuery({
    queryKey: ["used-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: Car[] }>("/cars/used-cars");
      return response.data;
    },
    enabled: selectedFilter === "Used Cars",
  });

  const { data: fullCars = [] } = useQuery({
    queryKey: ["full-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: FullCar[] }>("/cars/list-cars");
      return response.data;
    },
  });

  const { data: engines = [] } = useQuery({
    queryKey: ["engines"],
    queryFn: async () => {
      const response = await api.get<{ data: Engine[] }>("/engines/list-engines");
      return response.data;
    },
  });

  const engineMap = new Map<string, string>(
    engines.map((engine) => [engine._id, engine.name])
  );

  const carEngineMap = new Map<string, string>();
  fullCars.forEach((car) => {
    if (car.engineId) {
      carEngineMap.set(car._id, engineMap.get(car.engineId) || "");
    }
  });

  const getFilteredCars = () => {
    switch (selectedFilter) {
      case "Best Seller":
        return bestSellerCars;
      case "New Arrival":
        return newArrivalCars;
      case "Popular":
        return popularCars;
      case "Used Cars":
        return usedCars;
      case "All":
      default:
        return allCars;
    }
  };

  const filteredCars = getFilteredCars();
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const getVisibleCars = () => {
    const start = currentPage * itemsPerPage;
    return filteredCars.slice(start, start + itemsPerPage);
  };

  const isLoading =
    (selectedFilter === "All" && isAllCarsLoading) ||
    (selectedFilter === "Best Seller" && isBestSellerLoading) ||
    (selectedFilter === "New Arrival" && isNewArrivalLoading) ||
    (selectedFilter === "Popular" && isPopularLoading) ||
    (selectedFilter === "Used Cars" && isUsedCarsLoading);

  return (
    <section className="pb-4 pt-2 sm:py-4 bg-dealership-silver">
      <div className="container mx-auto">
        {/* header & filters */}
        {/* ... (unchanged for brevity) */}

        <div className="grid grid-cols-3 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-8 sm:py-12">
              <div className="text-xs sm:text-lg">Loading...</div>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-8 sm:py-12">
              <div className="text-xs sm:text-lg">No cars found for this category</div>
            </div>
          ) : (
            getVisibleCars().map((car) => {
              const engine = carEngineMap.get(car._id) || "Engine N/A";
              return (
                <Link key={car._id} to={`/listings/${car.slug}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow rounded-sm sm:rounded-md">
                    <div className="relative w-full h-16 sm:h-48">
                      <img
                        src={`${import.meta.env.VITE_MEDIA_URL}/${car.image}`}
                        alt={car.make}
                        className="w-full h-full object-cover"
                      />
                      {car.status === 3 && (
                        <div className="absolute top-0.5 right-0.5 bg-red-600 text-white px-1 rounded text-[9px] font-semibold z-10 sm:top-2 sm:right-2 sm:px-3 sm:py-1 sm:text-sm">
                          Sold
                        </div>
                      )}
                    </div>
                    <CardContent className="p-1 sm:p-4">
                      <h3 className="text-[11px] font-semibold text-dealership-navy truncate sm:text-xl">
                        {car.title}
                      </h3>
                      <p className="text-xs font-bold text-dealership-primary mt-0.5 sm:text-2xl sm:mt-2">
                        AWG {Number(car.price).toLocaleString()}
                      </p>
                      <div className="flex items-center text-[9px] text-gray-600 mt-0.5 truncate sm:text-sm">
                        <span>{engine}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-0.5 text-[8px] text-gray-700 sm:gap-2 sm:text-sm">
                        <span className="px-1 py-0.5 bg-gray-100 rounded">{car.transmission}</span>
                        <span className="px-1 py-0.5 bg-gray-100 rounded">{car.mileage.toLocaleString()} mi</span>
                        <span className="px-1 py-0.5 bg-gray-100 rounded">{car.make}</span>
                        {car.model && (
                          <span className="px-1 py-0.5 bg-gray-100 rounded">{car.model}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
