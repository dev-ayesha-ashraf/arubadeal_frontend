import { Button } from "@/components/ui/button";
import { useState } from "react";
import ListingDetailsDialog from "./ListingDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Car, User, Calendar, Gauge, MapPin, Eye } from "lucide-react";

export default function ListingCard({ listing }: any) {
  const [open, setOpen] = useState(false);
  const mediaUrl = import.meta.env.VITE_MEDIA_URL;
  const mainImg = mediaUrl + (listing.images?.[0]?.image_url || "/cars/placeholder-image.png");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800 border-green-200";
      case "Declined": return "bg-red-100 text-red-800 border-red-200";
      case "In Review": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Pending": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0
  }).format(price);
};


  return (
    <>
      <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-slate-200 bg-white group flex flex-col h-[520px]">
        {/* Car Image */}
        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden shrink-0">
          <img
            src={mainImg}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `AWG{mediaUrl}/cars/placeholder-image.png`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <Badge className={`absolute top-3 right-3 border-0 shadow-sm AWG{getStatusColor(listing.status)}`}>
            <span className="flex items-center gap-1 text-xs font-medium">
              {listing.status}
            </span>
          </Badge>
        </div>

        <CardContent className="p-5 flex-1 flex flex-col">
          {/* Title and Basic Info */}
          <div className="mb-4">
            <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-[rgb(206,131,57)] transition-colors">
              {listing.title}
            </h3>
            <p className="text-slate-600 text-sm mb-3">
              {listing.year} • {listing.make?.name} {listing.fuel_type?.name || "N/A"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-sm flex-1">
            <div className="flex flex-col gap-1 text-slate-700">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-900">AWG {formatPrice(listing.price)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span>{listing.mileage?.toLocaleString()} km</span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-700">
              <Car className="w-4 h-4 text-purple-600" />
              <span className="truncate">{listing.body_type?.name}</span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span className="truncate">{listing.location}</span>
            </div>
          </div>

          {/* Seller Info */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-700 font-medium">
                {listing.dealer?.first_name} {listing.dealer?.last_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-700">
                {new Date(listing.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="mt-auto shrink-0">
            <Button
              className="w-full bg-[rgb(206,131,57)] hover:bg-[rgb(196,121,47)] text-white shadow-sm transition-colors"
              onClick={() => setOpen(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            
          </div>
        </CardContent>
      </Card>

      {/* Dialog Component */}
      <ListingDetailsDialog
        open={open}
        onClose={() => setOpen(false)}
        data={listing}
      />
    </>
  );
}