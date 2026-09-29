import { assertAdminSession } from "@/lib/auth/assertAdminSession";
import { getAdminReviews } from "@/actions/adminActions";
import { ReviewModerationTable } from "@/components/admin/ReviewModerationTable";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: "pending" | "approved" | "all" }>;
}) {
  await assertAdminSession();

  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams.status || "pending";

  const res = await getAdminReviews(statusFilter);
  const reviews = res.success && res.data ? res.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl text-brand-ivory tracking-wide">Review Moderation Queue</h1>
        <p className="text-xs text-brand-ivory/60 font-sans mt-0.5">
          Approve submitted customer product reviews to display on storefront product detail pages.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-gold/20 pb-1">
        {[
          { key: "pending", label: "Pending Moderation" },
          { key: "approved", label: "Approved Reviews" },
          { key: "all", label: "All Reviews" },
        ].map((tab) => (
          <a
            key={tab.key}
            href={`/admin/reviews?status=${tab.key}`}
            className={`px-4 py-1.5 text-xs font-sans rounded-t-lg transition-colors ${
              statusFilter === tab.key
                ? "bg-brand-gold text-brand-forest font-semibold"
                : "text-brand-ivory/60 hover:text-brand-ivory hover:bg-brand-ivory/5"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Table Component */}
      <ReviewModerationTable initialReviews={reviews} />
    </div>
  );
}
