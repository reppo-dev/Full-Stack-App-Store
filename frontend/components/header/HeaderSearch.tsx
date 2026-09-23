"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Search, X } from "lucide-react";
import { Button } from "../ui/button";

export default function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="relative hidden md:block w-full max-w-md lg:max-w-lg"
      >
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, brands, categories..."
          className="w-full h-11 pl-4 pr-11 rounded-full bg-muted/40 border-border/70 focus-visible:ring-blue-600 transition-all text-sm"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-9 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-600 p-1 transition-colors cursor-pointer"
          aria-label="Submit search"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {/* Mobile Search Button Trigger */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="Toggle search"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Expandable Search Bar */}
      {isMobileOpen && (
        <div className="absolute top-full left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b px-4 py-3 shadow-md md:hidden animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-10 pl-3 pr-9 rounded-xl bg-muted/50 border-border/80 text-sm"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 font-semibold text-xs"
            >
              Search
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
