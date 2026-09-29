"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cartStore";
import { trackEvent } from "@/lib/telemetry";

interface ConfirmationContentProps {
  order: {
    orderNumber: string;
    createdAt: string;
    contactEmail: string;
    shippingAddress: any;
    status: string;
    paymentStatus: string;
    subtotal: string;
    shippingFee: string;
    tax: string;
    total: string;
    items: {
      id: string;
      productName: string;
      variantName: string | null;
      quantity: number;
      unitPrice: string;
      totalPrice: string;
      image: string;
    }[];
  };
}

export function ConfirmationContent({ order }: ConfirmationContentProps) {
  const clearCart = useCartStore((state) => state.clearCart);
  const trackedRef = useRef(false);

  // Clear Zustand cart & track purchase_completed on confirmation render if order is paid
  useEffect(() => {
    clearCart();

    if (!trackedRef.current && order.paymentStatus === "PAID") {
      trackedRef.current = true;
      const totalItemCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

      trackEvent("purchase_completed", {
        orderId: (order as any).id || order.orderNumber,
        orderNumber: order.orderNumber,
        total: Number(order.total).toFixed(2),
        itemCount: totalItemCount,
      });
    }
  }, [clearCart, order]);

  const address = order.shippingAddress || {};

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans">
      {/* Confirmation Badge Card */}
      <div className="bg-brand-beige/60 border border-brand-gold/30 rounded-2xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">
            Order Confirmed &bull; {order.paymentStatus}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-brand-forest">
            Thank You For Your Order
          </h1>
          <p className="text-xs text-brand-olive">
            Order Reference: <strong className="text-brand-forest font-mono text-sm">{order.orderNumber}</strong>
          </p>
        </div>

        <p className="text-xs text-brand-olive max-w-md mx-auto leading-relaxed pt-2 border-t border-brand-gold/15">
          A confirmation summary has been dispatched to <strong className="text-brand-forest">{order.contactEmail}</strong>. Your formulations are being prepared in our Himalayan sanctuary laboratory.
        </p>
      </div>

      {/* Estimated Delivery Banner */}
      <div className="bg-brand-forest text-brand-ivory rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-serif text-sm font-semibold text-brand-ivory">
              Estimated Sanctuary Delivery
            </h4>
            <p className="text-xs text-brand-ivory/80">
              3 to 5 business days via Express Climate-Controlled Shipping
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-gold bg-brand-ivory/10 px-3 py-1.5 rounded-full border border-brand-gold/25">
          Status: {order.status}
        </span>
      </div>

      {/* Itemized Order Breakdown */}
      <div className="bg-brand-beige/40 border border-brand-gold/20 rounded-2xl p-6 sm:p-8 space-y-6">
        <h3 className="font-serif text-xl font-semibold text-brand-forest border-b border-brand-gold/15 pb-3">
          Formulation Summary
        </h3>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 py-2 border-b border-brand-gold/10 last:border-none">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-brand-ivory border border-brand-gold/20 flex-shrink-0">
                  <Image src={item.image} alt={item.productName} fill sizes="56px" className="object-cover" />
                </div>
                <div>
                  <h4 className="font-serif text-xs font-semibold text-brand-forest">
                    {item.productName}
                  </h4>
                  <span className="text-[10px] text-brand-olive uppercase tracking-wider block">
                    {item.variantName || "Standard"} &bull; Qty: {item.quantity}
                  </span>
                </div>
              </div>
              <div className="text-right text-xs font-semibold text-brand-forest">
                {item.totalPrice}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Totals */}
        <div className="pt-4 border-t border-brand-gold/20 space-y-2 text-xs">
          <div className="flex justify-between text-brand-olive">
            <span>Subtotal</span>
            <span className="text-brand-forest font-semibold">{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-brand-olive">
            <span>Express Shipping</span>
            <span className="text-brand-forest font-semibold">{order.shippingFee}</span>
          </div>
          <div className="flex justify-between text-brand-olive">
            <span>Taxes</span>
            <span className="text-brand-forest font-semibold">{order.tax}</span>
          </div>
          <div className="flex justify-between items-baseline pt-3 border-t border-brand-gold/20 font-sans text-sm font-semibold">
            <span className="uppercase text-brand-forest">Total Paid</span>
            <span className="font-serif text-2xl text-brand-forest">{order.total}</span>
          </div>
        </div>
      </div>

      {/* Recipient Shipping Address Details */}
      <div className="bg-brand-beige/40 border border-brand-gold/20 rounded-2xl p-6 sm:p-8 space-y-3">
        <h3 className="font-serif text-lg font-semibold text-brand-forest border-b border-brand-gold/15 pb-2">
          Shipping Recipient & Address
        </h3>
        <div className="text-xs text-brand-olive leading-relaxed">
          <p className="font-semibold text-brand-forest">{address.fullName}</p>
          <p>{order.contactEmail} &bull; {address.phone}</p>
          <p>{address.addressLine1} {address.addressLine2 ? `, ${address.addressLine2}` : ""}</p>
          <p>{address.city}, {address.state} {address.postalCode}, {address.country}</p>
        </div>
      </div>

      {/* Catalog CTA */}
      <div className="text-center pt-4">
        <Link
          href="/perfumes"
          className="inline-block py-4 px-8 rounded-xl bg-brand-forest text-brand-ivory font-semibold text-xs uppercase tracking-widest hover:bg-brand-olive transition-colors shadow-md"
        >
          Continue Exploring Formulations &rarr;
        </Link>
      </div>
    </div>
  );
}
