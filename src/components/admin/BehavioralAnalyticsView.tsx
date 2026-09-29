"use client";

import { BehavioralAnalyticsData } from "@/actions/analyticsActions";
import { ConversionFunnelChart } from "./ConversionFunnelChart";

interface BehavioralAnalyticsViewProps {
  data: BehavioralAnalyticsData;
}

export function BehavioralAnalyticsView({ data }: BehavioralAnalyticsViewProps) {
  return (
    <div className="space-y-6">
      {/* Sampling Indicator Badge if >50k events */}
      {data.isSampled && (
        <div className="p-3 bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs rounded-lg flex items-center gap-2">
          <span>⚠</span>
          <span>
            <strong>Sampled Analytics:</strong> Telemetry in selected date range exceeded 50,000 events. Metrics below reflect a sampled subset of the first 50,000 processed events.
          </span>
        </div>
      )}

      {/* Conversion Funnel Chart */}
      <ConversionFunnelChart stages={data.funnel} />

      {/* Grid: Top Viewed Products & Top Search Queries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Viewed Products */}
        <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base text-brand-gold">Most-Viewed Formulations</h3>
            <span className="text-xs text-brand-ivory/50">Top 10 PDP Views</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-gold/10 bg-brand-forest/50 text-[11px] font-serif text-brand-gold tracking-wider uppercase">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Formulation Name</th>
                  <th className="py-2.5 px-3 text-right">View Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gold/5 text-xs font-sans text-brand-ivory/80">
                {data.topViewedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-brand-ivory/50">
                      No product view events logged in selected timeframe.
                    </td>
                  </tr>
                ) : (
                  data.topViewedProducts.map((p, idx) => (
                    <tr key={p.productId} className="hover:bg-brand-ivory/5 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-brand-gold">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-brand-ivory">{p.productName}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-brand-gold">
                        {p.viewCount} views
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Search Queries with Zero-Result Metrics */}
        <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base text-brand-gold">Search Queries & Unfulfilled Demand</h3>
            <span className="text-xs text-brand-ivory/50">Normalized Queries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-gold/10 bg-brand-forest/50 text-[11px] font-serif text-brand-gold tracking-wider uppercase">
                  <th className="py-2.5 px-3">Normalized Query</th>
                  <th className="py-2.5 px-3">Volume</th>
                  <th className="py-2.5 px-3">Avg Results</th>
                  <th className="py-2.5 px-3 text-right">Zero-Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gold/5 text-xs font-sans text-brand-ivory/80">
                {data.topSearchQueries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-brand-ivory/50">
                      No search query events logged in selected timeframe.
                    </td>
                  </tr>
                ) : (
                  data.topSearchQueries.map((q, idx) => (
                    <tr key={idx} className="hover:bg-brand-ivory/5 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-brand-ivory">
                        "{q.normalizedQuery}"
                      </td>
                      <td className="py-2.5 px-3 font-semibold">{q.searchVolume}</td>
                      <td className="py-2.5 px-3 text-brand-ivory/70">{q.avgResultCount}</td>
                      <td className="py-2.5 px-3 text-right">
                        {q.zeroResultCount > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            {q.zeroResultCount} zero-res
                          </span>
                        ) : (
                          <span className="text-brand-ivory/40">0</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Wishlist Activity Card */}
      <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg p-5 space-y-4">
        <h3 className="font-serif text-base text-brand-gold">Wishlist Addition Activity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {data.topWishlistItems.length === 0 ? (
            <p className="text-xs text-brand-ivory/50 italic col-span-full">
              No wishlist addition events in date range.
            </p>
          ) : (
            data.topWishlistItems.map((item, idx) => (
              <div
                key={item.productId}
                className="p-3 bg-black/30 rounded border border-brand-gold/10 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-brand-gold">#{idx + 1}</span>
                  <p className="text-xs font-medium text-brand-ivory mt-0.5 truncate" title={item.productName}>
                    {item.productName}
                  </p>
                </div>
                <p className="text-xs text-brand-ivory/60 mt-2 font-semibold">
                  {item.addCount} wishlist add(s)
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
