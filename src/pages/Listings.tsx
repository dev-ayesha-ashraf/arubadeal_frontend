import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { ListingsFilter } from "@/components/common/ListingsFilter";
import { Footer } from "@/components/common/Footer";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Share2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { SharePreview } from "@/components/common/SharePreview";
import { Car } from "@/types/car";

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
  const [sortBy, setSortBy] = useState("date-desc");
  const [searchParams] = useSearchParams();
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showSharePreview, setShowSharePreview] = useState(false);

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["cars", searchParams.toString()],
    queryFn: () => fetchCars(searchParams),
  });

  // Filter cars based on search query
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
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
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

            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : sortedCars.length === 0 ? (
              <div className="text-center py-8">
                {searchQuery
                  ? "No cars found matching your search criteria."
                  : "No cars available at the moment."}
              </div>
            ) : (
           <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {sortedCars.map((car) => (
    <Link
      key={car._id}
      to={`/listings/${car.slug}`}
      className="block"
    >
      <Card className="flex flex-row overflow-hidden hover:shadow-lg transition-shadow md:flex-col">
        {/* Image section */}
        <div className="relative w-1/4 md:w-full h-24 md:h-48 m-auto">
          <img
            src={`${import.meta.env.VITE_MEDIA_URL}/${car.image}`}
            alt={car.title}
            className="w-full h-full object-cover"
          />
          {car.status === 3 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
              Sold
            </div>
          )}
          <button
            onClick={(e) => handleShare(car, e)}
            className="absolute top-2 left-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <Share2 className="w-3 h-3 text-gray-600" />
          </button>
        </div>

        {/* Details section */}
        <CardContent className="p-2 md:p-4 w-3/4 md:w-full">
          <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">{car.title}</h3>
          <p className="text-xl md:text-2xl font-bold text-dealership-primary mb-1 md:mb-2">
            AWG {car.price}
          </p>
          <div className="flex items-center text-gray-600 mb-1 md:mb-2 text-sm md:text-base">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{car.address}</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs md:text-sm text-gray-600">
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
