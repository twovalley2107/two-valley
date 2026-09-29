"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveReview, rejectReview, AdminReviewListItem } from "@/actions/adminActions";

interface ReviewModerationTableProps {
  initialReviews: AdminReviewListItem[];
}

export function ReviewModerationTable({ initialReviews }: ReviewModerationTableProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<AdminReviewListItem[]>(initialReviews);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleApprove = async (id: string) => {
    setActionId(id);
    setMessage(null);

    try {
      const res = await approveReview(id);
      if (!res.success) {
        setMessage({ type: "error", text: res.error || "Failed to approve review." });
        setActionId(null);
        return;
      }

      setReviews((prev) => prev.filter((r) => r.id !== id));
      setMessage({ type: "success", text: "Review approved! It is now visible on the customer PDP." });
      router.refresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Error approving review." });
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject and delete this review?")) return;

    setActionId(id);
    setMessage(null);

    try {
      const res = await rejectReview(id);
      if (!res.success) {
        setMessage({ type: "error", text: res.error || "Failed to reject review." });
        setActionId(null);
        return;
      }

      setReviews((prev) => prev.filter((r) => r.id !== id));
      setMessage({ type: "success", text: "Review rejected and removed from system." });
      router.refresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Error rejecting review." });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-lg text-xs font-sans border ${
            message.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-200"
              : "bg-rose-950/60 border-rose-500/30 text-rose-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-gold/10 bg-brand-forest/50 text-[11px] font-serif text-brand-gold tracking-wider uppercase">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Reviewer</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Comment</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/5 text-xs font-sans text-brand-ivory/80">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-ivory/50">
                    No reviews in this moderation queue.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-brand-ivory/5 transition-colors">
                    <td className="py-3 px-4 font-medium text-brand-ivory">{r.productName}</td>
                    <td className="py-3 px-4 text-brand-ivory/70">{r.reviewerName}</td>
                    <td className="py-3 px-4 font-medium text-brand-gold">
                      {"★".repeat(r.rating)}
                      <span className="text-brand-ivory/20">{"★".repeat(5 - r.rating)}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {r.title && <p className="font-semibold text-brand-ivory text-xs">{r.title}</p>}
                      <p className="text-[11px] text-brand-ivory/70 line-clamp-2">{r.comment}</p>
                    </td>
                    <td className="py-3 px-4 text-brand-ivory/50 text-[11px]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!r.isApproved && (
                          <button
                            type="button"
                            disabled={actionId === r.id}
                            onClick={() => handleApprove(r.id)}
                            className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] rounded transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={actionId === r.id}
                          onClick={() => handleReject(r.id)}
                          className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[11px] rounded transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
