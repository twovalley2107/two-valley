"use client";

import Image from "next/image";
import Link from "next/link";
import { CustomerOrderDetail } from "@/actions/orderActions";
import { OrderStatus, PaymentStatus } from "@prisma/client";

interface OrderDetailViewProps {
  order: CustomerOrderDetail;
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-amber-50 text-amber-900 border-amber-200";
      case OrderStatus.PROCESSING:
        return "bg-emerald-50 text-emerald-900 border-emerald-200";
      case OrderStatus.SHIPPED:
        return "bg-blue-50 text-blue-900 border-blue-200";
      case OrderStatus.DELIVERED:
        return "bg-brand-forest text-brand-ivory border-brand-forest";
      case OrderStatus.CANCELLED:
        return "bg-red-50 text-red-900 border-red-200";
      default:
        return "bg-brand-beige text-brand-forest border-brand-gold/30";
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return "bg-emerald-100 text-emerald-900";
      case PaymentStatus.UNPAID:
        return "bg-amber-100 text-amber-900";
      case PaymentStatus.REFUNDED:
        return "bg-slate-100 text-slate-800";
      case PaymentStatus.FAILED:
        return "bg-red-100 text-red-900";
      default:
        return "bg-brand-beige text-brand-olive";
    }
  };

  const address = order.shippingAddress;

  return (
    <div className="space-y-8 font-sans">
      {/* Order Header Summary */}
      <div className="bg-brand-beige/60 border border-brand-gold/25 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-gold/15 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold block">
              Order Reference
            </span>
            <h1 className="font-mono text-2xl font-bold text-brand-forest">
              {order.orderNumber}
            </h1>
            <span className="text-xs text-brand-olive block mt-0.5">
              Placed on {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${getOrderStatusBadge(order.status)}`}>
              Order: {order.status}
            </span>
            <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${getPaymentStatusBadge(order.paymentStatus)}`}>
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-olive">
          <p>
            Status messaging: <strong className="text-brand-forest">Your order is {order.status.toLowerCase()}</strong>
          </p>
          <p>
            Estimated Express Delivery: <strong className="text-brand-forest">3 to 5 business days</strong>
          </p>
        </div>
      </div>

      {/* Itemized Order Breakdown Table */}
      <div className="bg-brand-beige/40 border border-brand-gold/20 rounded-2xl p-6 sm:p-8 space-y-6">
        <h3 className="font-serif text-xl font-semibold text-brand-forest border-b border-brand-gold/15 pb-3">
          Itemized Formulations
        </h3>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 py-3 border-b border-brand-gold/10 last:border-none"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-brand-ivory border border-brand-gold/20 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif text-sm font-semibold text-brand-forest truncate">
                    {item.productName}
                  </h4>
                  <span className="text-xs text-brand-olive block">
                    Size: {item.variantName || "Standard"} &bull; Qty: {item.quantity}
                  </span>
                  <span className="text-[11px] text-brand-olive/80">
                    Unit Price: {item.unitPrice}
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0 font-semibold text-sm text-brand-forest">
                {item.totalPrice}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Totals Breakdown */}
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
          Recipient & Shipping Address
        </h3>
        <div className="text-xs text-brand-olive leading-relaxed">
          <p className="font-semibold text-brand-forest">{address.fullName}</p>
          <p>{order.contactEmail} &bull; {address.phone}</p>
          <p>{address.addressLine1} {address.addressLine2 ? `, ${address.addressLine2}` : ""}</p>
          <p>{address.city}, {address.state} {address.postalCode}, {address.country}</p>
        </div>
      </div>

      {/* Back Link */}
      <div className="pt-2">
        <Link
          href="/account/orders"
          className="text-xs font-semibold uppercase tracking-wider text-brand-forest hover:text-brand-gold transition-colors inline-flex items-center space-x-1"
        >
          <span>&larr; Return to Order History</span>
        </Link>
      </div>
    </div>
  );
}
