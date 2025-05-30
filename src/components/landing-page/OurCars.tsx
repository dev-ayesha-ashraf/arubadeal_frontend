import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";

const filters = ["All", "Best Seller", "New Arrival", "Popular", "Used Cars"];

// Define the interface for cars
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

export const OurCars = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;
  const api = useApi();

  // Query for all cars when no filter is selected
  const { data: allCars = [], isLoading: isAllCarsLoading } = useQuery({
    queryKey: ["all-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: Car[] }>("/cars/v1/list-cars-for-home-page");
      return response.data;
    },
    enabled: selectedFilter === "All",
  });

  // Query for best seller cars
  const { data: bestSellerCars = [], isLoading: isBestSellerLoading } = useQuery({
    queryKey: ["best-seller-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: Car[] }>("/cars/v1/best-sellers");
      return response.data;
    },
    enabled: selectedFilter === "Best Seller",
  });

  // Query for new arrival cars
  const { data: newArrivalCars = [], isLoading: isNewArrivalLoading } = useQuery({
    queryKey: ["new-arrival-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: Car[] }>("/cars/v1/new-arrivals");
      return response.data;
    },
    enabled: selectedFilter === "New Arrival",
  });

  // Query for popular cars
  const { data: popularCars = [], isLoading: isPopularLoading } = useQuery({
    queryKey: ["popular-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: Car[] }>("/cars/v1/popular-cars");
      return response.data;
    },
    enabled: selectedFilter === "Popular",
  });

  // Query for used cars
  const { data: usedCars = [], isLoading: isUsedCarsLoading } = useQuery({
    queryKey: ["used-cars"],
    queryFn: async () => {
      const response = await api.get<{ data: Car[] }>("/cars/v1/used-cars");
      return response.data;
    },
    enabled: selectedFilter === "Used Cars",
  });

  // Determine which cars array to use based on the selected filter
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
    setCurrentPage(prev => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => (prev + 1) % totalPages);
  };

  const getVisibleCars = () => {
    const start = currentPage * itemsPerPage;
    return filteredCars.slice(start, start + itemsPerPage);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(0); // Reset to first page when changing filters
  };

  // Track car view when a car is clicked
  const trackCarView = async (carId: string) => {
    try {
      // Get user IP and user agent
      const ipAddress = ""; // In a real app, you'd get this from an IP service or server
      const userAgent = navigator.userAgent;

      // Call the track view endpoint
      await api.patch(`/cars/v1/track-car-view/${carId}?ip=${ipAddress}&ua=${encodeURIComponent(userAgent)}`);
    } catch (error) {
      console.error("Error tracking car view:", error);
      // Don't block the user from viewing the car if tracking fails
    }
  };

  // Determine if loading based on the selected filter
  const isLoading =
    (selectedFilter === "All" && isAllCarsLoading) ||
    (selectedFilter === "Best Seller" && isBestSellerLoading) ||
    (selectedFilter === "New Arrival" && isNewArrivalLoading) ||
    (selectedFilter === "Popular" && isPopularLoading) ||
    (selectedFilter === "Used Cars" && isUsedCarsLoading);

  return (
    <section className="py-16  bg-dealership-silver">
      <div className="container mx-auto">
        <div className="flex flex-col gap-6 mb-8">
          <h2 className="text-3xl font-bold">Our Cars</h2>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Desktop Filters and Navigation */}
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


            {/* Mobile Filters */}
            <div className="md:hidden flex flex-col w-full gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`text-left px-4 py-2 transition-colors rounded-md ${selectedFilter === filter
                      ? "bg-dealership-primary text-white"
                      : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Navigation Arrows - Desktop (Right) & Mobile (Left) */}
            <div className="flex gap-2 sm:ml-0">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="rounded-full hover:border-dealership-primary"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="rounded-full hover:border-dealership-primary"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="text-lg">Loading...</div>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="text-lg">No cars found for this category</div>
            </div>
          ) : (
            getVisibleCars().map((car) => (
              <Link
                key={car._id}
                to={`/listings/${car.slug}`}  
                onClick={() => trackCarView(car._id)}
              >
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
                        {car.model && (
                          <span className="px-2 py-1 bg-gray-100 text-sm rounded">
                            {car.model}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};