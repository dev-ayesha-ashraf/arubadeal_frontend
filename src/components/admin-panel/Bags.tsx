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

// Define Zod schema for bag validation
const bagSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type BagFormData = z.infer<typeof bagSchema>;

interface Bag {
  _id: string;
  name: string;
}

// API functions
const fetchBags = async (): Promise<Bag[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/bags/list-bags`,
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
    throw new Error(`Failed to fetch bags: ${response.status}`);
  }
  const res = await response.json();
  return res.data;
};

const createBag = async (data: BagFormData): Promise<Bag> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/bags/add-bag`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create bag: ${response.status}`);
  }
  const res = await response.json();
  return res.data;
};

const updateBag = async ({
  _id,
  data,
}: {
  _id: string;
  data: BagFormData;
}): Promise<Bag> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/bags/update-bag/${_id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update bag: ${response.status}`);
  }
  const res = await response.json();
  return res.data;
};

const deleteBag = async (_id: string): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/bags/delete-bag/${_id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete bag: ${response.status}`);
  }
  const res = await response.json();
  return res.data;
};

const BagsManagement = () => {
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bagToDelete, setBagToDelete] = useState<string | null>(null);
  const [editingBag, setEditingBag] = useState<Bag | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // React Query hooks
  const { data: bags = [], isLoading } = useQuery({
    queryKey: ["bags"],
    queryFn: fetchBags,
  });

  const createMutation = useMutation({
    mutationFn: createBag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bags"] });
      toast({
        title: "Success",
        description: "Bag added successfully",
      });
      setShowAddEditDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add bag",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateBag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bags"] });
      toast({
        title: "Success",
        description: "Bag updated successfully",
      });
      setShowAddEditDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update bag",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bags"] });
      toast({
        title: "Success",
        description: "Bag deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete bag",
        variant: "destructive",
      });
    },
  });

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BagFormData>({
    resolver: zodResolver(bagSchema),
    defaultValues: {
      name: editingBag?.name || "",
    },
  });

  const onSubmit = (data: BagFormData) => {
    if (editingBag?._id) {
      updateMutation.mutate({ _id: editingBag._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (_id: string) => {
    setBagToDelete(_id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (bagToDelete) {
      deleteMutation.mutate(bagToDelete);
      setShowDeleteDialog(false);
      setBagToDelete(null);
    }
  };

  const openAddDialog = () => {
    setEditingBag(null);
    reset({ name: "" });
    setShowAddEditDialog(true);
  };

  const openEditDialog = (bag: Bag) => {
    setEditingBag(bag);
    reset({ name: bag.name });
    setShowAddEditDialog(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bag Management</h1>
        <Button onClick={openAddDialog}>Add New Bag</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading bags...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bags.map((bag) => (
            <div key={bag._id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">{bag.name}</span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(bag)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(bag._id)}
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
            <DialogTitle>{editingBag ? "Edit Bag" : "Add New Bag"}</DialogTitle>
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
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingBag
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
        description="Are you sure you want to delete this bag? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        destructive={true}
      />
    </div>
  );
};

export default BagsManagement;
