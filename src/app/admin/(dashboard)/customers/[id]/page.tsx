import Link from "next/link";
import { notFound } from "next/navigation";
import { assertAdminSession } from "@/lib/auth/assertAdminSession";
import { getAdminCustomerDetail } from "@/actions/adminActions";
import { BackButton } from "@/components/ui/BackButton";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await assertAdminSession();

  const { id } = await params;
  const res = await getAdminCustomerDetail(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const customer = res.data;

  return (
    <div className="space-y-6">
      <BackButton fallbackHref="/admin/customers" label="Back to Customers" variant="admin" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl text-brand-ivory tracking-wide">
            Customer Profile: {customer.name || customer.email}
          </h1>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
              customer.role === "ADMIN"
                ? "bg-purple-950 text-purple-300 border border-purple-800"
                : "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
            }`}
          >
            {customer.role}
          </span>
        </div>
        <p className="text-xs text-brand-ivory/60 font-sans mt-1">
          Registered Account • ID: <span className="font-mono">{customer.id}</span>
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg p-4">
          <p className="text-[11px] text-brand-ivory/50 uppercase tracking-wider">Total Spent (PAID)</p>
          <p className="font-serif text-xl text-brand-gold mt-1">{customer.totalSpentPaid}</p>
        </div>

        <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg p-4">
          <p className="text-[11px] text-brand-ivory/50 uppercase tracking-wider">Total Orders</p>
          <p className="font-serif text-xl text-brand-ivory mt-1">{customer.orderCount}</p>
        </div>

        <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg p-4">
          <p className="text-[11px] text-brand-ivory/50 uppercase tracking-wider">Reviews Submitted</p>
          <p className="font-serif text-xl text-brand-ivory mt-1">{customer.reviewCount}</p>
        </div>

        <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg p-4">
          <p className="text-[11px] text-brand-ivory/50 uppercase tracking-wider">Member Since</p>
          <p className="font-serif text-sm text-brand-ivory mt-2">
            {new Date(customer.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Account Info & Security Note */}
      <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg p-5 space-y-3">
        <h3 className="font-serif text-base text-brand-gold">Account Metadata</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-brand-ivory/80">
          <div>
            <p className="text-[11px] text-brand-ivory/50 uppercase tracking-wider">Full Name</p>
            <p className="font-medium text-brand-ivory mt-0.5">{customer.name || "N/A"}</p>
          </div>

          <div>
            <p className="text-[11px] text-brand-ivory/50 uppercase tracking-wider">Email Address</p>
            <p className="font-medium text-brand-ivory mt-0.5">{customer.email}</p>
          </div>

          <div>
            <p className="text-[11px] text-brand-ivory/50 uppercase tracking-wider">Role Assignment</p>
            <p className="font-medium text-brand-ivory mt-0.5">{customer.role} (Role elevation disabled in UI)</p>
          </div>

          <div>
            <p className="text-[11px] text-brand-ivory/50 uppercase tracking-wider">Last Profile Update</p>
            <p className="font-medium text-brand-ivory mt-0.5">
              {new Date(customer.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Order History Summary Table */}
      <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg overflow-hidden space-y-3 p-5">
        <h3 className="font-serif text-base text-brand-gold">Customer Order History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-gold/10 bg-brand-forest/50 text-[11px] font-serif text-brand-gold tracking-wider uppercase">
                <th className="py-2.5 px-3">Order Number</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Fulfillment</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/5 text-xs font-sans text-brand-ivory/80">
              {customer.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-brand-ivory/50">
                    No order history for this customer profile.
                  </td>
                </tr>
              ) : (
                customer.recentOrders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-brand-ivory/5 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-brand-gold">{o.orderNumber}</td>
                    <td className="py-2.5 px-3 text-brand-ivory/60">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3">{o.status}</td>
                    <td className="py-2.5 px-3">{o.paymentStatus}</td>
                    <td className="py-2.5 px-3 font-medium text-brand-ivory">{o.total}</td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-xs text-brand-gold hover:underline font-medium"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
