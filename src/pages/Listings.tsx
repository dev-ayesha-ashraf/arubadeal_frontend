import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { ListingsFilter } from "@/components/common/ListingsFilter";
import { Footer } from "@/components/common/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, ArrowRight } from "lucide-react";
import { SharePreview } from "@/components/common/SharePreview";
import { Pagination } from "@/components/common/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CarAPI {
  _id: string;
  title: string;
  make: { id: string; name: string; slug?: string };
  year?: number;
  model: string;
  body_type?: { id: string; name: string; slug?: string };
  fuel_type?: { id: string; name: string };
  transmission?: { id: string; name: string };
  image: string | null;
  price: number | string;
  mileage?: number | string | null;
  color?: string;
  slug: string;
  status?: number;
  listedAt?: string;
  badge?: { id: string; name: string };
  vehicle_id?: string;
  location?: string;
  badges?: string[];
}

interface DropdownItem {
  id?: string;
  name?: string;
}

interface DropdownsData {
  makes: DropdownItem[];
  types: DropdownItem[];
  badges: DropdownItem[];
  locations: string[];
  prices: string[];
  colors: string[];
  models?: string[];
}

interface FilterState {
  make?: string;
  model?: string;
  type?: string;
  priceRange?: string;
  location?: string;
  color?: string;
  badge?: string;
}

const getPriceBadge = (price: number): string | null => {
  if (price < 10000) return "Best Deal";
  if (price >= 10000 && price < 25000) return "Great Price";
  if (price >= 25000 && price < 40000) return "Good Value";
  return null;
};

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dropdowns, setDropdowns] = useState<DropdownsData | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [allCars, setAllCars] = useState<CarAPI[]>([]);
  const [cars, setCars] = useState<CarAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialPage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedCar, setSelectedCar] = useState<CarAPI | null>(null);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [filteredCars, setFilteredCars] = useState<CarAPI[]>([]);

  const pageSize = 9;
  const initialSort = searchParams.get("sort") || "date-desc";
  const [sortBy, setSortBy] = useState<string>(initialSort);
  useEffect(() => {
    const paramsToFilters = (): FilterState => {
      const newFilters: FilterState = {};
      const make_id = searchParams.get("make_id");
      const model = searchParams.get("model");
      const type = searchParams.get("body_type_id");
      const color = searchParams.get("color");
      const location = searchParams.get("location");
      const min_price = searchParams.get("min_price");
      const max_price = searchParams.get("max_price");
      const badge_id = searchParams.get("badge_id");

      if (badge_id) newFilters.badge = badge_id;
      if (make_id) newFilters.make = make_id;
      if (model) newFilters.model = model;
      if (type) newFilters.type = type;
      if (color) newFilters.color = color;
      if (location) newFilters.location = location;
      if (min_price && max_price) newFilters.priceRange = `${min_price}-${max_price}`;

      return newFilters;
    };

    setFilters(paramsToFilters());
  }, [searchParams]);

  useEffect(() => {
    const fetchDropdownsAndCars = async () => {
      setIsLoading(true);
      try {
        const [makesRes, typesRes, badgesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/make/get_all`),
          fetch(`${import.meta.env.VITE_API_URL}/bodytype/get_all`),
          fetch(`${import.meta.env.VITE_API_URL}/badge/get_all`)
        ]);

        const [makes, types, badges] = await Promise.all([
          makesRes.json(),
          typesRes.json(),
          badgesRes.json()
        ]);

        const makeSlug = searchParams.get("makeSlug");
        const listingUrlBase = makeSlug
          ? `${import.meta.env.VITE_API_URL}/make/list_by_makes/${makeSlug}`
          : `${import.meta.env.VITE_API_URL}/car_listing/listing`;
        const initialRes = await fetch(`${listingUrlBase}?page=1&size=1`);
        const initialData = await initialRes.json();
        const totalItems = initialData.total_items || 1000;

        const listingRes = await fetch(`${listingUrlBase}?page=1&size=${totalItems}`);
        const listingData = await listingRes.json();


        const items: CarAPI[] = (listingData.items || []).map((car: any) => {
          const primaryImage = car.images?.find((i: any) => i.is_primary) || car.images?.[0];
          return {
            _id: car.id,
            title: car.title,
            make: car.make,
            model: car.model,
            year: car.year,
            body_type: car.body_type,
            fuel_type: car.fuel_type,
            transmission: car.transmission,
            color: car.color,
            slug: car.slug,
            price: car.price,
            mileage: car.mileage,
            status: car.is_sold ? 3 : 1,
            image: primaryImage ? `${import.meta.env.VITE_MEDIA_URL}${primaryImage.image_url}` : null,
            listedAt: car.created_at ?? null,
            badges: car.badge ? [car.badge.name] : [],
            badge: car.badge,
            vehicle_id: car.vehical_id ?? "",
            location: car.location ?? ""
          };
        });

        const uniqueModels = Array.from(new Set(items.map(i => i.model).filter(Boolean)));
        const uniqueColors = Array.from(new Set(items.map(i => i.color).filter(Boolean)));
        const uniqueLocations = Array.from(new Set(items.map(i => i.location).filter(Boolean)));

        setDropdowns({
          makes,
          types,
          badges: badges || [],
          locations: uniqueLocations,
          prices: ["0-3000", "3000-12000", "12000-50000"],
          colors: uniqueColors,
          models: uniqueModels
        });

        setAllCars(items);
      } catch (err) {
        console.error(err);
        setError("Failed to load cars.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDropdownsAndCars();
  }, [searchParams]);
  useEffect(() => {
    let tempCars = [...allCars];

    if (filters.make) tempCars = tempCars.filter(c => c.make?.id === filters.make);
    if (filters.model) tempCars = tempCars.filter(c => c.model === filters.model);
    if (filters.type) tempCars = tempCars.filter(c => c.body_type?.id === filters.type);
    if (filters.color) tempCars = tempCars.filter(c => c.color === filters.color);
    if (filters.location) tempCars = tempCars.filter(c => c.location === filters.location);
    if (filters.badge) tempCars = tempCars.filter(c => c.badge?.id === filters.badge);

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number);
      tempCars = tempCars.filter(c => Number(c.price) >= min && Number(c.price) <= max);
    }

    const searchQuery = searchParams.get("search")?.trim().toLowerCase();
    if (searchQuery) {
      tempCars = tempCars.filter(c =>
        c.title?.toLowerCase().includes(searchQuery) ||
        c.fuel_type?.name?.toLowerCase().includes(searchQuery) ||
        c.make?.name?.toLowerCase().includes(searchQuery) ||
        c.model?.toLowerCase().includes(searchQuery) ||
        c.body_type?.name?.toLowerCase().includes(searchQuery) ||
        c.color?.toLowerCase().includes(searchQuery) ||
        c.location?.toLowerCase().includes(searchQuery) ||
        (c.badges && c.badges.some(b => b.toLowerCase().includes(searchQuery))) ||
        (c.year && c.year.toString().includes(searchQuery))
      );
    }

    switch (sortBy) {
      case "price-asc":
        tempCars.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        tempCars.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "date-asc":
        tempCars.sort((a, b) => new Date(a.listedAt || "").getTime() - new Date(b.listedAt || "").getTime());
        break;
      case "date-desc":
      default:
        tempCars.sort((a, b) => new Date(b.listedAt || "").getTime() - new Date(a.listedAt || "").getTime());
        break;
    }

    setFilteredCars(tempCars);
    const pageFromUrl = Number(searchParams.get("page")) || 1;
    setCurrentPage(pageFromUrl);
  }, [filters, sortBy, searchParams, allCars]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(currentPage));
    setSearchParams(params, { replace: true });
  }, [currentPage]);

  useEffect(() => {
    const start = (currentPage - 1) * pageSize;
    setCars(filteredCars.slice(start, start + pageSize));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filteredCars, currentPage]);


  const totalPages = Math.ceil(filteredCars.length / pageSize);


  const title = useMemo(() => {
    const searchQuery = searchParams.get("search")?.trim();
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    return "All Listings";
  }, [searchParams]);

  const handleSortChange = (value: string) => {
    setSortBy(value);

    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    setSearchParams(params);
  };


  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (filters.make) params.set("make_id", filters.make);
    if (filters.model) params.set("model", filters.model);
    if (filters.type) params.set("body_type_id", filters.type);
    if (filters.color) params.set("color", filters.color);
    if (filters.location) params.set("location", filters.location);
    if (filters.badge) params.set("badge_id", filters.badge);
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-");
      params.set("min_price", min);
      params.set("max_price", max);
    }
    setSearchParams(params);
  };

  const onShare = (car: CarAPI, e: React.MouseEvent) => {
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
        <div className="flex flex-col gap-8 mt-[120px] md:mt-0">
          <div className="w-full flex justify-center">
            {dropdowns && (
              <ListingsFilter
                dropdowns={dropdowns}
                filters={filters}
                setFilters={setFilters}
                onApply={handleApplyFilters}
              />
            )}
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[200px]">
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
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : cars.length === 0 ? (
            <div className="text-center py-8">No cars found matching your criteria.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map(car => {
                const priceNumber = Number(car.price);
                const badgeLabel = Number.isFinite(priceNumber) ? getPriceBadge(priceNumber) : null;

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
                          src={car.image || "/fallback.jpg"}
                          alt={car.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        {car.status === 3 && (
                          <div
                            className="absolute bottom-1 left-1 md:top-2 md:left-2 md:bottom-auto
               bg-red-500 text-white px-1.5 py-0.5 md:px-2 md:py-0.5
               rounded-full text-[10px] md:text-xs font-semibold
               z-10 shadow-md"
                          >
                            Sold
                          </div>
                        )}

                        <button
                          onClick={(e) => onShare(car, e)}
                          className="absolute top-2 left-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors md:left-auto md:right-2 z-20"
                          aria-label="Share listing"
                        >
                          <Share2 className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>

                      <CardContent className="p-2 md:p-4 w-3/4 md:w-full">
                        <div className="flex items-center justify-between mb-2 md:mb-3 border-b border-gray-200 pb-1">
                          <h3 className="text-base md:text-lg font-semibold text-left">
                            {car.title}
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-xs md:text-sm text-gray-600 mb-2 border-b border-gray-200 pb-2">
                          <div>Make: {car.make?.name}</div>
                          <div>Model: {car.model ?? "N/A"}</div>
                          <div>Type: {car.body_type?.name ?? "N/A"}</div>
                          <div>Transmission: {car.transmission?.name ?? "N/A"}</div>
                          <div>Color: {car.color ?? "N/A"}</div>
                          <div>Badge: {car.badges?.join(", ") ?? "N/A"}</div>
                          <div>Vehicle ID: {car.vehicle_id ?? "N/A"}</div>
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

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      <Footer />

      <SharePreview
        car={selectedCar as any}
        isOpen={showSharePreview}
        onClose={() => setShowSharePreview(false)}
      />
    </div>
  );
};

export default Listings;
