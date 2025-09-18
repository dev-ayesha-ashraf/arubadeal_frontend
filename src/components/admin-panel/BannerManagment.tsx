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
  name: z.string().min(1, "Name is required"),
  position: z.number().optional(),
});

type BannerFormData = z.infer<typeof bannerSchema>;

interface Banner {
  id: string;
  name: string;
  image_url: string;
  is_display: number;
  details: Record<string, any>;
  position?: number;
}

const fetchBanners = async (): Promise<Banner[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/banner/get_all`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch banners");
  return await response.json();
};

const addBanner = async (formData: FormData): Promise<Banner> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/banner/create`,
    {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
      },
    }
  );
  if (!response.ok) throw new Error("Failed to add banner");
  return await response.json();
};

const updateBanner = async (
  { id, name, position, details, image }: 
  { id: string; name: string; position?: number; details?: any; image?: File | null }
): Promise<Banner> => {
  let response: Response;

  if (image) {
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        name,
        position,
        details: details ?? {},
      })
    );
    formData.append("image", image);

    response = await fetch(
      `${import.meta.env.VITE_API_URL}/banner/update?id=${id}`,
      {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    );
  } else {
    response = await fetch(
      `${import.meta.env.VITE_API_URL}/banner/update?id=${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify({
          name,
          position,
          details: details ?? {},
        }),
      }
    );
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail?.[0]?.msg || "Failed to update banner");
  }

  return await response.json();
};

const deleteBanner = async (id: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/banner/delete?id=${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail?.[0]?.msg || "Failed to delete banner");
  }

  return await response.json();
};

const BannerManagement = () => {
  const queryClient = useQueryClient();
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: fetchBanners,
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const addMutation = useMutation({
    mutationFn: addBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Success", description: "Banner added successfully" });
      setShowDialog(false);
    },
    onError: (error: any) =>
      toast({
        title: "Error",
        description: error.message || "Failed to add banner",
        variant: "destructive",
      }),
  });

const updateMutation = useMutation({
  mutationFn: (banner: {
    id: string;
    name: string;
    position?: number;
    details?: any;
    image?: File | null;
  }) => updateBanner(banner),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["banners"] });
    toast({ title: "Success", description: "Banner updated successfully" });
    setShowDialog(false);
  },
  onError: (error: any) =>
    toast({
      title: "Error",
      description: error.message || "Failed to update banner",
      variant: "destructive",
    }),
});



  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Success", description: "Banner deleted successfully" });
    },
    onError: (error: any) =>
      toast({
        title: "Error",
        description: error.message || "Failed to delete banner",
        variant: "destructive",
      }),
  });

  const handleAddEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();

    try {
      const target = e.currentTarget;
      const name = (target.elements.namedItem("name") as HTMLInputElement).value;
      const positionValue = (target.elements.namedItem("position") as HTMLInputElement).value;
      const position = positionValue ? Number(positionValue) : undefined;

      bannerSchema.parse({ name, position });

if (editingBanner?.id) {
  updateMutation.mutate({
    id: editingBanner.id,
    name,
    position,
    details: editingBanner.details ?? {},
    image: selectedFile, 
  });
}

      else {
        if (!selectedFile || selectedFile.size === 0) {
          throw new Error("Image is required");
        }

        formData.append("name", name);
        if (typeof position !== "undefined") {
          formData.append("position", position.toString());
        }
        formData.append("image", selectedFile);
        formData.append("details", "{}");

        console.log("➕ Adding new banner with data:");
        for (let pair of formData.entries()) {
          console.log(pair[0], pair[1]);
        }

        addMutation.mutate(formData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.errors?.[0]?.message || error.message || "Validation failed",
        variant: "destructive",
      });
    }
  };
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const openAddDialog = () => {
    setEditingBanner(null);
    setSelectedFile(null);
    setShowDialog(true);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setSelectedFile(null);
    setShowDialog(true);
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
          <div key={banner.id} className="bg-white p-4 rounded-lg shadow-md">
            <img
              src={`${import.meta.env.VITE_MEDIA_URL}${banner.image_url}`}
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
                  onClick={() => handleDelete(banner.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
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
                      src={`${import.meta.env.VITE_MEDIA_URL}${editingBanner.image_url}`}
                      alt={editingBanner.name}
                      className="h-24 object-cover rounded"
                    />

                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                  className="w-full p-2 border rounded-md"
                  required={!editingBanner}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Position
                </label>
                <input
                  type="number"
                  name="position"
                  defaultValue={editingBanner?.position || ""}
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
                    setShowDialog(false);
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
