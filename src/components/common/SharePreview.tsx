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
                src={`${import.meta.env.VITE_MEDIA_URL}/${car.image}`}
                alt={car.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              {car.status === 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Sold
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-dealership-navy">{car.title}</h3>
                <p className="text-2xl font-bold text-dealership-primary mt-2">
                  AWG {Number(car.price).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 text-sm rounded">
                  {car.transmission}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-sm rounded">
                  {car.mileage.toLocaleString()} mi
                </span>
                <span className="px-2 py-1 bg-gray-100 text-sm rounded">
                  {car.make}
                </span>
                {car.model && (
                  <span className="px-2 py-1 bg-gray-100 text-sm rounded">
                    {car.model}
                  </span>
                )}
              </div>
              <div className="pt-4">
                <ShareButtons url={window.location.href} title={car.title} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 