"use client";

import { useState, useEffect, useTransition } from "react";
import { ClientProduct, ClientProductVariant } from "@/types";
import {
  addToWishlist,
  removeFromWishlist,
  checkIsWishlisted,
} from "@/actions/wishlistActions";
import { useCartStore } from "@/lib/store/cartStore";
import { trackEvent } from "@/lib/telemetry";

interface PDPAddToCartProps {
  product: ClientProduct;
}

export function PDPAddToCart({ product }: PDPAddToCartProps) {
  const variants = product.variants || [];
  const [selectedVariant, setSelectedVariant] = useState<ClientProductVariant | null>(
    variants[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    let isMounted = true;
    async function loadWishlistStatus() {
      const res = await checkIsWishlisted(product.id);
      if (isMounted && res.success && res.data) {
        setIsWishlisted(res.data.isWishlisted);
      }
    }
    loadWishlistStatus();
    return () => {
      isMounted = false;
    };
  }, [product.id]);

  // Compute active price
  const activePriceNumber = selectedVariant?.priceOverride
    ? Number(selectedVariant.priceOverride)
    : Number(product.price);
  const formattedPrice = `$${activePriceNumber.toFixed(2)}`;

  // Active stock quantity
  const activeStock = selectedVariant
    ? selectedVariant.stockQuantity
    : product.stockQuantity;
  const isOutOfStock = activeStock <= 0;

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800";

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const variantId = selectedVariant?.id || `default-${product.id}`;
    const variantName = selectedVariant?.volumeWeight || "Standard";
    const priceString = selectedVariant?.priceOverride
      ? selectedVariant.priceOverride
      : product.price;

    addItem({
      productId: product.id,
      variantId,
      productSlug: product.slug,
      name: product.name,
      variantName,
      price: priceString,
      image: primaryImage,
      stockQuantity: activeStock,
      quantity,
    });

    trackEvent("cart_add", {
      productId: product.id,
      variantId,
      quantity,
      price: priceString,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const handleToggleWishlist = () => {
    if (isPending) return;
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);

    startTransition(async () => {
      let res;
      if (nextState) {
        res = await addToWishlist(product.id);
        if (res.success) {
          trackEvent("wishlist_add", { productId: product.id });
        }
      } else {
        res = await removeFromWishlist(product.id);
        if (res.success) {
          trackEvent("wishlist_remove", { productId: product.id });
        }
      }
      if (!res.success) {
        // Revert UI on failure
        setIsWishlisted(!nextState);
      }
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Price & Stock Display */}
      <div className="flex items-baseline justify-between border-b border-brand-gold/15 pb-4">
        <div>
          <span className="font-serif text-3xl font-semibold text-brand-forest">
            {formattedPrice}
          </span>
          {product.salePrice && (
            <span className="ml-3 font-sans text-sm text-brand-olive line-through">
              ${Number(product.salePrice).toFixed(2)}
            </span>
          )}
        </div>
        <div>
          {isOutOfStock ? (
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-forest bg-brand-beige border border-brand-gold/25 px-3 py-1 rounded-full">
              In Stock ({activeStock} Available)
            </span>
          )}
        </div>
      </div>

      {/* Variant Selector (if variants exist) */}
      {variants.length > 0 && (
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-olive">
            Select Size / Volume
          </label>
          <div className="flex flex-wrap gap-2.5">
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              const isVarOutOfStock = variant.stockQuantity <= 0;
              return (
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setQuantity(1);
                  }}
                  disabled={isVarOutOfStock}
                  className={`py-2.5 px-5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                    isSelected
                      ? "bg-brand-forest text-brand-ivory border-brand-forest shadow-md"
                      : isVarOutOfStock
                      ? "bg-brand-beige/50 text-brand-olive/40 border-brand-gold/10 line-through cursor-not-allowed"
                      : "bg-brand-beige text-brand-charcoal border-brand-gold/25 hover:border-brand-gold"
                  }`}
                >
                  {variant.volumeWeight}
                  {variant.priceOverride && (
                    <span className="ml-1.5 opacity-80">
                      (${Number(variant.priceOverride).toFixed(2)})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & CTA Button Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
        {/* Quantity Controls */}
        <div className="flex items-center justify-between border border-brand-gold/30 bg-brand-beige/50 rounded-xl px-4 py-2 sm:w-36">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            className="text-brand-forest hover:text-brand-gold disabled:opacity-30 p-1 focus:outline-none"
            aria-label="Decrease quantity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="font-semibold text-sm text-brand-forest px-2">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
            disabled={quantity >= activeStock || isOutOfStock}
            className="text-brand-forest hover:text-brand-gold disabled:opacity-30 p-1 focus:outline-none"
            aria-label="Increase quantity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Add to Cart Primary Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 py-4 px-8 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center space-x-2 ${
            isAdded
              ? "bg-emerald-700 text-brand-ivory"
              : isOutOfStock
              ? "bg-brand-beige text-brand-olive/50 cursor-not-allowed border border-brand-gold/15"
              : "bg-brand-gold text-brand-charcoal hover:bg-brand-gold/90 hover:shadow-lg"
          }`}
        >
          {isAdded ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Added to Cart!</span>
            </>
          ) : isOutOfStock ? (
            <span>Currently Unavailable</span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Add to Cart &bull; {formattedPrice}</span>
            </>
          )}
        </button>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          className={`p-4 rounded-xl border transition-colors flex items-center justify-center ${
            isWishlisted
              ? "bg-red-50 border-red-200 text-red-600"
              : "border-brand-gold/30 bg-brand-beige/50 text-brand-forest hover:border-brand-gold"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
