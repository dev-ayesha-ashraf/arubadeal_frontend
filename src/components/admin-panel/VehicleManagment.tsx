import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useMemo } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Plus, Settings, Edit, Trash2, Trash, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import { useLocalStorage } from "../../hooks/use-local-storage";
import { PropertySection } from "./PropertySection";

const vehicleSchema = z.object({
  price: z.string().min(1, "Price is required"),
  year: z.number().min(1900, "Valid year is required"),
  color: z.string().min(1, "Color is required"),
  seats: z.number().min(1, "Number of seats is required"),
  condition: z.number().min(0, "Condition is required"),
  mileage: z.number().min(0, "Mileage is required"),
  description: z.string().min(1, "Description is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  makeId: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  typeId: z.string().min(1, "Type is required"),
  engineId: z.string().min(1, "Engine is required"),
  transmissionId: z.string().min(1, "Transmission is required"),
  fuelTypeIds: z.array(z.string().nullable()).min(1, "At least one fuel type is required"),
  bagIds: z.array(z.string().nullable()).optional(),
  serialNumber: z.string().optional(),
  features: z.array(
    z.object({
      name: z.string().min(1, "Feature name is required"),
      value: z.string().min(1, "Feature value is required"),
    })
  ).optional(),
  status: z.number().optional(),
  customProperties: z.record(z.string(), z.object({
    name: z.string(),
    type: z.enum(['text', 'number', 'select']),
    value: z.string(),
    required: z.boolean()
  })).optional(),
  forceUpdate: z.boolean().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface Vehicle {
  _id: string;
  title: string;
  price: string;
  year: number;
  color: string;
  seats: number;
  condition: number;
  mileage: number;
  description: string;
  city: string;
  address: string;
  mapLocation: string;
  makeId: string;
  model: string;
  typeId: string;
  engineId: string;
  transmissionId: string;
  fuelTypeIds: string[];
  bagIds: string[];
  features: { name: string; value: string }[];
  images: string[];
  status?: number;
  serialNumber?: string;
  customProperties?: {
    [key: string]: {
      name: string;
      type: 'text' | 'number' | 'select';
      value: string;
      required: boolean;
    }
  };
  _timestamp?: number;
}

interface DropdownData {
  makes: {
    _id: string;
    name: string;
    image: string;
    status: number;
  }[];
  types: {
    _id: string;
    name: string;
    image: string;
    status: number;
  }[];
  fuelTypes: {
    _id: string;
    name: string;
    status: number;
  }[];
  engines: {
    _id: string;
    name: string;
    status: number;
  }[];
  transmissions: {
    _id: string;
    name: string;
    status: number;
  }[];
  badges: {
    _id: string;
    name: string;
    status: number;
  }[];
}

interface VehicleImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

// API functions
const fetchVehicles = async (): Promise<Vehicle[]> => {
  try {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cars/list-cars`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
    }
  );
    if (!response.ok) {
      if (response.status === 401) {
        handleAuthError({ response: { status: 401 } });
        return [];
      }
      throw new Error("Failed to fetch vehicles");
    }
  const res = await response.json();
  return res.data;
  } catch (error) {
    handleAuthError(error);
    return [];
  }
};

const addVehicleInfo = async (
  vehicleData: VehicleFormData
): Promise<Vehicle> => {
  // Get the current highest serial number
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cars/get-highest-serial`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
    }
  );
  
  let nextSerialNumber = "001";
  if (response.ok) {
    const data = await response.json();
    const currentHighest = parseInt(data.highestSerial || "0");
    nextSerialNumber = (currentHighest + 1).toString().padStart(3, "0");
  }

  // Add the serial number to the vehicle data
  const vehicleDataWithSerial = {
    ...vehicleData,
    serialNumber: nextSerialNumber
  };

  const createResponse = await fetch(
    `${import.meta.env.VITE_API_URL}/cars/add-car`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
      body: JSON.stringify(vehicleDataWithSerial),
    }
  );
  if (!createResponse.ok) throw new Error("Failed to add vehicle information");
  const res = await createResponse.json();
  return res.data;
};

const uploadVehicleImages = async ({
  vehicleId,
  image,
  isPrimary,
}: {
  vehicleId: string;
  image: File;
  isPrimary: boolean;
}): Promise<Vehicle> => {
  try {
  const formData = new FormData();
  formData.append("image", image);
  formData.append("isPrimary", isPrimary ? "true" : "false");

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cars/add-car-images/${vehicleId}`,
    {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to upload vehicle image");
  const res = await response.json();
  return res.data;
  } catch (error) {
    handleAuthError(error);
    return {} as Vehicle;
  }
};

const updateVehicle = async ({
  _id,
  vehicleData,
}: {
  _id: string;
  vehicleData: Partial<VehicleFormData>;
}): Promise<Vehicle> => {
  console.log("Updating vehicle with data:", JSON.stringify(vehicleData, null, 2));
  
  // Add a timestamp to force the server to recognize changes
  const dataToSend = {
    ...vehicleData,
    model: vehicleData.model,
    forceUpdate: true // Add this to force detection of changes
  };
  
  console.log("Sending data to server:", JSON.stringify(dataToSend, null, 2));
  
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cars/update-car/${_id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
      body: JSON.stringify(dataToSend),
    }
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Update response error:", errorData);
    throw new Error(errorData?.message || "Failed to update vehicle");
  }
  
  const res = await response.json();
  console.log("Update response:", res);
  return res.data;
};

const deleteVehicle = async (_id: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cars/delete-car/${_id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to delete vehicle");
  return await response.json();
};

const fetchDropdowns = async (): Promise<DropdownData> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cars/list-dropdowns`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch dropdown data");
  const res = await response.json();
  return res.data;
};

// Update the condition mapping object to include vehicle status
const conditionMap = {
  1: "New",
  2: "Used",
};

// Add this status mapping object
const statusMap = {
  0: "Draft",
  1: "Active",
  2: "Inactive",
  3: "Sold"
};

// Add this interface for custom properties
interface CustomProperty {
  _id: string;
  name: string;
  type: 'text' | 'number' | 'select';
  options?: string[]; // For select type
  required: boolean;
  value?: string; // For storing current value
}

// Add these functions for image management
const fetchVehicleImages = async (vehicleId: string): Promise<string[]> => {
  try {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cars/get-car-images/${vehicleId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
    }
  );
    if (!response.ok) {
      if (response.status === 401) {
        handleAuthError({ response: { status: 401 } });
        return [];
      }
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch vehicle images: ${errorText}`);
    }
  const res = await response.json();
  return res.data || [];
  } catch (error) {
    handleAuthError(error);
    return [];
  }
};

const deleteVehicleImage = async (imageId: string): Promise<void> => {
  try {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cars/delete-car-image/${imageId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to delete vehicle image");
  return await response.json();
  } catch (error) {
    handleAuthError(error);
  }
};

const setPrimaryImage = async (vehicleId: string, imageId: string): Promise<void> => {
  try {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cars/set-primary-image/${vehicleId}/${imageId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to set primary image");
  return await response.json();
  } catch (error) {
    handleAuthError(error);
  }
};

// Add this function to handle authentication errors
const handleAuthError = (error: any) => {
  if (error?.response?.status === 401) {
    // Instead of calling directly, clear token and redirect
    localStorage.removeItem("access_token");
    window.location.href = '/login';
    return;
  }
  throw error;
};

// Add this as a separate component outside the VehicleManagement component
interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newProperty: Partial<CustomProperty>;
  setNewProperty: React.Dispatch<React.SetStateAction<Partial<CustomProperty>>>;
  onAddProperty: () => void;
}

const AddPropertyDialog = ({ 
  open, 
  onOpenChange, 
  newProperty, 
  setNewProperty, 
  onAddProperty 
}: AddPropertyDialogProps) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    console.log(newName);
    setNewProperty(prevState => ({
      ...prevState,
      name: newName
    }));
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ transition: 'none' }}>
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Add a new custom property for vehicles. Properties are saved permanently.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Property Name</label>
            <input
              type="text"
              value={newProperty.name || ''}
              onChange={handleNameChange}
              className="w-full p-2 border rounded-md"
              style={{ transition: 'none' }}
              placeholder="Enter property name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Property Type</label>
            <select
              value={newProperty.type || 'text'}
              onChange={(e) =>
                setNewProperty(prev => ({
                  ...prev,
                  type: e.target.value as 'text' | 'number' | 'select'
                }))
              }
              className="w-full p-2 border rounded-md"
              style={{ transition: 'none' }}
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Dropdown Select</option>
            </select>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newProperty.required || false}
                onChange={e =>
                  setNewProperty(prev => ({ ...prev, required: e.target.checked }))
                }
                className="form-checkbox"
              />
              <span className="text-sm">Required Field</span>
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onAddProperty}>
              Add Property
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const VehicleManagement = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchVehicles,
  });

  const { data: dropdowns, isLoading: isLoadingDropdowns } = useQuery({
    queryKey: ["car-dropdowns"],
    queryFn: fetchDropdowns,
  });

  // Filter vehicles based on search query
  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = searchQuery.toLowerCase();
    const makeName = dropdowns?.makes?.find((make) => make._id === vehicle.makeId)?.name || '';
    const typeName = dropdowns?.types?.find((type) => type._id === vehicle.typeId)?.name || '';
    
    return (
      vehicle.title.toLowerCase().includes(searchLower) ||
      makeName.toLowerCase().includes(searchLower) ||
      typeName.toLowerCase().includes(searchLower) ||
      (vehicle.model || '').toLowerCase().includes(searchLower) ||
      (vehicle.serialNumber || '').toLowerCase().includes(searchLower)
    );
  });

  const [selectedMakeId, setSelectedMakeId] = useState<string>("");
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [newVehicleId, setNewVehicleId] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [modelInput, setModelInput] = useState<string>("");
  const { toast } = useToast();

  // Add these state variables to track dropdown visibility
  const [showFuelTypeDropdown, setShowFuelTypeDropdown] = useState(false);
  const [showBadgesDropdown, setShowBadgesDropdown] = useState(false);

  // Add these state variables to track selected items for display
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  // Add these state variables for feature management
  const [features, setFeatures] = useState<{ name: string; value: string }[]>([
    { name: "", value: "" },
    { name: "", value: "" },
  ]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);

  // Add these state variables for tracking upload progress
  const [uploadedImagesCount, setUploadedImagesCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Function to load custom properties from localStorage
  const loadCustomProperties = () => {
    try {
      const storedProps = localStorage.getItem("vehicle-custom-properties");
      return storedProps ? JSON.parse(storedProps) : [];
    } catch (e) {
      console.error("Error loading custom properties:", e);
      return [];
    }
  };

  // Initialize custom properties state
  const [customProperties, setCustomProperties] = useState<CustomProperty[]>(loadCustomProperties());
  const [showAddPropertyDialog, setShowAddPropertyDialog] = useState(false);
  const [newProperty, setNewProperty] = useState<Partial<CustomProperty>>({
    name: '',
    type: 'text',
    required: false
  });

  // Add these state variables for image management
  const [vehicleImages, setVehicleImages] = useState<{ id: string; url: string; isPrimary: boolean }[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Add the editingPropertyOptions state near line 422, after the other state variables
  const [editingPropertyOptions, setEditingPropertyOptions] = useState<CustomProperty | null>(null);

  // Add authentication check on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      //logout();
      return;
    }
  }, [isAuthenticated, logout]);

  // Add useEffect to initialize selected values when editing
  useEffect(() => {
    if (editingVehicle) {
      // Set form values using refs instead of FormData
      const form = document.querySelector('form');
      if (form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach((input) => {
          const name = input.getAttribute('name');
          if (name && name in editingVehicle) {
            if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement || input instanceof HTMLTextAreaElement) {
              input.value = editingVehicle[name as keyof Vehicle]?.toString() || '';
            }
          }
        });
      }

      // Set other state values
      setSelectedFuelTypes(editingVehicle.fuelTypeIds || []);
      setSelectedBadges(editingVehicle.bagIds || []);
      setFeatures(
        editingVehicle.features && editingVehicle.features.length > 0
          ? editingVehicle.features
          : [
              { name: "", value: "" },
              { name: "", value: "" },
            ]
      );
      setModelInput(editingVehicle.model || "");

      // Fetch vehicle images
      setIsLoadingImages(true);
      fetchVehicleImagesMutation.mutate(editingVehicle._id);
    } else {
      setSelectedFuelTypes([]);
      setSelectedBadges([]);
      setFeatures([
        { name: "", value: "" },
        { name: "", value: "" },
      ]);
      setModelInput("");
      setVehicleImages([]);
    }
  }, [editingVehicle]);

  // Watch for completion of all uploads
  useEffect(() => {
    if (
      isUploading &&
      uploadedImagesCount === selectedImages.length &&
      selectedImages.length > 0
    ) {
      // All images have been uploaded
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({
        title: "Success",
        description: "All vehicle images uploaded successfully",
      });
      resetForm();
      setIsUploading(false);
      setUploadedImagesCount(0);
    }
  }, [uploadedImagesCount, selectedImages.length, isUploading]);

  // Mutations
  const addVehicleInfoMutation = useMutation({
    mutationFn: addVehicleInfo,
    onSuccess: (data) => {
      setNewVehicleId(data._id);
      setCurrentStep(2);
      toast({
        title: "Success",
        description: "Vehicle information added. Please upload images now.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add vehicle information",
        variant: "destructive",
      });
    },
  });

  const uploadImagesMutation = useMutation({
    mutationFn: uploadVehicleImages,
    onSuccess: () => {
      if (editingVehicle) {
        fetchVehicleImagesMutation.mutate(editingVehicle._id);
      }
      setUploadedImagesCount((prev) => prev + 1);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: updateVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vehicle",
        variant: "destructive",
      });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vehicle",
        variant: "destructive",
      });
    },
  });

  // Add mutations for image management
  const fetchVehicleImagesMutation = useMutation({
    mutationFn: fetchVehicleImages,
    onSuccess: (data) => {
      const formattedImages = data.map((img: any) => ({
        id: img._id || img.id,
        url: img.image || img,
        isPrimary: img.isPrimary || false
      }));
      setVehicleImages(formattedImages);
      setIsLoadingImages(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch vehicle images",
        variant: "destructive",
      });
      setIsLoadingImages(false);
    },
  });

  const deleteVehicleImageMutation = useMutation({
    mutationFn: deleteVehicleImage,
    onSuccess: () => {
      if (editingVehicle) {
        fetchVehicleImagesMutation.mutate(editingVehicle._id);
      }
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  const setPrimaryImageMutation = useMutation({
    mutationFn: ({ vehicleId, imageId }: { vehicleId: string; imageId: string }) => 
      setPrimaryImage(vehicleId, imageId),
    onSuccess: () => {
      if (editingVehicle) {
        // Fetch updated images after setting primary
        fetchVehicleImagesMutation.mutate(editingVehicle._id);
      }
      toast({
        title: "Success",
        description: "Primary image updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update primary image",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setShowAddEditDialog(false);
    setEditingVehicle(null);
    setCurrentStep(1);
    setNewVehicleId(null);
    setSelectedImages([]);
    setShowFuelTypeDropdown(false);
    setShowBadgesDropdown(false);
    setSelectedFuelTypes([]);
    setSelectedBadges([]);
    setFeatures([
      { name: "", value: "" },
      { name: "", value: "" },
    ]);
    setPrimaryImageIndex(0);
    setModelInput("");
  };

  // Handle checkbox changes
  const handleFuelTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    if (e.target.checked) {
      setSelectedFuelTypes((prev) => [...prev, id]);
    } else {
      setSelectedFuelTypes((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBadgeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    if (e.target.checked) {
      setSelectedBadges((prev) => [...prev, id]);
    } else {
      setSelectedBadges((prev) => prev.filter((item) => item !== id));
    }
  };

  // Add this function to get condition text from value
  const getConditionText = (value: number) => {
    return conditionMap[value] || `Condition ${value}`;
  };

  const addFeatureField = () => {
    setFeatures([...features, { name: "", value: "" }]);
  };

  const updateFeature = (
    index: number,
    field: "name" | "value",
    value: string
  ) => {
    const updatedFeatures = [...features];
    updatedFeatures[index][field] = value;
    setFeatures(updatedFeatures);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      const updatedFeatures = features.filter((_, i) => i !== index);
      setFeatures(updatedFeatures);
    }
  };

  // Add this function to handle adding a new property
  const handleAddProperty = () => {
    if (!newProperty.name) {
      toast({
        title: "Error",
        description: "Property name is required",
        variant: "destructive",
      });
      return;
    }

    // Check if property with same name already exists
    if (customProperties.some(p => p.name.toLowerCase() === newProperty.name.toLowerCase())) {
      toast({
        title: "Error",
        description: "A property with this name already exists",
        variant: "destructive",
      });
      return;
    }

    const property: CustomProperty = {
      _id: Date.now().toString(), // Unique ID based on timestamp
      name: newProperty.name,
      type: newProperty.type || 'text',
      options: newProperty.type === 'select' ? ['Option 1', 'Option 2'] : undefined,
      required: newProperty.required || false
    };

    // Update local storage directly with the new property
    const updatedProperties = [...customProperties, property];
    localStorage.setItem("vehicle-custom-properties", JSON.stringify(updatedProperties));
    setCustomProperties(updatedProperties);
    
    setShowAddPropertyDialog(false);
    setNewProperty({
      name: '',
      type: 'text',
      required: false
    });
    
    toast({
      title: "Success",
      description: "Custom property added successfully",
    });
  };

  // Simplify the handleRemoveProperty function
  const handleRemoveProperty = (propertyId: string) => {
    if (confirm("Are you sure you want to delete this property? This will remove it from all future vehicles.")) {
      const updatedProperties = customProperties.filter(p => p._id !== propertyId);
      localStorage.setItem("vehicle-custom-properties", JSON.stringify(updatedProperties));
      setCustomProperties(updatedProperties);
      
      toast({
        title: "Success",
        description: "Property removed successfully",
      });
    }
  };

  // Add a new function to edit property options for select type
  const handleEditPropertyOptions = (propertyId: string, options: string[]) => {
    setCustomProperties(customProperties.map(p => {
      if (p._id === propertyId) {
        return { ...p, options };
      }
      return p;
    }));
  };

  // Add this function to handle property value changes
  const handlePropertyValueChange = (propertyId: string, value: string) => {
    console.log(`Property value changed: ID=${propertyId}, value=${value}`);
    
    // Update the properties array with the new value
    const updatedProperties = customProperties.map(p => {
      if (p._id === propertyId) {
        return { ...p, value, hasChanged: true };
      }
      return p;
    });
    
    // Save to state
    setCustomProperties(updatedProperties);
    
    // If in edit mode, force a re-render by updating model input
    if (editingVehicle) {
      console.log("Vehicle in edit mode, marking as modified");
      // Mark that customProperties have changed to force update on server
      localStorage.setItem("custom-properties-changed", "true");
    }
  };

  const handleAddVehicleInfo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    
    try {
      // Get make name for title generation
      const selectedMake = dropdowns?.makes.find(make => make._id === formData.get("makeId"));
      const makeName = selectedMake?.name || "";

      // Validate basic required fields
      const basicFields = {
        price: formData.get("price") as string,
        year: parseInt(formData.get("year") as string),
        makeId: formData.get("makeId") as string,
        model: formData.get("model") as string,
        fuelTypeIds: selectedFuelTypes,
        engineId: formData.get("engineId") as string,
      };

      // Check if any basic field is missing
      const missingFields = Object.entries(basicFields)
        .filter(([_, value]) => !value || (Array.isArray(value) && value.length === 0))
        .map(([key]) => key);

      if (missingFields.length > 0) {
        toast({
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      // Check if custom properties have changed
      const customPropertiesChanged = localStorage.getItem("custom-properties-changed") === "true";

      // Extract and format the data
      const vehicleData: VehicleFormData = {
        ...basicFields,
        color: formData.get("color") as string,
        seats: parseInt(formData.get("seats") as string) || 0,
        condition: parseInt(formData.get("condition") as string) || 0,
        mileage: parseInt(formData.get("mileage") as string) || 0,
        description: formData.get("description") as string,
        city: formData.get("city") as string,
        address: formData.get("address") as string,
        typeId: formData.get("typeId") as string,
        transmissionId: formData.get("transmissionId") as string,
        bagIds: selectedBadges,
        features: features.filter(
          (f) => f.name.trim() !== "" && f.value.trim() !== ""
        ),
        status: parseInt(formData.get("status") as string) || 0,
        customProperties: {},
        forceUpdate: customPropertiesChanged // Set the forceUpdate flag when custom properties have changed
      };

      // Add custom properties with their values
      customProperties.forEach(prop => {
        if (prop.value || prop.required) {
          vehicleData.customProperties[prop._id] = {
            name: prop.name,
            type: prop.type,
            value: prop.value || '',
            required: prop.required
          };
        }
      });

      // Validate the data
      vehicleSchema.parse(vehicleData);

      // Add title to the data before sending to server
      const vehicleDataWithTitle = {
        ...vehicleData,
        title: `${makeName} ${vehicleData.model} ${vehicleData.year}`,
      };

      if (editingVehicle) {
        updateVehicleMutation.mutate({
          _id: editingVehicle._id,
          vehicleData: vehicleDataWithTitle,
        });
        
        // Clear the custom properties changed flag after submitting
        localStorage.removeItem("custom-properties-changed");
      } else {
        addVehicleInfoMutation.mutate(vehicleDataWithTitle);
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description:
          error.errors?.[0]?.message ||
          error.message ||
          "Please check your inputs",
        variant: "destructive",
      });
    }
  };

  const handleUploadImages = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newVehicleId) {
      toast({
        title: "Error",
        description: "Vehicle information must be saved first",
        variant: "destructive",
      });
      return;
    }

    if (selectedImages.length === 0) {
      toast({
        title: "Error",
        description: "At least one image is required to publish the vehicle",
        variant: "destructive",
      });
      return;
    }

    // Start the upload process
    setIsUploading(true);
    setUploadedImagesCount(0);

    // Upload each image individually
    selectedImages.forEach((image, index) => {
      uploadImagesMutation.mutate({
        vehicleId: newVehicleId,
        image,
        isPrimary: index === 0, // First image is primary
      });
    });
  };

  const handleDelete = (_id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      deleteVehicleMutation.mutate(_id);
    }
  };

  // Update the form initialization
  const initializeForm = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
      setSelectedFuelTypes(vehicle.fuelTypeIds || []);
      setSelectedBadges(vehicle.bagIds || []);
    setModelInput(vehicle.model || "");

    // Initialize features
    if (vehicle.features && vehicle.features.length > 0) {
      setFeatures(vehicle.features);
    } else {
      setFeatures([
              { name: "", value: "" },
              { name: "", value: "" },
      ]);
    }

    // Initialize custom properties with any saved values
    if (vehicle.customProperties) {
      const updatedProperties = customProperties.map(prop => {
        if (vehicle.customProperties && vehicle.customProperties[prop._id]) {
          return {
            ...prop,
            value: vehicle.customProperties[prop._id].value || ''
          };
        }
        return prop;
      });
      setCustomProperties(updatedProperties);
    }

    setShowAddEditDialog(true);
    setCurrentStep(1);
  };

  // Update the edit button click handler
  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowAddEditDialog(true);
    // Initialize form after a short delay to ensure the dialog is rendered
    setTimeout(() => {
      initializeForm(vehicle);
    }, 100);
  };

  // Add this function to handle image upload in edit mode
  const handleEditModeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingVehicle) return;
    
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setIsUploading(true);
    setUploadedImagesCount(0);
    
    files.forEach((image, index) => {
      uploadImagesMutation.mutate({
        vehicleId: editingVehicle._id,
        image,
        isPrimary: vehicleImages.length === 0 && index === 0, // Only set as primary if no existing images
      });
    });
  };

  // Add a useEffect to handle completion of uploads in edit mode
  useEffect(() => {
    if (isUploading && uploadedImagesCount > 0 && editingVehicle) {
      // Check if all selected images are uploaded
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const fileCount = fileInput?.files?.length || 0;
      
      if (uploadedImagesCount === fileCount) {
        // All images have been uploaded
        fetchVehicleImagesMutation.mutate(editingVehicle._id);
        toast({
          title: "Success",
          description: "All vehicle images uploaded successfully",
        });
        setIsUploading(false);
        setUploadedImagesCount(0);
        
        // Reset the file input
        if (fileInput) {
          fileInput.value = '';
        }
      }
    }
  }, [uploadedImagesCount, isUploading, editingVehicle]);

  const ImageManagementSection = () => {
    if (!editingVehicle) return null;

    // Local state for order
    const [orderedImages, setOrderedImages] = useState<VehicleImage[]>(vehicleImages);

    // Update local state when vehicleImages prop changes
    useEffect(() => {
      setOrderedImages(vehicleImages);
    }, [vehicleImages]);

    const onDragEnd = (result: DropResult) => {
      if (!result.destination) return;

      const items = Array.from(orderedImages);
      const [moved] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, moved);

      // Update local state immediately for smooth UI
      setOrderedImages(items);

      // Send new order to the server
      reorderImagesMutation.mutate({
        vehicleId: editingVehicle._id,
        orderedImageIds: items.map(img => img.id),
      });
    };
    
    return (
      <div className="mt-6">
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-4">Manage Images</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Add New Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleEditModeImageUpload}
            className="w-full p-2 border rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">
            Select multiple images to upload.
          </p>
          {isUploading && (
            <div className="mt-2 text-blue-600">
              Uploading... ({uploadedImagesCount} complete)
            </div>
          )}
        </div>
          </div>
        <h3 className="font-semibold text-lg mb-4">Current Images</h3>
          {isLoadingImages ? (
            <div className="text-center py-4">Loading images...</div>
        ) : orderedImages.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No images available</div>
          ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) => (
                <div
                  className="flex flex-wrap gap-4 p-2"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {orderedImages.map((image, index) => (
                    <Draggable key={image.id} draggableId={image.id} index={index}>
                      {(draggableProvided, snapshot) => (
                        <div
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          {...draggableProvided.dragHandleProps}
                          className={`
                            relative rounded-md border overflow-hidden
                            ${snapshot.isDragging ? 'shadow-lg z-10 scale-3' : 'hover:shadow-md transition-shadow'}
                            transition-transform duration-10
                          `}
                        >
                          <img
                            src={`${import.meta.env.VITE_MEDIA_URL}/${image.url}`}
                            alt={`Vehicle ${index + 1}`}
                            className={`w-32 h-32 object-cover ${
                              image.isPrimary ? 'ring-2 ring-blue-500' : ''
                    }`}
                  />
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 hover:bg-black/40 transition-all">
                           {!image.isPrimary && (
                      <Button
                        size="sm"
                        variant="outline"
                                className="bg-white text-xs h-8 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
                        onClick={() => 
                          setPrimaryImageMutation.mutate({
                            vehicleId: editingVehicle._id,
                                    imageId: image.id,
                          })
                        }
                      >
                                Set Primary
                      </Button>
                            )} 
                    <Button
                      size="sm"
                              variant="destructive"
                              className="text-xs h-8 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity text-white bg-black-500"
                      onClick={() => {
                                if (
                                  confirm(
                                    'Are you sure you want to delete this image?'
                                  )
                                ) {
                          deleteVehicleImageMutation.mutate(image.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                         {image.isPrimary && (
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs text-center py-1">
                      Primary
                    </div>
                          )} 
                </div>
                      )}
                    </Draggable>
              ))}
                  {provided.placeholder}
            </div>
              )}
            </Droppable>
          </DragDropContext>
          )}
      </div>
    );
  };


  // Update the handleMarkAsSold function to preserve existing data
  const handleMarkAsSold = (vehicleId: string) => {
    if (confirm("Are you sure you want to mark this vehicle as sold?")) {
      // Find the vehicle in the vehicles array
      const vehicle = vehicles?.find(v => v._id === vehicleId);
      
      if (!vehicle) {
        toast({
          title: "Error",
          description: "Vehicle not found",
          variant: "destructive",
        });
        return;
      }
      
      // Log the vehicle data to debug
      console.log("Marking vehicle as sold:", vehicle);
      
      // Create update object with all required fields
      const updateData = {
        status: 3, // Sold status
        makeId: vehicle.makeId,
        model: vehicle.model || "", // Ensure model is provided
        year: vehicle.year,
        price: vehicle.price,
        engineId: vehicle.engineId,
        fuelTypeIds: vehicle.fuelTypeIds || [],
        title: vehicle.title,
        // Include minimal required fields based on the schema
        color: vehicle.color || "",
        seats: vehicle.seats || 0,
        condition: vehicle.condition || 0,
        mileage: vehicle.mileage || 0,
        description: vehicle.description || "",
        city: vehicle.city || "",
        address: vehicle.address || "",
        typeId: vehicle.typeId || "",
        transmissionId: vehicle.transmissionId || "",
      };
      
      console.log("Update data:", updateData);
      
      updateVehicleMutation.mutate({
        _id: vehicleId,
        vehicleData: updateData
      });
    }
  };

    // Update the mutation for reordering images
    const reorderImagesMutation = useMutation({
      mutationFn: async ({ vehicleId, orderedImageIds }: { vehicleId: string; orderedImageIds: string[] }) => {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/cars/v1/reorder-images/${vehicleId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JSON.parse(
                localStorage.getItem("access_token") || ""
              )}`,
            },
            body: JSON.stringify({ imageOrder: orderedImageIds }),
          }
        );
        if (!response.ok) {
          if (response.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem("access_token");
            window.location.href = '/login';
            return;
          }
          throw new Error("Failed to reorder images");
        }
        return await response.json();
      },
      onSuccess: () => {
        if (editingVehicle) {
          fetchVehicleImagesMutation.mutate(editingVehicle._id);
        }
        toast({
          title: "Success",
          description: "Image order updated successfully",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to reorder images",
          variant: "destructive",
        });
      },
    });

  if (isLoading || isLoadingDropdowns) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Vehicle List</h2>
          <div className="space-x-4 flex">
            <Button
              onClick={() => {
                setEditingVehicle(null);
                setShowAddEditDialog(true);
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Vehicle
            </Button>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => window.location.href = "/admin/vehicle-properties"}
            >
              <Settings className="mr-2 h-4 w-4" /> Properties
            </Button>
          </div>
        </div>

        {/* Search Box */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, make, model, or serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial #</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Make</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    {searchQuery ? "No vehicles found matching your search." : "No vehicles found. Add a new vehicle to get started."}
                  </td>
                </tr>
              )}
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vehicle.serialNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dropdowns?.makes?.find((make) => make._id === vehicle.makeId)?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dropdowns?.types?.find((type) => type._id === vehicle.typeId)?.name || 'N/A'}
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.model || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">AWG {vehicle.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        vehicle.status === 1
                          ? "bg-green-100 text-green-800"
                          : vehicle.status === 2
                          ? "bg-yellow-100 text-yellow-800"
                          : vehicle.status === 3
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusMap[vehicle.status] || "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-indigo-600 hover:text-indigo-900 border-indigo-200 hover:border-indigo-500"
                        onClick={() => handleEditClick(vehicle)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {vehicle.status !== 3 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-purple-600 hover:text-purple-900 border-purple-200 hover:border-purple-500"
                          onClick={() => handleMarkAsSold(vehicle._id)}
                        >
                          Mark as Sold
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-900 border-red-200 hover:border-red-500"
                        onClick={() => handleDelete(vehicle._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showAddEditDialog} onOpenChange={setShowAddEditDialog}>
          <DialogContent className="max-w-[90vw] w-[800px] h-[90vh] overflow-hidden flex flex-col" style={{transition: 'none'}} aria-describedby="vehicle-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
            </DialogTitle>
              <DialogDescription id="vehicle-dialog-description">
                {editingVehicle ? "Update vehicle details" : "Add a new vehicle to the inventory"}
              </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2">
            {!editingVehicle && (
              <Tabs defaultValue="step1" value={`step${currentStep}`}>
                <TabsList className="mb-4">
                  <TabsTrigger value="step1">
                    Step 1: Vehicle Information
                  </TabsTrigger>
                  <TabsTrigger value="step2" disabled={!newVehicleId}>
                    Step 2: Upload Images
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="step1">
                  <form onSubmit={handleAddVehicleInfo}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                          Basic Information
                        </h3>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Price <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="price"
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Year <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="year"
                            type="number"
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Color
                          </label>
                          <input
                            name="color"
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Seats
                          </label>
                          <input
                            name="seats"
                            type="number"
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Mileage
                          </label>
                          <input
                            name="mileage"
                            type="number"
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>
                        <h3 className="font-semibold text-lg">
                          Location & Details
                        </h3>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            City
                          </label>
                          <input
                            name="city"
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Address
                          </label>
                          <input
                            name="address"
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                          Vehicle Details
                        </h3>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Condition
                          </label>
                          <select
                            name="condition"
                            className="w-full p-2 border rounded-md"
                            required
                          >
                            <option value="">Select Condition</option>
                            <option value="1">New</option>
                            <option value="2">Used</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Make <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="makeId"
                            className="w-full p-2 border rounded-md"
                            required
                          >
                            <option value="">Select Make</option>
                            {dropdowns?.makes.map((make) => (
                              <option key={make._id} value={make._id}>
                                {make.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Model <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="model"
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Type
                          </label>
                          <select
                            name="typeId"
                            className="w-full p-2 border rounded-md"
                            required
                          >
                            <option value="">Select Type</option>
                            {dropdowns?.types.map((type) => (
                              <option key={type._id} value={type._id}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Engine Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="engineId"
                            className="w-full p-2 border rounded-md"
                            required
                          >
                            <option value="">Select Engine</option>
                            {dropdowns?.engines.map((engine) => (
                              <option key={engine._id} value={engine._id}>
                                {engine.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Transmission
                          </label>
                          <select
                            name="transmissionId"
                            className="w-full p-2 border rounded-md"
                            required
                          >
                            <option value="">Select Transmission</option>
                            {dropdowns?.transmissions.map((transmission) => (
                              <option
                                key={transmission._id}
                                value={transmission._id}
                              >
                                {transmission.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="relative">
                          <label className="block text-sm font-medium mb-1">
                            Fuel Types <span className="text-red-500">*</span>
                          </label>
                          <div
                            className="w-full p-2 pl-3 border rounded-md cursor-pointer flex justify-between items-center bg-white"
                            onClick={() =>
                              setShowFuelTypeDropdown(!showFuelTypeDropdown)
                            }
                          >
                            <span>
                              {selectedFuelTypes.length === 0
                                ? "Select fuel types"
                                : `${selectedFuelTypes.length} fuel type(s) selected`}
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </div>

                          {showFuelTypeDropdown && (
                            <div className="absolute z-10 mt-1 w-full border rounded-md p-2 pl-3 max-h-48 overflow-y-auto bg-white shadow-md">
                              {dropdowns?.fuelTypes.map((fuelType) => (
                                <div
                                  key={fuelType._id}
                                  className="flex items-center mb-1 pl-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    id={`fuel-${fuelType._id}`}
                                    checked={selectedFuelTypes.includes(
                                      fuelType._id
                                    )}
                                    onChange={(e) =>
                                      handleFuelTypeChange(e, fuelType._id)
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor={`fuel-${fuelType._id}`}
                                    className="cursor-pointer"
                                  >
                                    {fuelType.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="relative">
                          <label className="block text-sm font-medium mb-1">
                            Badges (select multiple)
                          </label>
                          <div
                            className="w-full p-2 pl-3 border rounded-md cursor-pointer flex justify-between items-center bg-white"
                            onClick={() =>
                              setShowBadgesDropdown(!showBadgesDropdown)
                            }
                          >
                            <span>
                              {selectedBadges.length === 0
                                ? "Select badges"
                                : `${selectedBadges.length} badge(s) selected`}
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </div>

                          {showBadgesDropdown && (
                            <div className="absolute z-10 mt-1 w-full border rounded-md p-2 pl-3 max-h-48 overflow-y-auto bg-white shadow-md">
                              {dropdowns?.badges.map((badge) => (
                                <div
                                  key={badge._id}
                                  className="flex items-center mb-1 pl-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    id={`badge-${badge._id}`}
                                    checked={selectedBadges.includes(badge._id)}
                                    onChange={(e) =>
                                      handleBadgeChange(e, badge._id)
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor={`badge-${badge._id}`}
                                    className="cursor-pointer"
                                  >
                                    {badge.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Description
                          </label>
                          <textarea
                            name="description"
                            className="w-full p-2 border rounded-md"
                            rows={3}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg">Features</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addFeatureField}
                        >
                          Add Feature
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex gap-2 mb-2 items-center"
                          >
                            <input
                              value={feature.name}
                              onChange={(e) =>
                                updateFeature(index, "name", e.target.value)
                              }
                              placeholder="Feature Name"
                              className="w-1/2 p-2 border rounded-md"
                            />
                            <input
                              value={feature.value}
                              onChange={(e) =>
                                updateFeature(index, "value", e.target.value)
                              }
                              placeholder="Feature Value"
                              className="w-1/2 p-2 border rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                        
                        <PropertySection 
                          properties={customProperties}
                          onRemoveProperty={handleRemoveProperty}
                          onAddProperty={() => setShowAddPropertyDialog(true)}
                          onPropertyValueChange={handlePropertyValueChange}
                          onEditOptions={(propertyId) => {
                            const property = customProperties.find(p => p._id === propertyId);
                            if (property) {
                              setEditingPropertyOptions(property);
                            }
                          }}
                        />
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                      <p>Fields marked with <span className="text-red-500">*</span> are required to publish the vehicle.</p>
                      <p>At least one image is required to publish the vehicle.</p>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <Button
                        type="submit"
                        disabled={addVehicleInfoMutation.isPending}
                      >
                        {addVehicleInfoMutation.isPending
                          ? "Saving..."
                          : "Next: Upload Images"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="step2">
                  <form onSubmit={handleUploadImages}>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        Upload Vehicle Images
                      </h3>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Images (select multiple)
                        </label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setSelectedImages(files);
                          }}
                          className="w-full p-2 border rounded-md"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          First image will be set as primary, all others will be
                          secondary.
                        </p>
                      </div>

                      {selectedImages.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">
                            Selected Images:
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {selectedImages.map((file, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index}`}
                                  className={`w-24 h-24 object-cover rounded border-2 ${
                                    index === 0
                                      ? "border-blue-500"
                                      : "border-transparent"
                                  }`}
                                />
                                <div className="absolute top-0 right-0 flex flex-col gap-1">
                                  <button
                                    type="button"
                                    className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                    onClick={() => {
                                      const newImages = selectedImages.filter(
                                        (_, i) => i !== index
                                      );
                                      setSelectedImages(newImages);
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                                {index === 0 && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs text-center py-1">
                                    Primary
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <Button
                        type="submit"
                        disabled={isUploading || selectedImages.length === 0}
                      >
                        {isUploading
                          ? `Uploading... (${uploadedImagesCount}/${selectedImages.length})`
                          : "Complete"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            )}

            {editingVehicle && (
              <form onSubmit={handleAddVehicleInfo}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Basic Information</h3>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="price"
                        defaultValue={editingVehicle.price}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="year"
                        type="number"
                        defaultValue={editingVehicle.year}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Color
                      </label>
                      <input
                        name="color"
                        defaultValue={editingVehicle.color}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Seats
                      </label>
                      <input
                        name="seats"
                        type="number"
                        defaultValue={editingVehicle.seats}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Condition
                      </label>
                      <select
                        name="condition"
                        defaultValue={editingVehicle.condition}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select Condition</option>
                        <option value="1">New</option>
                        <option value="2">Used</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Mileage
                      </label>
                      <input
                        name="mileage"
                        type="number"
                        defaultValue={editingVehicle.mileage}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        defaultValue={editingVehicle.description}
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">
                      Location & Details
                    </h3>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        City
                      </label>
                      <input
                        name="city"
                        defaultValue={editingVehicle.city}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Address
                      </label>
                      <input
                        name="address"
                        defaultValue={editingVehicle.address}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>

                    <h3 className="font-semibold text-lg mt-4">
                      Vehicle Details
                    </h3>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Make <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="makeId"
                        defaultValue={editingVehicle.makeId}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select Make</option>
                        {dropdowns?.makes.map((make) => (
                          <option key={make._id} value={make._id}>
                            {make.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Model <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="model"
                        value={modelInput}
                        onChange={(e) => {
                          setModelInput(e.target.value);
                          if (editingVehicle) {
                            setEditingVehicle({
                              ...editingVehicle,
                              model: e.target.value
                            });
                          }
                        }}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Type
                      </label>
                      <select
                        name="typeId"
                        defaultValue={editingVehicle.typeId}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select Type</option>
                        {dropdowns?.types.map((type) => (
                          <option key={type._id} value={type._id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Engine Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="engineId"
                        defaultValue={editingVehicle.engineId}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select Engine</option>
                        {dropdowns?.engines.map((engine) => (
                          <option key={engine._id} value={engine._id}>
                            {engine.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Transmission
                      </label>
                      <select
                        name="transmissionId"
                        defaultValue={editingVehicle.transmissionId}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select Transmission</option>
                        {dropdowns?.transmissions.map((transmission) => (
                          <option
                            key={transmission._id}
                            value={transmission._id}
                          >
                            {transmission.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium mb-1">
                        Fuel Types <span className="text-red-500">*</span>
                      </label>
                      <div
                        className="w-full p-2 pl-3 border rounded-md cursor-pointer flex justify-between items-center bg-white"
                        onClick={() =>
                          setShowFuelTypeDropdown(!showFuelTypeDropdown)
                        }
                      >
                        <span
                          className={
                            selectedFuelTypes.length === 0
                              ? "text-gray-500"
                              : ""
                          }
                        >
                          {selectedFuelTypes.length === 0
                            ? "Select fuel types"
                            : `${selectedFuelTypes.length} fuel type(s) selected`}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 opacity-50"
                          aria-hidden="true"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>

                      {showFuelTypeDropdown && (
                        <div className="absolute z-10 mt-1 w-full border rounded-md p-2 pl-3 max-h-48 overflow-y-auto bg-white shadow-md">
                          {dropdowns?.fuelTypes.map((fuelType) => (
                            <div
                              key={fuelType._id}
                              className="flex items-center mb-1 pl-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                id={`fuel-${fuelType._id}`}
                                checked={selectedFuelTypes.includes(
                                  fuelType._id
                                )}
                                onChange={(e) =>
                                  handleFuelTypeChange(e, fuelType._id)
                                }
                                className="mr-2"
                              />
                              <label
                                htmlFor={`fuel-${fuelType._id}`}
                                className="cursor-pointer"
                              >
                                {fuelType.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium mb-1">
                        Badges (select multiple)
                      </label>
                      <div
                        className="w-full p-2 pl-3 border rounded-md cursor-pointer flex justify-between items-center bg-white"
                        onClick={() =>
                          setShowBadgesDropdown(!showBadgesDropdown)
                        }
                      >
                              <span>
                          {selectedBadges.length === 0
                            ? "Select badges"
                            : `${selectedBadges.length} badge(s) selected`}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                                className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>

                      {showBadgesDropdown && (
                        <div className="absolute z-10 mt-1 w-full border rounded-md p-2 pl-3 max-h-48 overflow-y-auto bg-white shadow-md">
                          {dropdowns?.badges.map((badge) => (
                            <div
                              key={badge._id}
                              className="flex items-center mb-1 pl-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                id={`badge-${badge._id}`}
                                checked={selectedBadges.includes(badge._id)}
                                onChange={(e) =>
                                  handleBadgeChange(e, badge._id)
                                }
                                className="mr-2"
                              />
                              <label
                                htmlFor={`badge-${badge._id}`}
                                className="cursor-pointer"
                              >
                                {badge.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        defaultValue={editingVehicle.status?.toString() || "0"}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="0">Draft</option>
                        <option value="1">Active</option>
                        <option value="2">Inactive</option>
                        <option value="3">Sold</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">Features</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFeatureField}
                    >
                      Add Feature
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex gap-2 mb-2 items-center">
                        <input
                          value={feature.name}
                          onChange={(e) =>
                            updateFeature(index, "name", e.target.value)
                          }
                          placeholder="Feature Name"
                          className="w-1/2 p-2 border rounded-md"
                        />
                        <input
                          value={feature.value}
                          onChange={(e) =>
                            updateFeature(index, "value", e.target.value)
                          }
                          placeholder="Feature Value"
                          className="w-1/2 p-2 border rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                    <PropertySection 
                      properties={customProperties}
                      onRemoveProperty={handleRemoveProperty}
                      onAddProperty={() => setShowAddPropertyDialog(true)}
                      onPropertyValueChange={handlePropertyValueChange}
                      onEditOptions={(propertyId) => {
                        const property = customProperties.find(p => p._id === propertyId);
                        if (property) {
                          setEditingPropertyOptions(property);
                        }
                      }}
                    />
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  <p>Fields marked with <span className="text-red-500">*</span> are required to publish the vehicle.</p>
                  <p>At least one image is required to publish the vehicle.</p>
                </div>

                <ImageManagementSection />

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="submit"
                    disabled={updateVehicleMutation.isPending}
                  >
                    {updateVehicleMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
        <AddPropertyDialog 
          open={showAddPropertyDialog}
          onOpenChange={setShowAddPropertyDialog}
          newProperty={newProperty}
          setNewProperty={setNewProperty}
          onAddProperty={handleAddProperty}
        />
        {editingPropertyOptions && (
          <PropertyOptionsDialog
            property={editingPropertyOptions}
            onClose={() => setEditingPropertyOptions(null)}
            onSave={handleEditPropertyOptions}
          />
        )}
    </div>
  );
};

export default VehicleManagement;

  // Define the PropertyOptionsDialog component after the AddPropertyDialog component around line 970
  const PropertyOptionsDialog = ({ property, onClose, onSave }) => {
    const [options, setOptions] = useState(property.options || []);
    const [newOption, setNewOption] = useState("");
    const [isDuplicateError, setIsDuplicateError] = useState(false);

    const addOption = () => {
      if (newOption.trim()) {
        // Check for duplicate options
        if (options.includes(newOption.trim())) {
          setIsDuplicateError(true);
          return;
        }
        
        setOptions([...options, newOption.trim()]);
        setNewOption("");
        setIsDuplicateError(false);
      }
    };

    const removeOption = (index: number) => {
      setOptions(options.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addOption();
      }
    };

    const onDragEnd = (result: DropResult) => {
      // Dropped outside the list
      if (!result.destination) return;
      
      const reorderedOptions = [...options];
      const [movedItem] = reorderedOptions.splice(result.source.index, 1);
      reorderedOptions.splice(result.destination.index, 0, movedItem);
      
      setOptions(reorderedOptions);
    };

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md" aria-describedby="options-dialog-description" style={{transition: 'none'}}>
          <DialogHeader>
            <DialogTitle>Edit Options for {property.name}</DialogTitle>
            <DialogDescription id="options-dialog-description">
              Add, edit, or remove dropdown options for this property. Drag to reorder.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newOption}
                onChange={(e) => {
                  setNewOption(e.target.value);
                  setIsDuplicateError(false);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Add new option"
                className={`flex-1 p-2 border rounded-md ${isDuplicateError ? 'border-red-500' : ''}`}
                style={{transition: 'none'}}
              />
              <Button onClick={addOption} style={{transition: 'none'}}>Add</Button>
            </div>
            {isDuplicateError && (
              <p className="text-red-500 text-sm mt-1">This option already exists</p>
            )}
            
            <div className="max-h-[300px] overflow-y-auto border rounded-md p-2">
              {options.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No options added yet</p>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="options-list">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {options.map((option, index) => (
                          <Draggable key={`${option}-${index}`} draggableId={`${option}-${index}`} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center gap-2 bg-white border rounded-md p-2 group hover:border-gray-400"
                              >
                                <div className="flex-shrink-0 text-gray-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="21" y1="10" x2="3" y2="10"></line>
                                    <line x1="21" y1="6" x2="3" y2="6"></line>
                                    <line x1="21" y1="14" x2="3" y2="14"></line>
                                    <line x1="21" y1="18" x2="3" y2="18"></line>
                                  </svg>
                                </div>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...options];
                                    newOptions[index] = e.target.value;
                                    setOptions(newOptions);
                                  }}
                                  className="flex-1 p-1 border-none focus:ring-1 focus:ring-blue-500 rounded-md"
                                  style={{transition: 'none'}}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(index)}
                                  className="text-red-500 opacity-0 group-hover:opacity-100"
                                  style={{transition: 'none'}}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={onClose} style={{transition: 'none'}}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  onSave(property._id, options);
                  onClose();
                }}
                style={{transition: 'none'}}
                disabled={options.length === 0}
              >
                Save Options
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
