import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface Accessory {
    id: string;
    name: string;
    category: string;
    image: string;
    isNew?: boolean;
    isFeatured?: boolean;
}

const AccessoriesShowcase = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);

    // Simplified accessories data with only image and title
    const accessories: Accessory[] = [
        {
            id: "1",
            name: "Premium Car Audio System",
            category: "Audio, video, navigation",
            image: "https://plus.unsplash.com/premium_photo-1694206014241-3b20e50b1a4c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2FyJTIwYXVkaW8lMjBzeXN0ZW18ZW58MHx8MHx8fDA%3D",
            isNew: true,
            isFeatured: true
        },
        {
            id: "2",
            name: "Alloy Wheels Set",
            category: "Tires and rims",
            image: "https://images.unsplash.com/photo-1707926431952-f8b2cd370e9e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YWxsb3klMjB3aGVlbHMlMjBzZXR8ZW58MHx8MHx8fDA%3D",
            isFeatured: true
        },
        {
            id: "3",
            name: "Performance Exhaust",
            category: "Engine equipment",
            image: "https://images.unsplash.com/photo-1619255566224-fca5ef4ca1be?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FyJTIwZXhoYXVzdHxlbnwwfHwwfHx8MA%3D%3D",
            isFeatured: true
        },
        {
            id: "4",
            name: "LED Headlight Kit",
            category: "Electrical equipment",
            image: "https://plus.unsplash.com/premium_photo-1693894132528-5336cabf7161?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fGNhciUyMExFRCUyMGhlYWRsaWdodCUyMGtpdHxlbnwwfHwwfHx8MA%3D%3D",
            isNew: true
        },
        {
            id: "5",
            name: "Carbon Fiber Spoiler",
            category: "Body parts",
            image: "https://images.unsplash.com/photo-1710464090591-dcec65dff903?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FyYm9uJTIwZmliZXIlMjBzcG9pbGVyfGVufDB8fDB8fHww"
        },
        {
            id: "6",
            name: "Performance Brake Kit",
            category: "Braking system",
            image: "https://images.unsplash.com/photo-1656232976683-7b688560e427?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FyJTIwYnJha2V8ZW58MHx8MHx8fDA%3D",
            isFeatured: true
        }
    ];

    const categories = [
        "Tires",
        "Brakes",
        "Body",
        "Filter",
        "Oils & Liquids",
        "Wheel suspension & handlebars",
        "Suspension",
        "Exhaust",
        "Electrics",
        "Motor",
        "Belts, chains, rollers",
        "Other categories"
    ];

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
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prevIndex) =>
            (prevIndex - 1 + accessories.length) % accessories.length
        );
        setTimeout(() => setIsAnimating(false), 300);
    };

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % accessories.length);
        setTimeout(() => setIsAnimating(false), 300);
    };

    const toggleFavorite = (id: string) => {
        setFavorites(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const getVisibleAccessories = () => {
        const items = [];
        const maxItems = Math.min(visibleItems, accessories.length);

        for (let i = 0; i < maxItems; i++) {
            const index = (currentIndex + i) % accessories.length;
            items.push(accessories[index]);
        }

        return items;
    };

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
                            <button
                                key={category}
                                className="px-4 py-2 bg-white text-gray-700 rounded-full border border-gray-200 whitespace-nowrap hover:border-dealership-primary hover:text-dealership-primary transition-all duration-200"
                            >
                                {category}
                            </button>
                        ))}
                        <button className="px-4 py-2 bg-dealership-primary/80 text-gray-800 rounded-full font-medium whitespace-nowrap hover:bg-dealership-primary transition-all duration-200 flex items-center">
                            More spare parts <ChevronRight size={16} className="ml-1" />
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                        Featured Accessories
                    </h3>

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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {getVisibleAccessories().map((accessory) => (
                        <div
                            key={accessory.id}
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group relative"
                        >
                            <div className="absolute top-3 left-3 z-10 flex gap-2">
                                {accessory.isNew && (
                                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        NEW
                                    </span>
                                )}
                                {accessory.isFeatured && (
                                    <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        FEATURED
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => toggleFavorite(accessory.id)}
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
                                    src={accessory.image}
                                    alt={accessory.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                            </div>

                            <div className="p-4">
                                <h4 className="font-bold text-gray-900 text-center group-hover:text-dealership-primary transition-colors duration-200">
                                    {accessory.name}
                                </h4>
                            </div>
                        </div>
                    ))}
                </div>

                <Link to="/accessories">
                    <div className="text-center mt-12">
                        <button className="bg-dealership-primary hover:bg-dealership-primary/80 text-white px-6 py-3 rounded-full font-medium transition-colors shadow-md hover:shadow-lg">
                            Browse All Accessories
                        </button>
                    </div>
                </Link>
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