
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export const ListingCard = () => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=300&fit=crop"
        alt="Car"
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-dealership-navy">2023 BMW X5</h3>
        <p className="text-2xl font-bold text-dealership-primary mt-2">$45,000</p>
        <div className="flex items-center text-gray-600 mt-2">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">New York, NY</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-gray-100 text-sm rounded">Automatic</span>
          <span className="px-2 py-1 bg-gray-100 text-sm rounded">50,000 mi</span>
          <span className="px-2 py-1 bg-gray-100 text-sm rounded">SUV</span>
        </div>
      </div>
    </Card>
  );
};
