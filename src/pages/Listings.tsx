import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { ListingsFilter } from "@/components/common/ListingsFilter";
import { Footer } from "@/components/common/Footer";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Share2, ArrowRight } from "lucide-react";
import { SharePreview } from "@/components/common/SharePreview";
import { Car } from "@/types/car";

interface CarDetail {
  _id: string;
  model?: string;
  color?: string;
  typeId?: string;
  transmission?: string;
  year?: number;
  seats?: number;
}

interface Manufacturer {
  _id: string;
  name: string;
}

const fetchCars = async (params: URLSearchParams): Promise<Car[]> => {
  const listRes = await fetch(
    `${import.meta.env.VITE_API_URL}/cars/list-cars-for-home-page?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!listRes.ok) throw new Error("Failed to fetch base cars");
  const baseCars = (await listRes.json()).data;

  const [detailsRes, typesRes] = await Promise.all([
    fetch(`${import.meta.env.VITE_API_URL}/cars/list-cars`),
    fetch(`${import.meta.env.VITE_API_URL}/types/list-types`),
  ]);

  const detailsArray: CarDetail[] = (await detailsRes.json()).data ?? [];
  const typesArray: { _id: string; name: string }[] = (await typesRes.json()).data ?? [];

  const detailsMap = new Map<string, CarDetail>();
  for (const detail of detailsArray) {
    detailsMap.set(detail._id, detail);
  }

  const typesMap = new Map<string, string>();
  for (const type of typesArray) {
    typesMap.set(type._id, type.name);
  }

  return baseCars.map((baseCar: any): Car => {
    const detail = detailsMap.get(baseCar._id);
    const typeName = detail?.typeId ? typesMap.get(detail.typeId) : undefined;

    return {
      _id: baseCar._id,
      slug: baseCar.slug,
      title: baseCar.title,
      make: baseCar.make,
      image: baseCar.image,
      mileage: baseCar.mileage,
      price: baseCar.price,
      status: baseCar.status,
      model: detail?.model ?? "N/A",
      color: detail?.color ?? "N/A",
      type: typeName ?? "Unknown",
      transmission: detail?.transmission ?? baseCar.transmission ?? "N/A",
      year: detail?.year ?? baseCar.year ?? 0,
      seats: detail?.seats ?? baseCar.seats ?? 0,
    } as Car;
  });
};

const fetchMakes = async (): Promise<Manufacturer[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/makes/list-makes`);
  if (!response.ok) throw new Error("Failed to fetch makes");
  const data = await response.json();
  return data.data;
};

const getPriceBadge = (price: number): string | null => {
  if (price < 10000) return "Best Deal";
  if (price >= 10000 && price < 25000) return "Great Price";
  if (price >= 25000 && price < 40000) return "Good Value";
  return null;
};

const Listings = () => {
  const [sortBy, setSortBy] = useState("date-desc");
  const [searchParams] = useSearchParams();
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showSharePreview, setShowSharePreview] = useState(false);

  const makeId = searchParams.get("makeId");
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  const colorQuery = searchParams.get("color")?.toLowerCase() || "";

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["cars", searchParams.toString()],
    queryFn: () => fetchCars(searchParams),
  });

  const { data: makes = [] } = useQuery({
    queryKey: ["makes"],
    queryFn: fetchMakes,
    enabled: !!makeId,
  });

  const selectedMake = makes.find((make) => make._id === makeId);

  const filteredCars = cars.filter((car) => {
  const matchesSearch =
    !searchQuery ||
    car.title.toLowerCase().includes(searchQuery) ||
    car.make.toLowerCase().includes(searchQuery) ||
    (car.model?.toLowerCase() || "").includes(searchQuery) ||
    (car.type?.toLowerCase() || "").includes(searchQuery) ||
    (car.color?.toLowerCase() || "").includes(searchQuery);

  const matchesColor =
    !colorQuery || (car.color?.toLowerCase() || "") === colorQuery;

  return matchesSearch && matchesColor;
});


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
                  : makeId && selectedMake
                    ? `All ${selectedMake.name} Vehicles`
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
                {searchQuery || colorQuery
                  ? "No cars found matching your filters."
                  : "No cars available at the moment."}
              </div>
            ) : (
              <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCars.map((car) => {
                  const badgeLabel = getPriceBadge(Number(car.price));
                  return (
                    <Link
                      key={car._id}
                      to={`/listings/${car.slug}`}
                      className="block"
                    >
                      <Card className="flex flex-row overflow-hidden hover:shadow-lg transition-shadow md:flex-col relative">
                        <div className="relative w-1/4 md:w-full h-24 md:h-48 m-auto">
                          {badgeLabel && car.status !== 3 && (
                            <div className="hidden md:block absolute top-2 left-2 bg-dealership-primary text-white px-2 py-0.5 rounded-full text-[15px] font-semibold shadow-md z-10">
                              {badgeLabel}
                            </div>
                          )}
                          <img
                            src={`${import.meta.env.VITE_MEDIA_URL}/${car.image}`}
                            alt={car.title}
                            className="w-full h-full object-cover"
                          />
                          {car.status === 3 && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                              Sold
                            </div>
                          )}
                          <button
                            onClick={(e) => handleShare(car, e)}
                            className="absolute top-2 left-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors md:left-auto md:right-2"
                          >
                            <Share2 className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                        <CardContent className="p-2 md:p-4 w-3/4 md:w-full">
                          <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-left border-b border-gray-200 pb-1">
                            {car.title}
                          </h3>
                          <div className="grid grid-cols-2 gap-1 text-xs md:text-sm text-gray-600 mb-2 border-b border-gray-200 pb-2">
                            <div>Make: {car.make}</div>
                            <div>Model: {car.model}</div>
                            <div>Type: {car.type}</div>
                            <div>Mileage: {car.mileage} km</div>
                            <div>Color: {car.color}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xl font-bold text-dealership-primary">
                              AWG {car.price}
                            </p>
                            <button
                              className="hidden md:inline-flex items-center gap-1 text-dealership-primary hover:text-[#6B4A2B] font-medium mt-2"
                              type="button"
                            >
                              View Details
                              <ArrowRight className="w-4 h-4 transform -rotate-45" />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
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
