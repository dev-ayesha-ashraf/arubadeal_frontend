import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShareButtons } from "./ShareButtons";
import { Car } from "@/types/car";
import { ShareMetaTags } from "./ShareMetaTags";

interface SharePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  car: Car | null;
}

export const SharePreview = ({ isOpen, onClose, car }: SharePreviewProps) => {
  if (!car) return null;

  // Safe property access using any as escape hatch for problematic types
  const makeName = typeof car.make === 'string' ? car.make : (car.make as any)?.name || "N/A";
  const modelName = typeof car.model === 'string' ? car.model : (car.model as any)?.name || "N/A";
  const transmissionName = typeof car.transmission === 'string' ? car.transmission : (car.transmission as any)?.name || "N/A";
  
  // Safe number conversions
  const priceValue = typeof car.price === 'number' ? car.price : Number(car.price);
  const priceDisplay = !isNaN(priceValue) ? priceValue.toLocaleString() : "N/A";
  
  const mileageValue = typeof car.mileage === 'number' ? car.mileage : Number(car.mileage);
  const mileageDisplay = !isNaN(mileageValue) ? `${mileageValue.toLocaleString()} mi` : "N/A";

  return (
    <>
      <ShareMetaTags car={car} />
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Vehicle</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <img
                src={car.image || "/fallback.jpg"}
                alt={car.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              {car.status === 3 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Sold
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-dealership-navy">{car.title}</h3>
                <p className="text-2xl font-bold text-dealership-primary mt-2">
                  AWG {priceDisplay}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 text-sm rounded">
                  {transmissionName}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-sm rounded">
                  {mileageDisplay}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-sm rounded">
                  {makeName}
                </span>
                {modelName && modelName !== "N/A" && (
                  <span className="px-2 py-1 bg-gray-100 text-sm rounded">
                    {modelName}
                  </span>
                )}
              </div>
              <div className="pt-4">
                <ShareButtons
                  title={car.title}
                  url={`${window.location.origin}/listings/${car.slug}`}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};