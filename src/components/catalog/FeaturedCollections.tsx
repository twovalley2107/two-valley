import { getAllProducts } from "@/actions/catalogActions";
import { ProductCard } from "./ProductCard";
import Link from "next/link";
import { ProductWithRelations } from "@/types";

export async function FeaturedCollections() {
  const result = await getAllProducts({ includeOutOfStock: true });
  const allProducts = result.success && result.data ? result.data : [];

  const getDisplayProducts = (categorySlug: string): ProductWithRelations[] => {
    const isTeaCategory = categorySlug === "single-estate-teas";
    const categoryProducts = allProducts.filter((p) => {
      const pCatSlug = p.category?.slug?.toLowerCase() || "";
      const pCatName = p.category?.name?.toLowerCase() || "";
      if (isTeaCategory) {
        return (
          pCatSlug === "single-estate-teas" ||
          pCatSlug.includes("tea") ||
          pCatSlug.includes("chay") ||
          pCatSlug.includes("chai") ||
          pCatName.includes("tea") ||
          pCatName.includes("chai") ||
          Boolean(p.teaType)
        );
      }
      return (
        pCatSlug === "artisanal-perfumes" ||
        pCatSlug.includes("perfume") ||
        pCatName.includes("perfume") ||
        Boolean(p.fragranceFamily)
      );
    });

    // Sort: Featured first, then newest created at the top
    return [...categoryProducts].sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const featuredTeas = getDisplayProducts("single-estate-teas");
  const featuredPerfumes = getDisplayProducts("artisanal-perfumes");

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

        {/* Category 1: Single-Estate Teas */}
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

          <div className="grid grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-6 lg:gap-8">
            {featuredTeas.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Category 2: Artisanal Perfumes */}
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

          <div className="grid grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-6 lg:gap-8">
            {featuredPerfumes.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
