import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

interface DropdownItem {
  id?: string;
  name?: string;
}

interface DropdownsData {
  makes: DropdownItem[];
  types: DropdownItem[];
  badges: DropdownItem[];
  fuelTypes: DropdownItem[];
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
  fuelType?: string;
}

interface Props {
  dropdowns: DropdownsData;
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  onApply: () => void;
}

const makePriceRange = (min?: string, max?: string) => {
  if (!min && !max) return undefined;
  return `${min ?? ""}-${max ?? ""}`;
};

export const ListingsFilter = ({ dropdowns, filters, setFilters, onApply }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-white text-dealership-primary border-2 border-dealership-primary px-6 py-2 hover:bg-dealership-primary hover:text-white transition-colors duration-300 w-[140px]"
          onClick={() => setOpen(true)}
        >
          Filter
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-4">Filter Cars</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto pl-3 pr-3">
          {/* Make */}
          <Select value={filters.make} onValueChange={v => setFilters({ ...filters, make: v })}>
            <SelectTrigger className="mt-5 w-full"><SelectValue placeholder="Select Make" /></SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto bg-white">
              {dropdowns.makes.map(make => <SelectItem key={make.id} value={make.id}>{make.name}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Model */}
          <Select value={filters.model} onValueChange={v => setFilters({ ...filters, model: v })}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select Model" /></SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto bg-white">
              {dropdowns.models?.map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Type */}
          <Select value={filters.type} onValueChange={v => setFilters({ ...filters, type: v })}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select Type" /></SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto bg-white">
              {dropdowns.types.map(type => <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {/* Fuel Type */}
          <Select value={filters.fuelType} onValueChange={v => setFilters({ ...filters, fuelType: v })}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select Fuel Type" /></SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto bg-white">
              {dropdowns.fuelTypes.map(fuelType => (
                <SelectItem key={fuelType.id} value={fuelType.id}>
                  {fuelType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice ?? ""}
              onChange={e => {
                const newMin = e.target.value;
                const newPriceRange = makePriceRange(newMin, filters.maxPrice);
                setFilters({ ...filters, minPrice: newMin, priceRange: newPriceRange });
              }}
              className="border border-gray-300 rounded-xl p-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-dealership-primary"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice ?? ""}
              onChange={e => {
                const newMax = e.target.value;
                const newPriceRange = makePriceRange(filters.minPrice, newMax);
                setFilters({ ...filters, maxPrice: newMax, priceRange: newPriceRange });
              }}
              className="border border-gray-300 rounded-xl p-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-dealership-primary"
            />
          </div>

          {/* Location */}
          <Select value={filters.location} onValueChange={v => setFilters({ ...filters, location: v })}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto bg-white">
              {dropdowns.locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
            </SelectContent>
          </Select>
          {/* badge */}
          <Select value={filters.badge} onValueChange={v => setFilters({ ...filters, badge: v })}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select Badge" /></SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto bg-white">
              {dropdowns.badges.map(badge => (
                <SelectItem key={badge.id} value={badge.id}>
                  {badge.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>


          {/* Color */}
          <Select value={filters.color} onValueChange={v => setFilters({ ...filters, color: v })}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select Color" /></SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto bg-white">
              {dropdowns.colors.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button
            onClick={() => { onApply(); setOpen(false); }}
            className="bg-dealership-primary text-white py-3 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
