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

const transmissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type TransmissionFormData = z.infer<typeof transmissionSchema>;

interface Transmission {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const fetchTransmissions = async (): Promise<Transmission[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/transmission/get_all`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch transmissions: ${response.status}`);
  }
  return response.json();
};

const createTransmission = async (
  data: TransmissionFormData
): Promise<string> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/transmission/create?name=${encodeURIComponent(
      data.name
    )}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create transmission: ${response.status}`);
  }
  return response.json();
};

const updateTransmission = async ({
  id,
  data,
}: {
  id: string;
  data: TransmissionFormData;
}): Promise<string> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/transmission/update?id=${id}&name=${encodeURIComponent(
      data.name
    )}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update transmission: ${response.status}`);
  }
  return response.json();
};

const deleteTransmission = async (id: string): Promise<string> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/transmission/delete?id=${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete transmission: ${response.status}`);
  }
  return response.json();
};

const TransmissionsManagement = () => {
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [transmissionToDelete, setTransmissionToDelete] = useState<string | null>(null);
  const [editingTransmission, setEditingTransmission] =
    useState<Transmission | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transmissions = [], isLoading } = useQuery({
    queryKey: ["transmissions"],
    queryFn: fetchTransmissions,
  });

  const createMutation = useMutation({
    mutationFn: createTransmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transmissions"] });
      toast({ title: "Success", description: "Transmission added successfully" });
      setShowAddEditDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add transmission",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTransmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transmissions"] });
      toast({ title: "Success", description: "Transmission updated successfully" });
      setShowAddEditDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update transmission",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transmissions"] });
      toast({ title: "Success", description: "Transmission deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete transmission",
        variant: "destructive",
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransmissionFormData>({
    resolver: zodResolver(transmissionSchema),
    defaultValues: { name: editingTransmission?.name || "" },
  });

  const onSubmit = (data: TransmissionFormData) => {
    if (editingTransmission?.id) {
      updateMutation.mutate({ id: editingTransmission.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    setTransmissionToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (transmissionToDelete) {
      deleteMutation.mutate(transmissionToDelete);
      setShowDeleteDialog(false);
      setTransmissionToDelete(null);
    }
  };

  const openAddDialog = () => {
    setEditingTransmission(null);
    reset({ name: "" });
    setShowAddEditDialog(true);
  };

  const openEditDialog = (transmission: Transmission) => {
    setEditingTransmission(transmission);
    reset({ name: transmission.name });
    setShowAddEditDialog(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transmission Management</h1>
        <Button onClick={openAddDialog}>Add New Transmission</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading transmissions...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {transmissions.map((transmission) => (
            <div
              key={transmission.id}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{transmission.name}</span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(transmission)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(transmission.id)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={showAddEditDialog} onOpenChange={setShowAddEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransmission ? "Edit Transmission" : "Add New Transmission"}
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
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingTransmission
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

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Confirm Deletion"
        description="Are you sure you want to delete this transmission? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        destructive={true}
      />
    </div>
  );
};

export default TransmissionsManagement;
