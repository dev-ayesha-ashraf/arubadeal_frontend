import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Trash2,
  Pencil,
  ImagePlus,
  Plus,
  X,
  Search,
  Filter,
  Package,
  DollarSign,
  Hash,
  Tag,
  Car,
  CheckCircle,
  MoreVertical,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../common/PageHeader";

const API_URL = import.meta.env.VITE_API_URL;
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "https://api.arudeal.com/static";

const headers = {
  Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
  Accept: "application/json",
};

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

const Toast = ({ message, type = "success", onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div className={`
        flex items-center gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm min-w-80
        ${type === "success" ? "bg-green-50 border-green-200 text-green-800" : ""}
        ${type === "error" ? "bg-red-50 border-red-200 text-red-800" : ""}
      `}>
        <CheckCircle className={`w-5 h-5 ${type === "success" ? "text-green-600" : "text-red-600"}`} />
        <span className="font-medium flex-1">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function CarAccessory() {
  const [accessories, setAccessories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const navigate = useNavigate();


  const [formData, setFormData] = useState<any>({
    name: "",
    brand: "",
    price: 0,
    stock: 0,
    tags: [],
    model_compatibility: [],
    description: "",
    category_id: undefined,
    sub_category_id: undefined,
  });
  const [tempTag, setTempTag] = useState("");
  const [tempModel, setTempModel] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  const filteredAccessories = accessories
    .filter(accessory => {
      const matchesSearch = accessory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accessory.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" ||
        accessory.category?.id === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-high":
          return b.price - a.price;
        case "price-low":
          return a.price - b.price;
        case "stock":
          return b.stock - a.stock;
        case "newest":
          return new Date(b.created_at || b.updated_at || 0).getTime() -
            new Date(a.created_at || a.updated_at || 0).getTime();
        default:
          return 0;
      }
    });

  const fetchAccessories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/car_accessory/`, {
        headers,
        params: { page: 1, size: 50 },
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

  const getImageUrl = (accessory: any) => {
    if (!accessory.images || accessory.images.length === 0) return null;
    const primaryImage = accessory.images.find((img: any) => img.is_primary) || accessory.images[0];
    return `${MEDIA_URL}${primaryImage.image_url}`;
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
      if (editingId) {
        await axios.put(
          `${API_URL}/car_accessory/update/${editingId}`,
          {
            name: formData.name,
            brand: formData.brand,
            price: formData.price,
            stock: formData.stock,
            description: formData.description,
            tags: formData.tags,
            model_compatibility: formData.model_compatibility,
            category_id: formData.category_id,
            sub_category_id: formData.sub_category_id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
              Accept: "application/json",
            },
          }
        );
      } else {
        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("brand", formData.brand);
        payload.append("price", formData.price.toString());
        payload.append("stock", formData.stock.toString());
        payload.append("category_id", formData.category_id);
        if (formData.sub_category_id) {
          payload.append("sub_category_id", formData.sub_category_id);
        }
        payload.append("description", formData.description || "");
        formData.tags.forEach((tag) => {
          payload.append("tags", tag);
        });

        formData.model_compatibility.forEach((model) => {
          payload.append("model_compatibility", model);
        });

        images.forEach((img) => payload.append("images", img));

        await axios.post(`${API_URL}/car_accessory/create`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
            Accept: "application/json",
          },
        });
      }

      setOpen(false);
      setEditingId(null);
      resetForm();
      fetchAccessories();
      showToast(editingId ? "Accessory updated successfully!" : "Accessory created successfully!");
    } catch (err: any) {
      console.error("Failed to save accessory", err.response?.data || err);
      showToast("Failed to save accessory", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this accessory?")) return;

    try {
      await axios.delete(`${API_URL}/car_accessory/delete`, {
        headers,
        params: { id },
      });
      showToast("Accessory deleted successfully!");
      fetchAccessories();
    } catch (err: any) {
      console.error("Failed to delete accessory", err);
      showToast("Failed to delete accessory", "error");
    }
  };

  const addTag = () => {
    if (tempTag.trim() && !formData.tags.includes(tempTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tempTag.trim()],
      });
      setTempTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag: string) => tag !== tagToRemove),
    });
  };

  const addModel = () => {
    if (tempModel.trim() && !formData.model_compatibility.includes(tempModel.trim())) {
      setFormData({
        ...formData,
        model_compatibility: [...formData.model_compatibility, tempModel.trim()],
      });
      setTempModel("");
    }
  };

  const removeModel = (modelToRemove: string) => {
    setFormData({
      ...formData,
      model_compatibility: formData.model_compatibility.filter(
        (model: string) => model !== modelToRemove
      ),
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      price: 0,
      stock: 0,
      tags: [],
      model_compatibility: [],
      description: "",
      category_id: undefined,
      sub_category_id: undefined,
    });
    setImages([]);
    setTempTag("");
    setTempModel("");
    setEditingId(null);
  };

  const parseArrayField = (field: any): string[] => {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [field];
      }
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <PageHeader
              title="Car Accessories"
              description="Manage your car accessories inventory"
              icon={Package}
            >
            </PageHeader>
            <Dialog
              open={open}
              onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="rounded-lg bg-dealership-primary hover:bg-dealership-primary/80 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Accessory
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {editingId ? "Edit Accessory" : "New Accessory"}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name *</label>
                      <Input
                        placeholder="Accessory name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Brand *</label>
                      <Input
                        placeholder="Brand name"
                        value={formData.brand}
                        onChange={(e) =>
                          setFormData({ ...formData, brand: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price *</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="pl-10"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Stock *</label>
                      <div className="relative">
                        <Hash className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <Input
                          type="number"
                          placeholder="0"
                          className="pl-10"
                          value={formData.stock}
                          onChange={(e) =>
                            setFormData({ ...formData, stock: Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category *</label>
                      <Select
                        onValueChange={(v) =>
                          setFormData({ ...formData, category_id: v })
                        }
                        value={formData.category_id || undefined}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {categories.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subcategory</label>
                      <Select
                        onValueChange={(v) =>
                          setFormData({ ...formData, sub_category_id: v })
                        }
                        value={formData.sub_category_id || undefined}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Subcategory" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {subCategories.length > 0
                            ? subCategories.map((sc: any) => (
                              <SelectItem key={sc.id} value={sc.id}>
                                {sc.name}
                              </SelectItem>
                            ))
                            : <SelectItem value="none" disabled>No subcategories</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="Product description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={tempTag}
                        onChange={(e) => setTempTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.isArray(formData.tags)
                        ? formData.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                            {tag}
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-red-600"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))
                        : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      Model Compatibility
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add car model"
                        value={tempModel}
                        onChange={(e) => setTempModel(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addModel())}
                      />
                      <Button type="button" onClick={addModel} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.isArray(formData.model_compatibility)
                        ? formData.model_compatibility.map((model: string, index: number) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1 px-3 py-1">
                            {model}
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-red-600"
                              onClick={() => removeModel(model)}
                            />
                          </Badge>
                        ))
                        : null}
                    </div>
                  </div>
                  {!editingId && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Images</label>
                      <div className="flex items-center gap-3 p-4 border-2 border-dashed rounded-lg hover:border-dealership-primary transition-colors">
                        <label className="flex items-center gap-2 cursor-pointer text-dealership-primary hover:text-dealership-primary/80">
                          <ImagePlus className="w-5 h-5" />
                          Upload Images
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
                    </div>
                  )}

                  <Button
                    onClick={handleSave}
                    className="mt-4 bg-dealership-primary hover:bg-dealership-primary/80 py-3 text-base font-medium"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingId ? "Update Accessory" : "Create Accessory"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Accessories</p>
                  <p className="text-2xl font-bold text-blue-900">{accessories.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <Button
                onClick={() => setOpen(true)}
                className="mt-4 w-full bg-blue-700 hover:bg-blue-900 text-white text-sm py-1"
                size="sm"
              >
                Add Accessory
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">In Stock</p>
                  <p className="text-2xl font-bold text-green-900">
                    {accessories.filter(a => a.stock > 0).length}
                  </p>
                </div>
                <Hash className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {accessories.filter(a => a.stock === 0).length}
                  </p>
                </div>
                <X className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Categories</p>
                    <p className="text-2xl font-bold text-purple-900">{categories.length}</p>
                  </div>
                  <Filter className="w-8 h-8 text-purple-600" />
                </div>
                <div className="mt-auto pt-2">
                  <Button
                    onClick={() => navigate('/admin/category-management')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-1"
                    size="sm"
                  >
                    Manage Categories
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 shadow-sm border-0 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex-1 w-full lg:max-w-md">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search accessories by name or brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-4 flex-1 lg:justify-end">
                <div className="space-y-2 min-w-[150px]">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 min-w-[150px]">
                  <label className="text-sm font-medium text-gray-700">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-high">Price (High to Low)</SelectItem>
                      <SelectItem value="price-low">Price (Low to High)</SelectItem>
                      <SelectItem value="stock">Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading accessories...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredAccessories.length} of {accessories.length} accessories
              </p>
            </div>
            <Card className="hidden lg:block shadow-sm border-0">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50/80">
                    <TableRow>
                      <TableHead className="w-12">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccessories.map((item) => {
                      const imageUrl = getImageUrl(item);
                      const tags = parseArrayField(item.tags);
                      const models = parseArrayField(item.model_compatibility);

                      return (
                        <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell>
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <Package className={`w-5 h-5 text-gray-400 ${imageUrl ? 'hidden' : ''}`} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.brand}</div>
                              {models.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Car className="w-3 h-3" />
                                  <span>{models.slice(0, 2).join(', ')}{models.length > 2 && ` +${models.length - 2}`}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900">
                                {item.category?.name || 'N/A'}
                              </div>
                              {item.sub_category && (
                                <div className="text-xs text-gray-500">
                                  {item.sub_category.name}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-semibold text-gray-900">
                              AWG {parseFloat(item.price).toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={item.stock > 0 ? "default" : "destructive"}
                              className={
                                item.stock > 0
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-red-100 text-red-800 hover:bg-red-100"
                              }
                            >
                              {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {tags.slice(0, 2).map((tag: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-white">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setFormData({
                                      name: item.name,
                                      brand: item.brand,
                                      price: parseFloat(item.price),
                                      stock: item.stock,
                                      tags: parseArrayField(item.tags),
                                      model_compatibility: parseArrayField(item.model_compatibility),
                                      description: item.description || "",
                                      category_id: item.category?.id,
                                      sub_category_id: item.sub_category?.id,
                                    });
                                    setOpen(true);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(item.id)}
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="lg:hidden space-y-4">
              {filteredAccessories.map((item) => {
                const imageUrl = getImageUrl(item);
                const tags = parseArrayField(item.tags);
                const models = parseArrayField(item.model_compatibility);

                return (
                  <Card key={item.id} className="shadow-sm border-0">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                              <p className="text-sm text-gray-500">{item.brand}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant={item.stock > 0 ? "default" : "destructive"}
                                  className={
                                    item.stock > 0
                                      ? "bg-green-100 text-green-800 text-xs"
                                      : "bg-red-100 text-red-800 text-xs"
                                  }
                                >
                                  {item.stock > 0 ? `${item.stock} stock` : 'Out of stock'}
                                </Badge>
                                <span className="font-semibold text-gray-900">
                                  AWG {parseFloat(item.price).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setFormData({
                                      name: item.name,
                                      brand: item.brand,
                                      price: parseFloat(item.price),
                                      stock: item.stock,
                                      tags: parseArrayField(item.tags),
                                      model_compatibility: parseArrayField(item.model_compatibility),
                                      description: item.description || "",
                                      category_id: item.category?.id,
                                      sub_category_id: item.sub_category?.id,
                                    });
                                    setOpen(true);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(item.id)}
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="mt-2 space-y-2">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Category:</span> {item.category?.name || 'N/A'}
                              {item.sub_category && ` • ${item.sub_category.name}`}
                            </div>

                            {models.length > 0 && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Car className="w-3 h-3 flex-shrink-0" />
                                <span className="font-medium">Fits:</span>
                                <span className="truncate">{models.slice(0, 3).join(', ')}{models.length > 3 && ` +${models.length - 3}`}</span>
                              </div>
                            )}

                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {tags.slice(0, 3).map((tag: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {!loading && filteredAccessories.length === 0 && (
          <Card className="text-center py-16 border-0 bg-white/50 backdrop-blur-sm">
            <CardContent>
              <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {accessories.length === 0 ? "No accessories found" : "No matching accessories"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {accessories.length === 0
                  ? "Get started by adding your first car accessory to your inventory."
                  : "Try adjusting your search or filter criteria to find what you're looking for."}
              </p>
              {accessories.length === 0 && (
                <Button
                  className="bg-dealership-primary hover:bg-dealership-primary/90"
                  onClick={() => setOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Accessory
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}