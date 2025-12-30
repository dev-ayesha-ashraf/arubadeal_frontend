import { useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface Props {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  isMobile?: boolean;
  setIsFilterOpen?: (open: boolean) => void;
  categories: Category[];
}

export const FiltersSidebar = ({
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  setCurrentPage,
  isMobile = false,
  setIsFilterOpen,
  categories,
}: Props) => (
  <div className="h-full overflow-y-auto">
    <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4">
      <h2 className="text-xl font-bold text-dealership-navy">Search Filters</h2>
      {isMobile && setIsFilterOpen && (
        <button onClick={() => setIsFilterOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
          ✕
        </button>
      )}
    </div>

    <div className="mb-6">
      <label className="block text-sm font-medium text-dealership-navy mb-2">Search Accessories</label>
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name, brand, price..."
          className="w-full pl-3 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-dealership-primary focus:border-dealership-primary"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>

    <div className="mb-6">
      <h3 className="text-lg font-semibold text-dealership-navy mb-3 border-b border-gray-200 pb-2">Categories</h3>
      <div className="space-y-2">
        <button
          className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
            selectedCategory === "All"
              ? "bg-dealership-primary/60 text-gray-800 font-medium border border-blue-100"
              : "text-dealership-navy hover:bg-gray-50 border border-transparent"
          }`}
          onClick={() => {
            setSelectedCategory("All");
            setCurrentPage(1);
            isMobile && setIsFilterOpen?.(false);
          }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === cat.id
                ? "bg-dealership-primary/60 text-gray-800 font-medium border border-blue-100"
                : "text-dealership-navy hover:bg-gray-50 border border-transparent"
            }`}
            onClick={() => {
              setSelectedCategory(cat.id);
              setCurrentPage(1);
              isMobile && setIsFilterOpen?.(false);
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  </div>
);
