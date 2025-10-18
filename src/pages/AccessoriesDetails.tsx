import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';
import { Navbar } from '@/components/common/Navbar';
import { ImageZoom } from '@/components/common/ImageZoom';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, Truck, Shield, CheckCircle } from "lucide-react";
import { useParams, Link } from 'react-router-dom';

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

const AccessoriesDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [accessory, setAccessory] = useState<Accessory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Accessory[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const API_URL = import.meta.env.VITE_API_URL;
  const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

  useEffect(() => {
    const fetchAccessoryDetails = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/car_accessory/?page=1&size=50`);
        if (!response.ok) throw new Error(`Failed to fetch accessories: ${response.status}`);

        const data = await response.json();
        const foundAccessory = data.items.find((item: Accessory) => item.slug === slug);
        if (!foundAccessory) throw new Error('Accessory not found');
        setAccessory(foundAccessory);

        const related = data.items
          .filter((item: Accessory) => item.id !== foundAccessory.id && item.category.id === foundAccessory.category.id)
          .slice(0, 4);

        setRelatedProducts(related);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch accessory details');
      } finally {
        setLoading(false);
      }
    };
    fetchAccessoryDetails();
  }, [slug, API_URL, MEDIA_URL]);

  const productImages = accessory?.images.map(img => ({
    url: `${MEDIA_URL}${img.image_url}`,
    alt: accessory.name
  })) || [];

  const getPrimaryImage = (item: Accessory) => {
    const primary = item.images.find(i => i.is_primary);
    return primary ? `${MEDIA_URL}${primary.image_url}` :
      item.images.length > 0 ? `${MEDIA_URL}${item.images[0].image_url}` :
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600";
  };

  const navigatePrevious = () => setSelectedImageIndex(prev => prev === 0 ? productImages.length - 1 : prev - 1);
  const navigateNext = () => setSelectedImageIndex(prev => prev === productImages.length - 1 ? 0 : prev + 1);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !accessory) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          <p className="text-red-500 mb-4">{error || 'Accessory not found'}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navbar />

      <div className="container mx-auto py-8 px-4 lg:px-8 mt-4">
        <div className="flex flex-col lg:flex-row gap-8 mb-16">
          <div className="lg:w-1/2">
            <div className="relative bg-gray-50 rounded-2xl p-4">
              {productImages.length > 0 && (
                <>
                  <img
                    src={productImages[selectedImageIndex].url}
                    alt={productImages[selectedImageIndex].alt}
                    className="w-full h-96 object-contain rounded-lg cursor-zoom-in"
                    onClick={() => setIsZoomOpen(true)}
                  />
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={navigatePrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-lg"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={navigateNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-lg"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {productImages.length > 1 && (
              <div className="flex gap-3 mt-4">
                {productImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={img.alt}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${
                      selectedImageIndex === idx ? 'border-black' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:w-1/2 space-y-6">
            <div>
              <div className="flex items-center gap-4 ">
                <span className="text-sm text-gray-500">{accessory.category.name}</span>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  accessory.out_of_stock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {accessory.out_of_stock ? 'Out of Stock' : 'In Stock'}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{accessory.name}</h1>
              <p className="text-gray-600">{accessory.description}</p>
            </div>

            <div className="flex justify-between">
              <span className="text-4xl font-bold">AWG {accessory.price}</span>
              <button
                onClick={() => toggleFavorite(accessory.id)}
                className="p-3 rounded-full border hover:bg-gray-50"
              >
                <Heart 
                  size={20} 
                  className={favorites.includes(accessory.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} 
                />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="text-green-600" size={16} />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="text-blue-600" size={16} />
                <span>2-Year Warranty</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="text-green-600" size={16} />
                <span>Quality Certified</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))} 
                    className="px-4 py-2 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 min-w-[40px] text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => prev + 1)} 
                    className="px-4 py-2 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                
                <button
                  className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400"
                  disabled={accessory.out_of_stock}
                >
                  {accessory.out_of_stock ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Quick Specs</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Brand:</span>
                  <span className="ml-2 font-medium">{accessory.brand}</span>
                </div>
                <div>
                  <span className="text-gray-600">Stock:</span>
                  <span className="ml-2 font-medium">{accessory.stock} units</span>
                </div>
                {accessory.model_compatibility.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Compatible with:</span>
                    <span className="ml-2 font-medium">{accessory.model_compatibility.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((prod) => (
                <Link key={prod.id} to={`/accessorydetails/${prod.slug}`}>
                  <div className="group bg-white border rounded-xl overflow-hidden hover:shadow-lg transition">
                    <img
                      src={getPrimaryImage(prod)}
                      alt={prod.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1">{prod.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{prod.category.name}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold">AWG {prod.price}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          prod.out_of_stock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {prod.out_of_stock ? 'Out of Stock' : 'In Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />

      {productImages.length > 0 && (
        <ImageZoom
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
          imageUrl={productImages[selectedImageIndex].url}
          alt={productImages[selectedImageIndex].alt}
          images={productImages}
          currentIndex={selectedImageIndex}
        />
      )}
    </div>
  );
};

export default AccessoriesDetails;
