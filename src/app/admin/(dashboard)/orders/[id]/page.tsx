import { notFound } from "next/navigation";
import { assertAdminSession } from "@/lib/auth/assertAdminSession";
import { getAdminOrderDetail } from "@/actions/adminActions";
import { OrderFulfillmentForm } from "@/components/admin/OrderFulfillmentForm";
import { BackButton } from "@/components/ui/BackButton";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await assertAdminSession();

  const { id } = await params;
  const res = await getAdminOrderDetail(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const order = res.data;
  const address = order.shippingAddress || {};

  return (
    <div className="space-y-6">
      <BackButton fallbackHref="/admin/orders" label="Back to Orders" variant="admin" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl text-brand-ivory tracking-wide">
            Order #{order.orderNumber}
          </h1>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
              order.paymentStatus === "PAID"
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                : "bg-amber-950 text-amber-300 border border-amber-800"
            }`}
          >
            {order.paymentStatus}
          </span>
        </div>
        <p className="text-xs text-brand-ivory/60 font-sans mt-1">
          Placed on {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Shipping Address (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchased Items Card */}
          <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg p-5 space-y-4">
            <h3 className="font-serif text-base text-brand-gold">Purchased Formulations</h3>
            <div className="divide-y divide-brand-gold/10">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded bg-black/40 border border-brand-gold/10"
                    />
                    <div>
                      <p className="text-xs font-medium text-brand-ivory">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-[11px] text-brand-ivory/50">Size/Variant: {item.variantName}</p>
                      )}
                      <p className="text-[11px] text-brand-ivory/60">
                        Qty: {item.quantity} × {item.unitPrice}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-brand-gold">{item.totalPrice}</span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-brand-gold/10 space-y-1.5 text-xs text-brand-ivory/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{order.shippingFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{order.tax}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-brand-gold/10 font-medium text-sm text-brand-gold">
                <span>Total Paid</span>
                <span>{order.total}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address & Recipient Card */}
          <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg p-5 space-y-3">
            <h3 className="font-serif text-base text-brand-gold">Delivery & Recipient Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-brand-ivory/80">
              <div>
                <p className="text-[11px] text-brand-ivory/50 uppercase tracking-wider">Recipient Name</p>
                <p className="font-medium text-brand-ivory mt-0.5">{address.fullName || "N/A"}</p>

                <p className="text-[11px] text-brand-ivory/50 uppercase tracking-wider mt-3">Contact Information</p>
                <p className="mt-0.5">Email: {order.contactEmail}</p>
                {order.contactPhone && <p>Phone: {order.contactPhone}</p>}
              </div>

              <div>
                <p className="text-[11px] text-brand-ivory/50 uppercase tracking-wider">Shipping Address</p>
                <p className="mt-0.5">{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p>{address.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fulfillment Form Controls */}
        <div>
          <OrderFulfillmentForm
            orderId={order.id}
            currentStatus={order.status}
            initialTrackingNumber={order.trackingNumber}
          />
        </div>
      </div>
    </div>
  );
}
