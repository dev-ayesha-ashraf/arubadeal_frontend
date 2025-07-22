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
  _id: string;
  name: string;
  image: string;
}

const fetchMakes = async (): Promise<Make[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/makes/list-makes`,
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
  if (!response.ok) throw new Error("Failed to fetch makes");
  const res = await response.json();
  return res.data;
};

const addMake = async (formData: FormData): Promise<Make> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/makes/add-make`,
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
  if (!response.ok) throw new Error("Failed to add make");
  const res = await response.json();
  return res.data;
};

const updateMake = async ({
  _id,
  formData,
}: {
  _id: string;
  formData: FormData;
}): Promise<Make> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/makes/update-make/${_id}`,
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
  if (!response.ok) throw new Error("Failed to update make");
  const res = await response.json();
  return res.data;
};

const deleteMake = async (_id: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/makes/delete-make/${_id}`,
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
    onError: (error) => {
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
    onError: (error) => {
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
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete car make",
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

      makeSchema.parse({ name });

      // If editing, we need to handle the file differently
      if (editingMake?._id) {
        // If a new file is selected, add it to formData
        if (selectedFile) {
          formData.set("logo", selectedFile);
        }

        updateMutation.mutate({
          _id: editingMake._id,
          formData,
        });
      } else {
        // For new make, ensure we have a file
        if (!selectedFile) {
          throw new Error("Image is required");
        }

        formData.set("logo", selectedFile);
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
          <Card key={make._id} className="bg-white p-4 rounded-lg shadow-md">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="w-24 h-24 flex items-center justify-center overflow-hidden mb-3">
                <img
                  src={`${import.meta.env.VITE_MEDIA_URL}/${make.image}`}
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
                  onClick={() => handleDelete(make._id)}
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
                      src={`${import.meta.env.VITE_MEDIA_URL}/${
                        editingMake.image
                      }`}
                      alt={editingMake.name}
                      className="h-24 object-cover rounded"
                    />
                  </div>
                )}
                <input
                  type="file"
                  name="logo"
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
