import { assertAdminSession } from "@/lib/auth/assertAdminSession";
import {
  getSalesAnalytics,
  getBehavioralAnalytics,
  DateRangePreset,
} from "@/actions/analyticsActions";
import { AnalyticsDateFilter } from "@/components/admin/AnalyticsDateFilter";
import { SalesAnalyticsView } from "@/components/admin/SalesAnalyticsView";
import { BehavioralAnalyticsView } from "@/components/admin/BehavioralAnalyticsView";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; view?: string }>;
}) {
  await assertAdminSession();

  const resolvedParams = await searchParams;
  const preset = (resolvedParams.preset as DateRangePreset) || "30d";
  const currentView = resolvedParams.view || "sales";

  const [salesRes, behavioralRes] = await Promise.all([
    getSalesAnalytics(preset),
    getBehavioralAnalytics(preset),
  ]);

  const salesData = salesRes.success && salesRes.data ? salesRes.data : {
    netRealizedRevenue: "$0.00",
    grossPaidRevenue: "$0.00",
    paidActiveOrderCount: 0,
    averageOrderValue: "$0.00",
    topSellingSKUs: [],
    statusBreakdown: [],
  };

  const behavioralData = behavioralRes.success && behavioralRes.data ? behavioralRes.data : {
    isSampled: false,
    totalEventsProcessed: 0,
    funnel: [],
    topViewedProducts: [],
    topSearchQueries: [],
    topWishlistItems: [],
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-brand-ivory tracking-wide">Analytics & Intelligence</h1>
          <p className="text-xs text-brand-ivory/60 font-sans mt-0.5">
            Real-time financial sales metrics and customer behavioral telemetry insights.
          </p>
        </div>

        <AnalyticsDateFilter currentPreset={preset} />
      </div>

      {/* Analytics Sub-View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-gold/20 pb-1">
        <a
          href={`/admin/analytics?preset=${preset}&view=sales`}
          className={`px-4 py-1.5 text-xs font-sans rounded-t-lg transition-colors ${
            currentView === "sales"
              ? "bg-brand-gold text-brand-forest font-semibold"
              : "text-brand-ivory/60 hover:text-brand-ivory hover:bg-brand-ivory/5"
          }`}
        >
          Sales & Financial Metrics
        </a>
        <a
          href={`/admin/analytics?preset=${preset}&view=behavioral`}
          className={`px-4 py-1.5 text-xs font-sans rounded-t-lg transition-colors ${
            currentView === "behavioral"
              ? "bg-brand-gold text-brand-forest font-semibold"
              : "text-brand-ivory/60 hover:text-brand-ivory hover:bg-brand-ivory/5"
          }`}
        >
          Behavioural Telemetry Summary
        </a>
      </div>

      {/* Render Selected View */}
      {currentView === "behavioral" ? (
        <BehavioralAnalyticsView data={behavioralData} />
      ) : (
        <SalesAnalyticsView data={salesData} />
      )}
    </div>
  );
}
