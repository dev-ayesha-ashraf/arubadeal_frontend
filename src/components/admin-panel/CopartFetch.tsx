import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Search,
    Zap,
    Loader2,
    RefreshCw,
    Car,
    Globe,
    AlertCircle,
    Save,
    Edit2,
    Filter,
    ArrowRight,
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Check,
    X,
    Upload,
    FileSpreadsheet,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import PageHeader from "../common/PageHeader";
import StatsCard from "../common/StatsCard";
import LayoutToggle from "../common/LayoutToggle";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    const generatePages = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 4) pages.push("...");
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 3) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    const pages = generatePages();
    const baseStyle = "w-8 h-8 p-0 text-sm rounded-md transition-colors flex items-center justify-center";
    const activeStyle = "bg-dealership-primary text-white hover:bg-dealership-primary/90 shadow";
    const inactiveStyle = "border border-slate-200 text-slate-600 hover:bg-slate-100";

    return (
        <div className="flex items-center justify-center gap-2 flex-wrap mt-8 pb-4">
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
                    <span key={idx} className="w-8 h-8 flex items-center justify-center text-sm text-slate-400">
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

interface TPListing {
    id: string;
    title: string;
    make: string;
    model: string;
    year: string;
    price: string;
    miles: string;
    body_style: string;
    image: string;
    slug: string;
    vdp: string;
    dealer: string;
    is_active: boolean;
    status?: string;
}

interface SavedFilter {
    id: string;
    title: string;
    limit: number;
    Year?: string;
    Make?: string;
    "Fuel Type"?: string;
    Transmission?: string;
    "Sale Title Type"?: string;
    "Est. Retail Value"?: string;
}

const CopartFetch = () => {
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [listings, setListings] = useState<TPListing[]>([]);
    const [viewMode, setViewMode] = useState<"grid" | "table">("table");
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        count: 0,
        makes: 0
    });
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [selectedListingForDetail, setSelectedListingForDetail] = useState<TPListing | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [activeView, setActiveView] = useState<"dashboard" | "saved-filters">("dashboard");
    const [activeTab, setActiveTab] = useState("filters");

    const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
    const [isSavingFilter, setIsSavingFilter] = useState(false);
    const [filterTitle, setFilterTitle] = useState("");
    const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Bulk Update State
    const [isBulkUpdateDialogOpen, setIsBulkUpdateDialogOpen] = useState(false);
    const [bulkStatus, setBulkStatus] = useState<string>("Approved");
    const [bulkIsActive, setBulkIsActive] = useState<boolean>(true);
    const [bulkIsFeatured, setBulkIsFeatured] = useState<boolean>(false);

    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 0,
        page: 1,
        size: 20
    });

    // Form state for fetch API
    const [fetchParams, setFetchParams] = useState({
        limit: 5,
        Year: "",
        Make: "",
        fuel_type: "",
        Transmission: "",
        sale_title_type: "",
        est_retail_value: ""
    });

    const fetchExistingListings = async (page = pagination.page) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/copart_listing/admin?page=${page}&size=${pagination.size}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
                },
            });
            if (!res.ok) throw new Error("Failed to fetch existing listings");
            const data = await res.json();

            const mappedItems = (data.items || []).map((car: any) => {
                const primaryImage = car.images?.find((i: any) => i.is_primary) || car.images?.[0];
                return {
                    id: car.id,
                    title: `${car.year} ${car.make} ${car.model_detail || car.model_group}`,
                    make: car.make || "Unknown",
                    model: car.model_detail || car.model_group || "Unknown",
                    year: car.year,
                    price: car.est_retail_value || "0",
                    miles: car.odometer,
                    body_style: car.body_style || "Unknown",
                    image: primaryImage ? (primaryImage.image_url?.startsWith("http") ? primaryImage.image_url : `${import.meta.env.VITE_MEDIA_URL}${primaryImage.image_url}`) : "",
                    slug: car.id,
                    vdp: "", // Copart VDP link logic if available
                    dealer: `Copart - ${car.yard_name || car.yard_number}`,
                    is_active: car.is_active !== false,
                    status: car.status || "Pending"
                };
            });

            setListings(mappedItems);
            const totalPrice = mappedItems.reduce((sum: number, car: TPListing) => sum + (Number(car.price) || 0), 0);
            setStats({
                total: totalPrice,
                count: data.total_items || 0,
                makes: new Set(mappedItems.map((i: TPListing) => i.make)).size
            });
            setPagination({
                total_items: data.total_items || 0,
                total_pages: data.total_pages || 0,
                page: data.page || page,
                size: data.size || pagination.size
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to load Copart listings");
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedFilters = async () => {
        try {
            const res = await fetch(`${API_URL}/copart_listing/filters`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
                },
            });
            if (!res.ok) throw new Error("Failed to fetch saved filters");
            const data = await res.json();
            setSavedFilters(data.items || []);
        } catch (error) {
            console.error("Error fetching filters:", error);
        }
    };

    const handleSaveFilter = async () => {
        if (!filterTitle.trim()) {
            toast.error("Please enter a filter title");
            return;
        }

        try {
            setIsSavingFilter(true);
            const requestBody: any = {
                title: filterTitle,
                limit: Number(fetchParams.limit),
                "Year": fetchParams.Year,
                "Make": fetchParams.Make,
                "Fuel Type": fetchParams.fuel_type,
                "Transmission": fetchParams.Transmission,
                "Sale Title Type": fetchParams.sale_title_type,
                "Est. Retail Value": fetchParams.est_retail_value,
            };

            // Clean up empty string values from requestBody
            for (const key in requestBody) {
                if (requestBody[key] === "" || requestBody[key] === null || requestBody[key] === undefined) {
                    delete requestBody[key];
                }
            }

            const url = selectedFilterId
                ? `${API_URL}/copart_listing/filters/${selectedFilterId}`
                : `${API_URL}/copart_listing/filters`;
            const method = selectedFilterId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error("Failed to save filter");

            toast.success(selectedFilterId ? "Filter updated!" : "Filter saved!");
            setShowSaveDialog(false);
            setFilterTitle("");
            setSelectedFilterId(null);
            fetchSavedFilters();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSavingFilter(false);
        }
    };

    const handleDeleteFilter = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/copart_listing/filters/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
                },
            });

            if (!response.ok) {
                if (response.status !== 204 && response.status !== 200) {
                    throw new Error("Failed to delete filter");
                }
            }

            toast.success("Filter deleted!");
            fetchSavedFilters();
            if (selectedFilterId === id) {
                setSelectedFilterId(null);
                setFilterTitle("");
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const getFilterSummary = (filter: SavedFilter) => {
        const parts = [];
        if (filter.Year) parts.push(filter.Year);
        if (filter.Make) parts.push(filter.Make);
        if (filter["Fuel Type"]) parts.push(filter["Fuel Type"]);
        if (filter.Transmission) parts.push(filter.Transmission);
        if (filter["Sale Title Type"]) parts.push(filter["Sale Title Type"]);
        if (filter["Est. Retail Value"]) parts.push(filter["Est. Retail Value"]);
        if (filter.limit) parts.push(`Limit: ${filter.limit}`);

        return parts.join(" • ") || "No specific criteria";
    };

    const handleClearForm = () => {
        setFetchParams({
            limit: 5,
            Year: "",
            Make: "",
            fuel_type: "",
            Transmission: "",
            sale_title_type: "",
            est_retail_value: ""
        });
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setSelectedFilterId(null);
        setFilterTitle("");
        toast.info("Form cleared");
    };

    const applyFilter = (filter: SavedFilter) => {
        setFetchParams({
            limit: filter.limit || 5,
            Year: filter.Year || "",
            Make: filter.Make || "",
            fuel_type: filter["Fuel Type"] || "",
            Transmission: filter.Transmission || "",
            sale_title_type: filter["Sale Title Type"] || "",
            est_retail_value: filter["Est. Retail Value"] || ""
        });

        setSelectedFilterId(filter.id);
        setFilterTitle(filter.title);
        toast.info(`Applied filter: ${filter.title}`);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleExecuteFetch = async () => {
        if (!file) {
            toast.error("Please upload a CSV file");
            return;
        }

        try {
            setFetching(true);
            const formData = new FormData();
            formData.append("file", file);

            const queryParams = new URLSearchParams();
            if (fetchParams.limit) queryParams.append("limit", String(fetchParams.limit));
            if (fetchParams.Year) queryParams.append("Year", fetchParams.Year);
            if (fetchParams.Make) queryParams.append("Make", fetchParams.Make);
            if (fetchParams.fuel_type) queryParams.append("fuel_type", fetchParams.fuel_type);
            if (fetchParams.Transmission) queryParams.append("Transmission", fetchParams.Transmission);
            if (fetchParams.sale_title_type) queryParams.append("sale_title_type", fetchParams.sale_title_type);
            if (fetchParams.est_retail_value) queryParams.append("est_retail_value", fetchParams.est_retail_value);

            const response = await fetch(`${API_URL}/copart_listing/fetch?${queryParams.toString()}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData?.detail?.[0]?.msg || "Fetch failed");
            }

            const result = await response.json();
            toast.success(result.message || "Copart listings processing started in the background.");

            // Wait a bit and refresh since it's a background process
            setTimeout(fetchExistingListings, 3000);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchExistingListings(1);
        fetchSavedFilters();
    }, []);

    const handleBulkUpdate = async () => {
        if (selectedIds.size === 0) {
            toast.error("Please select listings to update");
            return;
        }

        try {
            setIsDeleting(true); // Using isDeleting as loading state
            const ids = Array.from(selectedIds);

            const queryParams = new URLSearchParams({
                is_active: String(bulkIsActive),
                is_featured: String(bulkIsFeatured),
                status: bulkStatus
            });

            // Using Copart admin update endpoint which likely follows same pattern
            const response = await fetch(`${API_URL}/copart_listing/admin?${queryParams.toString()}`, {
                method: "PUT",
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
                },
                body: JSON.stringify(ids),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData?.detail || "Failed to update listings");
            }

            toast.success("Listings updated successfully");
            setIsBulkUpdateDialogOpen(false);
            setSelectedIds(new Set());
            fetchExistingListings(pagination.page);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) {
            toast.error("Please select listings to delete");
            return;
        }

        try {
            setIsDeleting(true);
            const ids = Array.from(selectedIds);
            const response = await fetch(`${API_URL}/copart_listing/admin`, {
                method: "DELETE",
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
                },
                body: JSON.stringify(ids),
            });

            if (!response.ok) {
                if (response.status !== 204 && response.status !== 200) {
                    throw new Error("Failed to delete listings");
                }
            }

            toast.success(`Successfully deleted ${selectedIds.size} listing(s)`);
            setSelectedIds(new Set());
            fetchExistingListings(pagination.page);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleActive = async (listingId: string, newIsActive: boolean) => {
        try {
            setIsUpdating(listingId);

            const queryParams = new URLSearchParams({
                is_active: String(newIsActive),
                is_featured: 'false'
            });

            const response = await fetch(`${API_URL}/copart_listing/admin?${queryParams.toString()}`, {
                method: "PUT",
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
                },
                body: JSON.stringify([listingId]),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData?.detail || "Failed to update listing");
            }

            setListings(listings.map(l =>
                l.id === listingId ? { ...l, is_active: newIsActive } : l
            ));

            toast.success(newIsActive ? "Listing activated" : "Listing deactivated");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsUpdating(null);
        }
    };

    const toggleListingSelection = (id: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedIds(newSelection);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredListings.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredListings.map(l => l.id)));
        }
    };

    const filteredListings = listings.filter(l =>
        l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <PageHeader
                    title="Fetch Copart Listings"
                    description="Sync Arudeal database with Copart inventory"
                    icon={Zap}
                />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
                    <TabsList className="inline-flex items-center bg-transparent p-0 h-auto mb-6 w-full border-b justify-around">
                        <TabsTrigger
                            value="filters"
                            className="relative px-4 pb-3 pt-2 bg-transparent data-[state=active]:text-dealership-primary data-[state=active]:shadow-none hover:text-dealership-primary/80 transition-colors duration-200 group"
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                <span className="relative">
                                    Fetch Filters
                                    <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-dealership-primary transition-all duration-300 ease-out transform scale-x-0 group-data-[state=active]:scale-x-100 origin-center" />
                                </span>
                                {savedFilters.length > 0 && (
                                    <Badge variant="secondary" className="ml-2">
                                        {savedFilters.length}
                                    </Badge>
                                )}
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="cars"
                            className="relative px-4 pb-3 pt-2 bg-transparent data-[state=active]:text-dealership-primary data-[state=active]:shadow-none hover:text-dealership-primary/80 transition-colors duration-200 group"
                        >
                            <div className="flex items-center gap-2">
                                <Car className="w-4 h-4" />
                                <span className="relative">
                                    Synced Copart Cars
                                    <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-dealership-primary transition-all duration-300 ease-out transform scale-x-0 group-data-[state=active]:scale-x-100 origin-center" />
                                </span>
                                {stats.count > 0 && (
                                    <Badge variant="secondary" className="ml-2">
                                        {stats.count}
                                    </Badge>
                                )}
                            </div>
                        </TabsTrigger>
                    </TabsList>

                    {activeView === "dashboard" ? (
                        <>
                            <TabsContent value="filters" className="space-y-8 animate-in fade-in-50 duration-500">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div
                                        onClick={() => setActiveView("saved-filters")}
                                        className="cursor-pointer transition-transform hover:scale-[1.02]"
                                    >
                                        <StatsCard
                                            title="Saved Filters"
                                            value={savedFilters.length}
                                            icon={Save}
                                            variant="blue"
                                            description="Click to manage all filters"
                                        />
                                    </div>
                                    <StatsCard
                                        title="Current Applied"
                                        value={selectedFilterId ? filterTitle : "None"}
                                        icon={Zap}
                                        variant="green"
                                    />
                                    <StatsCard
                                        title="Fetch Limit"
                                        value={fetchParams.limit}
                                        icon={ArrowRight}
                                        variant="orange"
                                    />
                                </div>

                                {/* Fetch Form Card */}
                                <Card className="border-slate-200 shadow-sm overflow-hidden">
                                    <div className="bg-dealership-primary/5 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                                        <Filter className="w-5 h-5 text-dealership-primary" />
                                        <h2 className="font-semibold text-slate-800">Fetch Configuration</h2>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Make</label>
                                                <Input
                                                    placeholder="e.g. Toyota"
                                                    value={fetchParams.Make}
                                                    onChange={(e) => setFetchParams({ ...fetchParams, Make: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Year</label>
                                                <Input
                                                    placeholder="e.g. 2020"
                                                    value={fetchParams.Year}
                                                    onChange={(e) => setFetchParams({ ...fetchParams, Year: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Transmission</label>
                                                <Input
                                                    placeholder="e.g. Automatic"
                                                    value={fetchParams.Transmission}
                                                    onChange={(e) => setFetchParams({ ...fetchParams, Transmission: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Fuel Type</label>
                                                <Input
                                                    placeholder="e.g. Gas"
                                                    value={fetchParams.fuel_type}
                                                    onChange={(e) => setFetchParams({ ...fetchParams, fuel_type: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Sale Title Type</label>
                                                <Input
                                                    placeholder="e.g. CT"
                                                    value={fetchParams.sale_title_type}
                                                    onChange={(e) => setFetchParams({ ...fetchParams, sale_title_type: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Est. Retail Value</label>
                                                <Input
                                                    placeholder="e.g. 10000-30000"
                                                    value={fetchParams.est_retail_value}
                                                    onChange={(e) => setFetchParams({ ...fetchParams, est_retail_value: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Limit</label>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 5"
                                                    value={fetchParams.limit}
                                                    onChange={(e) => setFetchParams({ ...fetchParams, limit: parseInt(e.target.value) || 5 })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">CSV File <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <Input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept=".csv"
                                                        onChange={handleFileChange}
                                                        className="pl-10"
                                                    />
                                                    <FileSpreadsheet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex justify-end gap-3">
                                            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="border-dealership-primary text-dealership-primary hover:bg-dealership-primary/10"
                                                        onClick={() => {
                                                            if (!selectedFilterId) {
                                                                setFilterTitle("");
                                                            }
                                                        }}
                                                    >
                                                        <Save className="w-4 h-4 mr-2" />
                                                        {selectedFilterId ? "Update Filter" : "Save Filter"}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>{selectedFilterId ? "Update Filter" : "Save New Filter"}</DialogTitle>
                                                        <DialogDescription>
                                                            Give this filter a name so you can easily reuse it later.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">Filter Title</label>
                                                            <Input
                                                                placeholder="e.g. Toyota Clean Title"
                                                                value={filterTitle}
                                                                onChange={(e) => setFilterTitle(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
                                                        <Button
                                                            onClick={handleSaveFilter}
                                                            disabled={isSavingFilter}
                                                            className="bg-dealership-primary"
                                                        >
                                                            {isSavingFilter ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Filter"}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>

                                            <Button
                                                onClick={handleExecuteFetch}
                                                disabled={fetching}
                                                className="bg-dealership-primary hover:bg-dealership-primary/90 text-white min-w-[150px]"
                                            >
                                                {fetching ? (
                                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Executing...</>
                                                ) : (
                                                    <><Zap className="w-4 h-4 mr-2" /> Execute Sync</>
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={handleClearForm}
                                                className="text-slate-500"
                                            >
                                                Clear Form
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Saved Filters Section */}
                                {savedFilters.length > 0 && (
                                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                                        <div className="bg-blue-50/50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Save className="w-5 h-5 text-blue-600" />
                                                <h2 className="font-semibold text-slate-800">Saved Filters</h2>
                                            </div>
                                            <Badge variant="outline" className="bg-white">{savedFilters.length} Filters</Badge>
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {savedFilters.map((filter) => (
                                                    <div
                                                        key={filter.id}
                                                        className={`p-4 rounded-lg border transition-all cursor-pointer group relative ${selectedFilterId === filter.id
                                                            ? "border-dealership-primary bg-dealership-primary/5 shadow-sm"
                                                            : "border-slate-200 hover:border-dealership-primary/50 hover:bg-slate-50"
                                                            }`}
                                                        onClick={() => applyFilter(filter)}
                                                    >
                                                        <div className="pr-12">
                                                            <h3 className="font-semibold text-slate-800 truncate">{filter.title}</h3>
                                                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                                                {getFilterSummary(filter)}
                                                            </p>
                                                        </div>
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    applyFilter(filter);
                                                                    setShowSaveDialog(true);
                                                                }}
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Delete Filter?</DialogTitle>
                                                                        <DialogDescription>
                                                                            Are you sure you want to delete "{filter.title}"? This action cannot be undone.
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <DialogFooter className="gap-2 sm:gap-0">
                                                                        <DialogTrigger asChild>
                                                                            <Button variant="outline">Cancel</Button>
                                                                        </DialogTrigger>
                                                                        <Button variant="destructive" onClick={() => handleDeleteFilter(filter.id)}>Delete</Button>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                        {selectedFilterId === filter.id && (
                                                            <div className="absolute -top-2 -right-2 bg-dealership-primary text-white rounded-full p-0.5">
                                                                <Zap className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="cars" className="space-y-8 animate-in fade-in-50 duration-500">
                                {/* Functional Stats Grid for Cars */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div
                                        onClick={() => {
                                            handleExecuteFetch();
                                            setActiveTab("filters");
                                        }}
                                        className={`cursor-pointer transition-transform hover:scale-[1.02] ${fetching ? 'opacity-70 pointer-events-none' : ''}`}
                                    >
                                        <StatsCard
                                            title="Apply Filter / Sync"
                                            value={fetching ? "Syncing..." : "Run Fetch Now"}
                                            icon={Zap}
                                            variant="blue"
                                            description={fetching ? "Processing in background" : "Sync new listings from Copart"}
                                        />
                                    </div>
                                    <div
                                        onClick={() => setActiveView("saved-filters")}
                                        className="cursor-pointer transition-transform hover:scale-[1.02]"
                                    >
                                        <StatsCard
                                            title="Saved Filters"
                                            value={savedFilters.length}
                                            icon={Save}
                                            variant="green"
                                            description="Click to manage filter list"
                                        />
                                    </div>
                                    <StatsCard
                                        title="Unique Makes"
                                        value={stats.makes}
                                        icon={Globe}
                                        variant="orange"
                                    />
                                </div>

                                {/* List Header & Search */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="relative w-full md:w-96">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                placeholder="Search synced cars..."
                                                className="pl-10"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Button variant="outline" onClick={() => fetchExistingListings(pagination.page)} size="sm">
                                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                                Refresh List
                                            </Button>
                                            <LayoutToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                                        </div>
                                    </div>

                                    {/* Bulk Actions Bar */}
                                    {selectedIds.size > 0 && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-slate-700">
                                                    {selectedIds.size} listing{selectedIds.size !== 1 ? 's' : ''} selected
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedIds(new Set())}
                                                    className="border-blue-300 hover:bg-white"
                                                >
                                                    Clear Selection
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={handleBulkDelete}
                                                    disabled={isDeleting}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    {isDeleting ? (
                                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                                                    ) : (
                                                        <><Trash2 className="w-4 h-4 mr-2" /> Delete Selected</>
                                                    )}
                                                </Button>

                                                <Dialog open={isBulkUpdateDialogOpen} onOpenChange={setIsBulkUpdateDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" className="bg-dealership-primary hover:bg-dealership-primary/90">
                                                            <Edit2 className="w-4 h-4 mr-2" />
                                                            Bulk Update
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Update {selectedIds.size} Listings</DialogTitle>
                                                            <DialogDescription>
                                                                Apply status and visibility changes to all selected listings.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-6 py-4">
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id="bulk-active"
                                                                    checked={bulkIsActive}
                                                                    onCheckedChange={(c) => setBulkIsActive(!!c)}
                                                                />
                                                                <label htmlFor="bulk-active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                    Mark as Active
                                                                </label>
                                                            </div>

                                                            <div className="flex flex-col space-y-2">
                                                                <label htmlFor="bulk-status" className="text-sm font-medium leading-none">
                                                                    Set Status
                                                                </label>
                                                                <select
                                                                    id="bulk-status"
                                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    value={bulkStatus || ""}
                                                                    onChange={(e) => setBulkStatus(e.target.value)}
                                                                >
                                                                    <option value="" disabled>Select Status</option>
                                                                    <option value="Approved">Approved</option>
                                                                    <option value="Pending">Pending</option>
                                                                    <option value="In Review">In Review</option>
                                                                    <option value="Decline">Decline</option>
                                                                </select>
                                                            </div>

                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id="bulk-featured"
                                                                    checked={bulkIsFeatured}
                                                                    onCheckedChange={(c) => setBulkIsFeatured(!!c)}
                                                                />
                                                                <label htmlFor="bulk-featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                    Mark as Featured
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setIsBulkUpdateDialogOpen(false)}>Cancel</Button>
                                                            <Button onClick={handleBulkUpdate} disabled={isDeleting} className="bg-dealership-primary">
                                                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Listings"}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
                                        <Loader2 className="w-10 h-10 animate-spin text-dealership-primary mb-4" />
                                        <p className="text-slate-500">Loading synced listings...</p>
                                    </div>
                                ) : filteredListings.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                                        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-slate-900">No synced listings found</h3>
                                        <p className="text-slate-500">Try executing a sync or adjusting your search filters.</p>
                                    </div>
                                ) : viewMode === "table" ? (
                                    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50">
                                                    <TableHead className="w-12">
                                                        <Checkbox
                                                            checked={selectedIds.size === filteredListings.length && filteredListings.length > 0}
                                                            onCheckedChange={toggleSelectAll}
                                                            className="rounded"
                                                        />
                                                    </TableHead>
                                                    <TableHead className="w-[100px]">Image</TableHead>
                                                    <TableHead>Vehicle Details</TableHead>
                                                    <TableHead>Year</TableHead>
                                                    <TableHead>Price (USD)</TableHead>
                                                    <TableHead>Mileage</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Source</TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredListings.map((listing) => (
                                                    <TableRow key={listing.id} className={selectedIds.has(listing.id) ? "bg-blue-50" : ""}>
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedIds.has(listing.id)}
                                                                onCheckedChange={() => toggleListingSelection(listing.id)}
                                                                className="rounded"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <img
                                                                src={listing.image || "/fallback.jpg"}
                                                                alt={listing.title}
                                                                className="w-16 h-12 object-cover rounded shadow-sm"
                                                                onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium text-slate-900">{listing.title}</div>
                                                            <div className="text-xs text-slate-500 uppercase">{listing.make} • {listing.model}</div>
                                                        </TableCell>
                                                        <TableCell>{listing.year}</TableCell>
                                                        <TableCell className="font-semibold text-dealership-primary">
                                                            ${Number(listing.price).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>{listing.miles} miles</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={`${listing.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                listing.status === 'Decline' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    listing.status === 'In Review' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                                        'bg-slate-50 text-slate-700 border-slate-200'
                                                                }`}>
                                                                {listing.status || "Pending"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleToggleActive(listing.id, !listing.is_active)}
                                                                disabled={isUpdating === listing.id}
                                                                className={`${listing.is_active
                                                                    ? 'text-green-600 hover:bg-green-50'
                                                                    : 'text-red-600 hover:bg-red-50'
                                                                    }`}
                                                                title={listing.is_active ? "Click to deactivate" : "Click to activate"}
                                                            >
                                                                {isUpdating === listing.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : listing.is_active ? (
                                                                    <>
                                                                        <Check className="w-4 h-4 mr-1" />
                                                                        Active
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <X className="w-4 h-4 mr-1" />
                                                                        Inactive
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="bg-slate-50">
                                                                {listing.dealer}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    title="View Details"
                                                                    onClick={() => {
                                                                        setSelectedListingForDetail(listing);
                                                                        setIsDetailModalOpen(true);
                                                                    }}
                                                                >
                                                                    <Eye className="w-4 h-4 text-slate-600" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredListings.map((listing) => (
                                            <Card key={listing.id} className={`overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-slate-200 bg-white group relative ${selectedIds.has(listing.id) ? "ring-2 ring-blue-500" : ""}`}>
                                                {/* Selection Checkbox */}
                                                <div className="absolute top-3 left-3 z-10">
                                                    <Checkbox
                                                        checked={selectedIds.has(listing.id)}
                                                        onCheckedChange={() => toggleListingSelection(listing.id)}
                                                        className="rounded"
                                                    />
                                                </div>

                                                <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                                    <img
                                                        src={listing.image || "/fallback.jpg"}
                                                        alt={listing.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                                                    {/* Status Badge */}
                                                    <div className="absolute bottom-3 right-3">
                                                        <Badge className={`${listing.is_active ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white`}>
                                                            {listing.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <CardContent className="p-5">
                                                    {/* Title and Basic Info */}
                                                    <div className="mb-4">
                                                        <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-dealership-primary transition-colors">
                                                            {listing.title}
                                                        </h3>
                                                        <p className="text-slate-600 text-sm mb-3">
                                                            {listing.year} • {listing.make} {listing.model}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                                        <div className="flex flex-col gap-1 text-slate-700">
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-semibold text-slate-900">${Number(listing.price).toLocaleString()}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <Car className="w-4 h-4 text-purple-600" />
                                                            <span className="truncate">{listing.body_style}</span>
                                                        </div>
                                                    </div>

                                                    {/* Toggle Active Status */}
                                                    <div className="mb-4">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleToggleActive(listing.id, !listing.is_active)}
                                                            disabled={isUpdating === listing.id}
                                                            className={`w-full ${listing.is_active
                                                                ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300'
                                                                : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300'
                                                                }`}
                                                        >
                                                            {isUpdating === listing.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : listing.is_active ? (
                                                                <>
                                                                    <Check className="w-4 h-4 mr-2" />
                                                                    Active - Click to Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <X className="w-4 h-4 mr-2" />
                                                                    Inactive - Click to Activate
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-2">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedListingForDetail(listing);
                                                                setIsDetailModalOpen(true);
                                                            }}
                                                            className="w-full bg-dealership-primary hover:bg-dealership-primary/90 text-white"
                                                        >
                                                            <Edit2 className="w-4 h-4 mr-2" />
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.total_pages}
                                    onPageChange={(page) => fetchExistingListings(page)}
                                />
                            </TabsContent>
                        </>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setActiveView("dashboard")}
                                        className="text-slate-600 hover:text-dealership-primary"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back to Dashboard
                                    </Button>
                                    <h2 className="text-xl font-bold text-slate-800">Saved Search Filters</h2>
                                </div>
                                <Badge variant="secondary" className="px-3 py-1 bg-dealership-primary/10 text-dealership-primary border-none">
                                    {savedFilters.length} Active Filters
                                </Badge>
                            </div>

                            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                                <div className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead>Filter Name</TableHead>
                                                <TableHead>Configuration Summary</TableHead>
                                                <TableHead>Limit</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {savedFilters.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                                        No saved filters yet. Use the fetch configuration to save one.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                savedFilters.map((filter) => (
                                                    <TableRow key={filter.id} className="hover:bg-slate-50 group">
                                                        <TableCell className="font-semibold text-slate-900">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${selectedFilterId === filter.id ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                                {filter.title}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-slate-600 max-w-md">
                                                            <p className="truncate text-sm">
                                                                {getFilterSummary(filter)}
                                                            </p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{filter.limit || 'No limit'}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        applyFilter(filter);
                                                                        setActiveView("dashboard");
                                                                        setActiveTab("filters");
                                                                    }}
                                                                    className="h-8 border-dealership-primary text-dealership-primary hover:bg-dealership-primary hover:text-white"
                                                                >
                                                                    Apply
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-slate-400 hover:text-blue-600"
                                                                    onClick={() => {
                                                                        applyFilter(filter);
                                                                        setShowSaveDialog(true);
                                                                    }}
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </Button>
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent>
                                                                        <DialogHeader>
                                                                            <DialogTitle>Delete Filter?</DialogTitle>
                                                                            <DialogDescription>
                                                                                Are you sure you want to delete "{filter.title}"? This action cannot be undone.
                                                                            </DialogDescription>
                                                                        </DialogHeader>
                                                                        <DialogFooter className="gap-2 sm:gap-0">
                                                                            <DialogTrigger asChild>
                                                                                <Button variant="outline">Cancel</Button>
                                                                            </DialogTrigger>
                                                                            <Button variant="destructive" onClick={() => handleDeleteFilter(filter.id)}>Delete</Button>
                                                                        </DialogFooter>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        </div>
                    )}
                </Tabs>

                {/* Listing Detail Modal */}
                <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedListingForDetail?.title}</DialogTitle>
                        </DialogHeader>

                        {selectedListingForDetail && (
                            <div className="space-y-6">
                                {/* Image Section */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-900">Images</h3>
                                    <div className="bg-slate-100 rounded-lg p-4 h-64 flex items-center justify-center">
                                        <img
                                            src={selectedListingForDetail.image || "/fallback.jpg"}
                                            alt={selectedListingForDetail.title}
                                            className="h-full object-contain"
                                            onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                                        />
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Make</label>
                                        <p className="text-slate-900">{selectedListingForDetail.make}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Model</label>
                                        <p className="text-slate-900">{selectedListingForDetail.model}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Year</label>
                                        <p className="text-slate-900">{selectedListingForDetail.year}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Body Style</label>
                                        <p className="text-slate-900">{selectedListingForDetail.body_style}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Price</label>
                                        <p className="text-slate-900 font-semibold text-dealership-primary">${Number(selectedListingForDetail.price).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Mileage</label>
                                        <p className="text-slate-900">{selectedListingForDetail.miles} miles</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-slate-600">Location</label>
                                        <p className="text-slate-900">{selectedListingForDetail.dealer}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t">
                                    <Button
                                        variant="default"
                                        onClick={() => window.open(`/listings/${selectedListingForDetail.slug}?admin=true`, '_blank')}
                                        className="flex-1 bg-dealership-primary hover:bg-dealership-primary/90 text-white"
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit & Manage Images
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsDetailModalOpen(false)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default CopartFetch;
