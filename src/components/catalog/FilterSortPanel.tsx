"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface FilterSortPanelProps {
  categorySlug?: string;
  totalProducts: number;
}

export function FilterSortPanel({ categorySlug, totalProducts }: FilterSortPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Extract current filter values from URL
  const currentSort = searchParams.get("sort") || "featured";
  const currentFragranceFamily = searchParams.get("fragranceFamily") || "";
  const currentTeaType = searchParams.get("teaType") || "";
  const currentOrigin = searchParams.get("origin") || "";
  const currentMood = searchParams.get("mood") || "";
  const currentCaffeineLevel = searchParams.get("caffeineLevel") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  // Active filters count
  const activeFiltersCount = [
    currentFragranceFamily,
    currentTeaType,
    currentOrigin,
    currentMood,
    currentCaffeineLevel,
    currentMinPrice,
    currentMaxPrice,
  ].filter(Boolean).length;

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset pagination on filter change

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const isPerfume = categorySlug === "artisanal-perfumes" || !categorySlug;
  const isTea = categorySlug === "single-estate-teas" || !categorySlug;

  return (
    <div className="bg-brand-beige/50 border border-brand-gold/20 rounded-2xl p-4 sm:p-6 mb-8 font-sans text-brand-charcoal">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-brand-gold/15">
        {/* Count & Status */}
        <div className="flex items-center space-x-3">
          <span className="font-serif text-lg font-semibold text-brand-forest">
            Formulations
          </span>
          <span className="bg-brand-ivory text-brand-forest text-xs font-semibold px-2.5 py-1 rounded-full border border-brand-gold/25">
            {totalProducts} {totalProducts === 1 ? "Product" : "Products"}
          </span>
          {activeFiltersCount > 0 && (
            <span className="bg-brand-gold text-brand-charcoal text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFiltersCount} Active
            </span>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex md:hidden items-center space-x-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-brand-forest text-brand-ivory text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filter & Sort {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>
        </div>

        {/* Desktop Controls Bar */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <label htmlFor="sort-select" className="text-xs font-medium text-brand-olive uppercase tracking-wider">
              Sort By:
            </label>
            <select
              id="sort-select"
              value={currentSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="bg-brand-ivory text-brand-forest text-xs font-semibold px-3 py-2 rounded-xl border border-brand-gold/30 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-red-700 hover:text-red-900 underline underline-offset-4 uppercase tracking-wider"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Desktop Facet Controls Bar */}
      <div className="hidden md:flex flex-wrap items-center gap-3 pt-4 text-xs">
        {/* Fragrance Family (Perfumes) */}
        {isPerfume && (
          <div className="flex items-center space-x-1.5">
            <span className="text-brand-olive font-medium">Scent Family:</span>
            {["Fresh Woody", "Floral", "Spice"].map((family) => {
              const active = currentFragranceFamily === family;
              return (
                <button
                  key={family}
                  onClick={() => updateParam("fragranceFamily", active ? "" : family)}
                  className={`px-3 py-1 rounded-lg transition-colors border ${
                    active
                      ? "bg-brand-forest text-brand-ivory border-brand-forest font-semibold"
                      : "bg-brand-ivory text-brand-charcoal border-brand-gold/25 hover:border-brand-gold"
                  }`}
                >
                  {family}
                </button>
              );
            })}
          </div>
        )}

        {/* Tea Type (Teas) */}
        {isTea && (
          <div className="flex items-center space-x-1.5">
            <span className="text-brand-olive font-medium">Tea Type:</span>
            {["CTC Chai Patti", "Loose Leaf", "Green", "Infusion"].map((type) => {
              const active = currentTeaType === type;
              return (
                <button
                  key={type}
                  onClick={() => updateParam("teaType", active ? "" : type)}
                  className={`px-3 py-1 rounded-lg transition-colors border ${
                    active
                      ? "bg-brand-forest text-brand-ivory border-brand-forest font-semibold"
                      : "bg-brand-ivory text-brand-charcoal border-brand-gold/25 hover:border-brand-gold"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        )}

        {/* Tea Origin */}
        {isTea && (
          <div className="flex items-center space-x-1.5">
            <span className="text-brand-olive font-medium">Origin:</span>
            {["Assam", "Darjeeling", "Kashmir"].map((orig) => {
              const active = currentOrigin === orig;
              return (
                <button
                  key={orig}
                  onClick={() => updateParam("origin", active ? "" : orig)}
                  className={`px-3 py-1 rounded-lg transition-colors border ${
                    active
                      ? "bg-brand-forest text-brand-ivory border-brand-forest font-semibold"
                      : "bg-brand-ivory text-brand-charcoal border-brand-gold/25 hover:border-brand-gold"
                  }`}
                >
                  {orig}
                </button>
              );
            })}
          </div>
        )}

        {/* Mood Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-brand-olive font-medium">Mood:</span>
          {["Refreshing", "Meditative", "Energetic", "Romantic"].map((m) => {
            const active = currentMood === m;
            return (
              <button
                key={m}
                onClick={() => updateParam("mood", active ? "" : m)}
                className={`px-3 py-1 rounded-lg transition-colors border ${
                  active
                    ? "bg-brand-forest text-brand-ivory border-brand-forest font-semibold"
                    : "bg-brand-ivory text-brand-charcoal border-brand-gold/25 hover:border-brand-gold"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>

        {/* Price Range Filter Inputs */}
        <div className="flex items-center space-x-2 border-l border-brand-gold/20 pl-3">
          <span className="text-brand-olive font-medium">Max Price ($):</span>
          <input
            type="number"
            min="0"
            max="500"
            placeholder="Max $"
            value={currentMaxPrice}
            onChange={(e) => updateParam("maxPrice", e.target.value)}
            className="w-20 px-2 py-1 bg-brand-ivory border border-brand-gold/30 rounded-lg text-brand-forest text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
      </div>

      {/* Mobile Drawer Filter Modal */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-brand-charcoal/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-brand-ivory h-full p-6 space-y-6 overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-brand-gold/20 pb-4">
              <h3 className="font-serif text-lg font-semibold text-brand-forest">
                Filters & Sorting
              </h3>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 text-brand-olive hover:text-brand-forest"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Sort */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-olive">
                Sort Results
              </label>
              <select
                value={currentSort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="w-full bg-brand-beige text-brand-forest text-xs font-semibold p-3 rounded-xl border border-brand-gold/30"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>

            {/* Mobile Scent Family */}
            {isPerfume && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-olive">
                  Fragrance Family
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Fresh Woody", "Floral", "Spice"].map((family) => {
                    const active = currentFragranceFamily === family;
                    return (
                      <button
                        key={family}
                        onClick={() => updateParam("fragranceFamily", active ? "" : family)}
                        className={`px-3 py-1.5 rounded-lg text-xs border ${
                          active
                            ? "bg-brand-forest text-brand-ivory border-brand-forest font-semibold"
                            : "bg-brand-beige text-brand-charcoal border-brand-gold/25"
                        }`}
                      >
                        {family}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile Tea Type */}
            {isTea && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-olive">
                  Tea Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {["CTC Chai Patti", "Loose Leaf", "Green", "Infusion"].map((type) => {
                    const active = currentTeaType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => updateParam("teaType", active ? "" : type)}
                        className={`px-3 py-1.5 rounded-lg text-xs border ${
                          active
                            ? "bg-brand-forest text-brand-ivory border-brand-forest font-semibold"
                            : "bg-brand-beige text-brand-charcoal border-brand-gold/25"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile Mood */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-olive">
                Mood & Vibe
              </label>
              <div className="flex flex-wrap gap-2">
                {["Refreshing", "Meditative", "Energetic", "Romantic"].map((m) => {
                  const active = currentMood === m;
                  return (
                    <button
                      key={m}
                      onClick={() => updateParam("mood", active ? "" : m)}
                      className={`px-3 py-1.5 rounded-lg text-xs border ${
                        active
                          ? "bg-brand-forest text-brand-ivory border-brand-forest font-semibold"
                          : "bg-brand-beige text-brand-charcoal border-brand-gold/25"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Clear All */}
            <div className="pt-6 border-t border-brand-gold/20 flex flex-col gap-3">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-3 rounded-xl bg-brand-forest text-brand-ivory text-xs uppercase tracking-widest font-semibold"
              >
                Apply Filters
              </button>
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    clearAllFilters();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs text-red-700 underline uppercase tracking-wider"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
