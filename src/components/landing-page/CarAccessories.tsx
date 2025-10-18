import { useState, useEffect, useMemo } from 'react';
import { Header } from '../common/Header';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { Pagination } from '../common/Pagination';
import { Link, useSearchParams } from 'react-router-dom';

interface Category {
    id: string;
    name: string;
}

interface SubCategory {
    id: string;
    name: string;
}

interface Image {
    id: string;
    image_url: string;
    is_primary: boolean;
    position: number;
    is_display: boolean;
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
    images: Image[];
}

interface ApiResponse {
    total_items: number;
    total_pages: number;
    page: number;
    size: number;
    items: Accessory[];
}

const ITEMS_PER_PAGE = 9;
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/car_accessory`;
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

interface FiltersContentProps {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    setCurrentPage: (page: number) => void;
    isMobile: boolean;
    setIsFilterOpen?: (isOpen: boolean) => void;
    categories: Category[];
}
const checkPriceRange = (price: string, query: string): boolean => {
    const priceValue = parseFloat(price);
    const rangePatterns = [
        /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/,
        /(\d+(?:\.\d+)?)\s+to\s+(\d+(?:\.\d+)?)/, 
        /(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/, 
        /under\s+(\d+(?:\.\d+)?)/, 
        /over\s+(\d+(?:\.\d+)?)/, 
        /less than\s+(\d+(?:\.\d+)?)/, 
        /more than\s+(\d+(?:\.\d+)?)/, 
        /greater than\s+(\d+(?:\.\d+)?)/, 
    ];

    for (const pattern of rangePatterns) {
        const match = query.match(pattern);
        if (match) {
            if (pattern.toString().includes('under') || pattern.toString().includes('less than')) {
                const maxPrice = parseFloat(match[1]);
                return priceValue <= maxPrice;
            } else if (pattern.toString().includes('over') || pattern.toString().includes('more than') || pattern.toString().includes('greater than')) {
                const minPrice = parseFloat(match[1]);
                return priceValue >= minPrice;
            } else {
                const minPrice = parseFloat(match[1]);
                const maxPrice = parseFloat(match[2]);
                return priceValue >= minPrice && priceValue <= maxPrice;
            }
        }
    }

    return false;
};

const FiltersContent = ({
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    isMobile,
    setIsFilterOpen,
    categories,
}: FiltersContentProps) => (
    <div className="h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-gray-800">Search Filters</h2>
            {isMobile && setIsFilterOpen && (
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
                    placeholder="Search by name, brand, price, description..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dealership-primary focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => { 
                        setSearchQuery(e.target.value); 
                        setCurrentPage(1); 
                    }}
                />
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">Categories</h3>
            <div className="space-y-2">
                <button
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === 'All'
                        ? 'bg-dealership-primary/60 text-gray-800 font-medium border border-blue-100'
                        : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                        }`}
                    onClick={() => {
                        setSelectedCategory('All');
                        setCurrentPage(1);
                        if (isMobile && setIsFilterOpen) setIsFilterOpen(false);
                    }}
                >
                    All
                </button>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === category.id
                            ? 'bg-dealership-primary/60 text-gray-800 font-medium border border-blue-100'
                            : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                            }`}
                        onClick={() => {
                            setSelectedCategory(category.id);
                            setCurrentPage(1);
                            if (isMobile && setIsFilterOpen) setIsFilterOpen(false);
                        }}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const CarAccessories = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'All');
    const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
    const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.get('page') || '1'));
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [allAccessories, setAllAccessories] = useState<Accessory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024); 
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/category/`);
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data = await response.json();
                setCategories(data);
            } catch (err) {
                setError('Failed to load categories');
                console.error('Error fetching categories:', err);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchAllAccessories = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/`);
                if (!response.ok) throw new Error('Failed to fetch accessories');
                const data: ApiResponse = await response.json();
                
                let allItems = data.items;
                let totalPages = data.total_pages;
                
                if (totalPages > 1) {
                    const promises = [];
                    for (let page = 2; page <= totalPages; page++) {
                        promises.push(
                            fetch(`${API_BASE_URL}/?page=${page}&size=${data.size}`)
                                .then(res => res.json())
                                .then(pageData => pageData.items)
                        );
                    }
                    
                    const additionalItems = await Promise.all(promises);
                    allItems = allItems.concat(...additionalItems);
                }
                
                setAllAccessories(allItems);
            } catch (err) {
                setError('Failed to load accessories');
                console.error('Error fetching accessories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllAccessories();
    }, []);

    const filteredAccessories = useMemo(() => {
        if (!allAccessories.length) return [];

        let filtered = allAccessories;

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(accessory => 
                accessory.category?.id === selectedCategory
            );
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            
            const isNumericQuery = !isNaN(parseFloat(query)) && isFinite(parseFloat(query));
            const numericValue = isNumericQuery ? parseFloat(query) : null;

            filtered = filtered.filter(accessory => {
                const textMatch = 
                    accessory.name.toLowerCase().includes(query) ||
                    accessory.brand.toLowerCase().includes(query) ||
                    accessory.description.toLowerCase().includes(query) ||
                    (accessory.tags && accessory.tags.some(tag => 
                        tag.toLowerCase().includes(query)
                    )) ||
                    (accessory.model_compatibility && accessory.model_compatibility.some(model => 
                        model.toLowerCase().includes(query)
                    )) ||
                    accessory.category?.name.toLowerCase().includes(query) ||
                    accessory.sub_category?.name.toLowerCase().includes(query);

                const priceMatch = numericValue !== null && 
                    parseFloat(accessory.price) === numericValue;

                const partialPriceMatch = numericValue !== null && 
                    accessory.price.includes(query);

                const rangeMatch = checkPriceRange(accessory.price, query);

                return textMatch || priceMatch || partialPriceMatch || rangeMatch;
            });
        }

        return filtered;
    }, [allAccessories, selectedCategory, searchQuery]);

    const paginatedAccessories = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredAccessories.slice(startIndex, endIndex);
    }, [filteredAccessories, currentPage]);

    const totalPages = Math.ceil(filteredAccessories.length / ITEMS_PER_PAGE);
    const totalItems = filteredAccessories.length;

    useEffect(() => {
        const params = new URLSearchParams();
        
        if (selectedCategory !== 'All') {
            params.set('category', selectedCategory);
        }
        
        if (searchQuery) {
            params.set('search', searchQuery);
        }
        
        if (currentPage > 1) {
            params.set('page', currentPage.toString());
        }

        setSearchParams(params);
    }, [selectedCategory, searchQuery, currentPage, setSearchParams]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getImageUrl = (imagePath: string): string => {
        if (!imagePath) {
            return 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300'; 
        }
        
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        return `${MEDIA_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    const getFirstImage = (images: Image[]): string => {
        if (!images || !Array.isArray(images) || images.length === 0) {
            return getImageUrl(''); 
        }
        
        const primaryImage = images.find(img => img.is_primary) || images[0];
        return getImageUrl(primaryImage.image_url);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Header />
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-10 mt-20">
                    <div className="text-center text-red-500 py-12">
                        <p className="text-lg">{error}</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Header />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-10">
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
                    {!isMobile && (
                        <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm p-6 h-fit border border-gray-100">
                            <FiltersContent
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                setCurrentPage={setCurrentPage}
                                isMobile={isMobile}
                                categories={categories}
                            />
                        </div>
                    )}

                    {isMobile && (
                        <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)}></div>
                            <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-xl p-6 overflow-y-auto">
                                <FiltersContent
                                    selectedCategory={selectedCategory}
                                    setSelectedCategory={setSelectedCategory}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    setCurrentPage={setCurrentPage}
                                    isMobile={isMobile}
                                    setIsFilterOpen={setIsFilterOpen}
                                    categories={categories}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex-1">
                        <div className="mb-4 text-gray-600">
                            {loading ? (
                                'Loading all accessories...'
                            ) : (
                                `Showing ${Math.min(paginatedAccessories.length, ITEMS_PER_PAGE)} of ${totalItems} products`
                            )}
                        </div>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
                                    <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 h-full animate-pulse">
                                        <div className="w-full h-56 bg-gray-300"></div>
                                        <div className="p-4">
                                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-300 rounded w-2/3 mb-4"></div>
                                            <div className="h-3 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-300 rounded w-4/5"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                {paginatedAccessories.length > 0 ? (
                                    paginatedAccessories.map((accessory) => (
                                        <Link 
                                            to={`/accessorydetails/${accessory.slug}`} 
                                            key={accessory.id}
                                            state={{ accessory }}
                                        >
                                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-md cursor-pointer h-full flex flex-col">

                                                <div className="relative overflow-hidden">
                                                    <img
                                                        src={getFirstImage(accessory.images)}
                                                        alt={accessory.name}
                                                        className="w-full h-56 object-cover transform transition-transform duration-500 hover:scale-105"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300';
                                                        }}
                                                    />
                                                    {accessory.out_of_stock && (
                                                        <span className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="p-4 flex flex-col flex-grow">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 text-lg mb-1">{accessory.name}</h3>
                                                            <p className="text-gray-500 text-sm">{accessory.brand}</p>
                                                        </div>
                                                        <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                                                            {accessory.category?.name?.split(" ")[0] || 'Accessory'}
                                                        </span>
                                                    </div>

                                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{accessory.description}</p>

                                                    <div className="mt-auto">
                                                        <div className="flex justify-between items-center mb-3">
                                                          
                                                            <span className="text-lg font-bold text-gray-900">
                                                                AWG {accessory.price}
                                                            </span>
                                                        </div>

                                                        <button 
                                                            className={`w-full py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                                                                accessory.out_of_stock
                                                                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                                                    : 'bg-dealership-primary hover:bg-dealership-primary/80 text-white'
                                                            }`}
                                                            disabled={accessory.out_of_stock}
                                                        >
                                                            {accessory.out_of_stock ? (
                                                                'Out of Stock'
                                                            ) : (
                                                                <>
                                                                    <svg
                                                                        className="w-5 h-5 mr-2"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                    </svg>
                                                                    Add to Cart
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12">
                                        <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {totalPages > 1 && (
                            <div className="mt-8">
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CarAccessories;