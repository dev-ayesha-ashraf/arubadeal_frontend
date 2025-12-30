import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface AccessoryImage {
    id: string;
    image_url: string;
    is_primary: boolean;
    position: number;
    is_display: boolean;
}

interface Category {
    id: string;
    name: string;
}

interface SubCategory {
    id: string;
    name: string;
}

interface Accessory {
    id: string;
    name: string;
    brand: string;
    stock: number;
    price: string;
    description: string;
    tags: string[];
    model_compatibility: string[];
    slug: string;
    out_of_stock: boolean;
    category: Category;
    sub_category: SubCategory;
    images: AccessoryImage[];
}

interface AccessoriesResponse {
    total_items: number;
    total_pages: number;
    page: number;
    size: number;
    items: Accessory[];
}

const AccessoriesShowcase = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [accessories, setAccessories] = useState<Accessory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL;
    const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

    useEffect(() => {
        const fetchAccessories = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/car_accessory/?page=1&size=8`);
                if (!res.ok) throw new Error(`Failed to fetch accessories: ${res.status}`);
                const data: AccessoriesResponse = await res.json();
                setAccessories(data.items);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch accessories");
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/car_accessory/category/`);
                if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
                const data: Category[] = await res.json();
                setCategories(data);
            } catch {
                setCategories([
                    { id: "1", name: "Tires" },
                    { id: "2", name: "Brakes" },
                    { id: "3", name: "Body" },
                    { id: "4", name: "Filter" },
                    { id: "5", name: "Oils & Liquids" },
                ]);
            }
        };

        fetchAccessories();
        fetchCategories();
    }, [API_URL]);

    const [visibleItems, setVisibleItems] = useState(4);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) setVisibleItems(1);
            else if (window.innerWidth < 768) setVisibleItems(2);
            else if (window.innerWidth < 1024) setVisibleItems(3);
            else setVisibleItems(4);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handlePrevious = () => {
        if (isAnimating || accessories.length === 0) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + accessories.length) % accessories.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const handleNext = () => {
        if (isAnimating || accessories.length === 0) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % accessories.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const toggleFavorite = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFavorites((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const getPrimaryImage = (accessory: Accessory) => {
        const primaryImage = accessory.images.find((img) => img.is_primary);
        if (primaryImage) return `${MEDIA_URL}${primaryImage.image_url}`;
        if (accessory.images.length > 0)
            return `${MEDIA_URL}${accessory.images[0].image_url}`;
        return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=60";
    };

    const getVisibleAccessories = () => {
        if (accessories.length === 0) return [];
        const items = [];
        const maxItems = Math.min(visibleItems, accessories.length);
        for (let i = 0; i < maxItems; i++) {
            const index = (currentIndex + i) % accessories.length;
            items.push(accessories[index]);
        }
        return items;
    };

    if (loading) {
        return (
            <section className="py-16 bg-background overflow-hidden">
                <div className="container text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-3">
                        Premium Car Accessories
                    </h2>
                    <p className="text-muted-foreground">Loading accessories...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 bg-background overflow-hidden">
                <div className="container text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-3">
                        Premium Car Accessories
                    </h2>
                    <p className="text-red-500">Error: {error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-background overflow-hidden">
            <div className="container mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">
                            Premium Car Accessories
                        </h2>
                        <p className="text-muted-foreground max-w-2xl">
                            Discover our curated collection of high-quality automotive accessories
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePrevious}
                            disabled={isAnimating}
                            className="rounded-full hover:border-dealership-primary"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleNext}
                            disabled={isAnimating}
                            className="rounded-full hover:border-dealership-primary"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex overflow-x-auto hide-scrollbar pb-3 mb-8">
                    <div className="flex space-x-3 mx-auto">
                        {categories.map((category) => (
                            <Link key={category.id} to={`/accessories?category=${category.id}`}>
                                <Button
                                    variant="outline"
                                    className="rounded-full border-muted hover:border-dealership-primary hover:text-dealership-primary whitespace-nowrap"
                                >
                                    {category.name}
                                </Button>
                            </Link>
                        ))}

                        <Link to="/accessories">
                            <Button className="rounded-full bg-dealership-primary text-white hover:bg-dealership-primary/80">
                                More spare parts
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Accessories Grid */}
                {accessories.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No accessories found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-500">
                        {getVisibleAccessories().map((accessory) => (
                            <Link
                                to={`/accessorydetails/${accessory.slug}`}
                                key={accessory.id}
                                className="block"
                            >
                                <Card className="overflow-hidden group cursor-pointer border hover:border-dealership-primary transition-all duration-300">
                                    <CardContent className="relative p-4 flex flex-col">
                                        {/* Favorite button */}
                                        <button
                                            onClick={(e) => toggleFavorite(accessory.id, e)}
                                            className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-rose-50 transition"
                                        >
                                            <Heart
                                                size={18}
                                                className={
                                                    favorites.includes(accessory.id)
                                                        ? "fill-rose-500 text-rose-500"
                                                        : "text-muted-foreground"
                                                }
                                            />
                                        </button>

                                        {/* Image */}
                                        <div className="h-56 flex items-center justify-center overflow-hidden rounded-lg mb-4">
                                            <img
                                                src={getPrimaryImage(accessory)}
                                                alt={accessory.name}
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>

                                        {/* Name */}
                                        <h4 className="font-semibold text-lg text-center text-dealership-navy group-hover:text-dealership-primary transition-colors">
                                            {accessory.name}
                                        </h4>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="text-center mt-12">
                    <Link to="/accessories">
                        <Button className="bg-dealership-primary hover:bg-dealership-primary/80 text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg">
                            Browse All Accessories
                        </Button>
                    </Link>
                </div>
            </div>

            <style>
                {`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
            </style>
        </section>
    );
};

export default AccessoriesShowcase;
