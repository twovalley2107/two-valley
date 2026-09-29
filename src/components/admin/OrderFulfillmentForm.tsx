"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/actions/adminActions";
import { OrderStatus } from "@prisma/client";

interface OrderFulfillmentFormProps {
  orderId: string;
  currentStatus: OrderStatus;
  initialTrackingNumber?: string | null;
}

export function OrderFulfillmentForm({
  orderId,
  currentStatus,
  initialTrackingNumber,
}: OrderFulfillmentFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isTerminal = currentStatus === OrderStatus.DELIVERED || currentStatus === OrderStatus.CANCELLED;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await updateOrderStatus({
        orderId,
        status,
        trackingNumber: trackingNumber.trim() || undefined,
      });

      if (!res.success) {
        setMessage({ type: "error", text: res.error || "Failed to update order fulfillment status." });
        setLoading(false);
        return;
      }

      setMessage({ type: "success", text: `Order status successfully updated to ${res.data?.status || status}.` });
      router.refresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4 bg-brand-charcoal border border-brand-gold/10 p-5 rounded-lg">
      <h3 className="font-serif text-base text-brand-gold">Order Fulfillment & Tracking</h3>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs font-sans border ${
            message.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-200"
              : "bg-rose-950/60 border-rose-500/30 text-rose-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {isTerminal ? (
        <div className="p-3 bg-brand-forest/60 border border-brand-gold/20 text-brand-ivory/70 text-xs rounded">
          This order is in a terminal state (<strong>{currentStatus}</strong>) and cannot be modified further.
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">
              Fulfillment Order Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold"
            >
              {currentStatus === OrderStatus.PENDING && (
                <>
                  <option value={OrderStatus.PENDING}>PENDING (Awaiting Processing)</option>
                  <option value={OrderStatus.PROCESSING}>PROCESSING (In Fulfillment)</option>
                  <option value={OrderStatus.CANCELLED}>CANCELLED (Cancel Order)</option>
                </>
              )}
              {currentStatus === OrderStatus.PROCESSING && (
                <>
                  <option value={OrderStatus.PROCESSING}>PROCESSING (In Fulfillment)</option>
                  <option value={OrderStatus.SHIPPED}>SHIPPED (Handed to Carrier)</option>
                  <option value={OrderStatus.CANCELLED}>CANCELLED (Cancel Order)</option>
                </>
              )}
              {currentStatus === OrderStatus.SHIPPED && (
                <>
                  <option value={OrderStatus.SHIPPED}>SHIPPED (Handed to Carrier)</option>
                  <option value={OrderStatus.DELIVERED}>DELIVERED (Completed)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">
              Carrier Tracking Number (Saved in Shipping Metadata)
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. TRK-987654321"
              className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-brand-gold hover:bg-brand-gold-light text-brand-forest text-xs font-medium rounded transition-colors"
          >
            {loading ? "Updating Fulfillment..." : "Save Order Fulfillment"}
          </button>
        </div>
      )}
    </form>
  );
}
