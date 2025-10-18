import { Button } from "@/components/ui/button";
import { Car, Tags, Fuel, Zap, Workflow, Briefcase, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

interface PropertyType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  path: string;
}

const VehicleProperties = () => {
  const propertyTypes: PropertyType[] = [
    {
      id: "car-makes",
      name: "Car Makes",
      description: "Manage all car manufacturers like Toyota, Honda, BMW, etc.",
      icon: Car,
      path: "/admin/car-makes",
    },
    {
      id: "car-types",
      name: "Car Types",
      description: "Manage vehicle types like Sedan, SUV, Truck, etc.",
      icon: Car,
      path: "/admin/car-types",
    },
    {
      id: "fuel-types",
      name: "Fuel Types",
      description: "Manage fuel types like Petrol, Diesel, Electric, etc.",
      icon: Fuel,
      path: "/admin/fuel-types",
    },
    {
      id: "transmissions",
      name: "Transmissions",
      description: "Manage transmission types like Automatic, Manual, etc.",
      icon: Workflow,
      path: "/admin/transmissions",
    },
    {
      id: "bags",
      name: "Bags/Badges",
      description: "Manage vehicle badges and special features.",
      icon: Briefcase,
      path: "/admin/bags",
    },
    {
      id: "accessory-categories",
      name: "Accessory Categories",
      description: "Manage categories for car accessories like Audio, Lighting, Performance, etc.",
      icon: Wrench,
      path: "/admin/category-management",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehicle Properties</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {propertyTypes.map((property) => (
          <Link to={property.path} key={property.id}>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-dealership-primary/10 rounded-full">
                  <property.icon className="w-6 h-6 text-dealership-primary" />
                </div>
                <h2 className="text-xl font-semibold">{property.name}</h2>
              </div>
              <p className="text-gray-600 mb-4">{property.description}</p>
              <Button variant="outline" className="w-full">
                Manage {property.name}
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VehicleProperties;