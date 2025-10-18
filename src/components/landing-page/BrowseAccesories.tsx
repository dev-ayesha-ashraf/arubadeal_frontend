import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";

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
                const response = await fetch(`${API_URL}/car_accessory/?page=1&size=8`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch accessories: ${response.status}`);
                }

                const data: AccessoriesResponse = await response.json();
                setAccessories(data.items);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch accessories');
                console.error('Error fetching accessories:', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_URL}/car_accessory/category/`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch categories: ${response.status}`);
                }

                const data: Category[] = await response.json();
                setCategories(data);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setCategories([
                    { id: "1", name: "Tires" },
                    { id: "2", name: "Brakes" },
                    { id: "3", name: "Body" },
                    { id: "4", name: "Filter" },
                    { id: "5", name: "Oils & Liquids" },
                    { id: "6", name: "Wheel suspension & handlebars" },
                    { id: "7", name: "Suspension" },
                    { id: "8", name: "Exhaust" },
                    { id: "9", name: "Electrics" },
                    { id: "10", name: "Motor" },
                    { id: "11", name: "Belts, chains, rollers" },
                    { id: "12", name: "Other categories" }
                ]);
            }
        };

        fetchAccessories();
        fetchCategories();
    }, [API_URL]);

    const [visibleItems, setVisibleItems] = useState(4);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setVisibleItems(1);
            } else if (window.innerWidth < 768) {
                setVisibleItems(2);
            } else if (window.innerWidth < 1024) {
                setVisibleItems(3);
            } else {
                setVisibleItems(4);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handlePrevious = () => {
        if (isAnimating || accessories.length === 0) return;
        setIsAnimating(true);
        setCurrentIndex((prevIndex) =>
            (prevIndex - 1 + accessories.length) % accessories.length
        );
        setTimeout(() => setIsAnimating(false), 300);
    };

    const handleNext = () => {
        if (isAnimating || accessories.length === 0) return;
        setIsAnimating(true);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % accessories.length);
        setTimeout(() => setIsAnimating(false), 300);
    };

    const toggleFavorite = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
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

    const getPrimaryImage = (accessory: Accessory) => {
        const primaryImage = accessory.images.find(img => img.is_primary);
        if (primaryImage) {
            return `${MEDIA_URL}${primaryImage.image_url}`;
        }
        if (accessory.images.length > 0) {
            return `${MEDIA_URL}${accessory.images[0].image_url}`;
        }
        return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FyfGVufDB8fDB8fHww";
    };

    if (loading) {
        return (
            <section className="py-4 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-3">Premium Car Accessories</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Loading accessories...
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-4 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-3">Premium Car Accessories</h2>
                        <p className="text-red-500 max-w-2xl mx-auto">
                            Error: {error}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-4 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">Premium Car Accessories</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Discover our curated collection of high-quality automotive accessories
                    </p>
                </div>

                <div className="flex overflow-x-auto pb-3 hide-scrollbar">
                    <div className="flex space-x-2 mx-auto">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/accessories?category=${category.id}`}
                            >
                                <button
                                    className="px-4 py-2 bg-white text-gray-700 rounded-full border border-gray-200 whitespace-nowrap hover:border-dealership-primary hover:text-dealership-primary transition-all duration-200"
                                >
                                    {category.name}
                                </button>
                            </Link>
                        ))}

                        <Link to="/accessories">
                            <button className="px-4 py-2 bg-dealership-primary/80 text-gray-800 rounded-full font-medium whitespace-nowrap hover:bg-dealership-primary transition-all duration-200 flex items-center">
                                More spare parts <ChevronRight size={16} className="ml-1" />
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                        Featured Accessories
                    </h3>

                    {accessories.length > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrevious}
                                disabled={isAnimating}
                                className="p-3 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 hover:border-dealership-primary"
                            >
                                <ChevronLeft size={20} className="text-gray-700" />
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={isAnimating}
                                className="p-3 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 hover:border-dealership-primary"
                            >
                                <ChevronRight size={20} className="text-gray-700" />
                            </button>
                        </div>
                    )}
                </div>

                {accessories.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No accessories found.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {getVisibleAccessories().map((accessory) => (
                                <Link
                                    to={`/accessorydetails/${accessory.slug}`}
                                    key={accessory.id}
                                    className="block"
                                >
                                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group relative cursor-pointer">
                                        <div className="absolute top-3 left-3 z-10 flex gap-2">
                                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                NEW
                                            </span>
                                            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                FEATURED
                                            </span>
                                        </div>

                                        <button
                                            onClick={(e) => toggleFavorite(accessory.id, e)}
                                            className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-rose-50 transition-colors"
                                        >
                                            <Heart
                                                size={18}
                                                className={
                                                    favorites.includes(accessory.id)
                                                        ? "fill-rose-500 text-rose-500"
                                                        : "text-gray-400"
                                                }
                                            />
                                        </button>

                                        <div className="h-60 overflow-hidden relative">
                                            <img
                                                src={getPrimaryImage(accessory)}
                                                alt={accessory.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    
                                                    e.currentTarget.src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FyfGVufDB8fDB8fHww";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                                        </div>

                                        <div className="p-4">
                                            <h4 className="font-bold text-gray-900 text-center group-hover:text-dealership-primary transition-colors duration-200">
                                                {accessory.name}
                                            </h4>
                                            
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <Link to="/accessories">
                            <div className="text-center mt-12">
                                <button className="bg-dealership-primary hover:bg-dealership-primary/80 text-white px-6 py-3 rounded-full font-medium transition-colors shadow-md hover:shadow-lg">
                                    Browse All Accessories
                                </button>
                            </div>
                        </Link>
                    </>
                )}
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