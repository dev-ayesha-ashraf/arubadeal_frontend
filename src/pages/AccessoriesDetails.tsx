import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';
import { Navbar } from '@/components/common/Navbar';
import { useState } from 'react';

const AccessoriesDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

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

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <Navbar />
      
      {/* Mobile Layout */}
      <div className="block md:hidden">
        {/* Product Image */}
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Product Image</span>
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          <div className="mb-3">
            <h1 className="text-xl font-bold">Performance Steering Wheel</h1>
            <p className="text-sm text-gray-600">PKDT Chemnty 630</p>
          </div>
          
          {/* Price */}
          <div className="mb-4">
            <span className="text-xl font-bold">$300</span>
          </div>
          
          {/* Add to Cart Button */}
          <div className="mb-6">
            <button className="w-full bg-black text-white py-3 px-4 rounded-md font-medium">
              Add to Cart
            </button>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex">
              <button
                className={`flex-1 py-3 text-center font-medium text-sm ${
                  activeTab === 'description'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`flex-1 py-3 text-center font-medium text-sm ${
                  activeTab === 'specs'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('specs')}
              >
                Specs
              </button>
              <button
                className={`flex-1 py-3 text-center font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="mb-6">
            {activeTab === 'description' && (
              <div>
                <h2 className="font-bold mb-2">Description</h2>
                <p className="text-sm">
                  The PKDT Chemnty 630 steering wheel is coupled for car enthusiasts seeking precision control and stylish design. Built with high-strength chromity steel and non-stigging, it ensures both durability and comfort. Used for high-performance vehicles or a sleek interior upgrade, this steering wheel delivers exceptional responsiveness on the road.
                </p>
              </div>
            )}
            {activeTab === 'specs' && (
              <div>
                <h2 className="font-bold mb-2">Specification</h2>
                <p className="text-sm">Specifications would be listed here.</p>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                <h2 className="font-bold mb-2">Reviews</h2>
                <p className="text-sm">Product reviews would be displayed here.</p>
              </div>
            )}
          </div>
          
          {/* Features */}
          <div className="space-y-6 mb-8">
            <div className="flex items-start">
              <div className="bg-gray-100 rounded-full p-2 mr-3">
                <span className="text-xs">🚚</span>
              </div>
              <div>
                <h3 className="font-medium mb-1">Fast Shipping</h3>
                <p className="text-xs text-gray-600">
                  Integer matts ultricies augue, ac bloendum arcu viverra vel.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-gray-100 rounded-full p-2 mr-3">
                <span className="text-xs">↩️</span>
              </div>
              <div>
                <h3 className="font-medium mb-1">Easy Return</h3>
                <p className="text-xs text-gray-600">
                  Integer matts ultricies augue, ac bloendum arcu viverra vel.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-gray-100 rounded-full p-2 mr-3">
                <span className="text-xs">🔧</span>
              </div>
              <div>
                <h3 className="font-medium mb-1">Warranty Policy</h3>
                <p className="text-xs text-gray-600">
                  Integer matts ultricies augue, ac bloendum arcu viverra vel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Product Image Section */}
            <div className="lg:w-1/2">
              <div className="bg-gray-100 h-96 flex items-center justify-center rounded-lg">
                <span className="text-gray-500">Product Image</span>
              </div>
            </div>
            
            {/* Product Details Section */}
            <div className="lg:w-1/2">
              <div className="mb-6">
                <span className="text-sm text-gray-500">Category: Oils and fluids</span>
                <h1 className="text-3xl font-bold mt-1">Zerex G05 Phosphate Free Antifreeze Coolant Concentrate 1 GA</h1>
                <div className="flex items-center mt-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">In Stock</span>
                  <span className="text-gray-500 text-sm ml-3">SKU: UBWDEKISSI</span>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <span className="text-2xl font-bold">$33.43</span>
                  <span className="text-lg text-gray-500 line-through ml-2">$48.55</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">This product has been added to 25 people's carts.</p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm">
                  High-quality additives protect against leaks and won't harm gaskets, hoses, plastics or original vehicle finish
                </p>
              </div>
    
              
              <div className="flex items-center mb-6">
                <div className="flex items-center border border-gray-300 rounded-md mr-4">
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
                <button className="bg-black text-white py-2 px-6 rounded-md font-medium mr-3">
                  Add to cart
                </button>
                <button className="border border-gray-300 py-2 px-4 rounded-md">
                  Wishlist
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex items-center text-sm">
                  <div className="mr-6">
                    <span className="font-medium">Dispatch within 24 Hours:</span> Your product will be shipped quickly.
                  </div>
                  <div>
                    <span className="font-medium">3-Year Warranty:</span> Ignaro is safe with warranty conditions.
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm">
                    Our customer representative is waiting for you.<br />
                    Call for immediate assistance at <span className="font-medium">1-234-5678-91</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-500 mb-6">
                <span className="mr-4">Share:</span>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs">Icon</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Tabs Section */}
          <div className="mt-12">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {['description', 'specs', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    className={`py-4 px-1 font-medium text-sm border-b-2 ${
                      activeTab === tab
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
            
            <div className="py-6">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p>
                    High-quality additives protect against leaks and won't harm gaskets, hoses, plastics or original vehicle finish.
                    Integer matts ultricies augue, ac bloendum arcu viverra vel. Etiam eu facilisi svelt. Mauris auctor efficitur turpis feugiat boreet.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-xs">🚚</span>
                </div>
              </div>
              <h3 className="font-medium mb-2">Fast Shipping</h3>
              <p className="text-sm text-gray-600">
                Integer matts ultricies augue, ac bloendum arcu viverra vel. Etiam eu facilisi svelt. Mauris auctor efficitur turpis feugiat boreet.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-xs">↩️</span>
                </div>
              </div>
              <h3 className="font-medium mb-2">Easy Return</h3>
              <p className="text-sm text-gray-600">
                Integer matts ultricies augue, ac bloendum arcu viverra vel. Etiam eu facilisi svelt. Mauris auctor efficitur turpis feugiat boreet.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-xs">🔧</span>
                </div>
              </div>
              <h3 className="font-medium mb-2">Warranty Policy</h3>
              <p className="text-sm text-gray-600">
                Integer matts ultricies augue, ac bloendum arcu viverra vel. Etiam eu facilisi svelt. Mauris auctor efficitur turpis feugiat boreet.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section - Hidden on mobile */}
      <div className="hidden md:block mt-12 px-4 container mx-auto">
        <h2 className="text-2xl font-bold mb-6">Related products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {relatedProducts.map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-4">
              <div className="bg-gray-100 h-40 mb-3 flex items-center justify-center rounded">
                <span className="text-gray-500 text-sm">Product Image</span>
              </div>
              <div className="mb-2">
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                  {product.discount}% OFF
                </span>
              </div>
              <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.floor(product.rating)
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
                <span className="font-bold">${product.price}</span>
                <span className="text-sm text-gray-500 line-through ml-2">
                  ${product.originalPrice}
                </span>
              </div>
              <button className="w-full mt-3 bg-black text-white py-2 text-sm rounded">
                Add to cart
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AccessoriesDetails;