import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Search,
    Zap,
    Loader2,
    RefreshCw,
    Car,
    Globe,
    AlertCircle,
    Filter,
    ArrowRight,
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Calendar,
    Gauge,
    Palette
} from "lucide-react";
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
import { Link } from "react-router-dom";

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
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

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
}

const ThirdPartyFetch = () => {
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

    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 0,
        page: 1,
        size: 20
    });

    // Form state for fetch API
    const [fetchParams, setFetchParams] = useState({
        "vehicle.make": "",
        "vehicle.year": "",
        "vehicle.model": "",
        "vehicle.trim": "",
        "vehicle.engine": "",
        "retailListing.price": "",
        "retailListing.miles": "",
        limit: 50,
        page: 1
    });

    const fetchExistingListings = async (page = pagination.page) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api_listing/public?page=${page}&size=${pagination.size}`);
            if (!res.ok) throw new Error("Failed to fetch existing listings");
            const data = await res.json();

            const mappedItems = (data.items || []).map((car: any) => {
                const primaryImage = car.images?.find((i: any) => i.is_primary) || car.images?.[0];
                return {
                    id: car.id,
                    title: car.title,
                    make: car.meta_data?.make || "Unknown",
                    model: car.model || "Unknown",
                    year: car.year,
                    price: car.price,
                    miles: car.miles,
                    body_style: car.meta_data?.bodyType || "Unknown",
                    image: primaryImage ? `${import.meta.env.VITE_MEDIA_URL}${primaryImage.image_url}` : "",
                    slug: car.id
                };
            });

            setListings(mappedItems);
            const totalPrice = mappedItems.reduce((sum, car) => sum + (Number(car.price) || 0), 0);
            setStats({
                total: totalPrice,
                count: data.total_items || 0,
                makes: new Set(mappedItems.map((i: any) => i.make)).size
            });
            setPagination({
                total_items: data.total_items || 0,
                total_pages: data.total_pages || 0,
                page: data.page || page,
                size: data.size || pagination.size
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to load third-party listings");
        } finally {
            setLoading(false);
        }
    };

    const handleExecuteFetch = async () => {
        try {
            setFetching(true);

            // Structure the body with dot-notation keys as expected by the API
            const requestBody: any = {};

            if (fetchParams["vehicle.make"]) requestBody["vehicle.make"] = fetchParams["vehicle.make"];
            if (fetchParams["vehicle.model"]) requestBody["vehicle.model"] = fetchParams["vehicle.model"];
            if (fetchParams["vehicle.year"]) requestBody["vehicle.year"] = fetchParams["vehicle.year"];
            if (fetchParams["vehicle.trim"]) requestBody["vehicle.trim"] = fetchParams["vehicle.trim"];
            if (fetchParams["vehicle.engine"]) requestBody["vehicle.engine"] = fetchParams["vehicle.engine"];

            if (fetchParams["retailListing.price"]) requestBody["retailListing.price"] = fetchParams["retailListing.price"];
            if (fetchParams["retailListing.miles"]) requestBody["retailListing.miles"] = fetchParams["retailListing.miles"];

            const response = await fetch(`${API_URL}/api_listing/fetch?page=${fetchParams.page}&limit=${fetchParams.limit}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData?.detail?.[0]?.msg || "Fetch failed");
            }

            const result = await response.json();
            toast.success(result.message || "Third-party listings fetch started in background!");

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
    }, []);

    const filteredListings = listings.filter(l =>
        l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <PageHeader
                    title="Fetch Third Party Listings"
                    description="Sync Arudeal database with unique third-party data sources"
                    icon={Zap}
                />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard
                        title="Total Price Value"
                        value={`$${Number(stats.total).toLocaleString()}`}
                        icon={Car}
                        variant="blue"
                    />
                    <StatsCard
                        title="Total Cars Count"
                        value={stats.count}
                        icon={Globe}
                        variant="green"
                    />
                    <StatsCard
                        title="Unique Makes"
                        value={stats.makes}
                        icon={Globe}
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
                                    value={fetchParams["vehicle.make"]}
                                    onChange={(e) => setFetchParams({ ...fetchParams, "vehicle.make": e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Model</label>
                                <Input
                                    placeholder="e.g. Camry"
                                    value={fetchParams["vehicle.model"]}
                                    onChange={(e) => setFetchParams({ ...fetchParams, "vehicle.model": e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Trim</label>
                                <Input
                                    placeholder="e.g. LE"
                                    value={fetchParams["vehicle.trim"]}
                                    onChange={(e) => setFetchParams({ ...fetchParams, "vehicle.trim": e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Year</label>
                                <Input
                                    placeholder="e.g. 2022"
                                    value={fetchParams["vehicle.year"]}
                                    onChange={(e) => setFetchParams({ ...fetchParams, "vehicle.year": e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Engine</label>
                                <Input
                                    placeholder="e.g. 2.5L"
                                    value={fetchParams["vehicle.engine"]}
                                    onChange={(e) => setFetchParams({ ...fetchParams, "vehicle.engine": e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Max Price (USD)</label>
                                <Input
                                    placeholder="e.g. 25000"
                                    value={fetchParams["retailListing.price"]}
                                    onChange={(e) => setFetchParams({ ...fetchParams, "retailListing.price": e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Max Miles</label>
                                <Input
                                    placeholder="e.g. 50000"
                                    value={fetchParams["retailListing.miles"]}
                                    onChange={(e) => setFetchParams({ ...fetchParams, "retailListing.miles": e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Limit</label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 50"
                                    value={fetchParams.limit}
                                    onChange={(e) => setFetchParams({ ...fetchParams, limit: parseInt(e.target.value) || 50 })}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
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
                        </div>
                    </CardContent>
                </Card>

                {/* List Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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
                                    <TableHead className="w-[100px]">Image</TableHead>
                                    <TableHead>Vehicle Details</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Price (USD)</TableHead>
                                    <TableHead>Mileage</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredListings.map((listing) => (
                                    <TableRow key={listing.id}>
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
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link to={`/listings/${listing.slug}`} target="_blank">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Eye className="w-4 h-4 text-slate-600" />
                                                    </Button>
                                                </Link>
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
                            <Card key={listing.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-slate-200 bg-white group">
                                <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                    <img
                                        src={listing.image || "/fallback.jpg"}
                                        alt={listing.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
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
                                            <Gauge className="w-4 h-4 text-blue-600" />
                                            <span>{listing.miles} miles</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Car className="w-4 h-4 text-purple-600" />
                                            <span className="truncate">{listing.body_style}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Palette className="w-4 h-4 text-orange-600" />
                                            <span className="truncate">{listing.model}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link to={`/listings/${listing.slug}`} target="_blank" className="flex-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 transition-colors"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </Button>
                                        </Link>
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
            </div>
        </div>
    );
};

export default ThirdPartyFetch;
