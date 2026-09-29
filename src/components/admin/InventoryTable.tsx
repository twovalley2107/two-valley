"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateInventoryStock, InventoryItem } from "@/actions/adminActions";

interface InventoryTableProps {
  initialItems: InventoryItem[];
}

export function InventoryTable({ initialItems }: InventoryTableProps) {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [modified, setModified] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleStockChange = (id: string, newStock: number) => {
    const validStock = Math.max(0, Math.floor(newStock || 0));
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stockQuantity: validStock } : item))
    );
    setModified((prev) => ({
      ...prev,
      [id]: validStock,
    }));
  };

  const handleSave = async () => {
    const keys = Object.keys(modified);
    if (keys.length === 0) return;

    setMessage(null);
    setSaving(true);

    const updates = keys.map((id) => {
      const target = items.find((i) => i.id === id);
      return {
        id,
        type: target?.type || "product",
        stockQuantity: modified[id],
      };
    });

    try {
      const res = await updateInventoryStock({ updates });
      if (!res.success) {
        setMessage({ type: "error", text: res.error || "Failed to update inventory." });
        setSaving(false);
        return;
      }

      setMessage({ type: "success", text: `Successfully updated stock for ${res.data?.updatedCount || 0} item(s).` });
      setModified({});
      router.refresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Error saving inventory stock." });
    } finally {
      setSaving(false);
    }
  };

  const modifiedCount = Object.keys(modified).length;

  return (
    <div className="space-y-4">
      {message && (
        <div
          role={message.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`p-3 rounded-lg text-xs font-sans border ${
            message.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-200"
              : "bg-rose-950/60 border-rose-500/30 text-rose-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Floating Save Action Bar */}
      {modifiedCount > 0 && (
        <div className="sticky top-16 z-20 flex items-center justify-between p-3 bg-brand-forest border border-brand-gold text-xs rounded-lg shadow-xl animate-fade-in">
          <span className="text-brand-gold font-medium">
            {modifiedCount} item(s) modified
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setItems(initialItems);
                setModified({});
              }}
              className="px-3 py-1 text-brand-ivory/70 hover:text-brand-ivory text-xs"
            >
              Reset
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="px-4 py-1.5 bg-brand-gold text-brand-forest font-semibold rounded hover:bg-brand-gold-light transition-colors text-xs"
            >
              {saving ? "Saving..." : "Save Stock Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Real-time Inventory Table */}
      <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-gold/10 bg-brand-forest/50 text-[11px] font-serif text-brand-gold tracking-wider uppercase">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Variant / Label</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/5 text-xs font-sans text-brand-ivory/80">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-ivory/50">
                    No inventory records match current filter.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLow = item.stockQuantity > 0 && item.stockQuantity <= 15;
                  const isOut = item.stockQuantity === 0;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-brand-ivory/5 transition-colors ${
                        modified[item.id] !== undefined ? "bg-brand-gold/5" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-brand-gold/90">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4 font-medium text-brand-ivory">
                        {item.productName}
                      </td>
                      <td className="py-3 px-4 text-brand-ivory/70">
                        {item.variantLabel || "Standard"}
                      </td>
                      <td className="py-3 px-4 text-brand-ivory/60">{item.categoryName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                            isOut
                              ? "bg-rose-950/60 text-rose-300 border border-rose-800/40"
                              : isLow
                              ? "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                              : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                          }`}
                        >
                          {isOut ? "OUT OF STOCK" : isLow ? "LOW STOCK (<=15)" : "IN STOCK"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          min={0}
                          value={item.stockQuantity}
                          onChange={(e) => handleStockChange(item.id, Number(e.target.value))}
                          aria-label={`Update stock quantity for ${item.productName} ${item.variantLabel || ""}`}
                          className={`w-24 bg-black/50 border rounded px-2 py-1 text-xs text-right text-brand-ivory focus:outline-none focus:border-brand-gold ${
                            isOut
                              ? "border-rose-500/50"
                              : isLow
                              ? "border-amber-500/50"
                              : "border-brand-gold/20"
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
