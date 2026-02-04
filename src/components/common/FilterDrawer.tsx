import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Search, X, ChevronUp } from "lucide-react";
import { Drawer } from "vaul";

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
    const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== "").length;

    const handleClearFilters = () => {
        setFilters({});
        onApply({});
    };

    const handleApply = () => {
        onApply();
        if (window.innerWidth < 1024) {
            onToggle();
        }
    };

    const useNameAsValue = filterMode === "global" || filterMode === "auction";

    const FilterFields = ({ isMobile = false }) => (
        <div className={`grid ${isMobile ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-3`}>
            {/* Make */}
            <div>
                <label className="text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1 block">Make</label>
                <Select
                    value={filters.make || ""}
                    onValueChange={v => setFilters({ ...filters, make: v, model: undefined })}
                >
                    <SelectTrigger className="w-full h-10 text-sm lg:text-sm">
                        <SelectValue placeholder="Select Make" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto bg-white z-[110]">
                        {dropdowns.makes.map(make => (
                            <SelectItem
                                key={make.id}
                                value={useNameAsValue ? (make.name || "") : (make.id || "")}
                                className="text-sm lg:text-sm"
                            >
                                {make.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Model */}
            <div>
                <label className="text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1 block">Model</label>
                <Select
                    value={filters.model || ""}
                    onValueChange={v => setFilters({ ...filters, model: v })}
                >
                    <SelectTrigger className="w-full h-10 text-sm lg:text-sm">
                        <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto bg-white z-[110]">
                        {dropdowns.models?.map(model => (
                            <SelectItem key={model} value={model} className="text-sm lg:text-sm">{model}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Type */}
            <div>
                <label className="text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1 block">Body Type</label>
                <Select
                    value={filters.type || ""}
                    onValueChange={v => setFilters({ ...filters, type: v })}
                >
                    <SelectTrigger className="w-full h-10 text-sm lg:text-sm">
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto bg-white z-[110]">
                        {dropdowns.types.map(type => (
                            <SelectItem
                                key={type.id}
                                value={useNameAsValue ? (type.name || "") : (type.id || "")}
                                className="text-sm lg:text-sm"
                            >
                                {type.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Fuel Type */}
            <div>
                <label className="text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1 block">Fuel Type</label>
                <Select
                    value={filters.fuelType || ""}
                    onValueChange={v => setFilters({ ...filters, fuelType: v })}
                >
                    <SelectTrigger className="w-full h-10 text-sm lg:text-sm">
                        <SelectValue placeholder="Select Fuel Type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto bg-white z-[110]">
                        {dropdowns.fuelTypes.map(fuelType => (
                            <SelectItem
                                key={fuelType.id}
                                value={useNameAsValue ? (fuelType.name || "") : (fuelType.id || "")}
                                className="text-sm lg:text-sm"
                            >
                                {fuelType.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Price Range */}
            <div className={isMobile ? "col-span-1 sm:col-span-2" : ""}>
                <label className="text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1 block">Price Range</label>
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
                        className="border border-gray-300 rounded-lg p-2 w-1/2 focus:outline-none focus:ring-1 focus:ring-dealership-primary text-sm lg:text-sm"
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
                        className="border border-gray-300 rounded-lg p-2 w-1/2 focus:outline-none focus:ring-1 focus:ring-dealership-primary text-sm lg:text-sm"
                    />
                </div>
            </div>

            {/* Location */}
            <div>
                <label className="text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1 block">Location</label>
                <Select
                    value={filters.location || ""}
                    onValueChange={v => setFilters({ ...filters, location: v })}
                >
                    <SelectTrigger className="w-full h-10 text-sm lg:text-sm">
                        <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto bg-white z-[110]">
                        {dropdowns.locations.map(loc => (
                            <SelectItem key={loc} value={loc} className="text-sm lg:text-sm">{loc}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Badge - only for normal mode */}
            {filterMode === "normal" && (
                <div>
                    <label className="text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1 block">Badge</label>
                    <Select
                        value={filters.badge || ""}
                        onValueChange={v => setFilters({ ...filters, badge: v })}
                    >
                        <SelectTrigger className="w-full h-10 text-sm lg:text-sm">
                            <SelectValue placeholder="Badge" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto bg-white z-[110]">
                            {dropdowns.badges.map(badge => (
                                <SelectItem key={badge.id} value={badge.id || ""} className="text-sm lg:text-sm">
                                    {badge.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Color */}
            <div>
                <label className="text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-1 block">Color</label>
                <Select
                    value={filters.color || ""}
                    onValueChange={v => setFilters({ ...filters, color: v })}
                >
                    <SelectTrigger className="w-full h-10 text-sm lg:text-sm">
                        <SelectValue placeholder="Color" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto bg-white z-[110]">
                        {dropdowns.colors.map(color => (
                            <SelectItem key={color} value={color} className="text-sm lg:text-sm">{color}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );

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

            {/* Desktop Sidebar */}
            <div
                className={`hidden lg:block fixed bg-white shadow-2xl z-[100] transition-all duration-300 ease-in-out border-gray-200 
                    top-0 right-0 h-full w-[320px] border-l
                    ${isOpen ? "translate-x-0 visible opacity-100" : "translate-x-full invisible opacity-0"}
                `}
            >
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-dealership-primary" />
                        Filter Cars
                    </h2>
                    <div className="flex items-center gap-2">
                        {activeFilterCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1 text-xs h-9"
                            >
                                <X className="w-3 h-3" />
                                Clear
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggle}
                            className="hover:bg-gray-100 h-9"
                        >
                            <ChevronUp className={`w-5 h-5 transition-transform rotate-90`} />
                        </Button>
                    </div>
                </div>

                <div className="p-4 overflow-y-auto h-[calc(100%-140px)]">
                    <FilterFields />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
                    <Button
                        onClick={handleApply}
                        className="w-full bg-dealership-primary text-white py-3 flex items-center justify-center gap-2 text-sm"
                    >
                        <Search className="w-4 h-4" />
                        Apply Filters
                    </Button>
                </div>
            </div>

            {/* Mobile Bottom Sheet Drawer */}
            <Drawer.Root open={isOpen && window.innerWidth < 1024} onOpenChange={(open) => !open && onToggle()} shouldScaleBackground>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
                    <Drawer.Content className="bg-white flex flex-col rounded-t-[20px] h-auto max-h-[85%] fixed bottom-0 left-0 right-0 z-[101] outline-none">
                        <div className="p-4 bg-white rounded-t-[20px] flex-1 overflow-y-auto pb-24">
                            <div className="mx-auto w-12 h-1 flex-shrink-0 rounded-full bg-gray-300 mb-4" />
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-dealership-primary" />
                                    Filter Cars
                                </h2>
                                {activeFilterCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="text-red-500 hover:text-red-600 font-semibold h-8 text-xs"
                                    >
                                        Clear All
                                    </Button>
                                )}
                            </div>

                            <FilterFields isMobile={true} />
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100 z-[102] flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                            <Button
                                onClick={handleApply}
                                className="flex-1 bg-dealership-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-dealership-primary/20 active:scale-95 transition-transform"
                            >
                                <Search className="w-4 h-4" />
                                Apply {activeFilterCount > 0 ? `(${activeFilterCount})` : ""} Filters
                            </Button>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </>
    );
};

export default FilterDrawer;
