import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2, Pencil, ImagePlus } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const headers = {
  Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
  Accept: "application/json",
};

export default function CarAccessory() {
  const [accessories, setAccessories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState<any>({
    name: "",
    brand: "",
    price: 0,
    stock: 0,
    category_id: undefined,
    sub_category_id: undefined,
    description: "",
  });
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAccessories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/car_accessory/`, {
        headers,
        params: { page: 1, size: 20 },
      });
      setAccessories(res.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/car_accessory/category/`, {
        headers,
      });
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubCategories = async (categoryId?: string) => {
    if (!categoryId) {
      setSubCategories([]);
      setFormData((prev: any) => ({ ...prev, sub_category_id: undefined }));
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/car_accessory/sub-category/`, {
        headers,
        params: { category_id: categoryId },
      });
      setSubCategories(res.data || []);
      setFormData((prev: any) => ({ ...prev, sub_category_id: undefined }));
    } catch (err) {
      console.error(err);
      setSubCategories([]);
    }
  };

  useEffect(() => {
    fetchAccessories();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSubCategories(formData.category_id);
  }, [formData.category_id]);

 const handleSave = async () => {
  if (!formData.name || !formData.category_id || !formData.brand) return;

  setLoading(true);

  try {
    const payload = new FormData();

    // Required string/number fields
    payload.append("name", formData.name);
    payload.append("brand", formData.brand);
    payload.append("price", formData.price.toString());
    payload.append("stock", formData.stock.toString());
    payload.append("category_id", formData.category_id);
    if (formData.sub_category_id) payload.append("sub_category_id", formData.sub_category_id);
    payload.append("description", formData.description || "");

    // Arrays must be JSON strings
    payload.append("tags", JSON.stringify(formData.tags || []));
    payload.append("model_compatibility", JSON.stringify(formData.model_compatibility || []));

    // out_of_stock is optional, backend can calculate it, but you can send it too
    payload.append("out_of_stock", (formData.stock === 0).toString());

    // created_by (replace with actual logged-in user ID)
    payload.append("created_by", localStorage.getItem("user_id") || "");

    // Images
    images.forEach((img) => payload.append("images", img));

    if (editingId) {
      // Update existing accessory
      await axios.put(`${API_URL}/car_accessory/update/${editingId}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
          Accept: "application/json",
        },
      });
    } else {
      // Create new accessory
      await axios.post(`${API_URL}/car_accessory/create`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
          Accept: "application/json",
        },
      });
    }

    // Reset form
    setOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      brand: "",
      price: 0,
      stock: 0,
      category_id: undefined,
      sub_category_id: undefined,
      description: "",
      tags: [],
      model_compatibility: [],
    });
    setImages([]);
    fetchAccessories();
  } catch (err: any) {
    console.error("Failed to save accessory", err.response?.data || err);
  } finally {
    setLoading(false);
  }
};


  const handleDelete = async (id: string) => {
    await axios.delete(`${API_URL}/car_accessory/delete`, {
      headers,
      params: { id },
    });
    fetchAccessories();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Car Accessories</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl">+ Add Accessory</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Accessory" : "New Accessory"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                placeholder="Brand"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
              <Input
                placeholder="Price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
              <Input
                placeholder="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
              />

              <Select
                onValueChange={(v) =>
                  setFormData({ ...formData, category_id: v })
                }
                value={formData.category_id || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={(v) =>
                  setFormData({ ...formData, sub_category_id: v })
                }
                value={formData.sub_category_id || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subCategories.length > 0
                    ? subCategories.map((sc: any) => (
                        <SelectItem key={sc.id} value={sc.id}>
                          {sc.name}
                        </SelectItem>
                      ))
                    : null}
                </SelectContent>
              </Select>

              <Input
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <ImagePlus className="w-5 h-5" /> Upload Images
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files && setImages(Array.from(e.target.files))
                    }
                  />
                </label>
                {images.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {images.length} file(s) selected
                  </span>
                )}
              </div>

              <Button onClick={handleSave} className="mt-3">
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accessories.map((item) => (
            <Card key={item.id} className="shadow-lg rounded-2xl">
              <CardContent className="p-4 space-y-2">
                <h2 className="font-semibold text-lg">{item.name}</h2>
                <p className="text-sm text-gray-500">Brand: {item.brand}</p>
                <p className="text-sm">Price: ${item.price}</p>
                <p className="text-sm">Stock: {item.stock}</p>
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setEditingId(item.id);
                      setFormData(item);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
