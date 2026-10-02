"use client";

import { useState } from "react";
import Link from "next/link";
import { ClientProduct } from "@/types";
import { ProductCard } from "@/components/catalog/ProductCard";
import { removeFromWishlist } from "@/actions/wishlistActions";

interface WishlistGridProps {
  initialProducts: ClientProduct[];
}

export function WishlistGrid({ initialProducts }: WishlistGridProps) {
  const [products, setProducts] = useState<ClientProduct[]>(() => {
    return [...initialProducts].sort((a, b) => {
      const isATea = a.category?.slug === "single-estate-teas" || Boolean(a.teaType);
      const isBTea = b.category?.slug === "single-estate-teas" || Boolean(b.teaType);
      if (isATea && !isBTea) return -1;
      if (!isATea && isBTea) return 1;
      return 0;
    });
  });
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      const res = await removeFromWishlist(productId);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (err) {
      console.error("Failed to remove item from wishlist:", err);
    } finally {
      setRemovingId(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-brand-beige/60 border border-brand-gold/20 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-6 font-sans">
        <div className="w-16 h-16 rounded-full bg-brand-ivory border border-brand-gold/30 flex items-center justify-center mx-auto text-brand-forest">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-semibold text-brand-forest">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs text-brand-olive leading-relaxed">
            Explore our high-altitude extraits de parfum and single-estate tea flushes to save your favorite formulations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            href="/teas"
            className="py-3 px-6 rounded-xl bg-brand-forest text-brand-ivory text-xs font-semibold uppercase tracking-widest hover:bg-brand-olive transition-colors"
          >
            Discover Teas
          </Link>
          <Link
            href="/perfumes"
            className="py-3 px-6 rounded-xl border border-brand-forest text-brand-forest text-xs font-semibold uppercase tracking-widest hover:bg-brand-beige transition-colors"
          >
            Explore Perfumes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-xs text-brand-olive font-sans">
        Showing <span className="font-semibold text-brand-forest">{products.length}</span> saved {products.length === 1 ? "formulation" : "formulations"}
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-6 lg:gap-8">
        {products.map((product) => (
          <div key={product.id} className="relative group">
            <ProductCard product={product} />

            {/* Remove Action Button */}
            <button
              onClick={() => handleRemove(product.id)}
              disabled={removingId === product.id}
              aria-label={`Remove ${product.name} from wishlist`}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1 sm:p-2 rounded-full bg-brand-ivory/90 text-brand-olive hover:text-red-700 hover:bg-red-50 border border-brand-gold/20 shadow-sm transition-all focus:outline-none"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
