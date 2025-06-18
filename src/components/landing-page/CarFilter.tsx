import { Search, X } from "lucide-react";
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
  DialogClose,
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
      fetch(`${import.meta.env.VITE_API_URL}/cars/list-cars`)
    ]);

    const filtersData = await filtersRes.json();
    const carsData = await carsRes.json();

    if (filtersData.success && carsData.success) {
      // Extract unique, cleaned colors from car data
      const carColors = Array.from(
        new Set(
          carsData.data
            .map((car: any) => car.color?.trim()?.toLowerCase())
            .filter((color: string | undefined) => !!color)
        )
      ).sort();

      setDropdowns({
        ...filtersData.data,
        colors: carColors
      });

      setTotalListings(filtersData.data.total || 0);
      setFilteredBadges(filtersData.data.badges || []);

      if (filtersData.data.models && Array.isArray(filtersData.data.models)) {
        setModelOptions(filtersData.data.models);
      }
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
        let models = [];
        let fetchSuccess = false;
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/cars/models-by-make/${filters.make}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
              models = data.data;
              fetchSuccess = true;
            }
          }
        } catch (endpointError) {
          console.error('Error fetching from models-by-make endpoint:', endpointError);
        }

        if (!fetchSuccess) {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/cars/list-cars`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
              models = Array.from(
                new Set(
                  data.data
                    .filter(car => car.makeId === filters.make && car.model && car.model.trim() !== '' && car.status === 1)
                    .map(car => car.model)
                )
              );
            }
          }
        }

        setModelOptions([...models].sort());
      } catch (error) {
        console.error('Error in fetchFilteredModels:', error);
        setModelOptions([]);
      } finally {
        setIsLoadingModels(false);
      }
    };

    if (filters.make) {
      fetchFilteredModels();
    }
  }, [filters.make]);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();

    if (filters.make) searchParams.append('makeId', filters.make);
    if (filters.model) searchParams.append('model', filters.model);
    if (filters.type) searchParams.append('typeId', filters.type);
    if (filters.priceRange) searchParams.append('price', filters.priceRange);
    if (filters.location) searchParams.append('location', filters.location);
    if (filters.color) searchParams.append('color', filters.color);
    if (selectedFilter !== 'all') searchParams.append('badgeId', selectedFilter);

    navigate(`/listings?${searchParams.toString()}`);
  };

  return (
    <div className="bg-white px-4 sm:px-8 py-2 sm:py-4 rounded-lg shadow-lg max-w-7xl mx-auto -mt-30 relative z-10">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
          <button key="all" onClick={() => setSelectedFilter("all")}
            className={`text-xs px-2 py-1 rounded-full sm:text-sm sm:px-3 sm:py-2 capitalize ${selectedFilter === "all" ? "bg-dealership-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>all</button>
          {filteredBadges?.map((badge) => (
            <button key={badge._id} onClick={() => setSelectedFilter(badge._id)}
              className={`text-xs px-2 py-1 rounded-full sm:text-sm sm:px-3 sm:py-2 capitalize ${selectedFilter === badge._id ? "bg-dealership-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{badge.name}</button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm sm:text-lg font-semibold text-dealership-primary">
            {totalListings.toLocaleString()} Cars Available
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-sm sm:text-xl font-semibold text-dealership-primary border-2 border-dealership-primary px-3 py-1 sm:px-6 sm:py-2 hover:bg-dealership-primary hover:text-white">
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-w-full">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-xl font-semibold">Filter Cars</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col space-y-4">
                <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, make: value, model: undefined }))} value={filters.make}>
                  <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Select Make" /></SelectTrigger>
                  <SelectContent className="bg-white w-[44%] max-h-60 overflow-y-auto rounded-2xl shadow-xl ring-1 ring-gray-200 focus:outline-none transition-all duration-200 py-2 scrollbar-thin scrollbar-thumb-gray-300">
                    {dropdowns?.makes?.map((make) => (
                      <SelectItem key={make._id} value={make._id} className="text-gray-700 hover:bg-[#EADDCA]   hover:text-black transition-colors duration-150 cursor-pointer font-medium">{make.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, model: value }))} value={filters.model}>
                  <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Select Model" /></SelectTrigger>
                  <SelectContent className="bg-white w-[44%] max-h-60 overflow-y-auto rounded-2xl shadow-xl ring-1 ring-gray-200 focus:outline-none transition-all duration-200 py-2 scrollbar-thin scrollbar-thumb-gray-300">
                    {modelOptions.length === 0 ? (
                      <SelectItem value="no-models" disabled>{isLoadingModels ? "Loading models..." : "No models available"}</SelectItem>
                    ) : (
                      modelOptions.map((model) => (
                        <SelectItem key={model} value={model} className="text-gray-700 hover:bg-[#EADDCA]   hover:text-black transition-colors duration-150 cursor-pointer font-medium">{model}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))} value={filters.type}>
                  <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent className="bg-white w-[44%] max-h-60 overflow-y-auto rounded-2xl shadow-xl ring-1 ring-gray-200 focus:outline-none transition-all duration-200 py-2 scrollbar-thin scrollbar-thumb-gray-300">
                    {dropdowns?.types?.map((type) => (
                      <SelectItem key={type._id} value={type._id} className="text-gray-700 hover:bg-[#EADDCA]   hover:text-black transition-colors duration-150 cursor-pointer font-medium">{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, priceRange: value }))} value={filters.priceRange}>
                  <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Price Range" /></SelectTrigger>
                  <SelectContent className="bg-white w-[44%] max-h-60 overflow-y-auto rounded-2xl shadow-xl ring-1 ring-gray-200 focus:outline-none transition-all duration-200 py-2 scrollbar-thin scrollbar-thumb-gray-300">
                    {dropdowns?.prices?.map((price) => (
                      <SelectItem key={price} value={price.split("-").at(-1) || price} className="text-gray-700 hover:bg-[#EADDCA]   hover:text-black transition-colors duration-150 cursor-pointer font-medium">{price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, location: value }))} value={filters.location}>
                  <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Location" /></SelectTrigger>
                  <SelectContent className="bg-white w-[44%] max-h-60 overflow-y-auto rounded-2xl shadow-xl ring-1 ring-gray-200 focus:outline-none transition-all duration-200 py-2 scrollbar-thin scrollbar-thumb-gray-300">
                    {dropdowns?.locations?.map((location) => (
                      <SelectItem key={location} value={location} className="text-gray-700 hover:bg-[#EADDCA]   hover:text-black transition-colors duration-150 cursor-pointer font-medium">{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, color: value }))} value={filters.color}>
                  <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Select Color" /></SelectTrigger>
                  <SelectContent className="bg-white w-[44%] max-h-60 overflow-y-auto rounded-2xl shadow-xl ring-1 ring-gray-200 focus:outline-none transition-all duration-200 py-2 scrollbar-thin scrollbar-thumb-gray-300">
                    {dropdowns?.colors?.map((color) => (
                      <SelectItem key={color} value={color} className="text-gray-700 hover:bg-[#EADDCA]   hover:text-black transition-colors duration-150 cursor-pointer font-medium">{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={handleSearch} className="w-full bg-gradient-to-r from-dealership-primary/80 to-dealership-primary/100 py-6 text-lg">
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
