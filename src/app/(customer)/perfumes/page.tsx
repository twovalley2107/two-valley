import { Metadata } from "next";
import { getFilteredProducts } from "@/actions/catalogActions";
import { ProductCard } from "@/components/catalog/ProductCard";
import { FilterSortPanel } from "@/components/catalog/FilterSortPanel";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Artisanal Perfumes — Two Valley",
  description: "Handcrafted botanical extrait de parfum bridging high-altitude blossoms and rare woods.",
};

interface PerfumesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PerfumesPage({ searchParams }: PerfumesPageProps) {
  const params = await searchParams;

  const sort = typeof params.sort === "string" ? (params.sort as "newest" | "price-asc" | "price-desc" | "name-asc" | "featured") : "featured";
  const fragranceFamily = typeof params.fragranceFamily === "string" ? params.fragranceFamily : undefined;
  const mood = typeof params.mood === "string" ? params.mood : undefined;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;

  const result = await getFilteredProducts({
    categorySlug: "artisanal-perfumes",
    includeOutOfStock: true,
    sortBy: sort,
    fragranceFamily,
    mood,
    minPrice,
    maxPrice,
  });

  const products = result.success && result.data ? result.data.products : [];
  const totalCount = result.success && result.data ? result.data.totalCount : 0;

  return (
    <div className="min-h-screen bg-brand-ivory py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-brand-gold">
            Highland Extrait de Parfum
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-brand-forest">
            Artisanal Perfumes
          </h1>
          <p className="font-sans text-sm sm:text-base text-brand-olive leading-relaxed">
            Pure extraits formulated from rare botanical absolutes and high-altitude wild blossoms. Aged in small batches for subtle sensory elegance.
          </p>
        </div>

        {/* Interactive Filter & Sort Panel */}
        <FilterSortPanel categorySlug="artisanal-perfumes" totalProducts={totalCount} />

        {/* Product Grid / Empty State */}
        {products.length > 0 ? (
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-brand-beige/60 border border-brand-gold/20 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
            <h3 className="font-serif text-xl font-semibold text-brand-forest">
              No Perfumes Found
            </h3>
            <p className="text-xs text-brand-olive leading-relaxed">
              No artisanal formulations match your current filter selections. Try adjusting your scent family or price criteria.
            </p>
            <Link
              href="/perfumes"
              className="inline-block py-2.5 px-6 rounded-xl bg-brand-forest text-brand-ivory text-xs font-semibold uppercase tracking-wider hover:bg-brand-olive transition-colors"
            >
              Reset All Filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
