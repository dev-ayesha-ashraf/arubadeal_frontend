import { Card } from "@/components/ui/card";
import { MapPin, Car } from "lucide-react";

export const DealerCard = () => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop"
            alt="Dealer"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold text-dealership-primary">
              Premium Auto Group
            </h3>
            <div className="flex items-center text-gray-600 mt-1">
              <MapPin size={16} className="mr-1" />
              <span className="text-sm">New York, NY</span>
            </div>
          </div>
        </div>
        <div className="flex items-center text-gray-600">
          <Car size={16} className="mr-1" />
          <span className="text-sm">128 Cars Listed</span>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span>Rating</span>
            <span className="font-semibold">4.8/5.0 ⭐</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span>Years Active</span>
            <span className="font-semibold">15+ Years</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
