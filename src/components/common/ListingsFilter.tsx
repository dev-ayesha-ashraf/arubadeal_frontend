import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DropdownItem {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  label?: string;
  status?: number;
  image?: string;
  [key: string]: any; // Allow any additional properties
}

interface DropdownsData {
  makes: DropdownItem[];
  types: DropdownItem[];
  prices: string[];
  locations: string[];
  models?: string[];
  fieldGroups?: {
    name: string;
    fields: {
      name: string;
      type: string;
      label: string;
      required: boolean;
      options?: any[];
    }[];
  }[];
  customFields?: {
    name: string;
    type: string;
    label: string;
    required: boolean;
    options?: any[];
  }[];
}

interface FilterState {
  make?: string;
  type?: string;
  priceRange?: string;
  location?: string;
  model?: string;
  color?: string;
  [key: string]: any;
}

export const ListingsFilter = () => {
  const navigate = useNavigate();
  const [dropdowns, setDropdowns] = useState<DropdownsData | null>(null);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [colorOptions, setColorOptions] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Initialize filters from URL search params
  const initializeFiltersFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const filters: FilterState = {};

    // Add standard filters
    filters.make = params.get('makeId') || undefined;
    filters.model = params.get('model') || undefined;
    filters.type = params.get('typeSlug') || undefined;
    filters.priceRange = params.get('price') || undefined;
    filters.location = params.get('location') || undefined;
    filters.color = params.get("color") || undefined;

    // Add custom fields from URL
    dropdowns?.customFields?.forEach(field => {
      filters[field.name] = params.get(field.name) || undefined;
    });

    dropdowns?.fieldGroups?.forEach(group => {
      group.fields.forEach(field => {
        filters[field.name] = params.get(field.name) || undefined;
      });
    });

    console.log('Initialized filters from URL:', filters);
    return filters;
  };

  const [filters, setFilters] = useState<FilterState>(initializeFiltersFromURL());

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/cars/list-filters`);
        const data = await response.json();
        if (data.success) {
          setDropdowns(data.data);
          // Initialize model options from the filters endpoint if available
          if (data.data.models && Array.isArray(data.data.models)) {
            setModelOptions(data.data.models);
          }
          setFilters(initializeFiltersFromURL());
        }
      } catch (error) {
        console.error('Error fetching dropdowns:', error);
      }
    };

    fetchDropdowns();
  }, []);

  // Fetch all unique models from existing vehicles
  const fetchAllModelsAndColors = async () => {
    if (modelOptions.length > 0 && colorOptions.length > 0) return;

    setIsLoadingModels(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/cars/list-cars`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        const cars = data.data.filter(car => car.status === 1);

        const uniqueModels = Array.from(
          new Set(cars.filter(car => car.model).map(car => car.model))
        ).sort();
        setModelOptions(uniqueModels);

        // ✅ Color logic
        const uniqueColors = Array.from(
          new Set(cars.filter(car => car.color && car.color.trim()).map(car => car.color.trim()))
        ).sort();
        setColorOptions(uniqueColors);
      }
    } catch (error) {
      console.error("Error fetching models and colors:", error);
    } finally {
      setIsLoadingModels(false);
    }
  };


  // Fetch filtered models when make changes
  useEffect(() => {
    const fetchFilteredModels = async () => {
      if (!filters.make) return;

      setIsLoadingModels(true);
      try {
        console.log(`Fetching models for make ID: ${filters.make}`);

        // Use the cars endpoint as a fallback if the specific endpoint fails
        let models = [];
        let fetchSuccess = false;

        try {
          // First try the specific endpoint for models by make
          const response = await fetch(`${import.meta.env.VITE_API_URL}/cars/models-by-make/${filters.make}`);

          if (response.ok) {
            const data = await response.json();
            console.log('Response from models-by-make endpoint:', data);

            if (data.success && Array.isArray(data.data)) {
              models = data.data;
              fetchSuccess = true;
            }
          } else {
            console.error('API request failed:', response.status, response.statusText);
          }
        } catch (endpointError) {
          console.error('Error fetching from models-by-make endpoint:', endpointError);
        }

        // If the specific endpoint failed, fall back to filtering cars data
        if (!fetchSuccess) {
          console.log('Falling back to cars list for model filtering');
          const response = await fetch(`${import.meta.env.VITE_API_URL}/cars/list-cars`);

          if (response.ok) {
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
              // Filter models based on selected make
              models = Array.from(
                new Set(
                  data.data
                    .filter(car =>
                      car.makeId === filters.make &&
                      car.model &&
                      car.model.trim() !== '' &&
                      car.status === 1
                    )
                    .map(car => car.model)
                )
              );
            }
          }
        }
        const resp2 = await fetch(`${import.meta.env.VITE_API_URL}/cars/list-cars`);
        const d2 = await resp2.json();
        if (d2.success && Array.isArray(d2.data)) {
          const uniqueColors = Array.from(
            new Set(
              d2.data
                .filter(car => car.color && car.color.trim() && car.status === 1)
                .map(car => car.color.trim())
            )
          ).sort();
          setColorOptions(uniqueColors);
        }
        // Sort and set the models
        const sortedModels = [...models].sort();
        console.log('Final models list:', sortedModels);
        setModelOptions(sortedModels);
      } catch (error) {
        console.error('Error in fetchFilteredModels:', error);
        setModelOptions([]);
      } finally {
        setIsLoadingModels(false);
      }
    };


    if (filters.make) {
      fetchFilteredModels();
    } else {
      fetchAllModelsAndColors();
    }

  }, [filters.make]);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();

    // Add standard filters
    if (filters.make) searchParams.append('makeId', filters.make);
    if (filters.model) searchParams.append('model', filters.model);
    if (filters.type) searchParams.append('typeSlug', filters.type);
    if (filters.priceRange) searchParams.append('price', filters.priceRange);
    if (filters.location) searchParams.append('location', filters.location);
    if (filters.color) searchParams.append("color", filters.color);

    // Add custom fields
    dropdowns?.customFields?.forEach(field => {
      if (filters[field.name]) {
        searchParams.append(field.name, filters[field.name]);
      }
    });

    // Add field group fields
    dropdowns?.fieldGroups?.forEach(group => {
      group.fields.forEach(field => {
        if (filters[field.name]) {
          searchParams.append(field.name, filters[field.name]);
        }
      });
    });

    console.log('Search parameters:', Object.fromEntries(searchParams.entries()));
    navigate(`/listings?${searchParams.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters({});
    navigate('/listings');
  };

  const renderField = (field: any, groupName?: string) => {
    const label = groupName ? `${groupName} - ${field.label}` : field.label;

    switch (field.type) {
      case 'select':
        return (
          <div key={field.name}>
            <Label className="block text-sm font-medium mb-2">{label}</Label>
            <Select
              onValueChange={(value) => setFilters(prev => ({ ...prev, [field.name]: value }))}
              value={filters[field.name]}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {field.options?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'text':
      default:
        return (
          <div key={field.name}>
            <Label className="block text-sm font-medium mb-2">{label}</Label>
            <Input
              type="text"
              placeholder={`Enter ${field.label}`}
              value={filters[field.name] || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, [field.name]: e.target.value }))}
            />
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6 flex justify-center mt-[120px] md:mt-0">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="justify-center min-w-[15rem] text-xl font-semibold text-dealership-primary border-2 border-dealership-primary px-6 py-2 hover:bg-dealership-primary hover:text-white transition-all duration-200 shadow-sm hover:shadow-md max-[300px]:min-w-[10rem]"

          >
            Filter
          </Button>


        </DialogTrigger>
        <DialogContent className="w-[90%] sm:w-[90%] md:w-[90%] lg:max-w-3xl max-h-[90vh] overflow-y-auto">

          <DialogHeader>
            <DialogTitle className="text-xl text-dealership-primary">Filters</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear All</Button>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Make</Label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, make: value }))} value={filters.make}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Make" />
                </SelectTrigger>
                <SelectContent className="bg-white w-[44%] max-h-60 overflow-y-auto rounded-2xl shadow-xl ring-1 ring-gray-200 focus:outline-none transition-all duration-200 py-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {dropdowns?.makes?.map(make => (
                    <SelectItem key={make._id} value={make._id} className="text-gray-700 hover:bg-[#EADDCA]
  hover:text-black transition-colors duration-150 cursor-pointer font-medium">{make.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">Model</Label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, model: value }))} value={filters.model}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Select Model"} />
                </SelectTrigger>
                <SelectContent className="bg-white w-[44%] max-h-60 overflow-y-auto rounded-2xl shadow-xl ring-1 ring-gray-200 focus:outline-none transition-all duration-200 py-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {modelOptions.length === 0 ? (
                    <SelectItem value="no-models" disabled className="text-gray-700 hover:bg-[#EADDCA]
  hover:text-black transition-colors duration-150 cursor-pointer font-medium">
                      {isLoadingModels ? "Loading models..." : "No models available"}
                    </SelectItem>
                  ) : (
                    modelOptions.map(model => (
                      <SelectItem key={model} value={model} className="text-gray-700 hover:bg-[#EADDCA]
  hover:text-black transition-colors duration-150 cursor-pointer font-medium">{model}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">Type</Label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))} value={filters.type}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="bg-white w-[44%] max-h-60 overflow-y-auto rounded-2xl shadow-xl ring-1 ring-gray-200 focus:outline-none transition-all duration-200 py-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {dropdowns?.types?.map(type => (
                    <SelectItem key={type._id} value={type.slug} className="text-gray-700 hover:bg-[#EADDCA]
  hover:text-black transition-colors duration-150 cursor-pointer font-medium">{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">Price Range</Label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))} value={filters.priceRange}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Price Range" />
                </SelectTrigger>
                <SelectContent className="bg-white w-[44%] max-h-60 overflow-y-auto rounded-2xl shadow-xl ring-1 ring-gray-200 focus:outline-none transition-all duration-200 py-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {dropdowns?.prices?.map(price => (
                    <SelectItem key={price} value={price.split("-").at(-1)} className="text-gray-700 hover:bg-[#EADDCA]
  hover:text-black transition-colors duration-150 cursor-pointer font-medium">{price}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">Location</Label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))} value={filters.location}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent className="bg-white w-[44%] max-h-60 overflow-y-auto rounded-2xl shadow-xl ring-1 ring-gray-200 focus:outline-none transition-all duration-200 py-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {dropdowns?.locations?.map(location => (
                    <SelectItem key={location} value={location} className="text-gray-700 hover:bg-[#EADDCA]
  hover:text-black transition-colors duration-150 cursor-pointer font-medium">{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Color</Label>
              <Select
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, color: value }))
                }
                value={filters.color}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Color" />
                </SelectTrigger>
                <SelectContent className="bg-white w-[44%] max-h-60 overflow-y-auto rounded-2xl shadow-xl ring-1 ring-gray-200 focus:outline-none transition-all duration-200 py-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {colorOptions.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {dropdowns?.fieldGroups?.map(group => (
              <div key={group.name} className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.fields.map(field => renderField(field, group.name))}
                </div>
              </div>
            ))}

            {dropdowns?.customFields?.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Additional Fields</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dropdowns.customFields.map(field => renderField(field))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={handleSearch} className="w-full bg-dealership-primary">
                <Search className="w-4 h-4 mr-2" /> Search Cars
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
