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

// Define Zod schema for engine validation
const engineSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type EngineFormData = z.infer<typeof engineSchema>;

interface Engine {
  _id: string;
  name: string;
}

// API functions
const fetchEngines = async (): Promise<Engine[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/engines/list-engines`,
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
    throw new Error(`Failed to fetch engines: ${response.status}`);
  }
  const res = await response.json();
  return res.data;
};

const createEngine = async (data: EngineFormData): Promise<Engine> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/engines/add-engine`,
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
    throw new Error(`Failed to create engine: ${response.status}`);
  }
  const res = await response.json();
  return res.data;
};

const updateEngine = async ({
  _id,
  data,
}: {
  _id: string;
  data: EngineFormData;
}): Promise<Engine> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/engines/update-engine/${_id}`,
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
    throw new Error(`Failed to update engine: ${response.status}`);
  }
  const res = await response.json();
  return res.data;
};

const deleteEngine = async (_id: string): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/engines/delete-engine/${_id}`,
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
    throw new Error(`Failed to delete engine: ${response.status}`);
  }
  const res = await response.json();
  return res.data;
};

const EnginesManagement = () => {
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [engineToDelete, setEngineToDelete] = useState<string | null>(null);
  const [editingEngine, setEditingEngine] = useState<Engine | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // React Query hooks
  const { data: engines = [], isLoading } = useQuery({
    queryKey: ["engines"],
    queryFn: fetchEngines,
  });

  const createMutation = useMutation({
    mutationFn: createEngine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engines"] });
      toast({
        title: "Success",
        description: "Engine added successfully",
      });
      setShowAddEditDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add engine",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateEngine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engines"] });
      toast({
        title: "Success",
        description: "Engine updated successfully",
      });
      setShowAddEditDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update engine",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEngine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engines"] });
      toast({
        title: "Success",
        description: "engine deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete engine",
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
  } = useForm<EngineFormData>({
    resolver: zodResolver(engineSchema),
    defaultValues: {
      name: editingEngine?.name || "",
    },
  });

  const onSubmit = (data: EngineFormData) => {
    if (editingEngine?._id) {
      updateMutation.mutate({ _id: editingEngine._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (_id: string) => {
    setEngineToDelete(_id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (engineToDelete) {
      deleteMutation.mutate(engineToDelete);
      setShowDeleteDialog(false);
      setEngineToDelete(null);
    }
  };

  const openAddDialog = () => {
    setEditingEngine(null);
    reset({ name: "" });
    setShowAddEditDialog(true);
  };

  const openEditDialog = (engine: Engine) => {
    setEditingEngine(engine);
    reset({ name: engine.name });
    setShowAddEditDialog(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Engine Management</h1>
        <Button onClick={openAddDialog}>Add New Engine</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading engines...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {engines.map((engine) => (
            <div key={engine._id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">{engine.name}</span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(engine)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(engine._id)}
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
              {editingEngine ? "Edit Engine" : "Add New Engine"}
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
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingEngine
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
        description="Are you sure you want to delete this Engine? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        destructive={true}
      />
    </div>
  );
};

export default EnginesManagement;
