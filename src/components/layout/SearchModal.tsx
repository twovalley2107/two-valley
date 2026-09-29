"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchProducts } from "@/actions/catalogActions";
import { ClientProduct } from "@/types";
import { trackEvent } from "@/lib/telemetry";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClientProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Lock body scroll on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Debounced search query execution (300ms)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchProducts(trimmed, { includeOutOfStock: true });
        const count = res.success && res.data ? res.data.length : 0;
        if (res.success && res.data) {
          setResults(res.data);
        } else {
          setResults([]);
        }
        trackEvent("search_query", {
          query: trimmed.slice(0, 200),
          resultCount: count,
        });
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleFullSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-brand-charcoal/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        className="relative w-full max-w-2xl bg-brand-ivory rounded-2xl border border-brand-gold/30 shadow-2xl overflow-hidden font-sans text-brand-charcoal focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="search-modal-title" className="sr-only">
          Search Catalog
        </h2>

        {/* Search Header Form */}
        <form onSubmit={handleFullSearch} className="relative border-b border-brand-gold/20 p-4 sm:p-6 flex items-center">
          <svg
            className="w-5 h-5 text-brand-olive mr-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <label htmlFor="search-catalog-input" className="sr-only">
            Search perfumes, teas, notes, mood, or origin
          </label>
          <input
            id="search-catalog-input"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search perfumes, teas, notes, mood, or origin..."
            className="w-full bg-transparent text-base sm:text-lg font-serif text-brand-forest placeholder-brand-olive/60 focus:outline-none focus:ring-1 focus:ring-brand-gold rounded-lg px-2 py-1"
          />
          {loading && (
            <span className="text-xs text-brand-gold font-sans uppercase tracking-widest animate-pulse mr-2 flex-shrink-0" aria-live="polite">
              Searching...
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search modal"
            className="p-2 text-brand-olive hover:text-brand-forest rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </form>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-4" aria-live="polite">
          {query.trim() === "" ? (
            <div className="text-center py-8 text-xs text-brand-olive space-y-2">
              <p className="font-serif text-sm text-brand-forest font-medium">Popular Search Suggestions</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {["Cardamom", "Darjeeling", "Extrait", "Chai", "Meditative", "Oud"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-full bg-brand-beige border border-brand-gold/25 hover:border-brand-gold text-brand-forest transition-colors text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-olive px-1">
                Matching Formulations ({results.length})
              </div>
              <div className="grid grid-cols-1 gap-2">
                {results.slice(0, 5).map((product) => {
                  const image =
                    product.images.find((i) => i.isPrimary)?.url ||
                    product.images[0]?.url ||
                    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=400";

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center space-x-4 p-2.5 rounded-xl hover:bg-brand-beige/80 transition-colors border border-transparent hover:border-brand-gold/20 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-brand-ivory flex-shrink-0">
                        <Image src={image} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-serif text-sm font-semibold text-brand-forest truncate">
                          {product.name}
                        </div>
                        <div className="text-[11px] text-brand-olive truncate">
                          {product.category?.name} &bull; {product.fragranceFamily || product.teaType || product.origin || "Botanical"}
                        </div>
                      </div>
                      <div className="font-semibold text-xs text-brand-forest font-mono">
                        ${Number(product.price).toFixed(2)}
                      </div>
                    </Link>
                  );
                })}
              </div>
              {results.length > 5 && (
                <button
                  type="button"
                  onClick={handleFullSearch}
                  className="w-full text-center py-2.5 mt-2 rounded-xl bg-brand-beige text-brand-forest hover:bg-brand-gold/20 text-xs font-semibold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold"
                >
                  View All {results.length} Results for &ldquo;{query}&rdquo; &rarr;
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-brand-olive space-y-2">
              <p className="font-serif text-base text-brand-forest">No formulations found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs">Try searching for ingredients like cardamom, jasmine, saffron, or tea origins.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
