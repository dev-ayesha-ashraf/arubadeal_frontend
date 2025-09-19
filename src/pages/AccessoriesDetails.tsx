import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';
import { Navbar } from '@/components/common/Navbar';
import { ImageZoom } from '@/components/common/ImageZoom';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";

const AccessoriesDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const relatedProducts = [
    {
      id: 1,
      name: 'Pennzoil Platinum Full Synthetic OW-20 Motor Oil, 5 Quart',
      price: 26.96,
      originalPrice: 47.11,
      discount: 43,
      rating: 3.33,
      reviewCount: 3
    },
    {
      id: 2,
      name: 'Oil Filter - Compatible with 2011 - 2022 Ford',
      price: 65.33,
      originalPrice: 89.99,
      discount: 26,
      rating: 4.33,
      reviewCount: 3
    },
    {
      id: 3,
      name: 'Risione High Mileage Steering Stop White with Leak Repair...',
      price: 9.88,
      originalPrice: 15.99,
      discount: 39,
      rating: 4.33,
      reviewCount: 3
    },
    {
      id: 4,
      name: 'Catalytic converter cleaner high quality pass emissions test...',
      price: 21.18,
      originalPrice: 98.45,
      discount: 45,
      rating: 4.67,
      reviewCount: 3
    },
    {
      id: 5,
      name: 'Castrol GTX High Mileage SW-30 Synthetic Blend Motor Oil, ...',
      price: 41.16,
      originalPrice: 57.77,
      discount: 29,
      rating: 4.33,
      reviewCount: 3
    }
  ];
  const productImages = [
    { url: "https://images.unsplash.com/photo-1612805144400-88c7821bf36f?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Steering Wheel Front View" },
    { url: "https://images.unsplash.com/photo-1713212868358-091a79f8fe9a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDJ8fHxlbnwwfHx8fHw%3D", alt: "Steering Wheel Side View" },
    { url: "https://images.unsplash.com/photo-1673566774882-620ffd37ab09?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDZ8fHxlbnwwfHx8fHw%3D", alt: "Steering Wheel Close-up" }
  ];
  const navigatePrevious = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const navigateNext = () => {
    setSelectedImageIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <Navbar />
      <div className="container mx-auto mt-[150px] md:mt-0 py-4 md:py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          <div className="w-full lg:w-1/2">
            <div className="relative bg-gray-100 rounded-lg">
              <div
                className="h-64 md:h-96 flex items-center justify-center cursor-zoom-in relative"
                onClick={() => setIsZoomOpen(true)}
              >
                <img
                  src={productImages[selectedImageIndex].url}
                  alt={productImages[selectedImageIndex].alt}
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePrevious();
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateNext();
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="hidden sm:grid grid-cols-3 gap-2 mt-4">
                {productImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`rounded border-2 cursor-pointer flex items-center justify-center h-20 md:h-24 ${selectedImageIndex === idx
                      ? "border-black"
                      : "border-transparent"
                      }`}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>

              {/* MOBILE IMAGE INDICATOR DOTS - Show only on small screens */}
              <div className="sm:hidden flex justify-center mt-4 space-x-2">
                {productImages.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2 h-2 rounded-full ${selectedImageIndex === idx ? 'bg-black' : 'bg-gray-300'}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="w-full lg:w-1/2">
            <div className="mb-4 md:mb-6">
              <span className="text-xs md:text-sm text-gray-500">Category: Oils and fluids</span>
              <h1 className="text-xl md:text-3xl font-bold mt-1">Zerex G05 Phosphate Free Antifreeze Coolant Concentrate 1 GA</h1>
              <div className="flex items-center mt-2">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">In Stock</span>
                <span className="text-gray-500 text-xs md:text-sm ml-3">SKU: UBWDEKISSI</span>
              </div>
            </div>

            <div className="mb-4 md:mb-6">
              <div className="flex items-center">
                <span className="text-xl md:text-2xl font-bold">$33.43</span>
                <span className="text-base md:text-lg text-gray-500 line-through ml-2">$48.55</span>
              </div>
              <p className="text-xs md:text-sm text-gray-600 mt-1">This product has been added to 25 people's carts.</p>
            </div>

            <div className="mb-4 md:mb-6">
              <p className="text-xs md:text-sm">
                High-quality additives protect against leaks and won't harm gaskets, hoses, plastics or original vehicle finish
              </p>
            </div>

            <div className="flex items-center mb-4 md:mb-6">
              <div className="flex items-center border border-gray-300 rounded-md mr-3 md:mr-4">
                <button
                  className="px-3 py-2 text-lg"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <span className="px-3 py-2">{quantity}</span>
                <button
                  className="px-3 py-2 text-lg"
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  +
                </button>
              </div>
              <button className="bg-black text-white py-2 px-4 md:px-6 rounded-md font-medium mr-2 md:mr-3 text-sm md:text-base">
                Add to cart
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4 md:pt-6 mb-4 md:mb-6">
              <div className="flex flex-col md:flex-row md:items-center text-xs md:text-sm">
                <div className="mb-2 md:mb-0 md:mr-6">
                  <span className="font-medium">Dispatch within 24 Hours:</span> Your product will be shipped quickly.
                </div>
                <div>
                  <span className="font-medium">3-Year Warranty:</span> Ignaro is safe with warranty conditions.
                </div>
              </div>
              <div className="mt-3 md:mt-4">
                <p className="text-xs md:text-sm">
                  Our customer representative is waiting for you.<br className="hidden md:block" />
                  Call for immediate assistance at <span className="font-medium">1-234-5678-91</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs Section */}
        <div className="mt-8 md:mt-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 md:space-x-8 overflow-x-auto">
              {['description', 'specs', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  className={`py-3 md:py-4 px-1 font-medium text-xs md:text-sm border-b-2 whitespace-nowrap ${activeTab === tab
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-4 md:py-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-sm md:text-base">
                <p>
                  High-quality additives protect against leaks and won't harm gaskets, hoses, plastics or original vehicle finish.
                  Integer matts ultricies augue, ac bloendum arcu viverra vel. Etiam eu facilisi svelt. Mauris auctor efficitur turpis feugiat boreet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8 md:mt-12">
          <div className="text-center">
            <div className="mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xs">🚚</span>
              </div>
            </div>
            <h3 className="font-medium mb-2 text-sm md:text-base">Fast Shipping</h3>
            <p className="text-xs md:text-sm text-gray-600">
              Integer matts ultricies augue, ac bloendum arcu viverra vel. Etiam eu facilisi svelt. Mauris auctor efficitur turpis feugiat boreet.
            </p>
          </div>

          <div className="text-center">
            <div className="mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xs">↩️</span>
              </div>
            </div>
            <h3 className="font-medium mb-2 text-sm md:text-base">Easy Return</h3>
            <p className="text-xs md:text-sm text-gray-600">
              Integer matts ultricies augue, ac bloendum arcu viverra vel. Etiam eu facilisi svelt. Mauris auctor efficitur turpis feugiat boreet.
            </p>
          </div>

          <div className="text-center">
            <div className="mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xs">🔧</span>
              </div>
            </div>
            <h3 className="font-medium mb-2 text-sm md:text-base">Warranty Policy</h3>
            <p className="text-xs md:text-sm text-gray-600">
              Integer matts ultricies augue, ac bloendum arcu viverra vel. Etiam eu facilisi svelt. Mauris auctor efficitur turpis feugiat boreet.
            </p>
          </div>
        </div>

        {/* Related Products Section - Now visible on mobile too */}
        <div className="mt-8 md:mt-12">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Related products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
            {relatedProducts.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-3 md:p-4">
                <div className="bg-gray-100 h-28 md:h-40 mb-2 md:mb-3 flex items-center justify-center rounded">
                  <img
                    src="https://plus.unsplash.com/premium_photo-1672723447001-52a2e9f7f58d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Y2FyJTIwdGlyZXN8ZW58MHx8MHx8fDA%3D"
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="mb-1 md:mb-2">
                  <span className="bg-red-100 text-red-800 text-xs px-1 md:px-2 py-0.5 md:py-1 rounded">
                    {product.discount}% OFF
                  </span>
                </div>
                <h3 className="font-medium text-xs md:text-sm mb-1 md:mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center mb-1 md:mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-3 h-3 md:w-4 md:h-4 ${star <= Math.floor(product.rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                          }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600 ml-1">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold text-sm md:text-base">${product.price}</span>
                  <span className="text-xs md:text-sm text-gray-500 line-through ml-1 md:ml-2">
                    ${product.originalPrice}
                  </span>
                </div>
                <button className="w-full mt-2 md:mt-3 bg-black text-white py-1.5 md:py-2 text-xs md:text-sm rounded">
                  Add to cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='mt-12 md:mt-20'>
        <Footer />
      </div>

      <ImageZoom
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        imageUrl={productImages[selectedImageIndex].url}
        alt={productImages[selectedImageIndex].alt}
        images={productImages}
        currentIndex={selectedImageIndex}
      />
    </div>
  );
};

export default AccessoriesDetails;