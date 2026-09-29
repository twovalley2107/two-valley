import { getAllProducts } from "@/actions/catalogActions";
import { ProductCard } from "./ProductCard";
import Link from "next/link";
import { ProductWithRelations } from "@/types";

export async function FeaturedCollections() {
  const result = await getAllProducts({ includeOutOfStock: true });
  const allProducts = result.success && result.data ? result.data : [];

  const getDisplayProducts = (categorySlug: string): ProductWithRelations[] => {
    const categoryProducts = allProducts.filter((p) => p.category?.slug === categorySlug);
    const featured = categoryProducts.filter((p) => p.isFeatured);
    if (featured.length >= 4) {
      return featured.slice(0, 4);
    }
    const nonFeatured = categoryProducts.filter((p) => !p.isFeatured);
    return [...featured, ...nonFeatured].slice(0, 4);
  };

  const featuredPerfumes = getDisplayProducts("artisanal-perfumes");
  const featuredTeas = getDisplayProducts("single-estate-teas");

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-ivory">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="font-sans text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-brand-gold">
            Curated Formulations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-forest">
            Featured Collections
          </h2>
          <p className="font-sans text-base sm:text-lg text-brand-olive leading-relaxed">
            Discover our signature botanical extraits and single-estate tea harvests, crafted to evoke tranquility and sensory alignment.
          </p>
        </div>

        {/* Category 1: Artisanal Perfumes */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-brand-gold/20 pb-4">
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-forest">
                Artisanal Perfumes
              </h3>
              <p className="font-sans text-sm sm:text-base text-brand-olive mt-1">
                Pure extrait de parfum capturing high-altitude blossoms and rare woods.
              </p>
            </div>
            <Link
              href="/perfumes"
              className="mt-4 sm:mt-0 font-sans text-xs sm:text-sm font-semibold uppercase tracking-widest text-brand-forest hover:text-brand-gold transition-colors flex items-center space-x-1.5"
            >
              <span>View All Perfumes</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {featuredPerfumes.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Category 2: Single-Estate Teas */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-brand-gold/20 pb-4">
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-forest">
                Single-Estate Teas
              </h3>
              <p className="font-sans text-sm sm:text-base text-brand-olive mt-1">
                Hand-picked rare flushes harvested from pristine mountain tea gardens.
              </p>
            </div>
            <Link
              href="/teas"
              className="mt-4 sm:mt-0 font-sans text-xs sm:text-sm font-semibold uppercase tracking-widest text-brand-forest hover:text-brand-gold transition-colors flex items-center space-x-1.5"
            >
              <span>View All Teas</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {featuredTeas.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
