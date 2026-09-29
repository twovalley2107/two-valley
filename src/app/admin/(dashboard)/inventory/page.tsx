import { assertAdminSession } from "@/lib/auth/assertAdminSession";
import { getAdminInventory } from "@/actions/adminActions";
import { InventoryTable } from "@/components/admin/InventoryTable";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; stockFilter?: "all" | "low" | "out" }>;
}) {
  await assertAdminSession();

  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const stockFilter = resolvedParams.stockFilter || "all";

  const inventoryRes = await getAdminInventory({ search, stockFilter });
  const items = inventoryRes.success && inventoryRes.data ? inventoryRes.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl text-brand-ivory tracking-wide">Inventory Dashboard</h1>
        <p className="text-xs text-brand-ivory/60 font-sans mt-0.5">
          Real-time stock management with color-coded alerts and inline batch updates.
        </p>
      </div>

      {/* Filter Bar */}
      <form method="GET" className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-brand-charcoal/40 p-4 rounded-lg border border-brand-gold/10">
        <div>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search SKU or Product..."
            className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-1.5 text-xs text-brand-ivory placeholder-brand-ivory/40 focus:outline-none focus:border-brand-gold"
          />
        </div>

        <div>
          <select
            name="stockFilter"
            defaultValue={stockFilter}
            className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-1.5 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold"
          >
            <option value="all">All Items</option>
            <option value="low">Low Stock (&le; 15)</option>
            <option value="out">Out of Stock (= 0)</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="w-full px-4 py-1.5 bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold text-xs font-medium rounded transition-colors"
          >
            Filter Inventory
          </button>
        </div>
      </form>

      {/* Inventory Table Component */}
      <InventoryTable initialItems={items} />
    </div>
  );
}
