"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useCartStore } from "@/lib/store/cartStore";
import { validateCartStock, CartStockItemValidation } from "@/actions/cartActions";
import { trackEvent } from "@/lib/telemetry";

import { useFocusTrap } from "@/hooks/useFocusTrap";

export function CartSlideOver() {
  const router = useRouter();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    getFormattedCartTotal,
    getFreeShippingProgress,
  } = useCartStore();

  const containerRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose: closeCart });
  const [validationErrors, setValidationErrors] = useState<CartStockItemValidation[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const freeShipping = getFreeShippingProgress();

  const handleCheckoutValidation = () => {
    setValidationErrors([]);
    setGeneralError(null);

    if (items.length === 0) return;

    startTransition(async () => {
      const payload = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const res = await validateCartStock(payload);

      if (!res.success || !res.data) {
        setGeneralError(res.error || "Failed to validate stock availability.");
        return;
      }

      if (!res.data.isValid) {
        const invalidItems = res.data.itemValidations.filter((v) => !v.isValid);
        setValidationErrors(invalidItems);
      } else {
        closeCart();
        router.push("/checkout");
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
            {/* Slide-Over Panel */}
            <motion.div
              ref={containerRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-slideover-title"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-brand-ivory shadow-2xl flex flex-col justify-between border-l border-brand-gold/20 focus:outline-none"
            >
              {/* Header */}
              <div className="p-6 border-b border-brand-gold/15 bg-brand-beige/40 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 id="cart-slideover-title" className="font-serif text-xl sm:text-2xl font-semibold text-brand-forest">
                    Shopping Cart
                  </h2>
                  <span className="bg-brand-gold/20 text-brand-forest font-sans text-xs font-bold px-2.5 py-0.5 rounded-full border border-brand-gold/30">
                    {items.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                </div>

                <button
                  onClick={closeCart}
                  aria-label="Close shopping cart"
                  className="p-2 text-brand-forest hover:text-brand-gold transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-brand-gold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Free Shipping Progress Bar */}
              {items.length > 0 && (
                <div className="px-6 py-3.5 bg-brand-beige/70 border-b border-brand-gold/15 space-y-1.5">
                  <div className="flex justify-between text-xs text-brand-forest font-medium">
                    {freeShipping.isEligible ? (
                      <span className="text-emerald-800 font-semibold flex items-center gap-1">
                        <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Unlocked Complimentary Express Shipping
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-brand-forest">${freeShipping.remaining.toFixed(2)}</strong> for Free Express Shipping
                      </span>
                    )}
                    <span className="text-[10px] text-brand-olive uppercase tracking-wider font-bold">
                      {Math.round(freeShipping.percentage)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-brand-gold/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShipping.percentage}%` }}
                      transition={{ duration: 0.4 }}
                      className={`h-full transition-all duration-300 ${
                        freeShipping.isEligible ? "bg-emerald-700" : "bg-brand-gold"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Validation Alert Messages */}
              {(validationErrors.length > 0 || generalError) && (
                <div role="alert" aria-live="polite" className="mx-6 mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1.5">
                  <strong className="block font-semibold uppercase tracking-wider text-[10px] text-red-900">
                    Stock Availability Warning
                  </strong>
                  {generalError && <p>{generalError}</p>}
                  {validationErrors.map((err, idx) => (
                    <p key={idx}>&bull; {err.message}</p>
                  ))}
                </div>
              )}

              {/* Scrollable Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                    <div className="w-16 h-16 rounded-full bg-brand-beige border border-brand-gold/30 flex items-center justify-center text-brand-forest">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-serif text-xl font-semibold text-brand-forest">
                        Your Cart is Empty
                      </h3>
                      <p className="text-xs text-brand-olive max-w-xs leading-relaxed">
                        Discover our high-altitude extraits de parfum and single-estate tea flushes.
                      </p>
                    </div>
                    <Link
                      href="/perfumes"
                      onClick={closeCart}
                      className="py-3 px-6 rounded-xl bg-brand-forest text-brand-ivory text-xs font-semibold uppercase tracking-widest hover:bg-brand-olive transition-colors shadow-sm"
                    >
                      Explore Catalog
                    </Link>
                  </div>
                ) : (
                  items.map((item) => {
                    const itemTotalPrice = (Number(item.price) * item.quantity).toFixed(2);
                    return (
                      <div
                        key={`${item.productId}-${item.variantId}`}
                        className="flex gap-4 p-4 rounded-2xl bg-brand-beige/50 border border-brand-gold/15 transition-all"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-brand-ivory flex-shrink-0 border border-brand-gold/20">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <Link
                                href={`/product/${item.productSlug}`}
                                onClick={closeCart}
                                className="font-serif text-sm font-semibold text-brand-forest hover:text-brand-gold transition-colors line-clamp-1"
                              >
                                {item.name}
                              </Link>
                              <span className="inline-block mt-0.5 font-sans text-[10px] uppercase tracking-wider font-semibold text-brand-forest bg-brand-ivory border border-brand-gold/25 px-2 py-0.5 rounded-md">
                                {item.variantName}
                              </span>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => {
                                trackEvent("cart_remove", {
                                  productId: item.productId,
                                  variantId: item.variantId,
                                  quantity: item.quantity,
                                });
                                removeItem(item.productId, item.variantId);
                              }}
                              aria-label={`Remove ${item.name} from cart`}
                              className="text-brand-olive/60 hover:text-red-700 transition-colors p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* Price & Quantity Controls */}
                          <div className="flex items-center justify-between pt-2 border-t border-brand-gold/10 mt-2">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-brand-gold/30 bg-brand-ivory rounded-lg px-2 py-0.5">
                              <button
                                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="text-brand-forest hover:text-brand-gold disabled:opacity-30 p-1 focus:outline-none focus:ring-2 focus:ring-brand-gold rounded"
                                aria-label={`Decrease quantity of ${item.name}`}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="font-semibold text-xs text-brand-forest px-2">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                                disabled={item.quantity >= item.stockQuantity}
                                className="text-brand-forest hover:text-brand-gold disabled:opacity-30 p-1 focus:outline-none focus:ring-2 focus:ring-brand-gold rounded"
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>

                            {/* Item Subtotal */}
                            <div className="text-right">
                              <span className="font-semibold text-sm text-brand-forest">
                                ${itemTotalPrice}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Cart Footer */}
              {items.length > 0 && (
                <div className="p-6 border-t border-brand-gold/15 bg-brand-beige/40 space-y-4">
                  <div className="flex justify-between items-baseline font-sans">
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand-olive">
                      Subtotal
                    </span>
                    <span className="font-serif text-2xl font-semibold text-brand-forest">
                      {getFormattedCartTotal()}
                    </span>
                  </div>

                  <p className="text-[11px] text-brand-olive text-center">
                    Taxes and shipping calculated during checkout.
                  </p>

                  <div className="space-y-2.5">
                    <button
                      onClick={handleCheckoutValidation}
                      disabled={isPending}
                      className="w-full py-4 px-6 rounded-xl bg-brand-forest text-brand-ivory font-semibold text-xs uppercase tracking-widest hover:bg-brand-olive transition-all shadow-md flex items-center justify-center space-x-2 border border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-gold disabled:opacity-50"
                    >
                      {isPending ? (
                        <span>Validating Stock Availability...</span>
                      ) : (
                        <span>Proceed to Checkout &bull; {getFormattedCartTotal()}</span>
                      )}
                    </button>

                    <button
                      onClick={clearCart}
                      className="w-full text-center text-xs text-brand-olive hover:text-red-700 transition-colors underline underline-offset-4 py-1"
                    >
                      Clear Entire Cart
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
