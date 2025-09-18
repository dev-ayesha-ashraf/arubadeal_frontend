import { useState, useEffect } from 'react';
import { Header } from '../common/Header';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { Pagination } from '../common/Pagination';

interface Accessory {
    id: number;
    name: string;
    category: string;
    price: number;
    rating: number;
    description: string;
    image: string;
    brand: string;
    isFeatured?: boolean;
}

const ITEMS_PER_PAGE = 9;

const CarAccessories = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    // Check screen size on mount and resize
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024); // lg breakpoint
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const accessories: Accessory[] = [
        {
            id: 1,
            name: "Premium Car Audio System",
            category: "Audio, video, navigation",
            price: 299.99,
            rating: 4.8,
            description: "High-quality sound system with Bluetooth connectivity",
            image: "https://plus.unsplash.com/premium_photo-1694206014241-3b20e50b1a4c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2FyJTIwYXVkaW8lMjBzeXN0ZW18ZW58MHx8MHx8fDA%3D",
            brand: "Sony",
            isFeatured: true
        },
        {
            id: 2,
            name: "Alloy Wheels Set",
            category: "Tires and rims",
            price: 899.99,
            rating: 4.7,
            description: "18-inch lightweight alloy wheels for improved performance",
            image: "https://images.unsplash.com/photo-1707926431952-f8b2cd370e9e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YWxsb3klMjB3aGVlbHMlMjBzZXR8ZW58MHx8MHx8fDA%3D",
            brand: "Enkei"
        },
        {
            id: 3,
            name: "Performance Exhaust System",
            category: "Engine and engine equipment",
            price: 499.99,
            rating: 4.6,
            description: "Enhances engine sound and improves performance",
            image: "https://images.unsplash.com/photo-1725654037117-523ffb2f1f0d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fGNhciUyMGV4aGF1c3R8ZW58MHx8MHx8fDA%3D",
            brand: "Borla"
        },
        {
            id: 4,
            name: "LED Headlight Kit",
            category: "Electrical equipment",
            price: 159.99,
            rating: 4.5,
            description: "Bright LED headlights for improved visibility",
            image: "https://plus.unsplash.com/premium_photo-1693894132528-5336cabf7161?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fGNhciUyMExFRCUyMGhlYWRsaWdodCUyMGtpdHxlbnwwfHwwfHx8MA%3D%3D",
            brand: "Philips"
        },
        {
            id: 5,
            name: "Carbon Fiber Spoiler",
            category: "Body parts (large-size)",
            price: 399.99,
            rating: 4.4,
            description: "Aerodynamic spoiler for improved stability",
            image: "https://images.unsplash.com/photo-1710464090591-dcec65dff903?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FyYm9uJTIwZmliZXIlMjBzcG9pbGVyfGVufDB8fDB8fHww",
            brand: "Seibon"
        },
        {
            id: 6,
            name: "Car Cover",
            category: "Body parts (small-size)",
            price: 89.99,
            rating: 4.3,
            description: "Weather-resistant car cover for outdoor protection",
            image: "https://images.unsplash.com/photo-1596165494776-c27e37f666fe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FyJTIwY292ZXJ8ZW58MHx8MHx8fDA%3D",
            brand: "Classic Accessories"
        },
        {
            id: 7,
            name: "Performance Air Filter",
            category: "Engine and engine equipment",
            price: 49.99,
            rating: 4.2,
            description: "High-flow air filter for improved engine breathing",
            image: "https://plus.unsplash.com/premium_photo-1682126121962-d2ce1e5d889c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2FyJTIwYWlyJTIwZmlsdGVyfGVufDB8fDB8fHww",
            brand: "K&N"
        },
        {
            id: 8,
            name: "Dash Cam",
            category: "Audio, video, navigation",
            price: 129.99,
            rating: 4.7,
            description: "1080p HD recording with night vision",
            image: "https://images.unsplash.com/photo-1624505960581-1303fbcca00d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZGFzaGNhbXxlbnwwfHwwfHx8MA%3D%3D",
            brand: "Garmin"
        },
        {
            id: 9,
            name: "Sport Pedals",
            category: "Interior compartment",
            price: 79.99,
            rating: 4.1,
            description: "Aluminum sport pedals for better grip and style",
            image: "https://images.unsplash.com/photo-1623182102094-be4a73832c1d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2FycyUyMHBlZGFsc3xlbnwwfHwwfHx8MA%3D%3D",
            brand: "Megan Racing"
        },
        {
            id: 10,
            name: "Strut Tower Bar",
            category: "Suspension and steering",
            price: 199.99,
            rating: 4.5,
            description: "Improves chassis rigidity and handling",
            image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300",
            brand: "Cusco"
        },
        {
            id: 11,
            name: "Shift Knob",
            category: "Interior compartment",
            price: 59.99,
            rating: 4.0,
            description: "Weighted aluminum shift knob for precise shifting",
            image: "https://images.unsplash.com/photo-1661501315675-e0edf5678345?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2FyJTIwc2hpZnQlMjBrbm9ifGVufDB8fDB8fHww",
            brand: "Billet"
        },
        {
            id: 12,
            name: "Performance Brake Kit",
            category: "Suspension and steering",
            price: 699.99,
            rating: 4.8,
            description: "High-performance brake system for improved stopping",
            image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300",
            brand: "Brembo"
        },
        {
            id: 13,
            name: "Window Tint Kit",
            category: "Body parts (small-size)",
            price: 69.99,
            rating: 4.2,
            description: "Professional-grade window tint for privacy and UV protection",
            image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300",
            brand: "VViViD"
        },
        {
            id: 15,
            name: "Floor Mats",
            category: "Interior compartment",
            price: 99.99,
            rating: 4.6,
            description: "All-weather rubber floor mats for maximum protection",
            image: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=300",
            brand: "WeatherTech"
        },
        {
            id: 16,
            name: "Performance Chip",
            category: "Engine control units, modules and relays",
            price: 199.99,
            rating: 4.4,
            description: "Plug-and-play performance chip for increased horsepower",
            image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=300",
            brand: "Jet Performance"
        },
        {
            id: 17,
            name: "Steering Wheel Cover",
            category: "Interior compartment",
            price: 29.99,
            rating: 4.0,
            description: "Leather steering wheel cover for improved grip and comfort",
            image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300",
            brand: "BDK"
        },
        {
            id: 18,
            name: "Fuel Pump",
            category: "Fuel system",
            price: 149.99,
            rating: 4.5,
            description: "High-flow fuel pump for performance applications",
            image: "https://plus.unsplash.com/premium_photo-1693840238993-5536350d6c57?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2FyJTIwYWNjZXNvcnl8ZW58MHx8MHx8fDA%3D",
            brand: "Walbro"
        },
        {
            id: 19,
            name: "Radiator",
            category: "Cooling and climate control",
            price: 249.99,
            rating: 4.6,
            description: "Aluminum radiator for improved cooling efficiency",
            image: "https://plus.unsplash.com/premium_photo-1694207374055-4593b98cc1df?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGNhciUyMHJhZGlhdG9yfGVufDB8fDB8fHww",
            brand: "Koyorad"
        },
        {
            id: 20,
            name: "Short Throw Shifter",
            category: "Transmission and gear system",
            price: 299.99,
            rating: 4.7,
            description: "Reduces shift throw by 30% for quicker shifts",
            image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300",
            brand: "MGW"
        }
    ];

    const categories = [
        "All",
        "Audio, video, navigation",
        "Body parts (large-size)",
        "Body parts (small-size)",
        "Cooling and climate control",
        "Electrical equipment",
        "Engine and engine equipment",
        "Engine control units, modules and relays",
        "Fuel system",
        "Interior compartment",
        "Suspension and steering",
        "Tires and rims",
        "Transmission and gear system"
    ];

    // Filtered accessories
    const filteredAccessories = accessories.filter(accessory => {
        const matchesCategory = selectedCategory === 'All' || accessory.category === selectedCategory;
        const matchesSearch = accessory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            accessory.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filteredAccessories.length / ITEMS_PER_PAGE);
    const paginatedAccessories = filteredAccessories.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <svg
                    key={i}
                    className={`w-4 h-4 ${i <= rating ? 'text-amber-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            );
        }
        return stars;
    };

    const FiltersContent = () => (
        <div className="h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-800">Search Filters</h2>
                {isMobile && (
                    <button 
                        onClick={() => setIsFilterOpen(false)}
                        className="p-1 rounded-full hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Accessories</label>
                <div className="relative">
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Type to search..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dealership-primary focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">Categories</h3>
                <div className="space-y-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === category
                                    ? 'bg-dealership-primary/60 text-gray-800 font-medium border border-blue-100'
                                    : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                                }`}
                            onClick={() => { 
                                setSelectedCategory(category); 
                                setCurrentPage(1); 
                                if (isMobile) setIsFilterOpen(false);
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Header />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-10">
                {/* Mobile filter button */}
                {isMobile && (
                    <div className="mb-4 mt-20 pt-10">
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filters
                        </button>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar filters - Desktop */}
                    {!isMobile && (
                        <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm p-6 h-fit border border-gray-100">
                            <FiltersContent />
                        </div>
                    )}

                    {/* Mobile filter drawer */}
                    {isMobile && (
                        <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)}></div>
                            <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-xl p-6 overflow-y-auto">
                                <FiltersContent />
                            </div>
                        </div>
                    )}

                    {/* Main Product Grid */}
                    <div className="w-full lg:w-3/4">
                        {paginatedAccessories.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600">No accessories found. Try adjusting your search or filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedAccessories.map((accessory) => (
                                    <div key={accessory.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-md">
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={accessory.image}
                                                alt={accessory.name}
                                                className="w-full h-56 object-cover transform transition-transform duration-500 hover:scale-105"
                                            />
                                            {accessory.isFeatured && (
                                                <span className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                    Featured
                                                </span>
                                            )}
                                            <div className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-md">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{accessory.name}</h3>
                                                    <p className="text-gray-500 text-sm">{accessory.brand}</p>
                                                </div>
                                                <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                                                    {accessory.category.split(' ')[0]}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{accessory.description}</p>

                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center">
                                                    {renderStars(accessory.rating)}
                                                    <span className="text-gray-500 text-sm ml-1">({accessory.rating})</span>
                                                </div>
                                                <span className="text-lg font-bold text-gray-900">AWG {accessory.price.toFixed(2)}</span>
                                            </div>

                                            <button className="w-full bg-dealership-primary hover:bg-dealership-primary/80 text-white py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="mt-10">
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CarAccessories;