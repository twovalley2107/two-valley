import Link from "next/link";
import { assertAdminSession } from "@/lib/auth/assertAdminSession";
import { getAdminProducts } from "@/actions/adminActions";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; categoryId?: string; page?: string }>;
}) {
  await assertAdminSession();

  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const categoryId = resolvedParams.categoryId || "";
  const page = Number(resolvedParams.page || "1");

  const [productsRes, categories] = await Promise.all([
    getAdminProducts({ search, categoryId, page, limit: 10 }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const data = productsRes.success && productsRes.data ? productsRes.data : { products: [], total: 0, pages: 1 };

  return (
    <div className="space-y-6">
      {/* Header & New Product CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-brand-ivory tracking-wide">Products</h1>
          <p className="text-xs text-brand-ivory/60 font-sans mt-0.5">
            Manage Two Valley luxury tea and fragrance catalog items.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-brand-gold hover:bg-brand-gold-light text-brand-forest text-xs font-medium rounded transition-colors"
        >
          + New Product
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <form method="GET" className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-brand-charcoal/40 p-4 rounded-lg border border-brand-gold/10">
        <div>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name or SKU..."
            className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-1.5 text-xs text-brand-ivory placeholder-brand-ivory/40 focus:outline-none focus:border-brand-gold"
          />
        </div>

        <div>
          <select
            name="categoryId"
            defaultValue={categoryId}
            className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-1.5 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-brand-charcoal">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="w-full px-4 py-1.5 bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold text-xs font-medium rounded transition-colors"
          >
            Filter Products
          </button>
        </div>
      </form>

      {/* Products Table */}
      <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-gold/10 bg-brand-forest/50 text-[11px] font-serif text-brand-gold tracking-wider uppercase">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/5 text-xs font-sans text-brand-ivory/80">
              {data.products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-ivory/50">
                    No products found.
                  </td>
                </tr>
              ) : (
                data.products.map((product) => (
                  <tr key={product.id} className="hover:bg-brand-ivory/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-9 h-9 object-cover rounded bg-black/40 border border-brand-gold/10"
                        />
                        <div>
                          <p className="font-medium text-brand-ivory">{product.name}</p>
                          <p className="text-[10px] text-brand-ivory/50">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-brand-gold/80">
                      {product.sku}
                    </td>
                    <td className="py-3 px-4 text-brand-ivory/70">{product.categoryName}</td>
                    <td className="py-3 px-4">
                      <span>{product.price}</span>
                      {product.salePrice && (
                        <span className="ml-2 text-[10px] text-brand-gold">
                          ({product.salePrice})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                          product.stockQuantity > 15
                            ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                            : product.stockQuantity > 0
                            ? "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                            : "bg-rose-950/60 text-rose-300 border border-rose-800/40"
                        }`}
                      >
                        {product.stockQuantity} in stock
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-xs text-brand-gold hover:underline font-medium"
                      >
                        Edit
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
              Page {page} of {data.pages} ({data.total} items)
            </span>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/products?search=${search}&categoryId=${categoryId}&page=${page - 1}`}
                  className="px-3 py-1 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold rounded"
                >
                  Previous
                </Link>
              )}
              {page < data.pages && (
                <Link
                  href={`/admin/products?search=${search}&categoryId=${categoryId}&page=${page + 1}`}
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
