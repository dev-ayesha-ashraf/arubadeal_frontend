import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

// Remove the manufacturers array and create an interface for the manufacturer type
interface Manufacturer {
  _id: string;
  name: string;
  image: string;
  totalCars: number;
}

const fetchManufacturers = async (): Promise<Manufacturer[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/makes/v1/list-makes`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch manufacturers");
  const res = await response.json();
  return res.data;
};

export const BrowseByMake = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const { data: manufacturers = [], isLoading } = useQuery({
    queryKey: ["makes"],
    queryFn: fetchManufacturers,
  });

  const itemsPerPage = {
    mobile: 1,
    desktop: 5
  };

  const getItemsPerPage = () => {
    return window.innerWidth < 768 ? itemsPerPage.mobile : itemsPerPage.desktop;
  };

  const [visibleItems, setVisibleItems] = useState(getItemsPerPage());

  useEffect(() => {
    const handleResize = () => {
      setVisibleItems(getItemsPerPage());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - 1;
      return newIndex < 0 ? manufacturers.length - 1 : newIndex;
    });
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % manufacturers.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const getVisibleManufacturers = () => {
    const items = [];
    const maxItems = Math.min(visibleItems, manufacturers.length);
    for (let i = 0; i < maxItems; i++) {
      const index = (currentIndex + i) % manufacturers.length;
      items.push(manufacturers[index]);
    }
    return items;
  };

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-8">
          <h2 className="text-3xl font-bold">Browse by Make</h2>
          {!isLoading && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                disabled={isAnimating || manufacturers.length === 0}
                className="rounded-full hover:border-dealership-primary"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={isAnimating || manufacturers.length === 0}
                className="rounded-full hover:border-dealership-primary"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="relative">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 transition-all duration-500 ease-in-out">
              {getVisibleManufacturers().map((maker) => (
                <Link 
                  key={`${maker._id}`}
                  to={`/listings?makeId=${maker._id}`}
                >
                  <Card
                    className={`overflow-hidden cursor-pointer group border hover:border-dealership-primary transition-all duration-300 ${
                      isAnimating ? 'animate-fade-in' : ''
                    }`}
                  >
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 mb-4 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                        <img
                          src={`${import.meta.env.VITE_MEDIA_URL}/${maker.image}`}
                          alt={maker.name}
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                      <h3 className="font-semibold text-lg text-center mb-1 text-dealership-navy group-hover:text-dealership-primary transition-colors">
                        {maker.name} ({maker.totalCars})
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
