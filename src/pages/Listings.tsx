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
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Share2 } from "lucide-react";
import { SharePreview } from "@/components/common/SharePreview";
import { Car } from "@/types/car";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Pagination } from "@/components/common/Pagination";
import { useEffect } from "react";

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

interface CarType {
  _id: string;
  name: string;
}

const fetchCarsByPage = async ({
  page,
  makeId,
  limit = 9
}: { page: number; makeId?: string; limit?: number }): Promise<{
  cars: Car[];
  total: number;
}> => {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (makeId) params.set("makeId", makeId);

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cars/list-cars-for-home-page?${params.toString()}`
  );
  if (!response.ok) throw new Error("Failed to fetch cars");

  const res = await response.json();
  return {
    cars: res.data.data,
    total: res.data.pagination?.total || res.data.data.length
  };
};

const fetchFullCars = async (): Promise<CarDetail[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/cars/list-cars`);
  if (!response.ok) throw new Error("Failed to fetch full cars");
  const res = await response.json();
  return res.data.cars;
};

const fetchMakes = async (): Promise<Manufacturer[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/makes/list-makes`);
  if (!response.ok) throw new Error("Failed to fetch makes");
  const data = await response.json();
  return data.data;
};

const fetchTypes = async (): Promise<CarType[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/types/list-types`);
  if (!response.ok) throw new Error("Failed to fetch types");
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
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "date-desc");
  const handleSortChange = (value: string) => {
    setSortBy(value);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sort", value);
    setSearchParams(newParams);
  };

  const makeId = searchParams.get("makeId");
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  const colorQuery = searchParams.get("color")?.toLowerCase() || "";
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 9;
  const { data: homeCarsData, isLoading } = useQuery({
    queryKey: ["cars", makeId, currentPage, searchQuery],
    queryFn: async () => {
      if (searchQuery) {
        const firstPage = await fetchCarsByPage({ page: 1, makeId, limit: 1 });
        return fetchCarsByPage({ page: 1, makeId, limit: firstPage.total });
      } else {
        return fetchCarsByPage({ page: currentPage, makeId, limit: carsPerPage });
      }
    },
    placeholderData: (prev) => prev,
  });


  const { data: fullCars = [] } = useQuery({
    queryKey: ['fullCars'],
    queryFn: fetchFullCars,
    staleTime: 1000 * 60 * 5, 
  });

  const { data: makes = [] } = useQuery({
    queryKey: ["makes"],
    queryFn: fetchMakes,
    enabled: !!makeId,
  });

  const { data: types = [] } = useQuery({
    queryKey: ["types"],
    queryFn: fetchTypes,
  });

  const selectedMake = makes.find((make) => make._id === makeId);
  const homeCars = homeCarsData?.cars || [];
  const totalCars = homeCarsData?.total || 0;

  const mergedCars = homeCars.map((car) => {
    const fullCar = fullCars.find((c) => c._id === car._id);
    const typeName = types.find((t) => t._id === fullCar?.typeId)?.name || "N/A";
    return {
      ...car,
      model: fullCar?.model || "N/A",
      color: fullCar?.color || "N/A",
      type: typeName,
    };
  });

  const filteredCars = mergedCars.filter((car) => {
    const matchesSearch =
      !searchQuery ||
      car.title.toLowerCase().includes(searchQuery) ||
      car.make.toLowerCase().includes(searchQuery) ||
      (car.model?.toLowerCase() || "").includes(searchQuery) ||
      (car.type?.toLowerCase() || "").includes(searchQuery) ||
      (car.color?.toLowerCase() || "").includes(searchQuery);

    const matchesColor = !colorQuery || (car.color?.toLowerCase() || "") === colorQuery;

    return matchesSearch && matchesColor;
  });

  const sortedCars = [...filteredCars].sort((a, b) => {
    switch (sortBy) {
      case "price-asc": return Number(a.price) - Number(b.price);
      case "price-desc": return Number(b.price) - Number(a.price);
      case "date-asc": return a._id.localeCompare(b._id);
      default: return b._id.localeCompare(a._id);
    }
  });
  let paginatedCars: typeof sortedCars = [];
  let totalPages = 1;

  if (searchQuery) {
    totalPages = Math.ceil(sortedCars.length / carsPerPage);
    paginatedCars = sortedCars.slice(
      (currentPage - 1) * carsPerPage,
      currentPage * carsPerPage
    );
  } else {
    totalPages = Math.ceil(totalCars / carsPerPage);
    paginatedCars = sortedCars;
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, colorQuery, makeId]);


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
          <ListingsFilter />
          <div className="flex justify-end items-center gap-2 mb-4">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {searchQuery ? `Search Results for "${searchQuery}"` : makeId && selectedMake ? `All ${selectedMake.name} Vehicles` : "All Listings"}
              </h1>
              <Select value={sortBy} onValueChange={handleSortChange}>
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
            ) : paginatedCars.length === 0 ? (
              <div className="text-center py-8">No cars found matching your search criteria.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCars.map((car) => {
                  const badgeLabel = getPriceBadge(Number(car.price));
                  return (
                    <Link key={car._id} to={`/listings/${car.slug}`} className="block">
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
                            <div className="hidden md:block absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium z-10">
                              Sold
                            </div>
                          )}

                          <button
                            onClick={(e) => handleShare(car, e)}
                            className="absolute top-2 left-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors md:left-auto md:right-2 z-20"
                          >
                            <Share2 className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>

                        <CardContent className="p-2 md:p-4 w-3/4 md:w-full">
                          <div className="flex items-center justify-between mb-2 md:mb-3 border-b border-gray-200 pb-1">
                            <h3 className="text-base md:text-lg font-semibold text-left">
                              {car.title}
                            </h3>
                            {car.status === 3 && (
                              <div className="block md:hidden bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                Sold
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-1 text-xs md:text-sm text-gray-600 mb-2 border-b border-gray-200 pb-2">
                            <div>Make: {car.make}</div>
                            <div>Model: {car.model}</div>
                            <div>Type: {car.type}</div>
                            <div>
                              Mileage:{' '}
                              {car.mileage !== undefined && car.mileage !== null
                                ? typeof car.mileage === 'number'
                                  ? `${car.mileage.toLocaleString()} miles`
                                  : `${car.mileage}`.toLowerCase().includes('km') || `${car.mileage}`.toLowerCase().includes('miles')
                                    ? car.mileage
                                    : `${car.mileage} miles`
                                : '0 miles'}
                            </div>
                            <div>Color: {car.color}</div>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-xl font-bold text-dealership-primary">AWG {car.price}</p>
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
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}   
                onPageChange={setCurrentPage}
              />
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
