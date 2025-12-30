import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    X,
    Car,
    User,
    FileText,
    Settings,
    Gauge,
    Palette,
    Fuel,
    Cog,
    Users,
    MapPin,
    Calendar,
    DollarSign,
    Shield,
    Star,
    Phone,
    Mail
} from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function ListingDetailsDialog({
    open,
    onClose,
    data,
    extraActions,
}: {
    open: boolean;
    onClose: () => void;
    data: any;
    extraActions?: React.ReactNode;
}) {
    if (!data) return null;

    const mediaUrl = import.meta.env.VITE_MEDIA_URL;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US').format(price);
    };

    const getPrimaryImage = (images: any[]) => {
        if (!images || images.length === 0) return null;
        const primary = images.find(img => img.is_primary);
        return primary || images[0];
    };

    const primaryImage = getPrimaryImage(data.images);
    const imageUrl = mediaUrl + (primaryImage?.image_url || "/cars/placeholder-image.png");

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[85%] sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl p-0 rounded-xl sm:mx-0">
                {/* Header */}
                <DialogHeader className="relative p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                            <div className="p-1.5 sm:p-2 bg-dealership-primary rounded-lg mt-0.5 flex-shrink-0">
                                <Car className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 leading-tight pr-2">
                                    {data.title}
                                </DialogTitle>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <Calendar className="h-3 w-3" />
                                        <span>{data.year}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <Gauge className="h-3 w-3" />
                                        <span>{(data.mileage || 0).toLocaleString()} km</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate max-w-[100px]">{data.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <div className="text-right">
                                <div className="text-lg sm:text-xl font-bold text-dealership-primary">
                                    AWG {formatPrice(data.price)}
                                </div>
                                {data.min_price && data.min_price < data.price && (
                                    <div className="text-xs text-slate-500 line-through">
                                        AWG {formatPrice(data.min_price)}
                                    </div>
                                )}
                            </div>
                            <StatusBadge status={data.status} />
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Image Section */}
                    <div className="relative h-48 sm:h-64 bg-slate-100 rounded-xl overflow-hidden shadow-sm">
                        <img
                            src={imageUrl}
                            alt={data.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `${mediaUrl}/cars/placeholder-image.png`;
                            }}
                        />
                    </div>

                    {/* Additional Images */}
                    {data.images && data.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                            {data.images.slice(0, 4).map((image: any, index: number) => (
                                <div key={image.id} className="flex-shrink-0 w-16 h-12 sm:w-20 sm:h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                    <img
                                        src={mediaUrl + image.image_url}
                                        alt={`${data.title} ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Seller Info - Compact */}
                        <Card className="bg-slate-50 border-slate-200">
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-dealership-primary" />
                                        <span className="font-semibold text-slate-900 text-sm">Seller</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-900">
                                        {data.dealer?.first_name} {data.dealer?.last_name}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Specs Grid */}
                        <Card className="bg-slate-50 border-slate-200">
                            <CardContent className="p-3">
                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                                    <Car className="w-4 h-4 text-dealership-primary" />
                                    Quick Specs
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <CompactSpecItem label="Body Type" value={data.body_type?.name} />
                                    <CompactSpecItem label="Transmission" value={data.transmission?.name} />
                                    <CompactSpecItem label="Fuel Type" value={data.fuel_type?.name} />
                                    <CompactSpecItem label="Color" value={data.color?.name || data.color} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Combined Details Card for Mobile */}
                    <div className="block sm:hidden">
                        <Card>
                            <CardContent className="p-3">
                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                                    <Settings className="w-4 h-4 text-dealership-primary" />
                                    Vehicle Details
                                </h3>
                                <div className="space-y-2">
                                    <CompactSpecItem label="Make" value={data.make?.name} />
                                    <CompactSpecItem label="Model" value={data.model?.name || data.model} />
                                    <CompactSpecItem label="Condition" value={data.condition?.name || data.condition} />
                                    <CompactSpecItem label="Engine Type" value={data.engine_type} />
                                    <CompactSpecItem label="Seats" value={data.seats} />
                                    <CompactSpecItem label="Year" value={data.year} />
                                    <CompactSpecItem label="Mileage" value={`${(data.mileage || 0).toLocaleString()} km`} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-dealership-primary" />
                                    Vehicle Details
                                </h3>
                                <div className="space-y-3">
                                    <SpecItem label="Make" value={data.make?.name} />
                                    <SpecItem label="Model" value={data.model?.name || data.model} />
                                    <SpecItem label="Condition" value={data.condition?.name || data.condition} />
                                    <SpecItem label="Engine Type" value={data.engine_type} />
                                    <SpecItem label="Seats" value={data.seats} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <Gauge className="w-4 h-4 text-dealership-primary" />
                                    Technical Specs
                                </h3>
                                <div className="space-y-3">
                                    <SpecItem label="Year" value={data.year} />
                                    <SpecItem label="Mileage" value={`${(data.mileage || 0).toLocaleString()} km`} />
                                    <SpecItem label="Transmission" value={data.transmission?.name} />
                                    <SpecItem label="Fuel Type" value={data.fuel_type?.name} />
                                    <SpecItem label="Color" value={data.color?.name || data.color} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Description */}
                    {data.description && (
                        <Card>
                            <CardContent className="p-3 sm:p-4">
                                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                                    <FileText className="w-4 h-4 text-amber-500" />
                                    Description
                                </h3>
                                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line max-h-32 overflow-y-auto">
                                    {data.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-3 border-t border-slate-200">
                        <Button
                            variant="outline"
                            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm py-2"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                        {extraActions}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Compact Spec Item Component for mobile
function CompactSpecItem({ label, value }: { label: string; value: string | number }) {
    if (!value) return null;

    return (
        <div className="flex justify-between items-center py-1">
            <span className="text-xs text-slate-600">{label}</span>
            <span className="text-xs font-medium text-slate-900 text-right max-w-[60%] truncate">{value}</span>
        </div>
    );
}

// Original Spec Item Component for desktop
function SpecItem({ label, value }: { label: string; value: string | number }) {
    if (!value) return null;

    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
            <span className="text-sm text-slate-600">{label}</span>
            <span className="text-sm font-medium text-slate-900">{value}</span>
        </div>
    );
}