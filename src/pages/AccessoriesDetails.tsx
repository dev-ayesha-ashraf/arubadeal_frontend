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

      {/* MOBILE LAYOUT (hidden on md+) */}
      <div className="block md:hidden min-h-screen bg-gradient-to-b from-black to-dealership-primary flex flex-col">
        {/* Back Button + Header */}
        <div className="flex items-center justify-between px-4 py-3 mt-20 pt-20">
          <h1 className="text-white font-semibold text-lg">Car Steering</h1>
          <div className="w-6" />
        </div>

        {/* Product Image */}
        <div className="flex justify-center items-center">
          <img
            className="w-60 h-60 object-contain drop-shadow-xl"
            src="https://images.unsplash.com/photo-1557245526-45dc0f1a8745?q=80&w=870&auto=format&fit=crop"
            alt="Steering wheel"
          />
        </div>

        {/* Product Card */}
        <div className="bg-black rounded-t-3xl p-6 mt-4 flex-1">
          {/* Tabs */}
          <div className="flex justify-between mb-4">
            <button
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                activeTab === 'description'
                  ? 'bg-dealership-primary text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                activeTab === 'specs'
                  ? 'bg-dealership-primary text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
              onClick={() => setActiveTab('specs')}
            >
              Specification
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'description' && (
            <div className="text-white">
              <h2 className="font-semibold mb-2 text-lg">
                Performance Steering Wheel
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                The PILOT Chromoly 520 steering wheel is crafted for car enthusiasts
                seeking precision control and stylish design. Built with high-strength
                chromoly steel and a non-slip grip, it ensures both durability and
                comfort. Ideal for high-performance vehicles or a sleek interior
                upgrade, this steering wheel delivers exceptional responsiveness on
                the road.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="text-white">
              <h2 className="font-semibold mb-2 text-lg">Specifications</h2>
              <p className="text-gray-300 text-sm">
                Specifications would be listed here.
              </p>
            </div>
          )}

          {/* Price + Add to Cart */}
          <div className="flex items-center justify-between mt-6">
            <span className="text-2xl font-bold text-white">$300</span>
            <button className="bg-dealership-primary text-white px-6 py-3 rounded-2xl font-semibold shadow-lg">
              Add to Cart
            </button>
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
                <img src="https://images.unsplash.com/photo-1557245526-45dc0f1a8745?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
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
            </div>
          </div>

          {/* Product Tabs Section */}
          <div className="mt-12">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {['description', 'specs', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === tab
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
                <img src="https://plus.unsplash.com/premium_photo-1672723447001-52a2e9f7f58d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Y2FyJTIwdGlyZXN8ZW58MHx8MHx8fDA%3D" alt="" />
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
                      className={`w-4 h-4 ${star <= Math.floor(product.rating)
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

      {/* <Footer /> */}
    </div>
  );
};

export default AccessoriesDetails;