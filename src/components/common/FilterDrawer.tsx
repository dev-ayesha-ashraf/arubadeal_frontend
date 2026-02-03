import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Search, X, ChevronUp } from "lucide-react";

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

interface FilterDrawerProps {
    dropdowns: DropdownsData;
    filters: FilterState;
    setFilters: (f: FilterState) => void;
    onApply: (f?: FilterState) => void;
    filterMode?: "normal" | "global" | "auction";
    isOpen: boolean;
    onToggle: () => void;
}

const makePriceRange = (min?: string, max?: string) => {
    if (!min && !max) return undefined;
    return `${min ?? ""}-${max ?? ""}`;
};

export const FilterDrawer = ({
    dropdowns,
    filters,
    setFilters,
    onApply,
    filterMode = "normal",
    isOpen,
    onToggle
}: FilterDrawerProps) => {
    // Count active filters
    const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== "").length;

    const handleClearFilters = () => {
        setFilters({});
        onApply({});
    };

    const handleApply = () => {
        onApply();
        // Don't close for sidebar, but maybe for top drawer?
        // User said "only cards should become responsive... move on right" which implies persistent
        // For mobile top drawer, they probably want to close it after applying.
        if (window.innerWidth < 1024) {
            onToggle();
        }
    };

    // Use name for value in global/auction mode, id for normal mode
    const useNameAsValue = filterMode === "global" || filterMode === "auction";

    return (
        <>
            {/* Filter Toggle Button */}
            <Button
                className="bg-white text-dealership-primary border-2 border-dealership-primary px-6 py-2 hover:bg-dealership-primary hover:text-white transition-colors duration-300 flex items-center gap-2 z-30"
                onClick={onToggle}
            >
                <Filter className="w-4 h-4" />
                {isOpen ? "Hide Filters" : "Filter"}
                {activeFilterCount > 0 && (
                    <span className="bg-dealership-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs group-hover:bg-white group-hover:text-dealership-primary">
                        {activeFilterCount}
                    </span>
                )}
            </Button>

            {/* Sidebar / Top Panel - slides in without overlay */}
            {/* Fixed z-index to 100 to cover navbar/header */}
            <div
                className={`fixed bg-white shadow-2xl z-[100] transition-all duration-300 ease-in-out border-gray-200 
                    ${isOpen ? "visible opacity-100" : "invisible opacity-0"}
                    lg:top-0 lg:right-0 lg:left-auto lg:h-full lg:w-[320px] lg:border-l lg:translate-y-0
                    ${isOpen ? "lg:translate-x-0" : "lg:translate-x-full"}
                    top-0 left-0 w-full h-[45%] border-b translate-x-0
                    ${isOpen ? "translate-y-0" : "-translate-y-full"}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 lg:p-4 border-b bg-gray-50">
                    <h2 className="text-sm lg:text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Filter className="w-4 h-4 lg:w-5 lg:h-5 text-dealership-primary" />
                        Filter Cars
                    </h2>
                    <div className="flex items-center gap-2">
                        {activeFilterCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1 text-[10px] lg:text-xs h-7 lg:h-9"
                            >
                                <X className="w-3 h-3" />
                                Clear
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggle}
                            className="hover:bg-gray-100 h-7 lg:h-9"
                        >
                            <ChevronUp className={`w-5 h-5 transition-transform ${isOpen ? "" : "rotate-180"} lg:rotate-90`} />
                        </Button>
                    </div>
                </div>

                {/* Filter Content */}
                {/* Compact grid for mobile top panel */}
                <div className="flex flex-col p-3 lg:p-4 gap-3 lg:space-y-4 overflow-y-auto lg:h-[calc(100%-140px)] h-[calc(100%-100px)]">
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                        {/* Make */}
                        <div>
                            <label className="text-[10px] lg:text-sm font-medium text-gray-700 mb-0.5 lg:mb-1 block">Make</label>
                            <Select
                                value={filters.make || ""}
                                onValueChange={v => setFilters({ ...filters, make: v, model: undefined })}
                            >
                                <SelectTrigger className="w-full h-8 lg:h-10 text-[11px] lg:text-sm">
                                    <SelectValue placeholder="Select Make" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto bg-white z-[110]">
                                    {dropdowns.makes.map(make => (
                                        <SelectItem
                                            key={make.id}
                                            value={useNameAsValue ? (make.name || "") : (make.id || "")}
                                            className="text-[11px] lg:text-sm"
                                        >
                                            {make.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Model */}
                        <div>
                            <label className="text-[10px] lg:text-sm font-medium text-gray-700 mb-0.5 lg:mb-1 block">Model</label>
                            <Select
                                value={filters.model || ""}
                                onValueChange={v => setFilters({ ...filters, model: v })}
                            >
                                <SelectTrigger className="w-full h-8 lg:h-10 text-[11px] lg:text-sm">
                                    <SelectValue placeholder="Select Model" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto bg-white z-[110]">
                                    {dropdowns.models?.map(model => (
                                        <SelectItem key={model} value={model} className="text-[11px] lg:text-sm">{model}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="text-[10px] lg:text-sm font-medium text-gray-700 mb-0.5 lg:mb-1 block">Body Type</label>
                            <Select
                                value={filters.type || ""}
                                onValueChange={v => setFilters({ ...filters, type: v })}
                            >
                                <SelectTrigger className="w-full h-8 lg:h-10 text-[11px] lg:text-sm">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto bg-white z-[110]">
                                    {dropdowns.types.map(type => (
                                        <SelectItem
                                            key={type.id}
                                            value={useNameAsValue ? (type.name || "") : (type.id || "")}
                                            className="text-[11px] lg:text-sm"
                                        >
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fuel Type */}
                        <div>
                            <label className="text-[10px] lg:text-sm font-medium text-gray-700 mb-0.5 lg:mb-1 block">Fuel Type</label>
                            <Select
                                value={filters.fuelType || ""}
                                onValueChange={v => setFilters({ ...filters, fuelType: v })}
                            >
                                <SelectTrigger className="w-full h-8 lg:h-10 text-[11px] lg:text-sm">
                                    <SelectValue placeholder="Select Fuel Type" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto bg-white z-[110]">
                                    {dropdowns.fuelTypes.map(fuelType => (
                                        <SelectItem
                                            key={fuelType.id}
                                            value={useNameAsValue ? (fuelType.name || "") : (fuelType.id || "")}
                                            className="text-[11px] lg:text-sm"
                                        >
                                            {fuelType.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Price Range */}
                        <div className="col-span-2 lg:col-span-1">
                            <label className="text-[10px] lg:text-sm font-medium text-gray-700 mb-0.5 lg:mb-1 block">Price Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice ?? ""}
                                    onChange={e => {
                                        const newMin = e.target.value;
                                        const newPriceRange = makePriceRange(newMin, filters.maxPrice);
                                        setFilters({ ...filters, minPrice: newMin, priceRange: newPriceRange });
                                    }}
                                    className="border border-gray-300 rounded-lg p-1.5 lg:p-2 w-1/2 focus:outline-none focus:ring-1 focus:ring-dealership-primary text-[11px] lg:text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice ?? ""}
                                    onChange={e => {
                                        const newMax = e.target.value;
                                        const newPriceRange = makePriceRange(filters.minPrice, newMax);
                                        setFilters({ ...filters, maxPrice: newMax, priceRange: newPriceRange });
                                    }}
                                    className="border border-gray-300 rounded-lg p-1.5 lg:p-2 w-1/2 focus:outline-none focus:ring-1 focus:ring-dealership-primary text-[11px] lg:text-sm"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="text-[10px] lg:text-sm font-medium text-gray-700 mb-0.5 lg:mb-1 block">Location</label>
                            <Select
                                value={filters.location || ""}
                                onValueChange={v => setFilters({ ...filters, location: v })}
                            >
                                <SelectTrigger className="w-full h-8 lg:h-10 text-[11px] lg:text-sm">
                                    <SelectValue placeholder="Location" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto bg-white z-[110]">
                                    {dropdowns.locations.map(loc => (
                                        <SelectItem key={loc} value={loc} className="text-[11px] lg:text-sm">{loc}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Badge - only for normal mode */}
                        {filterMode === "normal" && (
                            <div>
                                <label className="text-[10px] lg:text-sm font-medium text-gray-700 mb-0.5 lg:mb-1 block">Badge</label>
                                <Select
                                    value={filters.badge || ""}
                                    onValueChange={v => setFilters({ ...filters, badge: v })}
                                >
                                    <SelectTrigger className="w-full h-8 lg:h-10 text-[11px] lg:text-sm">
                                        <SelectValue placeholder="Badge" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60 overflow-y-auto bg-white z-[110]">
                                        {dropdowns.badges.map(badge => (
                                            <SelectItem key={badge.id} value={badge.id || ""} className="text-[11px] lg:text-sm">
                                                {badge.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Color */}
                        <div>
                            <label className="text-[10px] lg:text-sm font-medium text-gray-700 mb-0.5 lg:mb-1 block">Color</label>
                            <Select
                                value={filters.color || ""}
                                onValueChange={v => setFilters({ ...filters, color: v })}
                            >
                                <SelectTrigger className="w-full h-8 lg:h-10 text-[11px] lg:text-sm">
                                    <SelectValue placeholder="Color" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto bg-white z-[110]">
                                    {dropdowns.colors.map(color => (
                                        <SelectItem key={color} value={color} className="text-[11px] lg:text-sm">{color}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Apply Button */}
                <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 bg-white border-t">
                    <Button
                        onClick={handleApply}
                        className="w-full bg-dealership-primary text-white py-1.5 lg:py-3 flex items-center justify-center gap-2 text-[11px] lg:text-sm h-8 lg:h-auto"
                    >
                        <Search className="w-3 h-3 lg:w-4 lg:h-4" />
                        Apply Filters
                    </Button>
                </div>
            </div>
        </>
    );
};

export default FilterDrawer;
