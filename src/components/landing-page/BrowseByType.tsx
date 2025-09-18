import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { CardContent } from "../ui/card";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { trackCustomEvent } from "@/lib/init-pixel";
import { useEffect } from "react";

interface CarType {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  count: number;
}

const fetchCarTypes = async (): Promise<CarType[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/bodytype/count_by_bodytype`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch car types");
  const res = await response.json();
  return res;
};

export const BrowseByType = () => {
  const { data: carTypes = [], isLoading } = useQuery({
    queryKey: ["types"],
    queryFn: fetchCarTypes,
  });

  const mediaUrl = import.meta.env.VITE_MEDIA_URL;
  useEffect(() => {
    trackCustomEvent("BrowseByTypeSectionViewed");
  }, []);

  const handleTypeClick = (item: CarType) => {
    trackCustomEvent("CarTypeSelected", {
      id: item.id,
      name: item.name,
      slug: item.slug,
      count: item.count,
    });
  };

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
          ) : carTypes && carTypes.length > 0 ? (
            carTypes.map((item) => {
              const fullImageUrl = `${mediaUrl}${item.image_url}`;
              return (
                <Link
                  key={item.id}
                  to={`/types/${item.slug}`}
                  className="group"
                  onClick={() => handleTypeClick(item)} 
                >
                  <div>
                    <img
                      src={fullImageUrl}
                      alt={item.name}
                      className="w-60 h-20 md:h-44 mx-auto object-contain"
                    />
                  </div>
                  <CardContent className="p-1 md:p-2">
                    <p className="font-bold text-center mb-1 text-dealership-navy group-hover:text-dealership-primary">
                      {item.name.toUpperCase()} ({item.count})
                    </p>
                  </CardContent>
                </Link>
              );
            })
          ) : (
            <div>No car types found.</div>
          )}
        </div>

        <div className="flex justify-center mt-8 lg:hidden">
          <Link to="/listings">
            <Button
              variant="default"
              className="gap-2 bg-gradient-to-r from-dealership-primary/80 to-dealership-primary/100"
              onClick={() =>
                trackCustomEvent("BrowseByTypeSeeAllClicked")
              }
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
