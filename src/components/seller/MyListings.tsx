import { useEffect, useState } from "react";
import ListingCard from "../common/ListingCard";
import EmptyState from "../common/EmptyState";
import EditVehicleModal from "../common/EditVehicleModal";
import { Button } from "@/components/ui/button";
import { Edit, Car, CheckCircle, XCircle } from "lucide-react";
import StatsCard from "../common/StatsCard";
import PageHeader from "../common/PageHeader";
import LayoutToggle from "../common/LayoutToggle";
import { List, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import ListingDetailsDialog from "../common/ListingDetailsDialog";

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

export default function MyListings() {
  const [data, setData] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [lookups, setLookups] = useState<Lookups>({
    makes: [],
    fueltypes: [],
    transmissions: [],
    bodytypes: [],
    badges: [],
  });
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchListings();
    fetchLookups();
  }, []);

  const fetchListings = () => {
    fetch(
      `${import.meta.env.VITE_API_URL}/seller_listing/my-listing?page=1&size=20`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((res) => setData(res.items || []));
  };

  const fetchLookups = async () => {
    try {
      const [makesRes, fueltypesRes, transmissionsRes, bodytypesRes, badgesRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/make/get_all`),
        fetch(`${import.meta.env.VITE_API_URL}/fueltype/get_all`),
        fetch(`${import.meta.env.VITE_API_URL}/transmission/get_all`),
        fetch(`${import.meta.env.VITE_API_URL}/bodytype/get_all`),
        fetch(`${import.meta.env.VITE_API_URL}/badge/get_all`),
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

  const handleEdit = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setEditModalOpen(true);
  };

  const handleViewDetails = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setViewDetailsOpen(true);
  };

  const handleSaved = () => {
    fetchListings();
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type}: ${message}`);
    alert(message);
  };

  // Calculate stats
  const totalListings = data.length;
  const activeListings = data.filter(l => l.is_active && !l.is_sold).length;
  const soldListings = data.filter(l => l.is_sold).length;

  return (
    <div className="px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title="My Listings"
          description="Manage your active and sold listings"
          icon={List}
        />
        <LayoutToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Listings"
          value={totalListings}
          icon={Car}
          variant="blue"
        />
        <StatsCard
          title="Active Listings"
          value={activeListings}
          icon={CheckCircle}
          variant="green"
        />
        <StatsCard
          title="Sold Listings"
          value={soldListings}
          icon={XCircle}
          variant="orange"
        />
      </div>

      {data.length === 0 ? (
        <EmptyState text="No listings found." />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.map((listing) => (
            <div key={listing.id} className="relative">
              <ListingCard listing={listing} />
              <Button
                onClick={() => handleEdit(listing)}
                className="absolute top-3 left-3 z-10 bg-white/90 hover:bg-white text-gray-700 border border-gray-300"
                size="sm"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border bg-white mb-8 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={`${import.meta.env.VITE_MEDIA_URL}${listing.images?.find((img: any) => img.is_primary)?.image_url || listing.images?.[0]?.image_url}`}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `${import.meta.env.VITE_MEDIA_URL}/cars/placeholder-image.png`;
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{listing.title}</div>
                        <div className="text-sm text-slate-500">{listing.year} • {listing.make?.name} {listing.model}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">AWG {listing.price?.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`border-0 shadow-sm ${listing.is_sold
                      ? "bg-red-100 text-red-800"
                      : listing.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                      }`}>
                      {listing.is_sold ? "Sold" : listing.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(listing)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleViewDetails(listing)}
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
      )
      }

      <EditVehicleModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        vehicle={selectedVehicle}
        onSaved={handleSaved}
        lookups={lookups}
        onSubmit={async (id, data) => {
          const token = localStorage.getItem("access_token");
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/seller_listing/update?id=${id}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to update vehicle');
          }
        }}
      />

      <ListingDetailsDialog
        open={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        data={selectedVehicle}
      />
    </div>
  );
}