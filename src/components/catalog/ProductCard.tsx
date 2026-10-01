import Image from "next/image";
import Link from "next/link";
import { ProductWithRelations, ClientProduct, RecommendationProductDTO } from "@/types";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface ProductCardProps {
  product: ClientProduct | ProductWithRelations | RecommendationProductDTO;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800";

  const formattedPrice = `$${Number(product.price).toFixed(2)}`;
  const categoryName = product.category?.name || "Botanicals";

  return (
    <ScrollReveal className="h-full">
      <div className="group relative bg-brand-beige/60 border border-brand-gold/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
        {/* Product Image Frame */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-brand-ivory mb-4">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          {product.isFeatured && (
            <span className="absolute top-3 left-3 bg-brand-gold text-brand-charcoal font-sans text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <span className="font-sans text-xs uppercase tracking-widest font-semibold text-brand-olive block mb-1">
              {categoryName}
            </span>

            <Link href={`/product/${product.slug}`} prefetch={false} className="focus:outline-none">
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-brand-forest group-hover:text-brand-gold transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>

            <p className="font-sans text-xs sm:text-sm text-brand-olive line-clamp-2 mt-1.5 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Sensory Note / Origin Badge */}
          <div className="pt-2">
            {product.fragranceFamily && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-brand-forest bg-brand-ivory border border-brand-gold/25 px-2.5 py-0.5 rounded-md">
                  {product.fragranceFamily}
                </span>
                {product.mood && (
                  <span className="font-sans text-[11px] tracking-wide text-brand-olive bg-brand-ivory/60 px-2.5 py-0.5 rounded-md">
                    {product.mood.split("&")[0]}
                  </span>
                )}
              </div>
            )}

            {product.teaType && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-brand-forest bg-brand-ivory border border-brand-gold/25 px-2.5 py-0.5 rounded-md">
                  {product.teaType}
                </span>
                {product.origin && (
                  <span className="font-sans text-[11px] tracking-wide text-brand-olive bg-brand-ivory/60 px-2.5 py-0.5 rounded-md">
                    {product.origin}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Price & Action CTA */}
          <div className="pt-3 border-t border-brand-gold/15 flex items-center justify-between font-sans">
            <div className="font-semibold text-brand-forest text-base sm:text-lg">
              {formattedPrice}
            </div>
            <Link
              href={`/product/${product.slug}`}
              prefetch={false}
              className="text-xs sm:text-sm uppercase tracking-widest font-semibold text-brand-forest hover:text-brand-gold transition-colors underline underline-offset-4 py-1"
            >
              Discover
            </Link>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
