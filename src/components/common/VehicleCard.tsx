import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, ArrowRight } from "lucide-react";

interface CarData {
    _id: string;
    title: string;
    make?: { id?: string; name?: string; slug?: string };
    year?: number;
    model?: string;
    body_type?: { id?: string; name?: string; slug?: string };
    fuel_type?: { id?: string; name?: string };
    transmission?: { id?: string; name?: string };
    image: string | null;
    price: number | string;
    mileage?: number | string | null;
    color?: string;
    slug: string;
    status?: number;
    listedAt?: string;
    badge?: { id?: string; name?: string };
    vehicle_id?: string;
    location?: string;
    badges?: string[];
    seats?: number | string | null;
    isThirdParty?: boolean;
    isCopart?: boolean;
    lot_number?: string;
}

interface VehicleCardProps {
    car: CarData;
    currency?: "AWG" | "USD";
    listingType?: "normal" | "global" | "auction";
    onShare?: (car: CarData, e: React.MouseEvent) => void;
}

const getPriceBadge = (price: number): string | null => {
    if (price < 10000) return "Best Deal";
    if (price >= 10000 && price < 25000) return "Great Price";
    if (price >= 25000 && price < 40000) return "Good Value";
    return null;
};

export const VehicleCard = ({
    car,
    currency = "AWG",
    listingType = "normal",
    onShare
}: VehicleCardProps) => {
    const priceNumber = Number(car.price);
    const badgeLabel = Number.isFinite(priceNumber) ? getPriceBadge(priceNumber) : null;

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onShare) {
            onShare(car, e);
        }
    };

    return (
        <Link to={`/listings/${car.slug}`} className="block h-full">
            <Card className="flex flex-row overflow-hidden hover:shadow-lg transition-shadow md:flex-col relative h-full">
                <div className="relative w-1/4 md:w-full h-24 md:h-48 m-auto">
                    {badgeLabel && car.status !== 3 && (
                        <div className="hidden md:block absolute top-2 left-2 bg-dealership-primary text-white px-2 py-0.5 rounded-full text-[15px] font-semibold shadow-md z-10">
                            {badgeLabel}
                        </div>
                    )}
                    <img
                        src={car.image || "/fallback.jpg"}
                        alt={car.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />

                    {car.status === 3 && (
                        <div
                            className="absolute bottom-1 left-1 md:top-2 md:left-2 md:bottom-auto
               bg-red-500 text-white px-1.5 py-0.5 md:px-2 md:py-0.5
               rounded-full text-[10px] md:text-xs font-semibold
               z-10 shadow-md"
                        >
                            Sold
                        </div>
                    )}

                    <button
                        onClick={handleShare}
                        className="absolute top-2 left-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors md:left-auto md:right-2 z-20"
                        aria-label="Share listing"
                    >
                        <Share2 className="w-3 h-3 text-gray-600" />
                    </button>
                </div>

                <CardContent className="p-2 md:p-4 w-3/4 md:w-full flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2 md:mb-3 border-b border-gray-200 pb-1">
                        <h3 className="text-base md:text-lg font-semibold text-left line-clamp-1" title={car.title}>
                            {car.title}
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-xs md:text-sm text-gray-600 mb-2">
                        <div>Make: {car.make?.name ?? "N/A"}</div>
                        <div>Model: {car.model ?? "N/A"}</div>
                        <div>Type: {car.body_type?.name ?? "N/A"}</div>
                        <div>Transmission: {car.transmission?.name ?? "N/A"}</div>
                        <div>Color: {car.color ?? "N/A"}</div>
                        {car.badges && car.badges.length > 0 && (
                            <div>Badge: {car.badges.join(", ")}</div>
                        )}
                        {listingType === "auction" ? (
                            <div>Vehicle ID: {car.lot_number ?? "N/A"}</div>
                        ) : (
                            <div>Vehicle ID: {car.vehicle_id ?? "N/A"}</div>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-auto border-t border-gray-200 pt-2">
                        <p className="text-xl font-bold text-dealership-primary">
                            {currency} {Number(car.price || 0).toLocaleString()}
                        </p>
                        <button
                            className="hidden md:inline-flex items-center gap-1 text-dealership-primary hover:text-[#6B4A2B] font-medium"
                            type="button"
                        >
                            View Details
                            <ArrowRight className="w-4 h-4 transform -rotate-45" />
                        </button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default VehicleCard;
