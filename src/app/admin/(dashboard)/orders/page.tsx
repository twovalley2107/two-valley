import Link from "next/link";
import { assertAdminSession } from "@/lib/auth/assertAdminSession";
import { getAdminOrders } from "@/actions/adminActions";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  await assertAdminSession();

  const resolvedParams = await searchParams;
  const statusParam = resolvedParams.status as OrderStatus | undefined;
  const search = resolvedParams.search || "";
  const page = Number(resolvedParams.page || "1");

  const ordersRes = await getAdminOrders({ status: statusParam, search, page, limit: 10 });
  const data = ordersRes.success && ordersRes.data ? ordersRes.data : { orders: [], total: 0, pages: 1 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl text-brand-ivory tracking-wide">Orders Management</h1>
        <p className="text-xs text-brand-ivory/60 font-sans mt-0.5">
          Inspect customer purchases, manage fulfillment statuses, and assign tracking numbers.
        </p>
      </div>

      {/* Filter Bar */}
      <form method="GET" className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-brand-charcoal/40 p-4 rounded-lg border border-brand-gold/10">
        <div>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search Order Number or Email..."
            className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-1.5 text-xs text-brand-ivory placeholder-brand-ivory/40 focus:outline-none focus:border-brand-gold"
          />
        </div>

        <div>
          <select
            name="status"
            defaultValue={statusParam || ""}
            className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-1.5 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold"
          >
            <option value="">All Fulfillment Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="w-full px-4 py-1.5 bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold text-xs font-medium rounded transition-colors"
          >
            Filter Orders
          </button>
        </div>
      </form>

      {/* Orders Table */}
      <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-gold/10 bg-brand-forest/50 text-[11px] font-serif text-brand-gold tracking-wider uppercase">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer Email</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/5 text-xs font-sans text-brand-ivory/80">
              {data.orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-ivory/50">
                    No orders match current filter.
                  </td>
                </tr>
              ) : (
                data.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-ivory/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-brand-gold">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-brand-ivory/60">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-brand-ivory/80">{order.customerEmail}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                            : order.paymentStatus === "UNPAID"
                            ? "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                            : "bg-rose-950/60 text-rose-300 border border-rose-800/40"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-950/60 text-emerald-300"
                            : order.status === "SHIPPED"
                            ? "bg-blue-950/60 text-blue-300"
                            : order.status === "PROCESSING"
                            ? "bg-purple-950/60 text-purple-300"
                            : order.status === "CANCELLED"
                            ? "bg-rose-950/60 text-rose-300"
                            : "bg-amber-950/60 text-amber-300"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-brand-ivory">{order.total}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs text-brand-gold hover:underline font-medium"
                      >
                        View & Fulfill
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-brand-gold/10 text-xs text-brand-ivory/60">
            <span>
              Page {page} of {data.pages} ({data.total} orders)
            </span>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/orders?status=${statusParam || ""}&search=${search}&page=${page - 1}`}
                  className="px-3 py-1 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold rounded"
                >
                  Previous
                </Link>
              )}
              {page < data.pages && (
                <Link
                  href={`/admin/orders?status=${statusParam || ""}&search=${search}&page=${page + 1}`}
                  className="px-3 py-1 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold rounded"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
