import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";

const fuelTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FuelTypeFormData = z.infer<typeof fuelTypeSchema>;

interface FuelType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const fetchFuelTypes = async (): Promise<FuelType[]> => {
  const response = await fetch(`${API_URL}/fueltype/get_all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch FuelTypes: ${response.status}`);
  }
  return response.json();
};

const createFuelType = async (data: FuelTypeFormData): Promise<FuelType> => {
  const params = new URLSearchParams({ name: data.name });
  const response = await fetch(`${API_URL}/fueltype/create?${params}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to create fuel-type: ${response.status}`);
  }
  return response.json();
};
const updateFuelType = async ({
  id,
  data,
}: {
  id: string;
  data: FuelTypeFormData;
}): Promise<FuelType> => {
  const params = new URLSearchParams({ id, name: data.name });
  const response = await fetch(`${API_URL}/fueltype/update?${params}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to update fuel-type: ${response.status}`);
  }
  return response.json();
};
const deleteFuelType = async (id: string): Promise<void> => {
  const params = new URLSearchParams({ id });
  const response = await fetch(`${API_URL}/fueltype/delete?${params}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete fuel-type: ${response.status}`);
  }
  return response.json();
};

const FuelTypesManagement = () => {
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fuelTypeToDelete, setFuelTypeToDelete] = useState<string | null>(null);
  const [editingFuelType, setEditingFuelType] = useState<FuelType | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fuelTypes = [], isLoading } = useQuery({
    queryKey: ["fuelTypes"],
    queryFn: fetchFuelTypes,
  });

  const createMutation = useMutation({
    mutationFn: createFuelType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuelTypes"] });
      toast({ title: "Success", description: "FuelType added successfully" });
      setShowAddEditDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add fuelType",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateFuelType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuelTypes"] });
      toast({ title: "Success", description: "Fuel Type updated successfully" });
      setShowAddEditDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update fuel Type",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFuelType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuelTypes"] });
      toast({ title: "Success", description: "Fuel Type deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete Fuel Type",
        variant: "destructive",
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FuelTypeFormData>({
    resolver: zodResolver(fuelTypeSchema),
    defaultValues: {
      name: editingFuelType?.name || "",
    },
  });

  const onSubmit = (data: FuelTypeFormData) => {
    if (editingFuelType?.id) {
      updateMutation.mutate({ id: editingFuelType.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    setFuelTypeToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (fuelTypeToDelete) {
      deleteMutation.mutate(fuelTypeToDelete);
      setShowDeleteDialog(false);
      setFuelTypeToDelete(null);
    }
  };

  const openAddDialog = () => {
    setEditingFuelType(null);
    reset({ name: "" });
    setShowAddEditDialog(true);
  };

  const openEditDialog = (fuelType: FuelType) => {
    setEditingFuelType(fuelType);
    reset({ name: fuelType.name });
    setShowAddEditDialog(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fuel Type Management</h1>
        <Button onClick={openAddDialog}>Add New Fuel Type</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading fuel Types...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fuelTypes.map((fuelType) => (
            <div
              key={fuelType.id}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{fuelType.name}</span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(fuelType)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(fuelType.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAddEditDialog} onOpenChange={setShowAddEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFuelType ? "Edit Fuel Type" : "Add New Fuel Type"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  {...register("name")}
                  className="w-full p-2 border rounded-md"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingFuelType
                    ? "Save"
                    : "Add"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddEditDialog(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Confirm Deletion"
        description="Are you sure you want to delete this Fuel Type? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        destructive={true}
      />
    </div>
  );
};

export default FuelTypesManagement;
