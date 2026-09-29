"use client";

import Image from "next/image";
import Link from "next/link";
import { RecommendationProductDTO } from "@/types";

interface PairingWidgetProps {
  pairingProduct: RecommendationProductDTO | null;
}

export function PairingWidget({ pairingProduct }: PairingWidgetProps) {
  // CRITICAL (Correction 3): Only render widget if a valid cross-category match exists!
  if (!pairingProduct) {
    return null;
  }

  const primaryImage =
    pairingProduct.images.find((img) => img.isPrimary)?.url ||
    pairingProduct.images[0]?.url ||
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800";

  const isTeaPairing = pairingProduct.category.slug === "single-estate-teas" || Boolean(pairingProduct.teaType);

  return (
    <aside aria-label="Complementary Product Pairing" className="bg-brand-beige/50 border border-brand-gold/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-brand-gold/15 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
          <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
            Pairs Well With
          </span>
        </div>
        <span className="font-sans text-[10px] uppercase tracking-wider font-semibold text-brand-olive bg-brand-ivory px-2.5 py-0.5 rounded-full border border-brand-gold/20">
          {isTeaPairing ? "Craft Tea Ritual" : "Parfumerie Companion"}
        </span>
      </div>

      {/* Product Content Card Grid */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Image Frame */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-brand-ivory border border-brand-gold/15">
          <Image
            src={primaryImage}
            alt={pairingProduct.name}
            fill
            sizes="128px"
            className="object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Narrative & Details */}
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-brand-olive block">
            {pairingProduct.category.name}
          </span>
          <Link href={`/product/${pairingProduct.slug}`} className="group inline-block">
            <h4 className="font-serif text-lg font-semibold text-brand-forest group-hover:text-brand-gold transition-colors">
              {pairingProduct.name}
            </h4>
          </Link>

          <p className="font-sans text-xs text-brand-olive line-clamp-2 leading-relaxed">
            {pairingProduct.description}
          </p>

          {/* Contextual Note Badges */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
            {pairingProduct.fragranceFamily && (
              <span className="font-sans text-[10px] uppercase font-medium text-brand-forest bg-brand-ivory border border-brand-gold/20 px-2 py-0.5 rounded-md">
                {pairingProduct.fragranceFamily}
              </span>
            )}
            {pairingProduct.teaType && (
              <span className="font-sans text-[10px] uppercase font-medium text-brand-forest bg-brand-ivory border border-brand-gold/20 px-2 py-0.5 rounded-md">
                {pairingProduct.teaType}
              </span>
            )}
            {pairingProduct.mood && (
              <span className="font-sans text-[10px] text-brand-olive bg-brand-ivory/80 px-2 py-0.5 rounded-md">
                {pairingProduct.mood}
              </span>
            )}
          </div>

          {/* Price & Action Button */}
          <div className="pt-2 flex items-center justify-between sm:justify-start sm:space-x-6">
            <span className="font-sans font-semibold text-brand-forest text-sm">
              ${pairingProduct.price}
            </span>
            <Link
              href={`/product/${pairingProduct.slug}`}
              className="inline-block px-4 py-1.5 bg-brand-forest hover:bg-brand-olive text-brand-ivory text-[11px] font-semibold uppercase tracking-widest rounded-md transition-colors font-sans"
            >
              Discover Pairing &rarr;
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
