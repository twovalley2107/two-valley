"use client";

import { SalesAnalyticsData } from "@/actions/analyticsActions";

interface SalesAnalyticsViewProps {
  data: SalesAnalyticsData;
}

export function SalesAnalyticsView({ data }: SalesAnalyticsViewProps) {
  return (
    <div className="space-y-6">
      {/* Revenue & Sales KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Realized Revenue Card */}
        <div className="bg-brand-charcoal border border-brand-gold/20 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans text-brand-ivory/60 uppercase tracking-wider">
              Net Realized Revenue
            </span>
            <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded">
              Active Paid
            </span>
          </div>
          <p className="font-serif text-2xl text-brand-gold mt-2 font-bold">
            {data.netRealizedRevenue}
          </p>
          <p className="text-[10px] text-brand-ivory/50 mt-1">
            Excludes CANCELLED paid orders
          </p>
        </div>

        {/* Average Order Value (AOV) Card */}
        <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg p-5">
          <span className="text-[11px] font-sans text-brand-ivory/60 uppercase tracking-wider">
            Average Order Value (AOV)
          </span>
          <p className="font-serif text-2xl text-brand-ivory mt-2 font-bold">
            {data.averageOrderValue}
          </p>
          <p className="text-[10px] text-brand-ivory/50 mt-1">
            Net Revenue ÷ {data.paidActiveOrderCount} Paid Orders
          </p>
        </div>

        {/* Paid Active Orders Count Card */}
        <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg p-5">
          <span className="text-[11px] font-sans text-brand-ivory/60 uppercase tracking-wider">
            Paid Active Orders
          </span>
          <p className="font-serif text-2xl text-brand-ivory mt-2 font-bold">
            {data.paidActiveOrderCount}
          </p>
          <p className="text-[10px] text-brand-ivory/50 mt-1">
            PROCESSING, SHIPPED, DELIVERED
          </p>
        </div>

        {/* Gross Paid Revenue Card */}
        <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg p-5">
          <span className="text-[11px] font-sans text-brand-ivory/60 uppercase tracking-wider">
            Gross Paid Revenue
          </span>
          <p className="font-serif text-2xl text-brand-ivory/80 mt-2 font-bold">
            {data.grossPaidRevenue}
          </p>
          <p className="text-[10px] text-brand-ivory/50 mt-1">
            Includes all paymentStatus = PAID
          </p>
        </div>
      </div>

      {/* Top Selling SKUs Table & Fulfillment Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling SKUs (2 Cols) */}
        <div className="lg:col-span-2 bg-brand-charcoal border border-brand-gold/10 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base text-brand-gold">Top-Selling SKUs & Products</h3>
            <span className="text-xs text-brand-ivory/50">Ranked by Volume</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-gold/10 bg-brand-forest/50 text-[11px] font-serif text-brand-gold tracking-wider uppercase">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Variant</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gold/5 text-xs font-sans text-brand-ivory/80">
                {data.topSellingSKUs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-brand-ivory/50">
                      No paid order sales recorded in this timeframe.
                    </td>
                  </tr>
                ) : (
                  data.topSellingSKUs.map((sku, idx) => (
                    <tr key={idx} className="hover:bg-brand-ivory/5 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-brand-gold">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-brand-ivory">{sku.productName}</td>
                      <td className="py-2.5 px-3 text-brand-ivory/60">{sku.variantName || "Standard"}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-brand-gold/80">{sku.sku}</td>
                      <td className="py-2.5 px-3 font-semibold">{sku.quantitySold}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-brand-gold">{sku.totalRevenue}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Fulfillment Status Breakdown (1 Col) */}
        <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg p-5 space-y-4">
          <h3 className="font-serif text-base text-brand-gold">Fulfillment Distribution</h3>
          <div className="space-y-3">
            {data.statusBreakdown.length === 0 ? (
              <p className="text-xs text-brand-ivory/50 italic py-4">No order records in date range.</p>
            ) : (
              data.statusBreakdown.map((s) => (
                <div key={s.status} className="flex items-center justify-between p-2.5 bg-black/30 rounded border border-brand-gold/10">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                      s.status === "DELIVERED"
                        ? "bg-emerald-950/80 text-emerald-300"
                        : s.status === "SHIPPED"
                        ? "bg-blue-950/80 text-blue-300"
                        : s.status === "PROCESSING"
                        ? "bg-purple-950/80 text-purple-300"
                        : s.status === "CANCELLED"
                        ? "bg-rose-950/80 text-rose-300"
                        : "bg-amber-950/80 text-amber-300"
                    }`}
                  >
                    {s.status}
                  </span>
                  <span className="text-xs font-semibold text-brand-ivory">{s.count} order(s)</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
