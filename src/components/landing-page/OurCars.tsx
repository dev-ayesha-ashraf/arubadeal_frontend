import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
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
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const width = window.innerWidth;
    return width >= 1024 ? 8 : 9;
  });

  const api = useApi();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setItemsPerPage(width >= 1024 ? 8 : 9);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch data queries
  const { data: allCars = [] } = useQuery({
    queryKey: ["all-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: Car[] }>("/cars/list-cars-for-home-page");
      return response.data;
    },
    enabled: selectedFilter === "All",
  });

  const { data: bestSellerCars = [] } = useQuery({
    queryKey: ["best-seller-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: Car[] }>("/cars/best-sellers");
      return response.data;
    },
    enabled: selectedFilter === "Best Seller",
  });

  const { data: newArrivalCars = [] } = useQuery({
    queryKey: ["new-arrival-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: Car[] }>("/cars/new-arrivals");
      return response.data;
    },
    enabled: selectedFilter === "New Arrival",
  });

  const { data: popularCars = [] } = useQuery({
    queryKey: ["popular-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: Car[] }>("/cars/popular-cars");
      return response.data;
    },
    enabled: selectedFilter === "Popular",
  });

  const { data: usedCars = [] } = useQuery({
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

  // Map engine ID to name
  const engineMap = new Map<string, string>(
    engines?.map((engine) => [engine._id, engine.name]) || []
  );

  const carEngineMap = new Map<string, string>();
  fullCars?.forEach((car) => {
    if (car.engineId) {
      carEngineMap.set(car._id, engineMap.get(car.engineId) || "Engine N/A");
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

  const filteredCars = getFilteredCars() || [];
  const totalPages = Math.ceil((filteredCars.length || 0) / itemsPerPage);

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const getVisibleCars = () => {
    if (!filteredCars || filteredCars.length === 0) return [];
    const start = currentPage * itemsPerPage;
    return filteredCars.slice(start, start + itemsPerPage);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(0);
  };

  const trackCarView = async (carId: string) => {
    try {
      const ipAddress = ""; // optional: get real IP from server
      const userAgent = navigator.userAgent;
      await api.patch(`/cars/v1/track-car-view/${carId}?ip=${ipAddress}&ua=${encodeURIComponent(userAgent)}`);
    } catch (error) {
      console.error("Error tracking car view:", error);
    }
  };

  const isLoading =
    (selectedFilter === "All" && allCars.length === 0) ||
    (selectedFilter === "Best Seller" && bestSellerCars.length === 0) ||
    (selectedFilter === "New Arrival" && newArrivalCars.length === 0) ||
    (selectedFilter === "Popular" && popularCars.length === 0) ||
    (selectedFilter === "Used Cars" && usedCars.length === 0);

  return (
    <section className="pb-4 pt-2 sm:py-4 bg-dealership-silver">
      <div className="container mx-auto">
        <div className="flex flex-col gap-1 sm:gap-6 mb-4 sm:mb-8">
          <h2 className="text-sm sm:text-3xl font-bold">Our Cars</h2>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4">
            <div className="hidden md:flex items-center gap-4 flex-wrap">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "destructive"}
                  onClick={() => handleFilterChange(filter)}
                  className={`transition-colors ${selectedFilter === filter
                    ? "bg-dealership-primary text-white hover:bg-dealership-primary/90"
                    : ""
                    }`}
                >
                  {filter}
                </Button>
              ))}
            </div>

            <div className="md:hidden w-full">
              <Select onValueChange={handleFilterChange} value={selectedFilter}>
                <SelectTrigger className="w-full px-4 text-[12px] h-[32px] rounded-md border text-gray-700 hover:bg-gray-100 font-medium">
                  <SelectValue placeholder="Select a filter" />
                </SelectTrigger>
                <SelectContent className="bg-white w-3/4">
                  {filters.map((filter) => (
                    <SelectItem
                      key={filter}
                      value={filter}
                      className={`text-gray-700 hover:bg-[#EADDCA] hover:text-black font-medium ${selectedFilter === filter ? "bg-dealership-primary text-white" : ""
                        }`}
                    >
                      {filter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center w-full lg:w-auto">
              <div className="flex gap-2 sm:ml-0">
                <Button variant="outline" size="icon" onClick={handlePrevious} className="rounded-full w-4 h-4 sm:w-10 sm:h-10">
                  <ArrowLeft className="sm:h-5 sm:w-4" style={{ height: '10px', width: '10px' }} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full w-4 h-4 sm:w-10 sm:h-10">
                  <ArrowRight className="sm:h-5 sm:w-4" style={{ height: '10px', width: '10px' }} />
                </Button>
              </div>
              <Link to="/listings" className="block sm:hidden">
                <Button
                  variant="default"
                  className="px-2 mt-1 py-0 text-sm gap-1 bg-gradient-to-r from-dealership-primary/80 to-dealership-primary/100"
                >
                  More Cars
                  <ArrowRight className="w-2 h-2 mt-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-8 sm:py-12">
              <div className="text-xs sm:text-lg">Loading...</div>
            </div>
          ) : !filteredCars || filteredCars.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-8 sm:py-12">
              <div className="text-xs sm:text-lg">No cars found for this category</div>
            </div>
          ) : (
            getVisibleCars().map((car) => {
              const engine = carEngineMap.get(car._id) || "Engine N/A";

              return (
                <Link
                  key={car._id}
                  to={`/listings/${car.slug}`}
                  onClick={() => trackCarView(car._id)}
                >
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
                      <div>
                        <h3 className="text-[11px] font-semibold text-dealership-navy truncate sm:text-xl">
                          {car.title}
                        </h3>
                        <p className="text-xs font-bold text-dealership-primary mt-0.5 sm:text-2xl sm:mt-2">
                          AWG {Number(car.price).toLocaleString()}
                        </p>
                        <div className="flex items-center text-[9px] text-gray-600 mt-0.5 truncate sm:text-sm">
                          <div className="flex flex-wrap items-center text-sm">
                            <h1 className="font-bold text-[9px] sm:text-[15px] mr-1">Engine:</h1>
                            <span className="text-[9px] sm:text-[15px]">{engine}</span>
                          </div>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-0.5 text-[8px] text-gray-700 sm:gap-2 sm:text-sm">
                          <span className="px-1 py-0.5 bg-gray-100 rounded">
                            {car.transmission}
                          </span>
                          <span className="px-1 py-0.5 bg-gray-100 rounded">
                            {car.mileage.toLocaleString()} mi
                          </span>
                          {car.model && (
                            <span className="px-1 py-0.5 bg-gray-100 rounded">
                              {car.model}
                            </span>
                          )}
                        </div>
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
