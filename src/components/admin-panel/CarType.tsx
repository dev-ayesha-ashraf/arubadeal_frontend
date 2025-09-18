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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BodyType {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

const fetchBodyTypes = async (): Promise<BodyType[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/bodytype/get_all`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch body types");
  return response.json();
};

const BodyTypes = () => {
  const [bodyTypes, setBodyTypes] = useState<BodyType[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<BodyType | null>(null);
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["bodytypes"],
    queryFn: fetchBodyTypes,
  });

  useEffect(() => {
    if (data) setBodyTypes(data);
  }, [data]);

  const addMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/bodytype/create`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
          },
        }
      );
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || "Failed to add body type");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bodytypes"] });
      toast({ title: "Success", description: "Body type added successfully" });
      resetDialog();
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to add body type",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/bodytype/update?id=${id}`,
        {
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
          },
        }
      );
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || "Failed to update body type");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bodytypes"] });
      toast({ title: "Success", description: "Body type updated successfully" });
      resetDialog();
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to update body type",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/bodytype/delete?id=${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
          },
        }
      );
      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.message || "Failed to delete body type");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bodytypes"] });
      toast({ title: "Success", description: "Body type deleted successfully" });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete body type",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;

    const formData = new FormData();
    formData.append("name", name);

    if (editing) {
      if (selectedImage) formData.append("image", selectedImage);
      updateMutation.mutate({ id: editing.id, formData });
    } else {
      if (!selectedImage) {
        toast({
          title: "Error",
          description: "Image is required for new body type",
          variant: "destructive",
        });
        return;
      }
      formData.append("image", selectedImage);
      addMutation.mutate(formData);
    }
  };

  const resetDialog = () => {
    setShowDialog(false);
    setEditing(null);
    setSelectedImage(null);
    setPreviewImage("");
  };

  const openAddDialog = () => {
    setEditing(null);
    setPreviewImage("");
    setSelectedImage(null);
    setShowDialog(true);
  };

  const openEditDialog = (bt: BodyType) => {
    setEditing(bt);
    setPreviewImage(`${import.meta.env.VITE_MEDIA_URL}/${bt.image_url}`);
    setShowDialog(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading body types</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Body Types</h1>
        <Button onClick={openAddDialog}>Add New Body Type</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bodyTypes.map((bt) => (
          <Card key={bt.id} className="bg-white rounded-lg shadow-md">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="w-full h-48 flex items-center justify-center overflow-hidden rounded-lg mb-4">
                  <img
                    src={`${import.meta.env.VITE_MEDIA_URL}${bt.image_url}`}
                    alt={bt.name}
                  />

                </div>
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">{bt.name}</h3>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(bt)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(bt.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Body Type" : "Add Body Type"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={editing?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} />
             {(previewImage || editing?.image_url) && (
  <div className="w-full h-32 flex items-center justify-center border rounded-lg overflow-hidden">
    <img
      src={
        previewImage ||
        (editing?.image_url.startsWith("http")
          ? editing.image_url
          : `${import.meta.env.VITE_MEDIA_URL}${editing.image_url}`)
      }
      alt="Preview"
      className="max-w-full max-h-full object-contain"
    />
  </div>
)}

            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
                {addMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editing
                    ? "Update"
                    : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BodyTypes;
