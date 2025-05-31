import {
  Select,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { ListingsFilter } from "@/components/common/ListingsFilter";
import { Footer } from "@/components/common/Footer";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Share2 } from "lucide-react";
import { SharePreview } from "@/components/common/SharePreview";
import { Car } from "@/types/car";
import ListingSubFilter from "@/components/common/ListingSubFilter";

const fetchCars = async (params: URLSearchParams): Promise<Car[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cars/v1/list-cars-for-home-page?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch cars");
  const res = await response.json();
  return res.data;
};

const Listings = () => {
  const navigate = useNavigate();
  const { filter } = useParams<{ filter: string }>();
  const [searchParams] = useSearchParams();

  // Map URL filter param to internal sortBy state
  const getSortByFromFilter = (filter?: string) => {
    switch (filter) {
      case "newestfirst":
        return "date-desc";
      case "oldestfirst":
        return "date-asc";
      case "price-low-high":
        return "price-asc";
      case "price-high-low":
        return "price-desc";
      default:
        return "date-desc";
    }
  };

  // Map sortBy state back to filter param for <Select> value
  const getFilterFromSortBy = (sortBy: string) => {
    switch (sortBy) {
      case "date-desc":
        return "newestfirst";
      case "date-asc":
        return "oldestfirst";
      case "price-asc":
        return "price-low-high";
      case "price-desc":
        return "price-high-low";
      default:
        return "newestfirst";
    }
  };

  const [sortBy, setSortBy] = useState(getSortByFromFilter(filter));

  useEffect(() => {
    setSortBy(getSortByFromFilter(filter));
  }, [filter]);

  // When select value changes, navigate to new filter route
  const handleSortChange = (value: string) => {
    navigate(`/listings/filter/${value}`);
  };

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["cars", searchParams.toString()],
    queryFn: () => fetchCars(searchParams),
  });

  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  const filteredCars = searchQuery
    ? cars.filter(
        (car) =>
          car.title.toLowerCase().includes(searchQuery) ||
          car.make.toLowerCase().includes(searchQuery) ||
          (car.model?.toLowerCase() || "").includes(searchQuery)
      )
    : cars;

  const sortedCars = [...filteredCars].sort((a, b) => {
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

  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showSharePreview, setShowSharePreview] = useState(false);

  const handleShare = (car: Car, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCar(car);
    setShowSharePreview(true);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div>
            <ListingsFilter />
          </div>
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : "All Listings"}
              </h1>
              <Select
                value={getFilterFromSortBy(sortBy)}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <ListingSubFilter />
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : sortedCars.length === 0 ? (
              <div className="text-center py-8">
                {searchQuery
                  ? "No cars found matching your search criteria."
                  : "No cars available at the moment."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCars.map((car) => (
                  <Link
                    key={car._id}
                    to={`/listings/${car.slug}`}
                    className="block"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={`${import.meta.env.VITE_MEDIA_URL}/${car.image}`}
                          alt={car.title}
                          className="w-full h-48 object-cover"
                        />
                        {car.status === 3 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Sold
                          </div>
                        )}
                        <button
                          onClick={(e) => handleShare(car, e)}
                          className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                        >
                          <Share2 className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{car.title}</h3>
                        <p className="text-2xl font-bold text-dealership-primary mb-2">
                          AWG {car.price}
                        </p>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{car.address}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>Make: {car.make}</div>
                          <div>Model: {car.model || "N/A"}</div>
                          <div>Type: {car.type}</div>
                          <div>Mileage: {car.mileage} km</div>
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
      <SharePreview
        car={selectedCar}
        isOpen={showSharePreview}
        onClose={() => setShowSharePreview(false)}
      />
    </div>
  );
};

export default Listings;
