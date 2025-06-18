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
import { z } from "zod";

const bannerSchema = z.object({
  name: z.string().min(1, "Title is required"),
  priority: z.number().optional(),
});

type BannerFormData = z.infer<typeof bannerSchema>;

interface Banner {
  _id: string;
  name: string;
  image: string;
  priority: number;
}

const fetchBanners = async (): Promise<Banner[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/banners/list-banners`,
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
  if (!response.ok) throw new Error("Failed to fetch banners");
  const res = await response.json();
  return res.data;
};

const addBanner = async (formData: FormData): Promise<Banner> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/banners/add-banner`,
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
  if (!response.ok) throw new Error("Failed to add banner");
  const res = await response.json();
  return res.data;
};

const updateBanner = async ({
  _id,
  formData,
}: {
  _id: string;
  formData: FormData;
}): Promise<Banner> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/banners/update-banner/${_id}`,
    {
      method: "PATCH",
      body: formData,
      headers: {
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to update banner");
  const res = await response.json();
  return res.data;
};

const deleteBanner = async (_id: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/banners/delete-banner/${_id}`,
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
  if (!response.ok) throw new Error("Failed to delete banner");
  return await response.json();
};

const BannerManagement = () => {
  const queryClient = useQueryClient();
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: fetchBanners,
  });
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const addMutation = useMutation({
    mutationFn: addBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Success", description: "Banner added successfully" });
      setShowAddEditDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add banner",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Success", description: "Banner updated successfully" });
      setShowAddEditDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update banner",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Success", description: "Banner deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete banner",
        variant: "destructive",
      });
    },
  });

  const handleAddEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    try {
      // Validate the form data
      const name = formData.get("name") as string;
      const priority = formData.get("priority")
        ? Number(formData.get("priority"))
        : undefined;

      bannerSchema.parse({ name, priority });

      // If editing, we need to handle the file differently
      if (editingBanner?._id) {
        // If a new file is selected, add it to formData
        if (selectedFile) {
          formData.set("banner", selectedFile);
        }

        updateMutation.mutate({
          _id: editingBanner._id,
          formData,
        });
      } else {
        // For new banner, ensure we have a file
        if (!selectedFile) {
          throw new Error("Image is required");
        }

        formData.set("banner", selectedFile);
        addMutation.mutate(formData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.errors?.[0]?.message || error.message || "Validation failed",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (_id: string) => {
    deleteMutation.mutate(_id);
  };

  const openAddDialog = () => {
    setEditingBanner(null);
    setSelectedFile(null);
    setShowAddEditDialog(true);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setSelectedFile(null);
    setShowAddEditDialog(true);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banner Management</h1>
        <Button onClick={openAddDialog}>Add New Banner</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div key={banner._id} className="bg-white p-4 rounded-lg shadow-md">
            <img
              src={`${import.meta.env.VITE_MEDIA_URL}/${banner.image}`}
              alt={banner.name}
              className="w-full h-48 object-cover rounded mb-4"
            />
            <div className="flex justify-between items-center">
              <span className="font-medium">{banner.name}</span>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(banner)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(banner._id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showAddEditDialog} onOpenChange={setShowAddEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "Edit Banner" : "Add New Banner"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEdit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  name="name"
                  defaultValue={editingBanner?.name || ""}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                {editingBanner && (
                  <div className="mb-2">
                    <img
                      src={`${import.meta.env.VITE_MEDIA_URL}/${
                        editingBanner.image
                      }`}
                      alt={editingBanner.name}
                      className="h-24 object-cover rounded"
                    />
                  </div>
                )}
                <input
                  type="file"
                  name="banner"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                  required={!editingBanner}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  name="priority"
                  defaultValue={editingBanner?.priority || ""}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  disabled={addMutation.isPending || updateMutation.isPending}
                >
                  {addMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingBanner
                    ? "Save"
                    : "Add"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddEditDialog(false);
                    setEditingBanner(null);
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BannerManagement;
