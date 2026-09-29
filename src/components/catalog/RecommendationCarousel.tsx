"use client";

import { ProductCard } from "@/components/catalog/ProductCard";
import { RecommendationProductDTO, ClientProduct } from "@/types";

interface RecommendationCarouselProps {
  productId: string;
  recommendations: RecommendationProductDTO[];
  title?: string;
  subtitle?: string;
}

/**
 * Converts a safe RecommendationProductDTO to ClientProduct shape for ProductCard.
 */
function dtoToClientProduct(dto: RecommendationProductDTO): ClientProduct {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    sku: dto.sku,
    description: dto.description,
    price: dto.price,
    salePrice: dto.salePrice,
    stockQuantity: 1,
    isFeatured: dto.isFeatured,
    categoryId: dto.category.id,
    fragranceFamily: dto.fragranceFamily,
    teaType: dto.teaType,
    origin: dto.origin,
    caffeineLevel: dto.caffeineLevel,
    steepingGuide: null,
    mood: dto.mood,
    occasion: dto.occasion,
    useCase: dto.useCase,
    pairingTags: dto.pairingTags,
    tags: dto.tags,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: dto.category.id,
      name: dto.category.name,
      slug: dto.category.slug,
      description: null,
      image: null,
    },
    images: dto.images.map((img) => ({
      id: img.id,
      productId: dto.id,
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })),
    sensoryAttributes: dto.sensoryAttributes.map((sa) => ({
      id: sa.id,
      productId: dto.id,
      attributeType: sa.attributeType,
      name: sa.name,
    })),
    variants: dto.variants.map((v) => ({
      id: v.id,
      productId: dto.id,
      volumeWeight: v.volumeWeight,
      priceOverride: v.priceOverride,
      stockQuantity: 1,
      sku: v.sku,
    })),
  };
}

export function RecommendationCarousel({
  productId,
  recommendations,
  title = "You May Also Enjoy",
  subtitle = "Complementary Formulations",
}: RecommendationCarouselProps) {
  // Exclude current product if present by any chance
  const filteredItems = recommendations.filter((item) => item.id !== productId);

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <section className="pt-12 border-t border-brand-gold/20 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between">
        <div>
          <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-brand-gold">
            {subtitle}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-forest mt-1">
            {title}
          </h2>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((recItem) => {
          const productProps = dtoToClientProduct(recItem);
          return <ProductCard key={recItem.id} product={productProps} />;
        })}
      </div>
    </section>
  );
}
