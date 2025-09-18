import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const makeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
});

type MakeFormData = z.infer<typeof makeSchema>;

interface Make {
  id: string;
  name: string;
  image_url: string;
}

const fetchMakes = async (): Promise<Make[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/make/get_all`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch makes");
  return await response.json();
};

const addMake = async (formData: FormData): Promise<Make> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/make/create`,
    {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
      },
    }
  );
  if (!response.ok) throw new Error("Failed to add make");
  return await response.json();
};

const updateMake = async ({
  id,
  formData,
}: {
  id: string;
  formData: FormData;
}): Promise<Make> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/make/update?id=${id}`,
    {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
      },
    }
  );
  if (!response.ok) throw new Error("Failed to update make");
  return await response.json();
};

const deleteMake = async (id: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/make/delete?id=${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
      },
    }
  );
  if (!response.ok) throw new Error("Failed to delete make");
  return await response.json();
};

const CarMake = () => {
  const queryClient = useQueryClient();
  const { data: makes = [], isLoading } = useQuery({
    queryKey: ["makes"],
    queryFn: fetchMakes,
  });
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [editingMake, setEditingMake] = useState<Make | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const addMutation = useMutation({
    mutationFn: addMake,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["makes"] });
      toast({ title: "Success", description: "Car Make added successfully" });
      setShowAddEditDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add car make",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateMake,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["makes"] });
      toast({ title: "Success", description: "Car Make updated successfully" });
      setShowAddEditDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update car make",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMake,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["makes"] });
      toast({ title: "Success", description: "Car Make deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete car make",
        variant: "destructive",
      });
    },
  });

 const handleAddEdit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const rawForm = new FormData(e.currentTarget);
  const formData = new FormData();

  try {
    const name = rawForm.get("name") as string;
    makeSchema.parse({ name });

    formData.append("name", name);

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    if (editingMake?.id) {
      updateMutation.mutate({
        id: editingMake.id,
        formData,
      });
    } else {
      if (!selectedFile) {
        throw new Error("Image is required");
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
    setEditingMake(null);
    setSelectedFile(null);
    setShowAddEditDialog(true);
  };

  const openEditDialog = (make: Make) => {
    setEditingMake(make);
    setSelectedFile(null);
    setShowAddEditDialog(true);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Car Makes</h1>
        <Button onClick={openAddDialog}>Add New Make</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {makes.map((make) => (
          <Card key={make.id} className="bg-white p-4 rounded-lg shadow-md">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="w-24 h-24 flex items-center justify-center overflow-hidden mb-3">
                <img
                  src={`${import.meta.env.VITE_MEDIA_URL}${make.image_url}`}
                  alt={make.name}
                  className="max-w-full max-h-full object-contain"
                />


              </div>
              <div>
                <h3 className="font-medium text-lg">{make.name}</h3>
              </div>
            </CardContent>
            <div className="flex justify-center items-center">
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(make)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(make.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showAddEditDialog} onOpenChange={setShowAddEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMake ? "Edit Car Make" : "Add New Car Make"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEdit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  name="name"
                  defaultValue={editingMake?.name || ""}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                {editingMake && (
                  <div className="mb-2">
                    <img
                      src={`${import.meta.env.VITE_MEDIA_URL}${editingMake.image_url}`}
                      alt={editingMake.name}
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
                    if (file) {
                      setSelectedFile(file);
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                  required={!editingMake}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  disabled={addMutation.isPending || updateMutation.isPending}
                >
                  {addMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingMake
                      ? "Save"
                      : "Add"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddEditDialog(false);
                    setEditingMake(null);
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

export default CarMake;
