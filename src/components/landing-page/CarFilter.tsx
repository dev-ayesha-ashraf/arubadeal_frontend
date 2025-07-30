import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface DropdownItem {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  label?: string;
  status?: number;
  image?: string;
  [key: string]: any;
}

interface DropdownsData {
  makes: DropdownItem[];
  types: DropdownItem[];
  badges: DropdownItem[];
  locations: string[];
  prices: string[];
  colors: string[];
  total: number;
  models?: string[];
}

interface FilterState {
  make?: string;
  type?: string;
  priceRange?: string;
  location?: string;
  badge?: string;
  model?: string;
  color?: string;
}

export const CarFilter = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [totalListings, setTotalListings] = useState(0);
  const navigate = useNavigate();
  const [dropdowns, setDropdowns] = useState<DropdownsData | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [filteredBadges, setFilteredBadges] = useState<DropdownItem[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [filtersRes, carsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/cars/list-filters`),
          fetch(`${import.meta.env.VITE_API_URL}/cars/list-cars-for-home-page?page=1&limit=8`)
        ]);

        const filtersData = await filtersRes.json();
        const carsData = await carsRes.json();

        console.log("carsData.data:", carsData.data); // Debug this structure

        const carList =
          Array.isArray(carsData.data?.cars)
            ? carsData.data.cars
            : Array.isArray(carsData.data?.cars?.items)
              ? carsData.data.cars.items
              : [];

        if (filtersData.success && carsData.success && carList.length > 0) {
          const carColors = Array.from(
            new Set(
              carList
                .map((car: any) => car.color?.trim()?.toLowerCase())
                .filter(Boolean)
            )
          ).sort();

          setDropdowns({
            ...filtersData.data,
            colors: carColors,
          });

          setTotalListings(filtersData.data.total || 0);
          setFilteredBadges(filtersData.data.badges || []);

          if (filtersData.data.models && Array.isArray(filtersData.data.models)) {
            setModelOptions(filtersData.data.models);
          }
        } else {
          console.warn("Unexpected API response structure", carsData);
        }

      } catch (error) {
        console.error("Error fetching dropdowns:", error);
      }
    };

    fetchDropdowns();
  }, []);

  useEffect(() => {
    const fetchFilteredModels = async () => {
      if (!filters.make) return;
      setIsLoadingModels(true);
      try {
        let models: string[] = [];
        let fetchSuccess = false;

        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/cars/models-by-make/${filters.make}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
              models = data.data;
              fetchSuccess = true;
            }
          }
        } catch (err) {
          console.error("Error fetching models-by-make:", err);
        }

        if (!fetchSuccess) {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/cars/list-cars`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
              models = Array.from(
                new Set(
                  data.data
                    .filter(car => car.makeId === filters.make && car.model?.trim() && car.status === 1)
                    .map(car => car.model)
                )
              );
            }
          }
        }

        setModelOptions(models.sort());
      } catch (error) {
        console.error("Error in fetchFilteredModels:", error);
        setModelOptions([]);
      } finally {
        setIsLoadingModels(false);
      }
    };

    if (filters.make) fetchFilteredModels();
  }, [filters.make]);

  useEffect(() => {
    if (dropdowns?.badges) {
      setFilteredBadges(dropdowns.badges);
    }
  }, [filters, dropdowns]);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (filters.make) searchParams.append("makeId", filters.make);
    if (filters.model) searchParams.append("model", filters.model);
    if (filters.type) searchParams.append("typeId", filters.type);
    if (filters.priceRange) searchParams.append("price", filters.priceRange);
    if (filters.location) searchParams.append("location", filters.location);
    if (filters.color) searchParams.append("color", filters.color);
    if (selectedFilter !== "all") searchParams.append("badgeId", selectedFilter);

    console.log("Search parameters:", Object.fromEntries(searchParams.entries()));
    navigate(`/listings?${searchParams.toString()}`);
  };

  return (
    <div className="bg-white px-4 sm:px-8 py-4 rounded-lg shadow-lg max-w-7xl mx-auto -mt-30 relative z-10">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
          <button
            key="all"
            onClick={() => setSelectedFilter("all")}
            className={`text-xs px-3 py-2 rounded-full sm:text-sm capitalize ${selectedFilter === "all" ? "bg-dealership-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            all
          </button>
          {filteredBadges.map((badge) => (
            <button
              key={badge._id}
              onClick={() => setSelectedFilter(badge._id!)}
              className={`text-xs px-3 py-2 rounded-full sm:text-sm capitalize ${selectedFilter === badge._id ? "bg-dealership-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
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
                <DialogTitle className="text-xl font-semibold mb-4">Filter Cars</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col space-y-4">
                {/* Make */}
                <Select onValueChange={(value) => setFilters(prev => ({ ...prev, make: value, model: undefined }))} value={filters.make}>
                  <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Select Make" /></SelectTrigger>
                  <SelectContent className="bg-white w-full max-h-60 overflow-y-auto">
                    {dropdowns?.makes?.map((make) => (
                      <SelectItem key={make._id} value={make._id!}>{make.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Model */}
                <Select onValueChange={(value) => setFilters(prev => ({ ...prev, model: value }))} value={filters.model}>
                  <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Select Model" /></SelectTrigger>
                  <SelectContent className="bg-white w-full max-h-60 overflow-y-auto">
                    {modelOptions.length === 0 ? (
                      <SelectItem value="no-models" disabled>
                        {isLoadingModels ? "Loading models..." : "No models available"}
                      </SelectItem>
                    ) : (
                      modelOptions.map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {/* Type */}
                <Select onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))} value={filters.type}>
                  <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent className="bg-white w-full max-h-60 overflow-y-auto">
                    {dropdowns?.types?.map((type) => (
                      <SelectItem key={type._id} value={type._id!}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Price */}
                <Select onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))} value={filters.priceRange}>
                  <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Price Range" /></SelectTrigger>
                  <SelectContent className="bg-white w-full max-h-60 overflow-y-auto">
                    {dropdowns?.prices?.map((price) => (
                      <SelectItem key={price} value={price.split("-").at(-1) ?? price}>{price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Location */}
                <Select onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))} value={filters.location}>
                  <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Location" /></SelectTrigger>
                  <SelectContent className="bg-white w-full max-h-60 overflow-y-auto">
                    {dropdowns?.locations?.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Color */}
                <Select onValueChange={(value) => setFilters(prev => ({ ...prev, color: value }))} value={filters.color}>
                  <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Color" /></SelectTrigger>
                  <SelectContent className="bg-white w-full max-h-60 overflow-y-auto">
                    {dropdowns?.colors?.map((color) => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-dealership-primary/80 to-dealership-primary py-6 text-lg"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Cars
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
