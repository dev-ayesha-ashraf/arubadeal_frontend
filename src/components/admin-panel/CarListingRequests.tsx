import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, X, Clock, Loader2, Search, Filter, Eye, Car, User, Calendar, Gauge, Palette, Cog, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw, Edit } from "lucide-react";
import { toast } from "sonner";
import EditVehicleModal from "../common/EditVehicleModal";
import StatsCard from "../common/StatsCard";
import PageHeader from "../common/PageHeader";
import ListingDetailsDialog from "../common/ListingDetailsDialog";
import LayoutToggle from "../common/LayoutToggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface CarListing {
  id: string;
  title: string;
  make: { id: string; name: string; slug: string };
  model: string;
  year: number;
  body_type: { id: string; name: string; slug: string };
  fuel_type: { id: string; name: string };
  transmission: { id: string; name: string };
  badge: { id: string; name: string };
  seats: number;
  condition: string;
  engine_type: string;
  price: number;
  mileage: string;
  status: "Pending" | "In Review" | "Approved" | "Decliend";
  color: string;
  vehicle_id: string;
  slug: string;
  is_active: boolean;
  is_sold: boolean;
  is_featured: boolean;
  features: any[];
  images: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
    position: number;
    is_display: boolean;
  }>;
  dealer: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  updated: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  location: string;
  created_at: string;
  updated_at: string;
  description?: string;
  vin?: string;
  min_price: number;
}

interface Seller {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

interface PaginatedResponse {
  total_items: number;
  total_pages: number;
  page: number;
  size: number;
  items: CarListing[];
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface Option {
  id: string;
  name: string;
}

interface Lookups {
  makes: Option[];
  fueltypes: Option[];
  transmissions: Option[];
  bodytypes: Option[];
  badges: Option[];
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const generatePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 4) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePages();
  const baseStyle =
    "w-8 h-8 p-0 text-sm rounded-md transition-colors flex items-center justify-center";

  const activeStyle =
    "bg-[rgb(206,131,57)] text-white hover:bg-[rgb(196,121,47)] shadow";
  const inactiveStyle =
    "border border-[rgb(206,131,57)] text-[rgb(206,131,57)] hover:bg-[rgb(206,131,57,0.1)]";

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap mt-6">
      <button
        className={`${baseStyle} ${inactiveStyle}`}
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>
      <button
        className={`${baseStyle} ${inactiveStyle}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, idx) =>
        typeof page === "number" ? (
          <button
            key={idx}
            onClick={() => onPageChange(page)}
            className={`${baseStyle} ${page === currentPage ? activeStyle : inactiveStyle}`}
          >
            {page}
          </button>
        ) : (
          <span
            key={idx}
            className="w-8 h-8 flex items-center justify-center text-sm text-gray-500"
          >
            ...
          </span>
        )
      )}

      <button
        className={`${baseStyle} ${inactiveStyle}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        className={`${baseStyle} ${inactiveStyle}`}
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const API_URL = import.meta.env.VITE_API_URL;
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

const CarListingRequests = () => {
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<CarListing | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "Pending",
    page: 1,
    size: 20,
    seller_search: ""
  });
  const [allListings, setAllListings] = useState<CarListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CarListing[]>([]);
  const [pagination, setPagination] = useState({
    total_items: 0,
    total_pages: 0,
    page: 1,
    size: 20
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<CarListing | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [lookups, setLookups] = useState<Lookups>({
    makes: [],
    fueltypes: [],
    transmissions: [],
    bodytypes: [],
    badges: [],
  });

  const applyFilters = (listings: CarListing[], searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredListings(listings);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();

    const filtered = listings.filter(listing => {
      const fullName = `${listing.dealer.first_name} ${listing.dealer.last_name}`.toLowerCase();
      const firstName = listing.dealer.first_name.toLowerCase();
      const lastName = listing.dealer.last_name.toLowerCase();
      return fullName.includes(searchLower) ||
        firstName.includes(searchLower) ||
        lastName.includes(searchLower) ||
        firstName.startsWith(searchLower) ||
        lastName.startsWith(searchLower);
    });

    setFilteredListings(filtered);
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      params.append("page", filters.page.toString());
      params.append("size", filters.size.toString());

      const response = await fetch(`${API_URL}/seller_listing/get-pending-list-admin?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) throw new Error("Failed to fetch listings");

      const data: PaginatedResponse = await response.json();
      setAllListings(data.items);
      setListings(data.items);
      applyFilters(data.items, filters.seller_search);

      setPagination({
        total_items: data.total_items,
        total_pages: data.total_pages,
        page: data.page,
        size: data.size
      });
    } catch (error) {
      toast.error("Failed to load listings");
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [makesRes, fueltypesRes, transmissionsRes, bodytypesRes, badgesRes] = await Promise.all([
        fetch(`${API_URL}/make/get_all`),
        fetch(`${API_URL}/fueltype/get_all`),
        fetch(`${API_URL}/transmission/get_all`),
        fetch(`${API_URL}/bodytype/get_all`),
        fetch(`${API_URL}/badge/get_all`),
      ]);

      const [makes, fueltypes, transmissions, bodytypes, badges] = await Promise.all([
        makesRes.json(),
        fueltypesRes.json(),
        transmissionsRes.json(),
        bodytypesRes.json(),
        badgesRes.json(),
      ]);

      setLookups({
        makes,
        fueltypes,
        transmissions,
        bodytypes,
        badges,
      });
    } catch (err) {
      console.error("Error fetching lookups:", err);
    }
  };

  const updateStatus = async (id: string, newStatus: CarListing["status"]) => {
    try {
      setUpdating(id);
      const response = await fetch(`${API_URL}/seller_listing/status-update?id=${id}&status=${newStatus}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) throw new Error("Failed to update status");

      const updatedListing: CarListing = await response.json();

      setListings(prev => prev.map(listing =>
        listing.id === id ? updatedListing : listing
      ));

      setAllListings(prev => prev.map(listing =>
        listing.id === id ? updatedListing : listing
      ));

      if (selectedListing?.id === id) {
        setSelectedListing(updatedListing);
      }

      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
      console.error("Error updating status:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleViewDetails = (listing: CarListing) => {
    setSelectedListing(listing);
    setIsDialogOpen(true);
  };

  const handleEdit = (listing: CarListing) => {
    setEditingListing(listing);
    setEditModalOpen(true);
  };

  const handleSaved = () => {
    fetchListings();
    if (selectedListing?.id === editingListing?.id) {
      setSelectedListing(null);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchLookups();
  }, [filters.status, filters.page, filters.size]);

  useEffect(() => {
    if (allListings.length > 0) {
      applyFilters(allListings, filters.seller_search);
    }
  }, [filters.seller_search, allListings]);

  const getStatusIcon = (status: CarListing["status"]) => {
    switch (status) {
      case "Approved": return <Check className="w-4 h-4" />;
      case "Decliend": return <X className="w-4 h-4" />;
      case "In Review": return <Loader2 className="w-4 h-4 animate-spin" />;
      case "Pending": return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: CarListing["status"]) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800 border-green-200";
      case "Decliend": return "bg-red-100 text-red-800 border-red-200";
      case "In Review": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Pending": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price).replace('$', '');
  };

  const getPrimaryImage = (images: CarListing["images"]) => {
    if (!images || images.length === 0) return null;
    const primary = images.find(img => img.is_primary);
    return primary || images[0];
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return `${MEDIA_URL}/cars/placeholder-image.png`;

    if (imagePath.startsWith('http')) return imagePath;

    return `${MEDIA_URL}${imagePath}`;
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Car Listing Requests"
          description="Manage and review car listing submissions from sellers"
          icon={ClipboardList}
        />

        {/* Filters Card */}
        <Card className="mb-8 shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
                >
                  <SelectTrigger className="w-[180px] bg-white border-slate-300">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Decliend">Declined</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 w-full sm:w-64">
                  <Search className="w-5 h-5 text-[rgb(206,131,57)]" />
                  <div className="relative flex-1">
                    <Input
                      placeholder="Search by seller name..."
                      value={filters.seller_search}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        seller_search: e.target.value,
                        page: 1
                      }))}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(206,131,57)] focus:border-transparent bg-white text-slate-900"
                    />
                    {filters.seller_search && (
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, seller_search: "" }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={fetchListings}
                className="bg-[rgb(206,131,57)] hover:bg-[rgb(196,121,47)] text-white shadow-sm transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <LayoutToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Listings"
            value={pagination.total_items}
            icon={Car}
            variant="blue"
          />
          <StatsCard
            title="Pending Review"
            value={filteredListings.filter(l => l.status === "Pending").length}
            icon={Clock}
            variant="orange"
          />
          <StatsCard
            title="Approved"
            value={filteredListings.filter(l => l.status === "Approved").length}
            icon={Check}
            variant="green"
          />
          <StatsCard
            title="Declined"
            value={filteredListings.filter(l => l.status === "Decliend").length}
            icon={X}
            variant="purple"
          />
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[rgb(206,131,57)] mx-auto mb-4" />
              <p className="text-slate-600">Loading car listings...</p>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {filteredListings.map((listing) => {
                const primaryImage = getPrimaryImage(listing.images);
                const imageUrl = getImageUrl(primaryImage?.image_url || null);

                return (
                  <Card key={listing.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-slate-200 bg-white group relative">
                    <Button
                      onClick={() => handleEdit(listing)}
                      className="absolute top-3 left-3 z-10 bg-white/90 hover:bg-white text-gray-700 border border-gray-300 shadow-sm"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `${MEDIA_URL}/cars/placeholder-image.png`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <Badge className={`absolute top-3 right-3 border-0 shadow-sm ${getStatusColor(listing.status)}`}>
                        <span className="flex items-center gap-1 text-xs font-medium">
                          {getStatusIcon(listing.status)}
                          {listing.status}
                        </span>
                      </Badge>
                    </div>

                    <CardContent className="p-5">
                      {/* Title and Basic Info */}
                      <div className="mb-4">
                        <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-[rgb(206,131,57)] transition-colors">
                          {listing.title}
                        </h3>
                        <p className="text-slate-600 text-sm mb-3">
                          {listing.year} • {listing.make.name} {listing.model}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex flex-col gap-1 text-slate-700">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-900">AWG {formatPrice(listing.price)}</span>
                          </div>
                          {listing.min_price && listing.min_price < listing.price && (
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-slate-500">Min:</span>
                              <span className="font-medium text-[rgb(206,131,57)]">AWG {formatPrice(listing.min_price)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-slate-700">
                          <Gauge className="w-4 h-4 text-blue-600" />
                          <span>{listing.mileage}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Car className="w-4 h-4 text-purple-600" />
                          <span className="truncate">{listing.body_type.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Palette className="w-4 h-4 text-orange-600" />
                          <span className="truncate">{listing.color}</span>
                        </div>
                      </div>

                      {/* Seller Info */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700 font-medium">
                            {listing.dealer.first_name} {listing.dealer.last_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">
                            {new Date(listing.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 transition-colors"
                          onClick={() => handleViewDetails(listing)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-[rgb(206,131,57)] hover:bg-[rgb(196,121,47)] text-white shadow-sm transition-colors"
                              disabled={updating === listing.id}
                            >
                              {updating === listing.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Status"
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white border-slate-200 shadow-lg min-w-[140px]">
                            {["Pending", "In Review", "Approved", "Decliend"].map((status) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() => updateStatus(listing.id, status as CarListing["status"])}
                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 text-slate-700"
                              >
                                {getStatusIcon(status as CarListing["status"])}
                                {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <Card className="shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <Pagination
                    currentPage={filters.page}
                    totalPages={pagination.total_pages}
                    onPageChange={handlePageChange}
                  />
                  <div className="text-center text-sm text-slate-600 mt-4">
                    Showing {filteredListings.length} of {pagination.total_items} listings •
                    Page {filters.page} of {pagination.total_pages}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            <div className="rounded-md border bg-white mb-8 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredListings.map((listing) => {
                    const primaryImage = getPrimaryImage(listing.images);
                    const imageUrl = getImageUrl(primaryImage?.image_url || null);
                    return (
                      <TableRow key={listing.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-12 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                              <img
                                src={imageUrl}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `${MEDIA_URL}/cars/placeholder-image.png`;
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{listing.title}</div>
                              <div className="text-sm text-slate-500">{listing.year} • {listing.mileage}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">AWG {formatPrice(listing.price)}</div>
                          {listing.min_price && listing.min_price < listing.price && (
                            <div className="text-xs text-slate-500">Min: {formatPrice(listing.min_price)}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-slate-900">{listing.dealer.first_name} {listing.dealer.last_name}</div>
                            <div className="text-slate-500 text-xs">{listing.dealer.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-600">
                            {new Date(listing.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`border-0 shadow-sm ${getStatusColor(listing.status)}`}>
                            <span className="flex items-center gap-1 text-xs font-medium">
                              {getStatusIcon(listing.status)}
                              {listing.status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => handleEdit(listing)}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => handleViewDetails(listing)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  className="h-8 px-2 bg-[rgb(206,131,57)] hover:bg-[rgb(196,121,47)] text-white shadow-sm transition-colors"
                                  disabled={updating === listing.id}
                                >
                                  {updating === listing.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    "Status"
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-white border-slate-200 shadow-lg min-w-[140px]">
                                {["Pending", "In Review", "Approved", "Decliend"].map((status) => (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() => updateStatus(listing.id, status as CarListing["status"])}
                                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 text-slate-700"
                                  >
                                    {getStatusIcon(status as CarListing["status"])}
                                    {status}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {pagination.total_pages > 1 && (
              <Card className="shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <Pagination
                    currentPage={filters.page}
                    totalPages={pagination.total_pages}
                    onPageChange={handlePageChange}
                  />
                  <div className="text-center text-sm text-slate-600 mt-4">
                    Showing {filteredListings.length} of {pagination.total_items} listings •
                    Page {filters.page} of {pagination.total_pages}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!loading && filteredListings.length === 0 && (
          <Card className="text-center py-16 shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardContent>
              <Car className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No listings found</h3>
              <p className="text-slate-600 mb-4">Try adjusting your filters or check back later</p>
              <Button
                onClick={() => setFilters(prev => ({ ...prev, status: "Pending", page: 1, seller_search: "" }))}
                className="bg-[rgb(206,131,57)] hover:bg-[rgb(196,121,47)] text-white"
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        )}

        <ListingDetailsDialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          data={selectedListing}
          extraActions={
            selectedListing && (
              <>
                <Button
                  onClick={() => {
                    setIsDialogOpen(false);
                    handleEdit(selectedListing);
                  }}
                  className="flex-1 bg-[rgb(206,131,57)] hover:bg-[rgb(196,121,47)] text-white shadow-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Listing
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="flex-1 bg-[rgb(206,131,57)] hover:bg-[rgb(196,121,47)] text-white shadow-sm"
                      disabled={updating === selectedListing.id}
                    >
                      {updating === selectedListing.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Update Status"
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border-slate-200 shadow-lg min-w-[160px]">
                    {["Pending", "In Review", "Approved", "Decliend"].map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => updateStatus(selectedListing.id, status as CarListing["status"])}
                        className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 text-slate-700"
                      >
                        {getStatusIcon(status as CarListing["status"])}
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )
          }
        />

        <EditVehicleModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          vehicle={editingListing}
          onSaved={handleSaved}
          lookups={lookups}
        />
      </div>
    </div>
  );
};

export default CarListingRequests;