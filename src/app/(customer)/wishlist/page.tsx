import { Metadata } from "next";
import { getWishlist } from "@/actions/wishlistActions";
import { WishlistGrid } from "@/components/catalog/WishlistGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Wishlist — Two Valley",
  description: "View your saved Two Valley artisanal perfumes and single-estate teas.",
};

export default async function WishlistPage() {
  const result = await getWishlist();
  const products = result.success && result.data ? result.data : [];

  return (
    <div className="min-h-screen bg-brand-ivory py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Editorial Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-brand-gold">
            Personal Sanctuary
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-forest">
            My Saved Formulations
          </h1>
          <p className="font-sans text-xs sm:text-sm text-brand-olive leading-relaxed">
            Your personal collection of saved extrait de parfum formulations and single-estate tea flushes.
          </p>
        </div>

        {/* Interactive Wishlist Grid */}
        <WishlistGrid initialProducts={products} />
      </div>
    </div>
  );
}
