import { Metadata } from "next";
import { getFilteredProducts } from "@/actions/catalogActions";
import { ProductCard } from "@/components/catalog/ProductCard";
import { FilterSortPanel } from "@/components/catalog/FilterSortPanel";

export const metadata: Metadata = {
  title: "Curated Collections — Two Valley",
  description: "Explore the complete Two Valley collection of artisanal perfumes and single-estate teas.",
};

interface CollectionsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const params = await searchParams;

  const sort = typeof params.sort === "string" ? (params.sort as "newest" | "price-asc" | "price-desc" | "name-asc" | "featured") : "featured";
  const fragranceFamily = typeof params.fragranceFamily === "string" ? params.fragranceFamily : undefined;
  const teaType = typeof params.teaType === "string" ? params.teaType : undefined;
  const mood = typeof params.mood === "string" ? params.mood : undefined;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;

  const result = await getFilteredProducts({
    includeOutOfStock: true,
    sortBy: sort,
    fragranceFamily,
    teaType,
    mood,
    minPrice,
    maxPrice,
  });

  const rawProducts = result.success && result.data ? result.data.products : [];
  const totalCount = result.success && result.data ? result.data.totalCount : 0;

  // By default (or featured sort), display Tea products before Perfumes
  const products =
    sort === "featured" || !params.sort
      ? [...rawProducts].sort((a, b) => {
          const isATea = a.category?.slug === "single-estate-teas" || Boolean(a.teaType);
          const isBTea = b.category?.slug === "single-estate-teas" || Boolean(b.teaType);
          if (isATea && !isBTea) return -1;
          if (!isATea && isBTea) return 1;
          return 0;
        })
      : rawProducts;

  return (
    <div className="min-h-screen bg-brand-ivory py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-brand-gold">
            Complete House Catalog
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-brand-forest">
            Curated Collections
          </h1>
          <p className="font-sans text-sm sm:text-base text-brand-olive leading-relaxed">
            The full sanctuary of Two Valley formulations — combining high-altitude extrait de parfum and single-estate mountain tea flushes.
          </p>
        </div>

        {/* Interactive Filter & Sort Panel */}
        <FilterSortPanel totalProducts={totalCount} />

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
              No Formulations Found
            </h3>
            <p className="text-xs text-brand-olive leading-relaxed">
              No catalog items match your selected filters. Please adjust your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
