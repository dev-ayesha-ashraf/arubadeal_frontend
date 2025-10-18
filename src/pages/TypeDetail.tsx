import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { ShareButtons } from "@/components/common/ShareButtons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/common/Pagination";
import { trackCustomEvent } from "@/lib/init-pixel";

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
  price: number;
  mileage: string | number;
  make: string;
  transmission: string;
  type: string;
  image: string;
  address: string;
  status: number;
  slug: string;
  created_at?: string; 
}

const fetchAllTypes = async (): Promise<CarType[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/bodytype/get_all`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Failed to fetch types");

  const res = await response.json();
  if (!Array.isArray(res)) return [];
  return res.map((item: any) => ({
    _id: item.id,
    name: item.name,
    image: item.image_url,
    banner: item.banner_url || undefined,
    slug: item.slug,
    totalCars: item.total_cars || undefined,
  }));
};

const fetchAllCarsBySlug = async (slug: string): Promise<Car[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/bodytype/list_by_bodytype/${slug}?page=1&size=1000`, 
    { method: "GET", headers: { "Content-Type": "application/json" } }
  );

  if (!response.ok) throw new Error(`Failed to fetch cars: ${response.status}`);
  const res = await response.json();

  return Array.isArray(res.items)
    ? res.items.map((car: any) => ({
        _id: car.id,
        title: car.title,
        price: Number(car.price),
        mileage: isNaN(Number(car.mileage)) ? car.mileage : Number(car.mileage),
        make: car.make?.name,
        transmission: car.transmission?.name,
        type: car.body_type?.name,
        image: car.images?.[0]?.image_url || "",
        address: car.location,
        status: car.is_sold ? 3 : 1,
        slug: car.slug,
        created_at: car.created_at, 
      }))
    : [];
};

const TypeDetail = () => {
  const navigate = useNavigate();
  const { typeSlug } = useParams<{ typeSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const urlSortBy = searchParams.get('sort') || "date-desc";
  const [sortBy, setSortBy] = useState(urlSortBy);
  
  const [currentType, setCurrentType] = useState<CarType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 9;

  const { data: allTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ["allTypes"],
    queryFn: fetchAllTypes,
  });

  const { data: allCars = [], isLoading: carsLoading } = useQuery({
    queryKey: ["allCars", typeSlug],
    queryFn: () => fetchAllCarsBySlug(typeSlug!),
    enabled: !!typeSlug,
  });

  useEffect(() => {
    if (allTypes.length > 0 && typeSlug) {
      const type = allTypes.find((t) => t.slug === typeSlug);
      if (type) {
        setCurrentType(type);
      } else {
        navigate("/listings");
      }
    }
  }, [allTypes, typeSlug, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1); 
    
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', value);
    setSearchParams(newSearchParams);
  };

  const sortedCars = [...allCars].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return Number(a.price) - Number(b.price);
      case "price-desc":
        return Number(b.price) - Number(a.price);
      case "date-asc":
        return new Date(a.created_at || a._id).getTime() - new Date(b.created_at || b._id).getTime();
      case "date-desc":
      default:
        return new Date(b.created_at || b._id).getTime() - new Date(a.created_at || a._id).getTime();
    }
  });

  const startIndex = (currentPage - 1) * carsPerPage;
  const endIndex = startIndex + carsPerPage;
  const displayedCars = sortedCars.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedCars.length / carsPerPage);

  useEffect(() => {
    if (currentType) {
      trackCustomEvent("TypeDetailPageViewed", {
        type_id: currentType._id,
        type_name: currentType.name,
        type_slug: currentType.slug,
        total_cars: sortedCars.length,
        current_page: currentPage,
        sort_by: sortBy,
      });
    }
  }, [currentType, sortedCars.length, currentPage, sortBy]);

  const isLoading = typesLoading || !currentType;

  return (
    <div className="min-h-screen bg-gray-50 max-[800px]:mt-[20vh]">
      <Header />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6 max-[600px]:flex-col">
          <h2 className="text-2xl font-bold text-dealership-navy">
            Available {currentType?.name} Vehicles ({sortedCars.length})
          </h2>
          <div className="flex">
            <ShareButtons
              title={`${currentType?.name} Vehicles`}
              url={window.location.href}
              imageUrl={
                currentType?.banner || currentType?.image
                  ? `${import.meta.env.VITE_MEDIA_URL}/${currentType?.banner || currentType?.image}`
                  : undefined
              }
            />
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[120px] bg-white sm:w-[200px]">
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
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full">
            {carsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-72 bg-gray-200 rounded-lg animate-pulse"
                  ></div>
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
              <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedCars.map((car) => (
                  <Link key={car._id} to={`/listings/${car.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-row md:flex-col h-32 md:h-auto">
                      <div className="relative w-1/3 md:w-full h-full md:h-48">
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
                      <CardContent className="p-1 sm:p-4 w-2/3 md:w-full flex flex-col justify-center">
                        <h3 className="text-sm sm:text-lg font-normal md:text-xl md:font-semibold text-dealership-navy">
                          {car.title}
                        </h3>
                        <p className="text-sm sm:text-lg font-normal md:text-2xl md:font-bold text-dealership-primary mt-1 sm:mt-2">
                          AWG {Number(car.price).toLocaleString()}
                        </p>
                        <div className="flex items-center text-gray-600 mt-[2px] sm:mt-2 text-sm md:text-base">
                          <MapPin size={16} className="mr-1" />
                          <span className="text-sm">{car.address}</span>
                        </div>
                        <div className="mt-1 sm:mt-3 flex flex-wrap gap-2 text-xs md:text-sm">
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {car.transmission}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {typeof car.mileage === "number"
                              ? car.mileage.toLocaleString() + " mi"
                              : car.mileage}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-sm rounded">
                            {car.make}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TypeDetail;