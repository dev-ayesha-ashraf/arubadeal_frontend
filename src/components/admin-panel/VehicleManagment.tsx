import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios, { InternalAxiosRequestConfig } from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import StatsCard from "../common/StatsCard";
import {
  Car,
  CheckCircle,
  DollarSign,
  Trash2,
  XCircle,
  Plus,
  Search,
  Edit,
  Eye,
  CheckSquare,
  Gauge,
  Palette,
  Calendar,
  MapPin,
  User,
} from "lucide-react";
import SearchBar from "../common/SearchBar";
import { Pagination } from "../common/Pagination";
import PageHeader from "../common/PageHeader";
import LayoutToggle from "../common/LayoutToggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API = import.meta.env.VITE_API_URL;
const MEDIA = import.meta.env.VITE_MEDIA_URL;

type Option = {
  id: string;
  name: string;
  slug?: string;
};

type VehicleImage = {
  id: string;
  image_url: string;
  is_primary: boolean;
  position: number;
  is_display: boolean;
};

type Vehicle = {
  id: string;
  title: string;
  make?: Option;
  model?: string;
  year?: number;
  body_type?: Option;
  price?: number;
  vehical_id?: string;
  slug?: string;
  is_active?: boolean;
  is_sold?: boolean;
  images?: VehicleImage[];
  mileage?: string;
  color?: string;
  seats?: number;
  engine_type?: string;
  transmission?: Option;
  fuel_type?: Option;
  badge?: Option;
  features?: { name: string; reason?: string }[];
  location?: string;
  condition?: string;
  created_at: string;
  dealer?: { first_name: string; last_name: string };
  description?: string;
};

const api = axios.create({ baseURL: API, withCredentials: false });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access_token");
  if (!config.headers) {
    config.headers = {} as typeof config.headers;
  }

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

const vehicleService = {
  list: (page = 1, size = 12) =>
    api.get("/car_listing/listing", { params: { page, size } }),
  get: (slug: string) => api.get(`/car_listing/get_car/${slug}`),
  create: (formData: FormData) =>
    api.post(`/car_listing/create`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, payload: any) =>
    api.put(`/car_listing/update/${id}`, payload),
  updateImages: (params: Record<string, any>) =>
    api.put(`/car_listing/update_images`, null, { params }),
  setStatus: (params: {
    id: string;
    is_sold?: boolean;
    in_active?: boolean;
    is_feature?: boolean;
  }) => api.put(`/car_listing/status`, null, { params }),
  delete: (id: string) =>
    api.delete(`/car_listing/delete`, { params: { id } }),
  batchDelete: (ids: string[]) =>
    api.delete(`/car_listing/batch-delete`, { data: ids }),
  batchStatus: (ids: string[], is_sold?: boolean) =>
    api.put(`/car_listing/batch-status`, ids, {
      params: { is_sold }
    }),
  uploadImages: (vehicalId: string, formData: FormData) =>
    api.post(`/car_listing/upload-images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      params: { vehical_id: vehicalId }
    }),
};

const lookups = {
  makes: () => api.get(`/make/get_all`),
  bodytypes: () => api.get(`/bodytype/get_all`),
  fueltypes: () => api.get(`/fueltype/get_all`),
  transmissions: () => api.get(`/transmission/get_all`),
  badges: () => api.get(`/badge/get_all`),
};

function formatPrice(num?: number) {
  if (num == null) return "-";
  return `AWG ${num.toLocaleString()}`;
}

const getPrimaryImage = (images: VehicleImage[]): VehicleImage | null => {
  if (!images || images.length === 0) return null;
  const primaryImage = images.find(img => img.is_primary === true);
  if (primaryImage) return primaryImage;
  return images[0];
};

export default function VehicleManager() {
  const navigate = useNavigate();
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const [size] = useState(12);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [makes, setMakes] = useState<Option[]>([]);
  const [bodytypes, setBodytypes] = useState<Option[]>([]);
  const [fueltypes, setFueltypes] = useState<Option[]>([]);
  const [transmissions, setTransmissions] = useState<Option[]>([]);
  const [badges, setBadges] = useState<Option[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [showBatchSoldConfirm, setShowBatchSoldConfirm] = useState(false);
  const [showBatchActiveConfirm, setShowBatchActiveConfirm] = useState(false);
  const [notification, setNotification] = useState<{ message: string; visible: boolean; type?: 'success' | 'error' }>({
    message: '',
    visible: false,
    type: 'success'
  });

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({
      message,
      visible: true,
      type
    });
    setTimeout(() => {
      setNotification({
        message: '',
        visible: false,
        type: 'success'
      });
    }, 5000);
  };

  const allSelectedAreSold = useMemo(() => {
    if (selectedVehicles.size === 0) return false;
    const selectedVehiclesList = vehicles.filter(v => selectedVehicles.has(v.id));
    return selectedVehiclesList.every(v => v.is_sold);
  }, [selectedVehicles, vehicles]);

  const allSelectedAreActive = useMemo(() => {
    if (selectedVehicles.size === 0) return false;
    const selectedVehiclesList = vehicles.filter(v => selectedVehicles.has(v.id));
    return selectedVehiclesList.every(v => !v.is_sold);
  }, [selectedVehicles, vehicles]);

  const hasMixedStatus = useMemo(() => {
    if (selectedVehicles.size === 0) return false;
    const selectedVehiclesList = vehicles.filter(v => selectedVehicles.has(v.id));
    const hasSold = selectedVehiclesList.some(v => v.is_sold);
    const hasActive = selectedVehiclesList.some(v => !v.is_sold);
    return hasSold && hasActive;
  }, [selectedVehicles, vehicles]);

  const handleBatchMarkAsSold = async () => {
    if (selectedVehicles.size === 0) return;
    try {
      const ids = Array.from(selectedVehicles);
      await vehicleService.batchStatus(ids, true);
      fetchVehicles();
      setSelectedVehicles(new Set());
      showNotification(`${ids.length} vehicle(s) marked as sold`);
    } catch (err: any) {
      console.error("Batch mark as sold failed:", err?.response?.data || err);
      showNotification("Failed to update vehicles", 'error');
    } finally {
      setShowBatchSoldConfirm(false);
    }
  };

  const handleBatchMarkAsActive = async () => {
    if (selectedVehicles.size === 0) return;
    try {
      const ids = Array.from(selectedVehicles);
      await vehicleService.batchStatus(ids, false);
      fetchVehicles();
      setSelectedVehicles(new Set());
      showNotification(`${ids.length} vehicle(s) marked as active`);
    } catch (err: any) {
      console.error("Batch mark as active failed:", err?.response?.data || err);
      showNotification("Failed to update vehicles", 'error');
    } finally {
      setShowBatchActiveConfirm(false);
    }
  };

  useEffect(() => {
    fetchLookups();
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredVehicles(allVehicles);
    } else {
      const searchTerm = search.toLowerCase().trim();
      const filtered = allVehicles.filter(vehicle =>
        searchVehicle(vehicle, searchTerm)
      );
      setFilteredVehicles(filtered);
    }
    setPage(1);
  }, [search, allVehicles]);

  useEffect(() => {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);
    setVehicles(paginatedVehicles);
  }, [filteredVehicles, page, size]);

  const searchVehicle = (vehicle: Vehicle, searchTerm: string): boolean => {
    const fieldsToSearch = [
      vehicle.title,
      vehicle.make?.name,
      vehicle.model,
      vehicle.year?.toString(),
      vehicle.body_type?.name,
      vehicle.price?.toString(),
      vehicle.vehical_id,
      vehicle.mileage,
      vehicle.color,
      vehicle.seats?.toString(),
      vehicle.engine_type,
      vehicle.transmission?.name,
      vehicle.fuel_type?.name,
      vehicle.badge?.name,
      vehicle.location,
      vehicle.condition,
      ...(vehicle.features?.map(f => f.name) || []),
      ...(vehicle.features?.map(f => f.reason).filter(Boolean) || [])
    ];

    return fieldsToSearch.some(field =>
      field && field.toLowerCase().includes(searchTerm)
    );
  };

  async function fetchLookups() {
    try {
      const [mk, bt, ft, tr, bd] = await Promise.all([
        lookups.makes(),
        lookups.bodytypes(),
        lookups.fueltypes(),
        lookups.transmissions(),
        lookups.badges(),
      ]);
      setMakes(mk.data || []);
      setBodytypes(bt.data || []);
      setFueltypes(ft.data || []);
      setTransmissions(tr.data || []);
      setBadges(bd.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchVehicles() {
    setLoading(true);
    try {
      const res = await vehicleService.list(1, 1000);
      const d = res.data;
      const allVehiclesData = d.items || [];
      setAllVehicles(allVehiclesData);
      setFilteredVehicles(allVehiclesData);
    } catch (err: any) {
      console.error("Fetch vehicles failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }

  const handleViewClick = (slug: string) => {
    navigate(`/admin/listings/${slug}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await vehicleService.delete(id);
      fetchVehicles();
      showNotification("Vehicle deleted successfully");
    } catch (err: any) {
      console.error("Delete failed:", err?.response?.data || err);
      showNotification("Failed to delete vehicle", 'error');
    }
  };

  const handleMarkAsSold = async (id: string) => {
    if (!confirm("Mark this vehicle as sold?")) return;
    try {
      await vehicleService.setStatus({ id, is_sold: true });
      fetchVehicles();
      showNotification("Vehicle marked as sold");
    } catch (err: any) {
      console.error("Mark as sold failed:", err?.response?.data || err);
      showNotification("Failed to update status", 'error');
    }
  };

  const handleMarkAsUnsold = async (id: string) => {
    if (!confirm("Mark this vehicle as unsold?")) return;
    try {
      await vehicleService.setStatus({ id, is_sold: false });
      fetchVehicles();
      showNotification("Vehicle marked as active");
    } catch (err: any) {
      console.error("Mark as unsold failed:", err?.response?.data || err);
      showNotification("Failed to update status", 'error');
    }
  };

  const toggleVehicleSelection = (id: string) => {
    setSelectedVehicles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedVehicles.size === vehicles.length) {
      setSelectedVehicles(new Set());
    } else {
      setSelectedVehicles(new Set(vehicles.map(v => v.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedVehicles.size === 0) return;
    try {
      const ids = Array.from(selectedVehicles);
      await vehicleService.batchDelete(ids);
      fetchVehicles();
      setSelectedVehicles(new Set());
      showNotification(`${ids.length} vehicle(s) deleted successfully`);
    } catch (err: any) {
      console.error("Batch delete failed:", err?.response?.data || err);
      showNotification("Failed to delete vehicles", 'error');
    } finally {
      setShowBatchDeleteConfirm(false);
    }
  };

  const onSaveSuccess = () => {
    setShowAdd(false);
    setShowEdit(false);
    setEditingVehicle(null);
    fetchVehicles();
    setSearch("");
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowEdit(true);
  };

  const totalVehicles = allVehicles.length;
  const activeVehicles = allVehicles.filter(v => !v.is_sold).length;
  const soldVehicles = allVehicles.filter(v => v.is_sold).length;
  const totalPages = Math.ceil(filteredVehicles.length / size);

  return (
    <div className="p-6 space-y-6">
      {/* Notification */}
      {notification.visible && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <PageHeader
          title="Vehicle Management"
          description="Manage your vehicle inventory"
          icon={Car}
        />
        <div className="flex gap-2">
          {selectedVehicles.size > 0 && (
            <>
              {!allSelectedAreSold && (
                <Button
                  onClick={() => setShowBatchSoldConfirm(true)}
                  variant="outline"
                  className="bg-green-600 text-white hover:bg-green-700 border-green-600"
                >
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Mark as Sold ({selectedVehicles.size})
                </Button>
              )}
              {!allSelectedAreActive && (
                <Button
                  onClick={() => setShowBatchActiveConfirm(true)}
                  variant="outline"
                  className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                >
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Mark as Active ({selectedVehicles.size})
                </Button>
              )}
              <Button
                onClick={() => setShowBatchDeleteConfirm(true)}
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedVehicles.size})
              </Button>
            </>
          )}
          <Button
            onClick={() => setShowAdd(true)}
            className="bg-dealership-primary hover:bg-dealership-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
          <LayoutToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </div>

      {
        hasMixedStatus && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <span className="text-yellow-800 text-sm">
                Selected vehicles have mixed status. You can mark all as Sold or Active.
              </span>
            </div>
          </div>
        )
      }

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Vehicles"
          value={totalVehicles}
          icon={Car}
          variant="blue"
        />
        <StatsCard
          title="Active Listings"
          value={activeVehicles}
          icon={CheckCircle}
          variant="green"
        />
        <StatsCard
          title="Sold Vehicles"
          value={soldVehicles}
          icon={DollarSign}
          variant="orange"
        />
      </div>

      {
        selectedVehicles.size > 0 && (
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm font-medium text-blue-900">
              {selectedVehicles.size} vehicle(s) selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedVehicles(new Set())}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </Button>
          </div>
        )
      }

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search vehicles by title, make, model, year, price, features, etc..."
        className="max-w-2xl"
      />

      {
        search && (
          <div className="text-sm text-gray-600">
            Found {filteredVehicles.length} vehicle(s) matching "{search}"
          </div>
        )
      }

      {/* Vehicles Grid */}
      {
        loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {search ? "No vehicles match your search" : "No vehicles found"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                checked={selectedVehicles.size === vehicles.length && vehicles.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <Label className="text-sm text-gray-600">Select All</Label>
            </div>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-slate-200 bg-white group relative">

                    <Button
                      onClick={() => handleEdit(vehicle)}
                      className="absolute top-3 left-3 z-10 bg-white/90 hover:bg-white text-gray-700 border border-gray-300 shadow-sm h-8 px-3"
                      size="sm"
                    >
                      <Edit className="w-3 h-3 mr-1.5" />
                      Edit
                    </Button>

                    <div className="absolute top-3 right-3 z-10">
                      <Checkbox
                        checked={selectedVehicles.has(vehicle.id)}
                        onCheckedChange={() => toggleVehicleSelection(vehicle.id)}
                        className="bg-white/90 border-gray-300 data-[state=checked]:bg-dealership-primary data-[state=checked]:border-dealership-primary w-5 h-5"
                      />
                    </div>

                    {/* Image Section */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      <img
                        src={`${MEDIA}${getPrimaryImage(vehicle.images)?.image_url || vehicle.images?.[0]?.image_url}`}
                        alt={vehicle.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `${MEDIA}/cars/placeholder-image.png`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                      {/* Status Badge */}
                      <Badge className={`absolute bottom-3 left-3 border-0 shadow-sm ${vehicle.is_sold
                        ? "bg-red-100 text-red-800"
                        : vehicle.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                        }`}>
                        <span className="flex items-center gap-1 text-xs font-medium">
                          {vehicle.is_sold ? (
                            <>
                              <DollarSign className="w-3 h-3" /> Sold
                            </>
                          ) : vehicle.is_active ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Inactive
                            </>
                          )}
                        </span>
                      </Badge>
                    </div>

                    <CardContent className="p-5">
                      {/* Title and Info */}
                      <div className="mb-4">
                        <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-dealership-primary transition-colors">
                          {vehicle.title}
                        </h3>
                        <p className="text-slate-600 text-sm mb-3">
                          {vehicle.year} • {vehicle.make?.name} {vehicle.model}
                        </p>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex flex-col gap-1 text-slate-700">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-900">{formatPrice(vehicle.price)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700">
                          <Gauge className="w-4 h-4 text-blue-600" />
                          <span>{vehicle.mileage || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Car className="w-4 h-4 text-purple-600" />
                          <span className="truncate">{vehicle.body_type?.name || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Palette className="w-4 h-4 text-orange-600" />
                          <span className="truncate">{vehicle.color || "-"}</span>
                        </div>
                      </div>

                      {/* Location & Date */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700 font-medium truncate max-w-[120px]">
                            {vehicle.location || "No location"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">
                            {new Date(vehicle.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">

                        {vehicle.is_sold ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300"
                            onClick={() => handleMarkAsUnsold(vehicle.id)}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-2" />
                            Active
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                            onClick={() => handleMarkAsSold(vehicle.id)}
                          >
                            <DollarSign className="w-3.5 h-3.5 mr-2" />
                            Sold
                          </Button>
                        )}

                        {/* Delete */}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDelete(vehicle.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Delete
                        </Button>
                      </div>
                      {/* View */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-5 w-full bg-[rgb(206,131,57)] hover:bg-[rgb(196,121,47)] text-white shadow-sm transition-colors"
                        onClick={() => handleViewClick(vehicle.slug || "")}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>

                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-md border bg-white mb-8 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Mileage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-12 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                              <img
                                src={`${MEDIA}${getPrimaryImage(vehicle.images)?.image_url || vehicle.images?.[0]?.image_url}`}
                                alt={vehicle.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `${MEDIA}/cars/placeholder-image.png`;
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{vehicle.title}</div>
                              <div className="text-sm text-slate-500">{vehicle.year} • {vehicle.make?.name} {vehicle.model}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatPrice(vehicle.price)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-600">{vehicle.mileage || "-"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`border-0 shadow-sm ${vehicle.is_sold
                            ? "bg-red-100 text-red-800"
                            : vehicle.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                            }`}>
                            {vehicle.is_sold ? "Sold" : vehicle.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(vehicle)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDelete(vehicle.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewClick(vehicle.slug || "")}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => {
                setPage(p);
                setSelectedVehicles(new Set());
              }}
            />
          </>
        )
      }

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        open={showAdd}
        onOpenChange={setShowAdd}
        onSaved={onSaveSuccess}
        lookups={{ makes, bodytypes, fueltypes, transmissions, badges }}
        showNotification={showNotification}
      />

      {/* Edit Vehicle Modal */}
      <EditVehicleModal
        open={showEdit}
        onOpenChange={setShowEdit}
        vehicle={editingVehicle}
        onSaved={onSaveSuccess}
        lookups={{ makes, bodytypes, fueltypes, transmissions, badges }}
        showNotification={showNotification}
      />

      {/* Confirmation Dialogs */}
      <Dialog open={showBatchSoldConfirm} onOpenChange={setShowBatchSoldConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Mark as Sold</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark {selectedVehicles.size} selected vehicle(s) as sold?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchSoldConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBatchMarkAsSold}
              className="bg-green-600 hover:bg-green-700"
            >
              Mark {selectedVehicles.size} as Sold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBatchActiveConfirm} onOpenChange={setShowBatchActiveConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-blue-600">Mark as Active</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark {selectedVehicles.size} selected vehicle(s) as active?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchActiveConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBatchMarkAsActive}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Mark {selectedVehicles.size} as Active
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBatchDeleteConfirm} onOpenChange={setShowBatchDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Batch Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedVehicles.size} selected vehicle(s)?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatchDelete}
            >
              Delete {selectedVehicles.size} Vehicle(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}

function AddVehicleModal({ open, onOpenChange, onSaved, lookups, showNotification }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  lookups: any;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<any>({
    price: undefined,
    year: undefined,
    color: "",
    seats: undefined,
    mileage: "",
    mileage_unit: "KM",
    location: "",
    city: "",
    address: "",
    condition: "used",
    make_id: "",
    model: "",
    body_type_id: "",
    engine_type: "",
    transmission_id: "",
    fuel_type_id: "",
    badge_id: "",
    description: "",
  });
  const [features, setFeatures] = useState<{ name: string, reason?: string }[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [newFeatureReason, setNewFeatureReason] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canNext = useMemo(() => {
    return !!(form.price && form.year && form.make_id && (images.length > 0 || step === 1));
  }, [form, images, step]);

  function updateField(k: string, v: any) {
    setForm((s: any) => ({ ...s, [k]: v }));
  }

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  }

  function addFeature() {
    if (newFeature.trim()) {
      const feature = {
        name: newFeature.trim(),
        reason: newFeatureReason.trim() || undefined
      };
      const updatedFeatures = [...features, feature];
      setFeatures(updatedFeatures);
      setNewFeature("");
      setNewFeatureReason("");
    }
  }

  function removeFeature(index: number) {
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
  }

  function editFeature(index: number, field: 'name' | 'reason', value: string) {
    const updatedFeatures = [...features];
    updatedFeatures[index] = {
      ...updatedFeatures[index],
      [field]: value
    };
    setFeatures(updatedFeatures);
  }

  async function handleCreate() {
    setSubmitting(true);
    if (newFeature.trim()) {
      setFeatures((prev) => [...prev, { name: newFeature.trim(), reason: newFeatureReason.trim() || undefined }]);
      setNewFeature("");
      setNewFeatureReason("");
    }
    try {
      const fd = new FormData();
      images.forEach((f) => fd.append("images", f));

      Object.entries(form).forEach(([k, v]) => {
        if (v == null || v === "" || k === "mileage_unit") return;
        if (k === "mileage") {
          fd.append(k, `${v} ${form.mileage_unit}`.trim());
          return;
        }
        fd.append(k, String(v));
      });

      const featuresJSON = JSON.stringify(features);
      fd.append("features", featuresJSON);

      fd.append("features", JSON.stringify([...features, ...(newFeature.trim() ? [{ name: newFeature.trim(), reason: newFeatureReason.trim() || undefined }] : [])]));
      await vehicleService.create(fd);

      showNotification("Vehicle created successfully");
      onSaved();
      onOpenChange(false);
      setStep(1);
      setForm({
        price: undefined,
        year: undefined,
        color: "",
        seats: undefined,
        mileage: "",
        mileage_unit: "KM",
        location: "",
        city: "",
        address: "",
        condition: "used",
        make_id: "",
        model: "",
        body_type_id: "",
        engine_type: "",
        transmission_id: "",
        fuel_type_id: "",
        badge_id: "",
        description: "",
      });
      setFeatures([]);
      setImages([]);
      setImagePreviews([]);
    } catch (err) {
      console.error("❌ API Error:", err);
      showNotification("Failed to create vehicle", 'error');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-dealership-primary">Add a new vehicle</DialogTitle>
          <DialogDescription>
            Step {step} of 2 - {step === 1 ? "Vehicle Information" : "Upload Images"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={form.price || ""}
                onChange={(e) => updateField("price", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                value={form.year || ""}
                onChange={(e) => updateField("year", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={form.color}
                onChange={(e) => updateField("color", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seats">Seats</Label>
              <Input
                id="seats"
                type="number"
                value={form.seats || ""}
                onChange={(e) => updateField("seats", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage</Label>
              <div className="flex gap-2">
                <Input
                  id="mileage"
                  type="number"
                  placeholder="e.g., 50000"
                  className="flex-1"
                  value={form.mileage ?? ""}
                  onChange={(e) => updateField("mileage", e.target.value)}
                />
                <Select
                  value={form.mileage_unit}
                  onValueChange={(v) => updateField("mileage_unit", v)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="KM">KM</SelectItem>
                    <SelectItem value="Miles">Miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="make_id">Make *</Label>
              <Select value={form.make_id} onValueChange={(v) => updateField("make_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Make" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {lookups.makes.map((m: Option) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={form.model}
                onChange={(e) => updateField("model", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body_type_id">Type</Label>
              <Select
                value={form.body_type_id}
                onValueChange={(v) => updateField("body_type_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-48 overflow-y-auto">
                  {lookups.bodytypes.map((b: Option) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="engine_type">Engine Type</Label>
              <Input
                id="engine_type"
                value={form.engine_type}
                onChange={(e) => updateField("engine_type", e.target.value)}
                placeholder="e.g., V6, 4-Cylinder"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmission_id">Transmission</Label>
              <Select value={form.transmission_id} onValueChange={(v) => updateField("transmission_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Transmission" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {lookups.transmissions.map((t: Option) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel_type_id">Fuel Types</Label>
              <Select value={form.fuel_type_id} onValueChange={(v) => updateField("fuel_type_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel types" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {lookups.fueltypes.map((f: Option) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="badge_id">Badge</Label>
              <Select value={form.badge_id} onValueChange={(v) => updateField("badge_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select badges" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {lookups.badges.map((b: Option) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="features">Features</Label>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Feature name"
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newFeatureReason}
                    onChange={(e) => setNewFeatureReason(e.target.value)}
                    placeholder="Reason (optional)"
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  />
                  <Button
                    type="button"
                    onClick={addFeature}
                    className="bg-dealership-primary hover:bg-dealership-primary/90"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 bg-gray-50 rounded">
                    <Input
                      value={feature.name}
                      onChange={(e) => editFeature(index, 'name', e.target.value)}
                      placeholder="Feature name"
                      className="flex-1"
                    />
                    <Input
                      value={feature.reason || ''}
                      onChange={(e) => editFeature(index, 'reason', e.target.value)}
                      placeholder="Reason (optional)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeFeature(index)}
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="space-y-2">
              <Label>Upload Images (At least 1 is required)</Label>
              <Input type="file" multiple onChange={onFilesChange} className="mt-2" />
              <div className="mt-3 grid grid-cols-4 gap-2">
                {images.map((f, i) => (
                  <div key={i} className="border p-1 text-xs">
                    <div className="h-20 overflow-hidden flex items-center justify-center">
                      {imagePreviews[i] ? (
                        <img
                          src={imagePreviews[i]}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          {f.name}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setImages((s) => s.filter((_, idx) => idx !== i));
                          setImagePreviews((s) => s.filter((_, idx) => idx !== i));
                          URL.revokeObjectURL(imagePreviews[i]);
                        }}
                        className="text-red-600 text-sm p-0 h-auto"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!canNext}
                className="bg-dealership-primary hover:bg-dealership-primary/90"
              >
                Next: Upload Images
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={images.length === 0 || submitting}
                className="bg-dealership-primary hover:bg-dealership-primary/90"
              >
                {submitting ? "Creating..." : "Create"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditVehicleModal({
  open,
  onOpenChange,
  vehicle,
  onSaved,
  lookups,
  showNotification,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onSaved: () => void;
  lookups: any;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}) {
  const [form, setForm] = useState<any>({});
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [images, setImages] = useState<VehicleImage[]>(vehicle?.images || []);
  const [saving, setSaving] = useState(false);
  const [features, setFeatures] = useState<{ name: string, reason?: string }[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [newFeatureReason, setNewFeatureReason] = useState("");

  const sortImagesWithPrimaryFirst = (images: VehicleImage[]): VehicleImage[] => {
    if (!images || images.length === 0) return [];
    return [...images]
      .filter((img) => img.is_display !== false)
      .sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        if (a.position !== undefined && b.position !== undefined) {
          return a.position - b.position;
        }
        return 0;
      });
  };

  useEffect(() => {
    if (vehicle) {
      setForm({
        make_id: vehicle.make?.id || "",
        model: vehicle.model || "",
        fuel_type_id: vehicle.fuel_type?.id || "",
        transmission_id: vehicle.transmission?.id || "",
        engine_type: vehicle.engine_type || "",
        body_type_id: vehicle.body_type?.id || "",
        badge_id: vehicle.badge?.id || "",
        color: vehicle.color || "",
        mileage_value: vehicle.mileage ? vehicle.mileage.split(" ")[0] : "",
        mileage_unit: (vehicle.mileage && vehicle.mileage.split(" ").length > 1) ? vehicle.mileage.split(" ")[1] : "KM",
        price: vehicle.price ?? "",
        year: vehicle.year ?? "",
        description: vehicle.description || "",
        location: vehicle.location || "",
        seats: vehicle.seats ?? "",
        condition: vehicle.condition || "used",
      });
      setFeatures(vehicle.features || []);
      const sortedImages = sortImagesWithPrimaryFirst(vehicle.images || []);
      setImages(sortedImages);
    }
  }, [vehicle]);

  function updateField(k: string, v: any) {
    setForm((s: any) => ({ ...s, [k]: v }));
  }

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setUploadFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setUploadPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeUploadFile(index: number) {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
    setUploadPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  function addFeature() {
    if (newFeature.trim()) {
      const feature = {
        name: newFeature.trim(),
        reason: newFeatureReason.trim() || undefined
      };
      const updatedFeatures = [...features, feature];
      setFeatures(updatedFeatures);
      setNewFeature("");
      setNewFeatureReason("");
    }
  }

  function removeFeature(index: number) {
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
  }

  function editFeature(index: number, field: 'name' | 'reason', value: string) {
    const updatedFeatures = [...features];
    updatedFeatures[index] = {
      ...updatedFeatures[index],
      [field]: value
    };
    setFeatures(updatedFeatures);
  }

  async function handleSave() {
    if (!vehicle) return;

    setSaving(true);
    try {
      const payload = {
        make_id: form.make_id || null,
        model: form.model || null,
        fuel_type_id: form.fuel_type_id || null,
        transmission_id: form.transmission_id || null,
        engine_type: form.engine_type || null,
        body_type_id: form.body_type_id || null,
        badge_id: form.badge_id || null,
        color: form.color || null,
        mileage: form.mileage_value ? `${form.mileage_value} ${form.mileage_unit}`.trim() : null,
        price: form.price !== "" ? Number(form.price) : null,
        year: form.year !== "" ? Number(form.year) : null,
        description: form.description || null,
        location: form.location || null,
        seats: form.seats !== "" ? Number(form.seats) : null,
        condition: form.condition || "used",
        features: features.length > 0 ? features : null,
      };

      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== null && v !== undefined && v !== "")
      );

      await vehicleService.update(vehicle.id, cleanPayload);

      if (uploadFiles.length > 0 && vehicle.vehical_id) {
        const fd = new FormData();
        uploadFiles.forEach((f) => fd.append("images", f));

        try {
          const uploadResponse = await vehicleService.uploadImages(vehicle.vehical_id, fd);
          const freshResponse = await vehicleService.get(vehicle.slug || '');
          const freshImages = freshResponse.data.images || [];
          const sortedImages = sortImagesWithPrimaryFirst(freshImages);

          setImages(sortedImages);
          setUploadFiles([]);
          setUploadPreviews([]);
          uploadPreviews.forEach(preview => URL.revokeObjectURL(preview));

        } catch (err: any) {
          console.error("Image upload failed:", err?.response?.data || err);
          showNotification("Vehicle details updated but image upload failed", 'error');
        }
      }

      showNotification("Vehicle updated successfully");
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Update failed:", err?.response?.data || err);
      showNotification("Failed to update vehicle", 'error');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    return () => {
      uploadPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [uploadPreviews]);

  async function setPrimaryImage(image: VehicleImage) {
    if (!vehicle) return;
    try {
      await vehicleService.updateImages({ image_id: image.id, make_primary: true });
      const fresh = await api.get(`/car_listing/get_car/${vehicle.slug}`);
      const freshImages = fresh.data.images || [];
      const sortedImages = sortImagesWithPrimaryFirst(freshImages);
      setImages(sortedImages);
      showNotification("Primary image updated");
    } catch (err) {
      console.error(err);
      showNotification("Failed to update primary image", 'error');
    }
  }

  async function removeImage(image: VehicleImage) {
    if (!vehicle) return;
    try {
      await vehicleService.updateImages({ image_id: image.id, mark_not_to_show: true });
      const fresh = await api.get(`/car_listing/get_car/${vehicle.slug}`);
      const freshImages = fresh.data.images || [];
      const sortedImages = sortImagesWithPrimaryFirst(freshImages);
      setImages(sortedImages);
      showNotification("Image removed");
    } catch (err) {
      console.error(err);
      showNotification("Failed to remove image", 'error');
    }
  }

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-dealership-primary">Edit Vehicle</DialogTitle>
          <DialogDescription>
            Update the details of this vehicle
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Make */}
          <div className="space-y-2">
            <Label htmlFor="edit-make">Make</Label>
            <Select value={form.make_id} onValueChange={(v) => updateField("make_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Make" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {lookups.makes.map((m: Option) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label htmlFor="edit-model">Model</Label>
            <Input
              id="edit-model"
              value={form.model || ""}
              onChange={(e) => updateField("model", e.target.value)}
            />
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label htmlFor="edit-year">Year</Label>
            <Input
              id="edit-year"
              type="number"
              value={form.year || ""}
              onChange={(e) => updateField("year", Number(e.target.value))}
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>

          {/* Fuel Type */}
          <div className="space-y-2">
            <Label htmlFor="edit-fuel-type">Fuel Type</Label>
            <Select value={form.fuel_type_id} onValueChange={(v) => updateField("fuel_type_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Fuel Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {lookups.fueltypes.map((f: Option) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transmission */}
          <div className="space-y-2">
            <Label htmlFor="edit-transmission">Transmission</Label>
            <Select value={form.transmission_id} onValueChange={(v) => updateField("transmission_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Transmission" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {lookups.transmissions.map((t: Option) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Engine Type */}
          <div className="space-y-2">
            <Label htmlFor="edit-engine-type">Engine Type</Label>
            <Input
              id="edit-engine-type"
              value={form.engine_type || ""}
              onChange={(e) => updateField("engine_type", e.target.value)}
              placeholder="e.g., V6, 4-Cylinder"
            />
          </div>

          {/* Body Type */}
          <div className="space-y-2">
            <Label htmlFor="edit-body-type">Body Type</Label>
            <Select
              value={form.body_type_id}
              onValueChange={(v) => updateField("body_type_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Body Type" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-48 overflow-y-auto">
                {lookups.bodytypes.map((b: Option) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Badge */}
          <div className="space-y-2">
            <Label htmlFor="edit-badge">Badge</Label>
            <Select value={form.badge_id} onValueChange={(v) => updateField("badge_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Badge" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {lookups.badges.map((b: Option) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="edit-color">Color</Label>
            <Input
              id="edit-color"
              value={form.color || ""}
              onChange={(e) => updateField("color", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-mileage">Mileage</Label>
            <div className="flex gap-2">
              <Input
                id="edit-mileage"
                type="number"
                placeholder="e.g., 50000"
                className="flex-1"
                value={form.mileage_value || ""}
                onChange={(e) => updateField("mileage_value", e.target.value)}
              />
              <Select
                value={form.mileage_unit}
                onValueChange={(v) => updateField("mileage_unit", v)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="KM">KM</SelectItem>
                  <SelectItem value="Miles">Miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="edit-price">Price</Label>
            <Input
              id="edit-price"
              type="number"
              value={form.price || ""}
              onChange={(e) => updateField("price", Number(e.target.value))}
            />
          </div>

          {/* Seats */}
          <div className="space-y-2">
            <Label htmlFor="edit-seats">Seats</Label>
            <Input
              id="edit-seats"
              type="number"
              value={form.seats || ""}
              onChange={(e) => updateField("seats", Number(e.target.value))}
            />
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="edit-condition">Condition</Label>
            <Select value={form.condition} onValueChange={(v) => updateField("condition", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              value={form.location || ""}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={form.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Features */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="features">Features</Label>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Feature name"
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                />
              </div>
              <div className="flex gap-2">
                <Input
                  value={newFeatureReason}
                  onChange={(e) => setNewFeatureReason(e.target.value)}
                  placeholder="Reason (optional)"
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                />
                <Button
                  type="button"
                  onClick={addFeature}
                  className="bg-dealership-primary hover:bg-dealership-primary/90"
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2 items-center p-2 bg-gray-50 rounded">
                  <Input
                    value={feature.name}
                    onChange={(e) => editFeature(index, 'name', e.target.value)}
                    placeholder="Feature name"
                    className="flex-1"
                  />
                  <Input
                    value={feature.reason || ''}
                    onChange={(e) => editFeature(index, 'reason', e.target.value)}
                    placeholder="Reason (optional)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => removeFeature(index)}
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 space-y-2">
            <Label>Upload New Images</Label>
            <Input
              type="file"
              multiple
              onChange={onFilesChange}
              className="mt-2"
              accept="image/*"
            />
            {uploadFiles.length > 0 && (
              <div className="mt-3">
                <Label>New Images to Upload:</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {uploadFiles.map((file, i) => (
                    <div key={i} className="border p-2 text-xs relative">
                      <div className="h-20 overflow-hidden flex items-center justify-center mb-2">
                        {uploadPreviews[i] ? (
                          <img
                            src={uploadPreviews[i]}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            {file.name}
                          </div>
                        )}
                      </div>
                      <div className="text-xs truncate">{file.name}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUploadFile(i)}
                        className="absolute top-1 right-1 text-red-600 text-xs p-1 h-6 w-6"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-2 space-y-2">
            <Label>Current Images</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-2">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className={`border p-2 text-xs relative flex flex-col ${index === 0 ? 'ring-2 ring-dealership-primary/80 ring-opacity-50' : ''
                    }`}
                >
                  <div className="w-full h-24 overflow-hidden rounded">
                    <img
                      src={`${MEDIA}${img.image_url}`}
                      className="h-24 w-full object-cover"
                      alt={`Vehicle image ${index + 1}`}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs font-medium truncate">
                      {index === 0 ? (
                        <span className="text-dealership-primary">Primary</span>
                      ) : null}
                    </div>

                    <div className="flex gap-1">
                      {index !== 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPrimaryImage(img)}
                          className="text-xs p-1 h-6 text-blue-600 hover:text-blue-800 whitespace-nowrap"
                          title="Set as primary"
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage(img)}
                        className="text-xs p-1 h-6 text-red-600 hover:text-red-800 whitespace-nowrap"
                        title="Remove image"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-dealership-primary hover:bg-dealership-primary/90"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}