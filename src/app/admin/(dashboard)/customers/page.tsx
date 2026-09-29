import Link from "next/link";
import { assertAdminSession } from "@/lib/auth/assertAdminSession";
import { getAdminCustomers } from "@/actions/adminActions";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  await assertAdminSession();

  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const page = Number(resolvedParams.page || "1");

  const customersRes = await getAdminCustomers({ search, page, limit: 15 });
  const data = customersRes.success && customersRes.data ? customersRes.data : { customers: [], total: 0, pages: 1 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl text-brand-ivory tracking-wide">Customer Management</h1>
        <p className="text-xs text-brand-ivory/60 font-sans mt-0.5">
          View registered customer accounts, total spent, and purchase history summaries.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <form method="GET" className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-brand-charcoal/40 p-4 rounded-lg border border-brand-gold/10">
        <div className="sm:col-span-2">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search Customer Name or Email..."
            className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-1.5 text-xs text-brand-ivory placeholder-brand-ivory/40 focus:outline-none focus:border-brand-gold"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full px-4 py-1.5 bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold text-xs font-medium rounded transition-colors"
          >
            Search Customers
          </button>
        </div>
      </form>

      {/* Customers Table */}
      <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-gold/10 bg-brand-forest/50 text-[11px] font-serif text-brand-gold tracking-wider uppercase">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4">Paid Orders</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/5 text-xs font-sans text-brand-ivory/80">
              {data.customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-ivory/50">
                    No customers match current search.
                  </td>
                </tr>
              ) : (
                data.customers.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-ivory/5 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-brand-ivory">{c.name || "N/A"}</p>
                      <p className="text-[11px] text-brand-ivory/60">{c.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.role === "ADMIN"
                            ? "bg-purple-950/80 text-purple-300 border border-purple-800/40"
                            : "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
                        }`}
                      >
                        {c.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brand-ivory/60">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium">{c.orderCount} order(s)</td>
                    <td className="py-3 px-4 font-medium text-brand-gold">{c.totalSpentPaid}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="text-xs text-brand-gold hover:underline font-medium"
                      >
                        View Profile
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
              Page {page} of {data.pages} ({data.total} profiles)
            </span>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/customers?search=${search}&page=${page - 1}`}
                  className="px-3 py-1 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold rounded"
                >
                  Previous
                </Link>
              )}
              {page < data.pages && (
                <Link
                  href={`/admin/customers?search=${search}&page=${page + 1}`}
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
