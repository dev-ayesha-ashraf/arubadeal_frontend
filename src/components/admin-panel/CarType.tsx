import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const typeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logo: z.string().optional(),
  banner: z.string().optional(),
});

type TypeFormData = z.infer<typeof typeSchema>;

interface CarType {
  _id: string;
  name: string;
  logo: string;
  banner?: string;
}

const fetchTypes = async (): Promise<CarType[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/types/list-types`,
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
  if (!response.ok) throw new Error("Failed to fetch car types");
  const res = await response.json();
  return res.data;
};

const CarTypes = () => {
  const [types, setTypes] = useState<CarType[]>([]);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [editingType, setEditingType] = useState<CarType | null>(null);
  const { toast } = useToast();
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string>("");
  const [previewBanner, setPreviewBanner] = useState<string>("");

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["types"],
    queryFn: fetchTypes,
  });

  useEffect(() => {
    if (data) {
      setTypes(data);
    }
  }, [data]);

  const addMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log('Making add type request');
      
      // Set up the request
      const requestOptions = {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${JSON.parse(
            localStorage.getItem("access_token") || ""
          )}`,
        },
      };
      
      console.log('Request options:', {
        method: requestOptions.method,
        headers: requestOptions.headers,
        url: `${import.meta.env.VITE_API_URL}/types/add-type`,
      });
      
      // Make the API request
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/types/add-type`,
        requestOptions
      );

      // Get the response data
      const responseData = await response.json();
      console.log('API Response:', {
        status: response.status,
        ok: response.ok,
        data: responseData
      });

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add car type");
      }

      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["types"] });
      toast({
        title: "Success",
        description: "Car type added successfully",
      });
      setShowAddEditDialog(false);
      setSelectedLogo(null);
      setSelectedBanner(null);
      setPreviewLogo("");
      setPreviewBanner("");
    },
    onError: (error) => {
      console.error('Add mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add type",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      console.log('Making update request for type ID:', id);
      
      // Set up the request
      const requestOptions = {
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${JSON.parse(
            localStorage.getItem("access_token") || ""
          )}`,
        },
      };
      
      console.log('Request options:', {
        method: requestOptions.method,
        headers: requestOptions.headers,
        url: `${import.meta.env.VITE_API_URL}/types/update-type/${id}`,
      });
      
      // Make the API request
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/types/update-type/${id}`,
        requestOptions
      );

      // Get the response data
      const responseData = await response.json();
      console.log('API Response:', {
        status: response.status,
        ok: response.ok,
        data: responseData
      });

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update car type");
      }

      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["types"] });
      toast({
        title: "Success",
        description: "Car type updated successfully",
      });
      setShowAddEditDialog(false);
      setSelectedLogo(null);
      setSelectedBanner(null);
      setPreviewLogo("");
      setPreviewBanner("");
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update type",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/types/delete-type/${id}`,
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete car type");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["types"] });
      toast({
        title: "Success",
        description: "Car type deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete type",
        variant: "destructive",
      });
    },
  });

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedLogo(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedBanner(file);
      setPreviewBanner(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const form = event.target as HTMLFormElement;
      const name = (form.elements.namedItem('name') as HTMLInputElement).value;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      if (editingType) {
        // For existing types: Create a new FormData instance
        const formData = new FormData();
        
        // Add the name and slug fields
        formData.append('name', name);
        formData.append('slug', slug);
        
        // Add logo if selected
        if (selectedLogo) {
          formData.append('logo', selectedLogo);
        }
        
        // Add banner if selected
        if (selectedBanner) {
          formData.append('banner', selectedBanner);
        }
        
        // Debug: Log the form data
        console.log('Update Form Data Contents:');
        for (const [key, value] of formData.entries()) {
          console.log(`${key}: ${value instanceof File ? value.name : value}`);
        }
        
        // Make the API call
        updateMutation.mutate({ id: editingType._id, formData });
      } else {
        // For new types: Create a new FormData instance
        const formData = new FormData();
        
        // Add the name and slug fields
        formData.append('name', name);
        formData.append('slug', slug);
        
        // Logo is required for new types
        if (!selectedLogo) {
          throw new Error("Logo is required for new types");
        }
        formData.append('logo', selectedLogo);
        
        // Add banner if selected
        if (selectedBanner) {
          formData.append('banner', selectedBanner);
        }
        
        // Debug: Log the form data
        console.log('Add Form Data Contents:');
        for (const [key, value] of formData.entries()) {
          console.log(`${key}: ${value instanceof File ? value.name : value}`);
        }
        
        // Make the API call
        addMutation.mutate(formData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit form",
        variant: "destructive",
      });
    }
  };

  const openAddDialog = () => {
    setEditingType(null);
    setSelectedLogo(null);
    setSelectedBanner(null);
    setPreviewLogo("");
    setPreviewBanner("");
    setShowAddEditDialog(true);
  };

  const openEditDialog = (type: CarType) => {
    setEditingType(type);
    setPreviewLogo(`${import.meta.env.VITE_MEDIA_URL}/${type.logo}`);
    if (type.banner) {
      setPreviewBanner(`${import.meta.env.VITE_MEDIA_URL}/${type.banner}`);
    }
    setShowAddEditDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this type?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  if (error)
    return <div>Error loading car types: {(error as Error).message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Car Types</h1>
        <Button onClick={openAddDialog}>Add New Type</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {types.map((type) => (
          <Card key={type._id} className="bg-white rounded-lg shadow-md">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="w-full h-48 flex items-center justify-center overflow-hidden rounded-lg mb-4">
                  <img
                    src={`${import.meta.env.VITE_MEDIA_URL}/${type.logo}`}
                    alt={type.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                {type.banner && (
                  <div className="w-full h-32 flex items-center justify-center overflow-hidden rounded-lg mb-4">
                    <img
                      src={`${import.meta.env.VITE_MEDIA_URL}/${type.banner}`}
                      alt={`${type.name} Banner`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">{type.name}</h3>
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(type)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(type._id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddEditDialog} onOpenChange={setShowAddEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType ? "Edit Car Type" : "Add New Car Type"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingType?.name}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo">Logo Image</Label>
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
              {(previewLogo || editingType?.logo) && (
                <div className="w-full h-32 flex items-center justify-center border rounded-lg overflow-hidden">
                  <img
                    src={previewLogo || `${import.meta.env.VITE_MEDIA_URL}/${editingType?.logo}`}
                    alt="Logo Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner">Banner Image</Label>
              <Input
                id="banner"
                name="banner"
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
              />
              {(previewBanner || editingType?.banner) && (
                <div className="w-full h-32 flex items-center justify-center border rounded-lg overflow-hidden">
                  <img
                    src={previewBanner || `${import.meta.env.VITE_MEDIA_URL}/${editingType?.banner}`}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddEditDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
                {addMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingType
                  ? "Update"
                  : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarTypes;
