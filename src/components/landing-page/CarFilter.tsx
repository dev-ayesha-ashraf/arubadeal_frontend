import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { trackCustomEvent } from "@/lib/init-pixel"; 

interface DropdownItem {
  _id?: string;
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
  minPrice?: string;
  maxPrice?: string;
  location?: string;
  color?: string;
  badge?: string;
}

const makePriceRange = (min?: string, max?: string) => {
  if (!min && !max) return undefined;
  return `${min ?? ""}-${max ?? ""}`;
};

export const CarFilter = () => {
  const navigate = useNavigate();
  const [dropdowns, setDropdowns] = useState<DropdownsData | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [totalListings, setTotalListings] = useState<number>(0);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [makesRes, typesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/make/get_all`),
          fetch(`${import.meta.env.VITE_API_URL}/bodytype/get_all`),
        ]);

        const [makes, types] = await Promise.all([makesRes.json(), typesRes.json()]);

        const listingRes = await fetch(`${import.meta.env.VITE_API_URL}/car_listing/listing`);
        const listingData = await listingRes.json();
        setTotalListings(listingData.total_items ?? 0);

        const items = listingData.items || [];
        const uniqueModels = Array.from(new Set(items.map((i: any) => i.model).filter(Boolean)));
        const uniqueColors = Array.from(new Set(items.map((i: any) => i.color).filter(Boolean)));
        const uniqueLocations = Array.from(new Set(items.map((i: any) => i.location).filter(Boolean)));

        setDropdowns({
          makes,
          types,
          badges: [],
          locations: uniqueLocations,
          prices: ["0-3000", "3000-12000", "12000-50000"],
          colors: uniqueColors,
          models: uniqueModels,
        });
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };

    fetchFilters();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (filters.make) params.set("make_id", filters.make);
    if (filters.model) params.set("model", filters.model);
    if (filters.type) params.set("body_type_id", filters.type);

    if (filters.minPrice || filters.maxPrice) {
      if (filters.minPrice) params.set("min_price", filters.minPrice);
      if (filters.maxPrice) params.set("max_price", filters.maxPrice);
    } else if (filters.priceRange) {
      const [minStr, maxStr] = filters.priceRange.split("-").map((s) => s.trim());
      const min = Number(minStr);
      const max = Number(maxStr);
      if (!Number.isNaN(min)) params.set("min_price", String(min));
      if (!Number.isNaN(max)) params.set("max_price", String(max));
    }

    if (filters.location) params.set("location", filters.location);
    if (filters.color) params.set("color", filters.color);
    if (selectedBadge !== "all") params.set("badge", selectedBadge);

    trackCustomEvent("CarFilterApplied", {
      make: filters.make || null,
      model: filters.model || null,
      type: filters.type || null,
      priceRange: filters.priceRange || makePriceRange(filters.minPrice, filters.maxPrice) || null,
      location: filters.location || null,
      color: filters.color || null,
      badge: selectedBadge !== "all" ? selectedBadge : null,
    });

    navigate(`/listings?${params.toString()}`);
  };

  if (!dropdowns) return null;

  return (
    <div className="bg-white px-4 sm:px-8 py-4 rounded-lg shadow-lg max-w-7xl mx-auto -mt-30 relative z-10">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
          <button
            onClick={() => setSelectedBadge("all")}
            className={`text-xs px-3 py-2 rounded-full sm:text-sm capitalize ${
              selectedBadge === "all"
                ? "bg-dealership-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            all
          </button>
          {dropdowns.badges.map((badge) => (
            <button
              key={badge._id}
              onClick={() => setSelectedBadge(badge._id!)}
              className={`text-xs px-3 py-2 rounded-full sm:text-sm capitalize ${
                selectedBadge === badge._id
                  ? "bg-dealership-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {badge.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm sm:text-lg font-semibold text-dealership-primary">
            {totalListings.toLocaleString()} Cars Available
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-sm sm:text-xl font-semibold text-dealership-primary border-2 border-dealership-primary px-6 py-2 hover:bg-dealership-primary hover:text-white transition-all"
              >
                Filter
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl w-full">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold mb-4">
                  Filter Cars
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col space-y-4">
                {/* Make */}
                <Select
                  value={filters.make}
                  onValueChange={(v) => setFilters((prev) => ({ ...prev, make: v, model: undefined }))}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select Make" />
                  </SelectTrigger>
                  <SelectContent className="bg-white w-full max-h-60 overflow-y-auto">
                    {dropdowns.makes.map((make) => (
                      <SelectItem key={make.id} value={make.id}>
                        {make.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Model */}
                <Select value={filters.model} onValueChange={(v) => setFilters((prev) => ({ ...prev, model: v }))}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent className="bg-white w-full max-h-60 overflow-y-auto">
                    {dropdowns.models?.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Type */}
                <Select value={filters.type} onValueChange={(v) => setFilters((prev) => ({ ...prev, type: v }))}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white w-full max-h-60 overflow-y-auto">
                    {dropdowns.types.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Min / Max Price */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice ?? ""}
                    onChange={(e) =>
                      setFilters((prev) => {
                        const newMin = e.target.value;
                        return { ...prev, minPrice: newMin, priceRange: makePriceRange(newMin, prev.maxPrice) };
                      })
                    }
                    className="border border-gray-300 rounded-xl p-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-dealership-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice ?? ""}
                    onChange={(e) =>
                      setFilters((prev) => {
                        const newMax = e.target.value;
                        return { ...prev, maxPrice: newMax, priceRange: makePriceRange(prev.minPrice, newMax) };
                      })
                    }
                    className="border border-gray-300 rounded-xl p-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-dealership-primary"
                  />
                </div>

                {/* Location */}
                <Select
                  value={filters.location}
                  onValueChange={(v) => setFilters((prev) => ({ ...prev, location: v }))}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white w-full max-h-60 overflow-y-auto">
                    {dropdowns.locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Color */}
                <Select value={filters.color} onValueChange={(v) => setFilters((prev) => ({ ...prev, color: v }))}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent className="bg-white w-full max-h-60 overflow-y-auto">
                    {dropdowns.colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-dealership-primary/80 to-dealership-primary py-6 text-lg"
                >
                  <Search className="w-5 h-5 mr-2" /> Search Cars
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
