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

const badgeSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type BadgeFormData = z.infer<typeof badgeSchema>;

interface Badge {
  id: string;
  name: string;
}

const fetchBadges = async (): Promise<Badge[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/badge/get_all`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch badges: ${response.status}`);
  }
  return await response.json();
};

const createBadge = async (data: BadgeFormData): Promise<Badge> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/badge/create?name=${encodeURIComponent(
      data.name
    )}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create badge: ${response.status}`);
  }
  return await response.json();
};

const updateBadge = async ({
  id,
  data,
}: {
  id: string;
  data: BadgeFormData;
}): Promise<Badge> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/badge/update?id=${encodeURIComponent(
      id
    )}&name=${encodeURIComponent(data.name)}`,
    {
      method: "PUT",
       headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update badge: ${response.status}`);
  }
  return await response.json();
};

const deleteBadge = async (id: string): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/badge/delete?id=${encodeURIComponent(
      id
    )}`,
    {
      method: "DELETE",
     headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete badge: ${response.status}`);
  }
  return await response.json();
};

const BadgesManagement = () => {
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState<string | null>(null);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: badges = [], isLoading } = useQuery({
    queryKey: ["badges"],
    queryFn: fetchBadges,
  });

  const createMutation = useMutation({
    mutationFn: createBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast({
        title: "Success",
        description: "Badge added successfully",
      });
      setShowAddEditDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add badge",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast({
        title: "Success",
        description: "Badge updated successfully",
      });
      setShowAddEditDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update badge",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast({
        title: "Success",
        description: "Badge deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete badge",
        variant: "destructive",
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BadgeFormData>({
    resolver: zodResolver(badgeSchema),
    defaultValues: {
      name: editingBadge?.name || "",
    },
  });

  const onSubmit = (data: BadgeFormData) => {
    if (editingBadge?.id) {
      updateMutation.mutate({ id: editingBadge.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    setBadgeToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (badgeToDelete) {
      deleteMutation.mutate(badgeToDelete);
      setShowDeleteDialog(false);
      setBadgeToDelete(null);
    }
  };

  const openAddDialog = () => {
    setEditingBadge(null);
    reset({ name: "" });
    setShowAddEditDialog(true);
  };

  const openEditDialog = (badge: Badge) => {
    setEditingBadge(badge);
    reset({ name: badge.name });
    setShowAddEditDialog(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Badge Management</h1>
        <Button onClick={openAddDialog}>Add New Badge</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading badges...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {badges.map((badge) => (
            <div key={badge.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">{badge.name}</span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(badge)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(badge.id)}
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
              {editingBadge ? "Edit Badge" : "Add New Badge"}
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
                    : editingBadge
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
        description="Are you sure you want to delete this badge? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        destructive={true}
      />
    </div>
  );
};

export default BadgesManagement;
