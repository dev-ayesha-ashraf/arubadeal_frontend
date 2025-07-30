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
import { Pagination } from "../common/Pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
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

  const {
    data: carsData = [],
    isLoading,
  } = useQuery({
    queryKey: ["cars", selectedFilter, currentPage, itemsPerPage],
    queryFn: async () => {
      let endpoint = "";

      switch (selectedFilter) {
        case "Best Seller":
          endpoint = "/cars/best-sellers";
          break;
        case "New Arrival":
          endpoint = "/cars/new-arrivals";
          break;
        case "Popular":
          endpoint = "/cars/popular-cars";
          break;
        case "Used Cars":
          endpoint = "/cars/used-cars";
          break;
        case "All":
        default:
          endpoint = `/cars/list-cars-for-home-page?page=${currentPage}&limit=${itemsPerPage}`;
      }

      const response = await api.get(endpoint);
      const result = response.data;

      if (Array.isArray(result)) return result;
      if (Array.isArray(result.data)) return result.data;
      if (Array.isArray(result.data?.data)) return result.data.data;

      return [];
    },
  });

  const { data: fullCars = [] } = useQuery({
    queryKey: ["full-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: { data: FullCar[] } }>(
        `/cars/list-cars-for-home-page?page=${currentPage}&limit=${itemsPerPage}`
      );
      return response.data?.data ?? [];
    },
  });

  const { data: engines = [] } = useQuery({
    queryKey: ["engines"],
    queryFn: async () => {
      const response = await api.get<{ data: Engine[] }>(
        "/engines/list-engines"
      );
      return response.data;
    },
  });

  const engineMap = new Map<string, string>(
    engines?.map((engine) => [engine._id, engine.name]) || []
  );

  const carEngineMap = new Map<string, string>();
  fullCars?.forEach((car) => {
    if (car.engineId) {
      carEngineMap.set(car._id, engineMap.get(car.engineId) || "Engine N/A");
    }
  });

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  const trackCarView = async (carId: string) => {
    try {
      const ipAddress = ""; // optional
      const userAgent = navigator.userAgent;
      await api.patch(
        `/cars/v1/track-car-view/${carId}?ip=${ipAddress}&ua=${encodeURIComponent(
          userAgent
        )}`
      );
    } catch (error) {
      console.error("Error tracking car view:", error);
    }
  };

  const filteredCars = Array.isArray(carsData) ? carsData : [];

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
                  variant={
                    selectedFilter === filter ? "default" : "destructive"
                  }
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
              <Select
                onValueChange={handleFilterChange}
                value={selectedFilter}
              >
                <SelectTrigger className="w-full px-4 text-[12px] h-[32px] rounded-md border text-gray-700 hover:bg-gray-100 font-medium">
                  <SelectValue placeholder="Select a filter" />
                </SelectTrigger>
                <SelectContent className="bg-white w-3/4">
                  {filters.map((filter) => (
                    <SelectItem
                      key={filter}
                      value={filter}
                      className={`text-gray-700 hover:bg-[#EADDCA] hover:text-black font-medium ${selectedFilter === filter
                          ? "bg-dealership-primary text-white"
                          : ""
                        }`}
                    >
                      {filter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        <div className="grid grid-cols-3 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-8 sm:py-12">
              <div className="text-xs sm:text-lg">Loading...</div>
            </div>
          ) : !filteredCars || filteredCars.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-8 sm:py-12">
              <div className="text-xs sm:text-lg">
                No cars found for this category
              </div>
            </div>
          ) : (
            filteredCars.map((car) => {
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
                            <h1 className="font-bold text-[9px] sm:text-[15px] mr-1">
                              Engine:
                            </h1>
                            <span className="text-[9px] sm:text-[15px]">
                              {engine}
                            </span>
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

        {/* Pagination controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={11} // Replace with real total from API
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </section>
  );
};
