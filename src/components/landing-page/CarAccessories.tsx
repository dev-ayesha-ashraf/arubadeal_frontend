import { useState, useEffect, useMemo } from "react";
import { Header } from "../common/Header";
import { Navbar } from "../common/Navbar";
import { Footer } from "../common/Footer";
import { Pagination } from "../common/Pagination";
import { Link, useSearchParams } from "react-router-dom";
import { AccessoryCard } from "../common/AccessoryCard";
import { FiltersSidebar } from "../common/FilterSidebar";

interface Accessory {
  id: string;
  name: string;
  brand: string;
  price: string;
  slug: string;
  description: string;
  out_of_stock: boolean;
  images: any[];
  category?: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
}

const ITEMS_PER_PAGE = 9;
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/car_accessory`;

export const CarAccessories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "All");
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.get("page") || "1"));
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [allAccessories, setAllAccessories] = useState<Accessory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", () => setIsMobile(window.innerWidth < 1024));
    return () => window.removeEventListener("resize", () => setIsMobile(window.innerWidth < 1024));
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/category/`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        setCategories(await res.json());
      } catch {
        setError("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchAccessories = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/`);
        if (!res.ok) throw new Error("Failed to fetch accessories");
        const data = await res.json();
        setAllAccessories(data.items || []);
      } catch {
        setError("Failed to load accessories");
      } finally {
        setLoading(false);
      }
    };
    fetchAccessories();
  }, []);

  const filteredAccessories = useMemo(() => {
    if (!allAccessories.length) return [];
    let filtered = allAccessories;
    if (selectedCategory !== "All") {
      filtered = filtered.filter(acc => acc.category?.id === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(acc =>
        acc.name.toLowerCase().includes(q) ||
        acc.brand.toLowerCase().includes(q) ||
        acc.description.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allAccessories, selectedCategory, searchQuery]);

  const paginatedAccessories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAccessories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAccessories, currentPage]);

  const totalPages = Math.ceil(filteredAccessories.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navbar />

      <section className="py-16">
        <div className="container flex flex-col lg:flex-row gap-8">
          {!isMobile && (
            <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm p-6 border border-border h-fit">
              <FiltersSidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setCurrentPage={setCurrentPage}
                categories={categories}
              />
            </div>
          )}

          {isMobile && isFilterOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end">
              <div className="w-4/5 max-w-sm bg-white p-6 overflow-y-auto">
                <FiltersSidebar
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  setCurrentPage={setCurrentPage}
                  categories={categories}
                  isMobile
                  setIsFilterOpen={setIsFilterOpen}
                />
              </div>
            </div>
          )}

          <div className="flex-1">
            {error && <p className="text-red-500">{error}</p>}
            {loading ? (
              <p>Loading accessories...</p>
            ) : paginatedAccessories.length === 0 ? (
              <p>No accessories found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedAccessories.map(acc => (
                  <AccessoryCard key={acc.id} accessory={acc} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CarAccessories;
