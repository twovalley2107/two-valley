import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProductBySlug, getAllProducts } from "@/actions/catalogActions";
import { getApprovedReviews, ProductReviewSummary } from "@/actions/reviewActions";
import { getRecommendations, getCrossCategoryPairing } from "@/lib/recommendations";
import { PDPGallery } from "@/components/catalog/PDPGallery";
import { PDPAddToCart } from "@/components/catalog/PDPAddToCart";
import { PDPBadges } from "@/components/catalog/PDPBadges";
import { ScentPyramid } from "@/components/catalog/ScentPyramid";
import { SteepingGuide } from "@/components/catalog/SteepingGuide";
import { ReviewSection, StarRating } from "@/components/catalog/ReviewSection";
import { RecommendationCarousel } from "@/components/catalog/RecommendationCarousel";
import { PairingWidget } from "@/components/catalog/PairingWidget";
import { ProductViewTracker } from "@/components/telemetry/ProductViewTracker";
import { serializeProductForClient } from "@/lib/serializers/productSerializer";

import { BackButton } from "@/components/ui/BackButton";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate static params for all catalog slugs at build time (TV-07-001).
 */
export async function generateStaticParams() {
  const result = await getAllProducts({ includeOutOfStock: true });
  if (!result.success || !result.data) {
    return [];
  }
  return result.data.map((p) => ({
    slug: p.slug,
  }));
}

/**
 * Dynamic SEO metadata generation for PDP (TV-07-001).
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductBySlug(slug);
  const product = result.data;

  if (!product) {
    return {
      title: "Product Not Found — Two Valley",
    };
  }

  return {
    title: `${product.name} — Two Valley`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;
  const serializedProduct = serializeProductForClient(product);
  const category = product.category;
  const isPerfume = category?.slug === "artisanal-perfumes" || Boolean(product.fragranceFamily);
  const isTea = category?.slug === "single-estate-teas" || Boolean(product.teaType);

  // Concurrently fetch auth user, reviews, recommendations, and cross-category pairing in parallel
  const supabase = await createClient();
  const [authRes, reviewResult, recResult, pairingResult] = await Promise.all([
    supabase.auth.getUser().catch(() => ({ data: { user: null } })),
    getApprovedReviews(product.id),
    getRecommendations(product, 4),
    getCrossCategoryPairing(product),
  ]);

  const user = authRes.data?.user || null;
  const isAuthenticated = Boolean(user);

  const reviewSummary: ProductReviewSummary =
    reviewResult.success && reviewResult.data
      ? reviewResult.data
      : {
          reviews: [],
          totalCount: 0,
          averageRating: 0,
          ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };

  const recommendations = recResult.success && recResult.data ? recResult.data : [];
  const pairingProduct = pairingResult.success && pairingResult.data ? pairingResult.data : null;

  // JSON-LD Product Schema for SEO
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.description,
    sku: product.sku,
    aggregateRating:
      reviewSummary.totalCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: reviewSummary.averageRating.toFixed(1),
            reviewCount: reviewSummary.totalCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: Number(product.price).toFixed(2),
      availability:
        product.stockQuantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="min-h-screen bg-brand-ivory font-sans py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Telemetry Product View Tracker */}
      <ProductViewTracker
        productId={product.id}
        slug={product.slug}
        categoryId={product.categoryId}
        price={Number(product.price).toFixed(2)}
      />

      {/* JSON-LD Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Navigation Bar: Contextual Back Button + Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <BackButton
            fallbackHref={isPerfume ? "/perfumes" : isTea ? "/teas" : "/collections"}
            label={isPerfume ? "Back to Perfumes" : isTea ? "Back to Teas" : "Back to Collections"}
          />

          <nav aria-label="Breadcrumb" className="text-xs text-brand-olive flex items-center space-x-2">
            <Link href="/" className="hover:text-brand-forest transition-colors">
              Home
            </Link>
            <span>/</span>
            {category && (
              <>
                <Link
                  href={category.slug === "artisanal-perfumes" ? "/perfumes" : "/teas"}
                  className="hover:text-brand-forest transition-colors"
                >
                  {category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-brand-forest font-semibold truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </nav>
        </div>

        {/* Product Layout Grid: Left Gallery + Right Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6">
            <PDPGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column: Product Narrative, Add To Cart, Widgets */}
          <div className="lg:col-span-6 space-y-8">
            {/* Header Title & Category */}
            <div className="space-y-3">
              <span className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-brand-gold">
                {category?.name || "Two Valley Formulation"}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-forest leading-tight">
                {product.name}
              </h1>

              {/* PDP Rating Header Summary */}
              <div className="flex items-center space-x-3 pt-1">
                <StarRating rating={Math.round(reviewSummary.averageRating)} size="sm" />
                <a
                  href="#reviews"
                  className="text-xs text-brand-olive hover:text-brand-forest transition-colors font-sans"
                >
                  {reviewSummary.totalCount > 0
                    ? `${reviewSummary.averageRating.toFixed(1)} (${reviewSummary.totalCount} review${
                        reviewSummary.totalCount === 1 ? "" : "s"
                      })`
                    : "No reviews yet"}
                </a>
              </div>

              <p className="font-sans text-sm sm:text-base text-brand-olive leading-relaxed pt-2">
                {product.description}
              </p>
            </div>

            {/* Add to Cart & Variant Selection Block */}
            <PDPAddToCart product={serializedProduct} />

            {/* Contextual Badges (Mood, Occasion, UseCase, Pairing) */}
            <PDPBadges
              mood={product.mood}
              occasion={product.occasion}
              useCase={product.useCase}
              pairingTags={product.pairingTags}
            />

            {/* Perfume Sensory Pyramid Widget */}
            {isPerfume && (
              <ScentPyramid
                sensoryAttributes={product.sensoryAttributes}
                fragranceFamily={product.fragranceFamily}
              />
            )}

            {/* Tea Steeping Guide Widget */}
            {isTea && (
              <SteepingGuide
                steepingGuide={product.steepingGuide}
                origin={product.origin}
                caffeineLevel={product.caffeineLevel}
                teaType={product.teaType}
                sensoryAttributes={product.sensoryAttributes}
              />
            )}

            {/* Cross-Category Pairing Callout Widget (TV-13-004) */}
            <PairingWidget pairingProduct={pairingProduct} />
          </div>
        </div>

        {/* Customer Reviews Section (TV-12-002) */}
        <ReviewSection
          productId={product.id}
          productSlug={product.slug}
          initialSummary={reviewSummary}
          isAuthenticated={isAuthenticated}
        />

        {/* Same-Category Deterministic Recommendations Carousel (TV-13-003) */}
        <RecommendationCarousel
          productId={product.id}
          recommendations={recommendations}
        />
      </div>
    </div>
  );
}
