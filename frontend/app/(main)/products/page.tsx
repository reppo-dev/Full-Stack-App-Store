"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { productsApi } from "@/lib/api/products";
import { Product } from "@/models/modles";
import CardProducts from "@/components/cardProductsmain";
import BannerProducts from "@/components/bannerProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Gamepad2,
  Grid,
  RefreshCw,
  X,
} from "lucide-react";

const categoryFilters = [
  { id: 0, name: "All Products", icon: Grid },
  { id: 1, name: "Smartphones & Tablets", icon: Smartphone },
  { id: 2, name: "Laptops & Computers", icon: Laptop },
  { id: 3, name: "Audio & Headphones", icon: Headphones },
  { id: 4, name: "Wearable Tech", icon: Watch },
  { id: 5, name: "Gaming & Consoles", icon: Gamepad2 },
];

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = parseInt(searchParams.get("category_id") || searchParams.get("categoryId") || "0", 10);
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productsApi.listAll();
        setProducts(res);
      } catch (err) {
        console.error("Failed to load catalog products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter and Sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory > 0) {
          const pCat = Number(p.category_id ?? p.categoryId ?? p.CategoryID ?? 0);
          if (pCat !== selectedCategory) return false;
        }
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title?.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchCat = p.category_name?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
        if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
        if (sortBy === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
        return 0; // default featured
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory(0);
    setSearchQuery("");
    setSortBy("featured");
  };

  return (
    <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Hero Campaign Carousel */}
      <BannerProducts />

      {/* Catalog Header & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Package className="h-7 w-7 text-red-600" />
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Browse genuine flagship devices, verified authentic warranty, and same-day delivery.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search catalog by model or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-10 rounded-xl bg-card border-border/80 focus-visible:ring-red-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 pr-8 rounded-xl border border-border/80 bg-card text-xs font-semibold text-foreground focus:outline-hidden focus:ring-2 focus:ring-red-600 appearance-none cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Filter Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        {categoryFilters.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "bg-red-600 text-white shadow-sm scale-102"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-border/60"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Results Metadata */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong className="text-foreground font-semibold">{filteredProducts.length}</strong> items
          {selectedCategory > 0 && ` in ${categoryFilters.find((c) => c.id === selectedCategory)?.name}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>

        {(selectedCategory > 0 || searchQuery || sortBy !== "featured") && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-red-600 hover:underline font-semibold flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-red-600 mb-3" />
          <p className="text-sm text-muted-foreground">Loading catalog products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="border border-dashed border-border/80 rounded-3xl p-16 text-center bg-card max-w-lg mx-auto">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
          <h3 className="text-lg font-bold text-foreground">No Products Found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            We couldn't find any products matching your current filters or search query.
          </p>
          <Button
            onClick={resetFilters}
            className="mt-5 bg-red-600 hover:bg-red-700 text-white font-bold h-9 text-xs rounded-xl"
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <CardProducts key={product.id || product.ID} props={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-red-600 mb-3" />
          <p className="text-sm text-muted-foreground">Loading catalog...</p>
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}
