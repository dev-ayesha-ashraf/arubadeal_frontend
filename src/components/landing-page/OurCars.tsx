import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ArrowRight } from "lucide-react";
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
import { trackCustomEvent } from "@/lib/init-pixel";

const filters = ["All", "Best Seller", "New Arrival", "Popular", "Used Cars"];

interface Car {
  id: string;
  title: string;
  price: number;
  mileage: string;
  make: { id: string; name: string; slug: string };
  model?: string;
  transmission?: { id: string; name: string };
  engine_type?: string;
  vehical_id: string;
  slug: string;
  is_sold: boolean;
  images: { id: string; image_url: string; is_primary: boolean }[];
  badge?: { id: string; name: string };
}

interface CarsAPIResponse {
  cars: Car[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

interface OurCarsProps {
  badgeFilter?: string;
}

export const OurCars = ({ badgeFilter = "all" }: OurCarsProps) => {
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
    data: carsData = {
      cars: [],
      pagination: {
        total: 0,
        totalPages: 1,
        currentPage: 1,
        limit: itemsPerPage,
      },
    },
    isLoading,
  } = useQuery<CarsAPIResponse>({
    queryKey: ["cars", selectedFilter, currentPage, itemsPerPage, badgeFilter],
    queryFn: async () => {

      const params = new URLSearchParams();
      let endpoint = "/car_listing/listing";

      if (selectedFilter === "New Arrival") {
        endpoint = "/car_listing/latest_arrival";
      }

      if (badgeFilter && badgeFilter !== "all") {
        params.set("size", "1000");
        params.set("page", "1");

        const result = await api.get<{
          items: Car[];
          total_items: number;
          total_pages: number;
          page: number;
          size: number;
        }>(`${endpoint}?${params.toString()}`, { skipAuth: true });

        const allItems = result.items ?? [];
        const filteredItems = allItems.filter(car => car.badge?.id === badgeFilter);

        const totalItems = filteredItems.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const pagedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

        return {
          cars: pagedItems,
          pagination: {
            total: totalItems,
            totalPages: totalPages,
            currentPage: currentPage,
            limit: itemsPerPage
          }
        };

      } else {
        params.set("page", currentPage.toString());
        params.set("size", itemsPerPage.toString());

        const result = await api.get<{
          items: Car[];
          total_items: number;
          total_pages: number;
          page: number;
          size: number;
        }>(`${endpoint}?${params.toString()}`, { skipAuth: true });

        return {
          cars: result.items ?? [],
          pagination: {
            total: result.total_items,
            totalPages: result.total_pages,
            currentPage: result.page,
            limit: result.size,
          },
        };
      }
    },

    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
    trackCustomEvent("CarFilterSelected", { filter });
  };

  const trackCarView = async (car: Car) => {
    try {
      const ipAddress = "";
      const userAgent = navigator.userAgent;
      await api.patch(
        `/cars/v1/track-car-view/${car.id}?ip=${ipAddress}&ua=${encodeURIComponent(
          userAgent
        )}`
      );

      trackCustomEvent("CarViewed", {
        carId: car.id,
        title: car.title,
        price: car.price,
        make: car.make?.name,
        model: car.model,
        badge: car.badge?.name || null,
      });
    } catch (error) {
      console.error("Error tracking car view:", error);
    }
  };

  const filteredCars = carsData.cars || [];
  const totalPages = carsData.pagination?.totalPages || 1;

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
            Array.from({ length: itemsPerPage }).map((_, i) => (
              <Card
                key={i}
                className="overflow-hidden animate-pulse rounded-sm sm:rounded-md h-full flex flex-col"
              >
                <div className="w-full h-16 sm:h-48 bg-gray-200" />
                <CardContent className="p-1 sm:p-4 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : !filteredCars || filteredCars.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-8 sm:py-12">
              <div className="text-xs sm:text-lg">
                No cars found for this category
              </div>
            </div>
          ) : (
            filteredCars.map((car) => {
              const primaryImage =
                car.images?.find((img) => img.is_primary)?.image_url ||
                car.images?.[0]?.image_url;

              return (
                <Link
                  key={car.id}
                  to={`/listings/${car.slug}`}
                  onClick={() => trackCarView(car)}
                  className="h-full"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow rounded-sm sm:rounded-md h-full flex flex-col">
                    <div className="relative w-full h-16 sm:h-48 flex-shrink-0">
                      <img
                        src={`${import.meta.env.VITE_MEDIA_URL}${primaryImage}`}
                        alt={car.make?.name}
                        className="w-full h-full object-cover"
                      />
                      {car.is_sold && (
                        <div className="absolute top-0.5 right-0.5 bg-red-600 text-white px-1 rounded text-[9px] font-semibold z-10 sm:top-2 sm:right-2 sm:px-3 sm:py-1 sm:text-sm">
                          Sold
                        </div>
                      )}
                    </div>
                    <CardContent className="p-1 sm:p-4 flex flex-col flex-grow">
                      <div className="flex-grow">
                        <h3 className="text-[11px] font-semibold text-dealership-navy truncate sm:text-xl">
                          {car.title.toUpperCase()}
                        </h3>
                        <p className="text-xs font-bold text-dealership-primary mt-0.5 sm:text-2xl sm:mt-2">
                          AWG {Number(car.price).toLocaleString()}
                        </p>
                        <div className="flex items-center text-[9px] text-gray-600 mt-0.5 truncate sm:text-sm">
                          <h1 className="font-bold text-[9px] sm:text-[15px] mr-1">
                            Engine:
                          </h1>
                          <span className="text-[9px] sm:text-[15px]">
                            {car.engine_type || "N/A"}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-0.5 text-[8px] text-gray-700 sm:gap-2 sm:text-sm">
                          <span className="px-1 py-0.5 bg-blue-100 rounded, capitalize">
                            {car.transmission?.name}
                          </span>
                          <span className="px-1 py-0.5 bg-blue-100 rounded">
                            {car.mileage}
                          </span>
                          {car.badge?.name && (
                            <span className="px-1 py-0.5 bg-blue-100 rounded, capitalize">
                              {car.badge.name}
                            </span>
                          )}
                          {car.model && (
                            <span className="px-1 py-0.5 bg-blue-100 rounded capitalize">
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </section>
  );
};