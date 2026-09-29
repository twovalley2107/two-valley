import { Metadata } from "next";
import { getFilteredProducts } from "@/actions/catalogActions";
import { ProductCard } from "@/components/catalog/ProductCard";
import { FilterSortPanel } from "@/components/catalog/FilterSortPanel";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search Catalog — Two Valley",
  description: "Search Two Valley artisanal perfumes and single-estate teas.",
};

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const query = typeof params.q === "string" ? params.q.trim() : "";
  const sort = typeof params.sort === "string" ? (params.sort as "newest" | "price-asc" | "price-desc" | "name-asc" | "featured") : "featured";
  const fragranceFamily = typeof params.fragranceFamily === "string" ? params.fragranceFamily : undefined;
  const teaType = typeof params.teaType === "string" ? params.teaType : undefined;
  const mood = typeof params.mood === "string" ? params.mood : undefined;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;

  const result = await getFilteredProducts({
    searchQuery: query,
    includeOutOfStock: true,
    sortBy: sort,
    fragranceFamily,
    teaType,
    mood,
    minPrice,
    maxPrice,
  });

  const products = result.success && result.data ? result.data.products : [];
  const totalCount = result.success && result.data ? result.data.totalCount : 0;

  return (
    <div className="min-h-screen bg-brand-ivory py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Search Results Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-brand-gold">
            Catalog Search
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-forest">
            {query ? `Search Results for "${query}"` : "Explore Catalog"}
          </h1>
          <p className="font-sans text-sm text-brand-olive">
            {query
              ? `Found ${totalCount} ${totalCount === 1 ? "formulation" : "formulations"} matching your search criteria.`
              : "Enter a search term to find botanical extraits, tea flushes, notes, or origins."}
          </p>
        </div>

        {/* Filter & Sort Controls */}
        <FilterSortPanel totalProducts={totalCount} />

        {/* Results Grid / Empty State */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-brand-beige/60 border border-brand-gold/20 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 font-sans">
            <h3 className="font-serif text-xl font-semibold text-brand-forest">
              No Results Found
            </h3>
            <p className="text-xs text-brand-olive leading-relaxed">
              We couldn&apos;t find any formulations matching &ldquo;{query}&rdquo;. Try searching for terms like <span className="font-medium text-brand-forest">cardamom, chai, lavender, or Darjeeling</span>.
            </p>
            <div className="pt-2 flex justify-center space-x-4">
              <Link
                href="/perfumes"
                className="py-2.5 px-5 rounded-xl bg-brand-forest text-brand-ivory text-xs font-semibold uppercase tracking-wider hover:bg-brand-olive transition-colors"
              >
                Browse Perfumes
              </Link>
              <Link
                href="/teas"
                className="py-2.5 px-5 rounded-xl border border-brand-forest text-brand-forest text-xs font-semibold uppercase tracking-wider hover:bg-brand-beige transition-colors"
              >
                Browse Teas
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
