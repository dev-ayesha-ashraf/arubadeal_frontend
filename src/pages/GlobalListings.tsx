import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/common/Header";
import { Navbar } from "@/components/common/Navbar";
import { GlobalListingsFilter } from "@/components/common/GlobalListingsFilter";
import { Footer } from "@/components/common/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, ArrowRight, Globe } from "lucide-react";
import { SharePreview } from "@/components/common/SharePreview";
import { Pagination } from "@/components/common/Pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FeedbackBar } from "@/components/common/FeedbackBar";

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
    seats?: number | string | null;
    isThirdParty?: boolean;
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
    fuelTypes: DropdownItem[];
    prices: string[];
    colors: string[];
    models?: string[];
}

interface FilterState {
    make?: string;
    model?: string;
    type?: string;
    priceRange?: string;
    minPrice?: string;
    maxPrice?: string;
    location?: string;
    color?: string;
    fuelType?: string;
}

const getPriceBadge = (price: number): string | null => {
    if (price < 10000) return "Best Deal";
    if (price >= 10000 && price < 25000) return "Great Price";
    if (price >= 25000 && price < 40000) return "Good Value";
    return null;
};

const GlobalListings = () => {
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
            const make = searchParams.get("make");
            const model = searchParams.get("model");
            const type = searchParams.get("type");
            const color = searchParams.get("color");
            const location = searchParams.get("location");
            const min_price = searchParams.get("min_price");
            const max_price = searchParams.get("max_price");
            const fuelType = searchParams.get("fuelType");

            if (make) newFilters.make = make;
            if (model) newFilters.model = model;
            if (type) newFilters.type = type;
            if (color) newFilters.color = color;
            if (location) newFilters.location = location;
            if (min_price && max_price) newFilters.priceRange = `${min_price}-${max_price}`;
            if (fuelType) newFilters.fuelType = fuelType;
            if (min_price) newFilters.minPrice = min_price;
            if (max_price) newFilters.maxPrice = max_price;

            return newFilters;
        };

        setFilters(paramsToFilters());
    }, [searchParams]);

    useEffect(() => {
        const fetchDropdownsAndCars = async () => {
            setIsLoading(true);
            try {
                const [makesRes, typesRes, badgesRes, fuelTypesRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/make/get_all`),
                    fetch(`${import.meta.env.VITE_API_URL}/bodytype/get_all`),
                    fetch(`${import.meta.env.VITE_API_URL}/badge/get_all`),
                    fetch(`${import.meta.env.VITE_API_URL}/fueltype/get_all`)
                ]);

                if (!makesRes.ok || !typesRes.ok || !badgesRes.ok || !fuelTypesRes.ok) {
                    throw new Error("Failed to load filter data");
                }

                const [makes, types, badges, fuelTypes] = await Promise.all([
                    makesRes.json(),
                    typesRes.json(),
                    badgesRes.json(),
                    fuelTypesRes.json()
                ]);

                // Fetch third-party listings
                const tpRes = await fetch(`${import.meta.env.VITE_API_URL}/api_listing/public?page=1&size=1000`);
                if (!tpRes.ok) {
                    throw new Error("Failed to load USA listings from server");
                }
                const tpData = await tpRes.json();

                // Helper to remove LHD/RHD
                const cleanText = (text: string) => text.replace(/\s*\b(lhd|rhd)\b\s*/gi, "").trim();

                const tpItems: CarAPI[] = (tpData.items || []).map((car: any) => {
                    // Find the primary or first image
                    const primaryImage = car.images?.find((i: any) => i.is_primary) || car.images?.[0];

                    return {
                        _id: car.id,
                        title: cleanText(`${car.year} ${car.meta_data?.make || ""} ${car.model || ""}`),
                        make: {
                            id: "tp-make",
                            name: car.meta_data?.make || "Unknown",
                            slug: car.meta_data?.make?.toLowerCase() || "unknown"
                        },
                        model: cleanText(car.model || "Unknown"),
                        year: car.year,
                        body_type: {
                            id: "tp-body",
                            name: car.meta_data?.bodyType || "Unknown",
                            slug: car.meta_data?.bodyType?.toLowerCase() || "unknown"
                        },
                        fuel_type: {
                            id: "tp-fuel",
                            name: car.meta_data?.fuelType || "N/A"
                        },
                        transmission: {
                            id: "tp-trans",
                            name: cleanText(car.meta_data?.transmission || "N/A")
                        },
                        color: car.exteriorColor,
                        slug: car.id,
                        price: car.price,
                        mileage: car.miles,
                        status: 1,
                        image: primaryImage ? `${import.meta.env.VITE_MEDIA_URL}${primaryImage.image_url}` : null,
                        listedAt: car.createdAt,
                        badges: [],
                        badge: undefined,
                        vehicle_id: car.vehical_id || "",
                        location: `${car.city}, ${car.state}` || car.city || "",
                        seats: car.seats,
                        isThirdParty: true,
                    };
                });

                // Priority sorting
                const makePriority = [
                    "Toyota",
                    "Honda",
                    "Mitsubishi",
                    "Suzuki",
                    "Nissan",
                    "Isuzu",
                    "Benz",
                    "BMW"
                ];

                tpItems.sort((a, b) => {
                    const makeA = a.make.name;
                    const makeB = b.make.name;
                    const indexA = makePriority.indexOf(makeA);
                    const indexB = makePriority.indexOf(makeB);

                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                    return 0;
                });

                const uniqueModels = Array.from(new Set(tpItems.map(i => i.model).filter(Boolean)));
                const uniqueColors = Array.from(new Set(tpItems.map(i => i.color).filter(Boolean)));
                const uniqueLocations = Array.from(new Set(tpItems.map(i => i.location).filter(Boolean)));

                // Extract unique makes and body types from actual car data
                const uniqueMakes = Array.from(
                    new Set(tpItems.map(i => i.make.name).filter(Boolean))
                ).map(name => ({ id: name, name }));

                const uniqueTypes = Array.from(
                    new Set(tpItems.map(i => i.body_type?.name).filter(Boolean))
                ).map(name => ({ id: name, name }));

                // Extract unique fuel types from actual car data instead of using API
                const uniqueFuelTypes = Array.from(
                    new Set(tpItems.map(i => i.fuel_type?.name).filter(Boolean))
                ).map(name => ({ id: name, name }));

                setDropdowns({
                    makes: uniqueMakes,
                    types: uniqueTypes,
                    badges: badges || [],
                    fuelTypes: uniqueFuelTypes,
                    locations: uniqueLocations,
                    prices: ["0-3000", "3000-12000", "12000-50000"],
                    colors: uniqueColors,
                    models: uniqueModels
                });

                setAllCars(tpItems);
            } catch (err) {
                console.error(err);
                setError("Failed to load global listings.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDropdownsAndCars();
    }, [searchParams]);

    useEffect(() => {
        let tempCars = [...allCars];

        if (filters.make) tempCars = tempCars.filter(c => c.make?.name.toLowerCase() === filters.make?.toLowerCase());
        if (filters.model) tempCars = tempCars.filter(c => c.model === filters.model);
        if (filters.type) tempCars = tempCars.filter(c => c.body_type?.name.toLowerCase() === filters.type?.toLowerCase());
        if (filters.color) tempCars = tempCars.filter(c => c.color === filters.color);
        if (filters.location) tempCars = tempCars.filter(c => c.location === filters.location);
        if (filters.fuelType) tempCars = tempCars.filter(c => c.fuel_type?.name.toLowerCase() === filters.fuelType?.toLowerCase());

        if (filters.priceRange) {
            const [min, max] = filters.priceRange.split("-").map(Number);
            tempCars = tempCars.filter(c => Number(c.price) >= min && Number(c.price) <= max);
        }

        const searchQuery = searchParams.get("search")?.trim().toLowerCase();

        if (searchQuery) {
            const keywords = searchQuery.split(/\s+/).filter(Boolean);
            const numberWords: Record<string, number> = {
                one: 1,
                two: 2,
                three: 3,
                four: 4,
                five: 5,
                six: 6,
                seven: 7,
                eight: 8,
                nine: 9,
                ten: 10,
            };
            const seatMatch = searchQuery.match(/\b(\d{1,2})\s*(seats?|seater)?\b/);
            let seatQuery: number | null = seatMatch ? Number(seatMatch[1]) : null;
            if (!seatQuery) {
                const wordMatch = searchQuery.match(
                    new RegExp(`\\b(${Object.keys(numberWords).join("|")})\\s*(seats?|seater)?\\b`, "i")
                );
                if (wordMatch) {
                    seatQuery = numberWords[wordMatch[1].toLowerCase()];
                }
            }

            tempCars = tempCars.filter(c => {
                const haystack = [
                    c.title,
                    c.fuel_type?.name,
                    c.make?.name,
                    c.model,
                    c.body_type?.name,
                    c.transmission?.name,
                    c.color,
                    c.location,
                    c.badges?.join(" "),
                    c.year?.toString(),
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const matchesText = keywords.every(keyword => haystack.includes(keyword));

                const matchesSeats =
                    seatQuery !== null && Number(c.seats) === seatQuery;

                if (seatQuery !== null) {
                    return matchesSeats;
                }

                return matchesText;
            });
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
        return "USA Listings";
    }, [searchParams]);

    const handleSortChange = (value: string) => {
        setSortBy(value);

        const params = new URLSearchParams(searchParams);
        params.set("sort", value);
        setSearchParams(params);
    };


    const handleApplyFilters = () => {
        const params = new URLSearchParams();
        if (filters.make) params.set("make", filters.make);
        if (filters.model) params.set("model", filters.model);
        if (filters.type) params.set("type", filters.type);
        if (filters.color) params.set("color", filters.color);
        if (filters.location) params.set("location", filters.location);
        if (filters.fuelType) params.set("fuelType", filters.fuelType);
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
                <div className="flex flex-col gap-8 mt-[20px] md:mt-0">
                    <div className="w-full flex justify-center">
                        {dropdowns && (
                            <GlobalListingsFilter
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
                        <div className="text-center py-8">No United States listings found matching your criteria.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cars.map(car => {
                                const priceNumber = Number(car.price);
                                const badgeLabel = Number.isFinite(priceNumber) ? getPriceBadge(priceNumber) : null;

                                return (
                                    <Link key={car._id} to={`/listings/${car.slug}`} className="block h-full">
                                        <Card className="flex flex-row overflow-hidden hover:shadow-lg transition-shadow md:flex-col relative h-full">
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

                                            <CardContent className="p-2 md:p-4 w-3/4 md:w-full flex flex-col flex-1">
                                                <div className="flex items-center justify-between mb-2 md:mb-3 border-b border-gray-200 pb-1">
                                                    <h3 className="text-base md:text-lg font-semibold text-left line-clamp-1" title={car.title}>
                                                        {car.title}
                                                    </h3>
                                                </div>

                                                <div className="grid grid-cols-2 gap-1 text-xs md:text-sm text-gray-600 mb-2 ">
                                                    <div>Make: {car.make?.name}</div>
                                                    <div>Model: {car.model ?? "N/A"}</div>
                                                    <div>Type: {car.body_type?.name ?? "N/A"}</div>
                                                    <div>Transmission: {car.transmission?.name ?? "N/A"}</div>
                                                    <div>Color: {car.color ?? "N/A"}</div>
                                                    {car.badges && car.badges.length > 0 && (
                                                        <div>Badge: {car.badges.join(", ")}</div>
                                                    )}
                                                    <div>Vehicle ID: {car.vehicle_id ?? "N/A"}</div>
                                                </div>

                                                <div className="flex items-center justify-between mt-auto border-t border-gray-200 pt-2">
                                                    <p className="text-xl font-bold text-dealership-primary">
                                                        USD {car.price}
                                                    </p>
                                                    <button
                                                        className="hidden md:inline-flex items-center gap-1 text-dealership-primary hover:text-[#6B4A2B] font-medium"
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

export default GlobalListings;
