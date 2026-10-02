import { Metadata } from "next";
import { getFilteredProducts } from "@/actions/catalogActions";
import { ProductCard } from "@/components/catalog/ProductCard";
import { FilterSortPanel } from "@/components/catalog/FilterSortPanel";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Single-Estate Teas — Two Valley",
  description: "Rare-harvest, single-estate tea leaves harvested from pristine mountain valleys.",
};

interface TeasPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TeasPage({ searchParams }: TeasPageProps) {
  const params = await searchParams;

  const sort = typeof params.sort === "string" ? (params.sort as "newest" | "price-asc" | "price-desc" | "name-asc" | "featured") : "featured";
  const teaType = typeof params.teaType === "string" ? params.teaType : undefined;
  const origin = typeof params.origin === "string" ? params.origin : undefined;
  const mood = typeof params.mood === "string" ? params.mood : undefined;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;

  const result = await getFilteredProducts({
    categorySlug: "single-estate-teas",
    includeOutOfStock: true,
    sortBy: sort,
    teaType,
    origin,
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
            Rare Highland Flushes
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-brand-forest">
            Single-Estate Teas
          </h1>
          <p className="font-sans text-sm sm:text-base text-brand-olive leading-relaxed">
            Hand-picked leaves from renowned micro-estates in Darjeeling, Assam, and high mountain valleys. Direct-trade harvests crafted for meditative tea rituals.
          </p>
        </div>

        {/* Interactive Filter & Sort Panel */}
        <FilterSortPanel categorySlug="single-estate-teas" totalProducts={totalCount} />

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
              No Teas Found
            </h3>
            <p className="text-xs text-brand-olive leading-relaxed">
              No tea harvests match your selected criteria. Try resetting your tea type or origin filter.
            </p>
            <Link
              href="/teas"
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
