import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Image {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface Accessory {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: string;
  slug: string;
  out_of_stock: boolean;
  images: Image[];
  category?: Category;
}

interface Props {
  accessory: Accessory;
}

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

const getFirstImage = (images: Image[]) => {
  if (!images?.length) return "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300";
  const primary = images.find(img => img.is_primary) || images[0];
  return `${MEDIA_URL}${primary.image_url}`;
};

export const AccessoryCard = ({ accessory }: Props) => (
  <Link to={`/accessorydetails/${accessory.slug}`}>
    <Card className="overflow-hidden group hover:shadow-md border hover:border-dealership-primary transition-all duration-300 flex flex-col h-full">
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={getFirstImage(accessory.images)}
            alt={accessory.name}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300")}
          />
          {accessory.out_of_stock && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-dealership-navy group-hover:text-dealership-primary mb-1">
          {accessory.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-2">{accessory.brand}</p>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
          {accessory.description}
        </p>

        <div className="mt-4 flex justify-between items-center">
          <span className="font-bold text-dealership-primary">AWG {accessory.price}</span>
          <Button
            disabled={accessory.out_of_stock}
            variant={accessory.out_of_stock ? "secondary" : "default"}
            className="rounded-full"
          >
            {accessory.out_of_stock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  </Link>
);
