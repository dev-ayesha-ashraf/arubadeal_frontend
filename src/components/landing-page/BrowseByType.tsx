import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Define the type interface
interface CarType {
  _id: string;
  name: string;
  slug: string;
  totalCars: number;
  logo: string;
}

const fetchCarTypes = async (): Promise<CarType[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/types/list-types`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch car types");
  const res = await response.json();
  return res.data;
};

export const BrowseByType = () => {
  const { data: carTypes = [], isLoading } = useQuery({
    queryKey: ["types"],
    queryFn: fetchCarTypes,
  });

    const mediaUrl = import.meta.env.VITE_MEDIA_URL;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-sm sm:text-3xl font-bold">Browse Cars by Type</h2>
          <div className="hidden sm:block">
            <Link to="/listings">
              <Button variant="ghost" className="gap-2">
                See All Types
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            carTypes.map((item) => {
              const imagePath = item.logo;
              const fullImageUrl = `${mediaUrl}/${imagePath}`;
              return (
                <Link key={item._id} to={`/types/${item.slug}`} className="group">
                  <div>
                    <img
                      src={fullImageUrl}
                      alt={item.name}
                      className="w-60 h-20 md:h-44 mx-auto object-contain"
                    />
                  </div>
                  <CardContent className="p-1 md:p-2">
                    <p className="font-bold text-center mb-1 text-dealership-navy group-hover:text-dealership-primary">
                      {item.name} ({item.totalCars})
                    </p>
                  </CardContent>
                </Link>
              );
            })
          )}
        </div>
        <div className="flex justify-center mt-8 lg:hidden">
          <Link to="/listings">
            <Button
              variant="default"
              className="gap-2 bg-gradient-to-r from-dealership-primary/80 to-dealership-primary/100"
            >
              See All Types
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
