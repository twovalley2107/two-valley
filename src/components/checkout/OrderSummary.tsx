"use client";

import Image from "next/image";
import { useCartStore } from "@/lib/store/cartStore";

export function OrderSummary() {
  const { items, getCartTotal, getFreeShippingProgress } = useCartStore();

  const subtotal = getCartTotal();
  const freeShipping = getFreeShippingProgress();
  const shippingFee = freeShipping.isEligible ? 0 : 15;
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="bg-brand-beige/50 border border-brand-gold/20 rounded-2xl p-6 sm:p-8 space-y-6 font-sans sticky top-28 shadow-sm">
      <div className="border-b border-brand-gold/20 pb-4">
        <h3 className="font-serif text-xl font-semibold text-brand-forest">
          Order Summary
        </h3>
        <p className="text-xs text-brand-olive mt-1">
          {items.reduce((acc, i) => acc + i.quantity, 0)} formulation(s) in cart
        </p>
      </div>

      {/* Itemized Cart List */}
      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => {
          const itemTotal = (Number(item.price) * item.quantity).toFixed(2);
          return (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex items-center gap-3 py-2 border-b border-brand-gold/10 last:border-none"
            >
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-brand-ivory flex-shrink-0 border border-brand-gold/15">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
                <span className="absolute top-0 right-0 bg-brand-forest text-brand-ivory text-[9px] font-bold px-1.5 py-0.5 rounded-bl">
                  {item.quantity}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-xs font-semibold text-brand-forest truncate">
                  {item.name}
                </h4>
                <span className="text-[10px] text-brand-olive uppercase tracking-wider block font-medium">
                  {item.variantName}
                </span>
              </div>

              <div className="text-right font-semibold text-xs text-brand-forest">
                ${itemTotal}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals Breakdown */}
      <div className="space-y-3 pt-4 border-t border-brand-gold/20 text-xs">
        <div className="flex justify-between text-brand-olive">
          <span>Subtotal</span>
          <span className="font-semibold text-brand-forest">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-brand-olive">
          <span>Estimated Express Shipping</span>
          {freeShipping.isEligible ? (
            <span className="font-semibold text-emerald-800">FREE</span>
          ) : (
            <span className="font-semibold text-brand-forest">$15.00</span>
          )}
        </div>

        <div className="flex justify-between text-brand-olive">
          <span>Estimated Taxes</span>
          <span className="font-semibold text-brand-forest">$0.00</span>
        </div>

        <div className="flex justify-between items-baseline pt-3 border-t border-brand-gold/20 font-sans">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-forest">
            Total Due
          </span>
          <span className="font-serif text-2xl font-semibold text-brand-forest">
            ${grandTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
