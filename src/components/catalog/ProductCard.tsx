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
      <div className="group relative bg-brand-beige/60 border border-brand-gold/20 rounded-xl sm:rounded-2xl p-1.5 xs:p-2 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
        {/* Product Image Frame (Clickable Link) */}
        <Link
          href={`/product/${product.slug}`}
          prefetch={false}
          className="relative aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden bg-brand-ivory mb-1.5 sm:mb-4 block cursor-pointer group/img"
        >
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 767px) 33vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover/img:scale-105 group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          {product.isFeatured && (
            <span className="absolute top-1 left-1 sm:top-3 sm:left-3 bg-brand-gold text-brand-charcoal font-sans text-[7px] xs:text-[8px] sm:text-xs font-bold uppercase tracking-wider px-1 sm:px-2.5 py-0.5 rounded-full shadow-sm">
              Featured
            </span>
          )}
        </Link>

        {/* Product Details */}
        <div className="space-y-1 sm:space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <span className="font-sans text-[8px] xs:text-[9px] sm:text-xs uppercase tracking-wider font-semibold text-brand-olive block mb-0.5 truncate">
              {categoryName}
            </span>

            <Link href={`/product/${product.slug}`} prefetch={false} className="focus:outline-none block">
              <h3 className="font-serif text-[11px] xs:text-xs sm:text-xl font-semibold text-brand-forest group-hover:text-brand-gold transition-colors line-clamp-1 leading-tight">
                {product.name}
              </h3>
            </Link>

            <p className="hidden sm:block font-sans text-xs sm:text-sm text-brand-olive line-clamp-2 mt-1.5 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Sensory Note / Origin Badge */}
          <div className="hidden sm:block pt-2">
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
          <div className="pt-1 sm:pt-3 border-t border-brand-gold/15 flex items-center justify-between font-sans mt-1">
            <div className="font-semibold text-brand-forest text-[11px] xs:text-xs sm:text-lg">
              {formattedPrice}
            </div>
            <Link
              href={`/product/${product.slug}`}
              prefetch={false}
              className="hidden sm:inline text-xs sm:text-sm uppercase tracking-widest font-semibold text-brand-forest hover:text-brand-gold transition-colors underline underline-offset-4 py-1"
            >
              Discover
            </Link>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
