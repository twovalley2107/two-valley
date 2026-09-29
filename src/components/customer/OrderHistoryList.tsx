"use client";

import Image from "next/image";
import Link from "next/link";
import { CustomerOrderSummary } from "@/actions/orderActions";
import { OrderStatus, PaymentStatus } from "@prisma/client";

interface OrderHistoryListProps {
  orders: CustomerOrderSummary[];
}

export function OrderHistoryList({ orders }: OrderHistoryListProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-brand-beige/60 border border-brand-gold/20 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-6 font-sans shadow-sm">
        <div className="w-16 h-16 rounded-full bg-brand-ivory border border-brand-gold/30 flex items-center justify-center mx-auto text-brand-forest">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-semibold text-brand-forest">
            No Orders Placed Yet
          </h2>
          <p className="text-xs text-brand-olive leading-relaxed">
            Your personal sanctuary order history is clear. Discover our high-altitude extraits de parfum and single-estate tea flushes.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            href="/perfumes"
            className="py-3 px-6 rounded-xl bg-brand-forest text-brand-ivory text-xs font-semibold uppercase tracking-widest hover:bg-brand-olive transition-colors"
          >
            Explore Perfumes
          </Link>
          <Link
            href="/teas"
            className="py-3 px-6 rounded-xl border border-brand-forest text-brand-forest text-xs font-semibold uppercase tracking-widest hover:bg-brand-beige transition-colors"
          >
            Discover Teas
          </Link>
        </div>
      </div>
    );
  }

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

  return (
    <div className="space-y-6 font-sans">
      <div className="text-xs text-brand-olive">
        Showing <span className="font-semibold text-brand-forest">{orders.length}</span> archived order(s)
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          return (
            <div
              key={order.id}
              className="bg-brand-beige/50 border border-brand-gold/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-md space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-gold/15 pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-brand-forest block">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-brand-olive">
                    Placed on {formattedDate}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getOrderStatusBadge(order.status)}`}>
                    Order: {order.status}
                  </span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${getPaymentStatusBadge(order.paymentStatus)}`}>
                    Payment: {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Item Preview & Summary */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-brand-ivory border border-brand-gold/20 flex-shrink-0">
                    <Image
                      src={order.firstItemImage}
                      alt={order.firstItemName}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-brand-forest line-clamp-1">
                      {order.firstItemName}
                    </h4>
                    <p className="text-xs text-brand-olive">
                      {order.itemCount} {order.itemCount === 1 ? "item" : "items"} total
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs text-brand-olive uppercase tracking-wider block font-medium">
                    Total Paid
                  </span>
                  <span className="font-serif text-xl font-semibold text-brand-forest">
                    {order.total}
                  </span>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="pt-3 border-t border-brand-gold/15 flex justify-end">
                <Link
                  href={`/account/orders/${encodeURIComponent(order.orderNumber)}`}
                  className="py-2.5 px-5 rounded-xl bg-brand-forest text-brand-ivory text-xs font-semibold uppercase tracking-widest hover:bg-brand-olive transition-colors shadow-sm inline-flex items-center space-x-2"
                >
                  <span>View Order Details</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
