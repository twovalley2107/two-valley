// Force dynamic rendering on every request — no stale cached KPI data.
// Required because this page calls Prisma aggregations that must reflect
// the live database state. cacheComponents is not enabled in next.config.ts,
// so this is the correct mechanism for Next.js 16.3.5 (previous caching model).
export const dynamic = "force-dynamic";

import { assertAdminSession } from "@/lib/auth/assertAdminSession";
import { getAdminDashboardKPIs } from "@/actions/adminActions";
import { KPICard } from "@/components/admin/KPICard";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Executive Dashboard — Two Valley Admin",
};

export default async function AdminDashboardPage() {
  // ── LAYER 3: Independent Admin Authorization Guard ─────────────────────
  // This is the third independent assertAdminSession() check:
  //   1. Middleware (Layer 1 — route protection)
  //   2. layout.tsx (Layer 2 — layout guard)
  //   3. page.tsx (Layer 3 — this check, independent of layout)
  // Each check re-verifies Supabase Auth session AND Profile.role === ADMIN.
  let adminName = "";
  try {
    const { profile } = await assertAdminSession();
    adminName = profile.name || profile.email;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "statusCode" in err) {
      const statusCode = (err as { statusCode: number }).statusCode;
      if (statusCode === 401 || statusCode === 403) {
        redirect(`/admin/login?redirectTo=/admin${statusCode === 403 ? "&error=denied" : ""}`);
      }
    }
    redirect("/admin/login");
  }

  // Fetch all KPI metrics via the server action (which also independently re-verifies auth).
  // On error, surface a graceful message rather than crashing the page.
  const kpiResult = await getAdminDashboardKPIs();

  if (!kpiResult.success || !kpiResult.data) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-serif text-brand-gold">Executive Dashboard</h1>
        <div className="p-6 rounded-2xl bg-brand-charcoal/50 border border-red-500/30 text-red-400 text-sm font-sans">
          Failed to load dashboard metrics. {kpiResult.error}
        </div>
      </div>
    );
  }

  const kpi = kpiResult.data;

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-serif text-brand-gold tracking-wide">
          Executive Dashboard
        </h1>
        <p className="text-sm text-brand-ivory/60 font-sans">
          Welcome back,{" "}
          <span className="text-brand-ivory/80">{adminName}</span>
          {" "}· Metrics refresh on every page load · Business day: Asia/Kolkata (IST)
        </p>
      </div>

      {/* ── Row 1: Today & Revenue ──────────────────────────────────────── */}
      <section aria-labelledby="ops-heading">
        <h2 id="ops-heading" className="text-xs font-sans text-brand-ivory/40 uppercase tracking-widest mb-3">
          Today&apos;s Activity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Today's Orders"
            value={String(kpi.todayOrderCount)}
            subtitle="Orders placed since IST midnight"
          />
          <KPICard
            label="Today's Revenue"
            value={kpi.todayRevenuePaid}
            subtitle="Paid orders today (IST)"
          />
          <KPICard
            label="Total Revenue"
            value={kpi.totalRevenuePaid}
            subtitle="All-time paid orders only"
          />
          <KPICard
            label="Pending Orders"
            value={String(kpi.pendingOrderCount)}
            subtitle="Awaiting fulfilment"
            alert={kpi.pendingOrderCount > 0}
          />
        </div>
      </section>

      {/* ── Row 2: Inventory & Moderation ───────────────────────────────── */}
      <section aria-labelledby="inventory-heading">
        <h2 id="inventory-heading" className="text-xs font-sans text-brand-ivory/40 uppercase tracking-widest mb-3">
          Inventory &amp; Moderation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Low-Stock Products"
            value={String(kpi.lowStockProductCount)}
            subtitle="Product stock ≤ 15 units"
            alert={kpi.lowStockProductCount > 0}
          />
          <KPICard
            label="Out-of-Stock Products"
            value={String(kpi.outOfStockProductCount)}
            subtitle="Product stock = 0"
            alert={kpi.outOfStockProductCount > 0}
          />
          <KPICard
            label="Pending Reviews"
            value={String(kpi.pendingReviewCount)}
            subtitle="Awaiting moderation approval"
            alert={kpi.pendingReviewCount > 0}
          />
          <KPICard
            label="Total Customers"
            value={String(kpi.totalCustomerCount)}
            subtitle="Registered customer accounts"
          />
        </div>
      </section>

      {/* ── Security & Data integrity notices (dev-visible) ─────────────── */}
      <section aria-label="Security status">
        <div className="p-4 rounded-xl bg-brand-charcoal/50 border border-brand-gold/10 font-mono text-[11px] text-brand-gold/50 space-y-1">
          <div>[AUTH]: assertAdminSession() verified at layout + page + action layers</div>
          <div>[DATA]: Revenue sourced exclusively from Order.total WHERE paymentStatus = PAID</div>
          <div>[STOCK]: Low-stock KPI uses Product.stockQuantity (threshold ≤ 15 per TASKS.md TV-15-002)</div>
          <div>[TIMEZONE]: Business-day boundary — Asia/Kolkata (IST, UTC+05:30)</div>
          <div>[PRIVACY]: No PII, no EventLog rows, no individual order data on this page</div>
        </div>
      </section>

    </div>
  );
}
