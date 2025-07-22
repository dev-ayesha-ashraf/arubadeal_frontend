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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const modelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  makeId: z.string().min(1, "Make is required"),
});

type ModelFormData = z.infer<typeof modelSchema>;

interface Model {
  _id: string;
  name: string;
  makeId: string;
  makeName: string;
}

interface Make {
  _id: string;
  name: string;
  image: string;
}

const fetchModels = async (): Promise<Model[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/models/list-models`,
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
  if (!response.ok) throw new Error("Failed to fetch models");
  const res = await response.json();
  return res.data;
};

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

const addModel = async (formData: FormData): Promise<Model> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/models/add-model`,
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
  
  if (!response.ok) {
    // Try to get the error message from the response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to add model (${response.status})`);
    } catch (e) {
      throw new Error(`Failed to add model: ${response.statusText} (${response.status})`);
    }
  }
  
  const res = await response.json();
  return res.data;
};

const updateModel = async ({
  _id,
  formData,
}: {
  _id: string;
  formData: FormData;
}): Promise<Model> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/models/update-model/${_id}`,
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
  if (!response.ok) throw new Error("Failed to update model");
  const res = await response.json();
  return res.data;
};

const deleteModel = async (_id: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/models/delete-model/${_id}`,
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
  if (!response.ok) throw new Error("Failed to delete model");
  return await response.json();
};

const CarModel = () => {
  const queryClient = useQueryClient();
  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: ["models"],
    queryFn: fetchModels,
  });
  const { data: makes = [], isLoading: makesLoading } = useQuery({
    queryKey: ["makes"],
    queryFn: fetchMakes,
  });
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [selectedMakeId, setSelectedMakeId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (editingModel) {
      setSelectedMakeId(editingModel.makeId);
    } else {
      setSelectedMakeId("");
    }
  }, [editingModel]);

  const addMutation = useMutation({
    mutationFn: addModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      toast({ title: "Success", description: "Car Model added successfully" });
      setShowAddEditDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add car model",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      toast({ title: "Success", description: "Car Model updated successfully" });
      setShowAddEditDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update car model",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      toast({ title: "Success", description: "Car Model deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete car model",
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
      const makeId = formData.get("makeId") as string;

      modelSchema.parse({ name, makeId });

      if (editingModel?._id) {
        updateMutation.mutate({
          _id: editingModel._id,
          formData,
        });
      } else {
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

  const handleDelete = (_id: string) => {
    deleteMutation.mutate(_id);
  };

  const openAddDialog = () => {
    setEditingModel(null);
    setSelectedMakeId("");
    setShowAddEditDialog(true);
  };

  const openEditDialog = (model: Model) => {
    setEditingModel(model);
    setSelectedMakeId(model.makeId);
    setShowAddEditDialog(true);
  };

  if (modelsLoading || makesLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Car Models</h1>
        <Button onClick={openAddDialog}>Add New Model</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((model) => (
          <Card key={model._id} className="bg-white p-4 rounded-lg shadow-md">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="text-center">
                <h3 className="font-medium text-lg">{model.name}</h3>
                <p className="text-gray-500 text-sm">Make: {model.makeName}</p>
              </div>
            </CardContent>
            <div className="flex justify-center items-center">
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(model)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(model._id)}
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
              {editingModel ? "Edit Car Model" : "Add New Car Model"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEdit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  name="name"
                  defaultValue={editingModel?.name || ""}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Make</label>
                <Select
                  name="makeId"
                  value={selectedMakeId}
                  onValueChange={setSelectedMakeId}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a make" />
                  </SelectTrigger>
                  <SelectContent>
                    {makes.map((make) => (
                      <SelectItem key={make._id} value={make._id}>
                        {make.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  disabled={addMutation.isPending || updateMutation.isPending}
                >
                  {addMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingModel
                    ? "Save"
                    : "Add"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddEditDialog(false);
                    setEditingModel(null);
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

export default CarModel; 