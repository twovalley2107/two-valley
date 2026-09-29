"use client";

import { useState } from "react";
import Link from "next/link";
import { submitReview, ProductReviewSummary, CustomerReviewDTO } from "@/actions/reviewActions";

interface ReviewSectionProps {
  productId: string;
  productSlug: string;
  initialSummary: ProductReviewSummary;
  isAuthenticated: boolean;
}

/**
 * Helper component to render 5-star visual rating using inline SVG icons.
 * Follows Two Valley Gold (#D4AF37) brand styling without external icon packages.
 */
export function StarRating({
  rating,
  maxStars = 5,
  size = "md",
  interactive = false,
  onRatingSelect,
}: {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingSelect?: (rating: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const currentRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center space-x-1" role={interactive ? "radiogroup" : "img"} aria-label={`Rating: ${rating} out of ${maxStars} stars`}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= currentRating;

        return (
          <button
            key={index}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && onRatingSelect && onRatingSelect(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            className={`${interactive ? "cursor-pointer transform hover:scale-110 transition-transform" : "cursor-default"} focus:outline-none`}
            aria-label={interactive ? `Rate ${starValue} out of 5 stars` : undefined}
          >
            <svg
              className={`${starSizes[size]} ${
                isFilled ? "text-brand-gold fill-brand-gold" : "text-gray-300 fill-gray-200"
              } transition-colors`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

export function ReviewSection({
  productId,
  productSlug,
  initialSummary,
  isAuthenticated,
}: ReviewSectionProps) {
  const [summary] = useState<ProductReviewSummary>(initialSummary);
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (comment.trim().length < 3) {
      setErrorMessage("Review comment must be at least 3 characters.");
      return;
    }

    if (comment.trim().length > 1000) {
      setErrorMessage("Review comment cannot exceed 1000 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitReview({
        productId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to submit review.");
      } else {
        setSuccessMessage(
          res.data?.message || "Thank you! Your review has been submitted and is awaiting moderation."
        );
        // Reset form inputs
        setTitle("");
        setComment("");
        setRating(5);
      }
    } catch (err) {
      console.error("Submit review error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalReviews = summary.totalCount;
  const avgRating = summary.averageRating;

  return (
    <section id="reviews" className="py-12 border-t border-brand-gold/20 space-y-12">
      {/* Section Header */}
      <div className="space-y-2">
        <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-brand-gold">
          Customer Formulations Experience
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-forest">
          Customer Reviews
        </h2>
      </div>

      {/* Rating Summary Card */}
      <div className="bg-brand-beige/40 rounded-xl p-6 sm:p-8 border border-brand-gold/15 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Column: Big Average & Stars */}
        <div className="md:col-span-4 text-center md:text-left space-y-3 md:border-r md:border-brand-gold/20 md:pr-8">
          <div className="font-serif text-5xl font-bold text-brand-forest">
            {totalReviews > 0 ? avgRating.toFixed(1) : "0.0"}
          </div>
          <div className="flex justify-center md:justify-start">
            <StarRating rating={Math.round(avgRating)} size="lg" />
          </div>
          <p className="font-sans text-xs text-brand-olive uppercase tracking-wider font-semibold">
            {totalReviews > 0
              ? `Based on ${totalReviews} customer review${totalReviews === 1 ? "" : "s"}`
              : "No reviews yet"}
          </p>
        </div>

        {/* Right Column: Star Breakdown Distribution */}
        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((starTier) => {
            const count = summary.ratingCounts[starTier as keyof typeof summary.ratingCounts] || 0;
            const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

            return (
              <div key={starTier} className="flex items-center space-x-3 text-xs text-brand-olive font-sans">
                <span className="w-8 text-right font-medium">{starTier} ★</span>
                <div className="flex-1 bg-brand-ivory h-2.5 rounded-full overflow-hidden border border-brand-gold/10">
                  <div
                    className="bg-brand-gold h-full transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-brand-olive/80">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission Section / Guest Prompt */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-brand-gold/15 space-y-6">
        <h3 className="font-serif text-xl font-semibold text-brand-forest">
          Write a Review
        </h3>

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-forest font-sans">
                Overall Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-3">
                <StarRating
                  rating={rating}
                  size="lg"
                  interactive
                  onRatingSelect={(val) => setRating(val)}
                />
                <span className="text-sm font-semibold text-brand-forest font-sans">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Optional Title Input */}
            <div className="space-y-1.5">
              <label htmlFor="review-title" className="block text-xs font-semibold uppercase tracking-wider text-brand-forest font-sans">
                Review Title <span className="text-brand-olive font-normal">(Optional)</span>
              </label>
              <input
                id="review-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="e.g. Exquisite Sandalwood Notes & Lasting Sillage"
                className="w-full px-4 py-2.5 rounded-md border border-brand-gold/30 bg-brand-ivory text-brand-forest text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 font-sans"
              />
            </div>

            {/* Comment Textarea */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="review-comment" className="block text-xs font-semibold uppercase tracking-wider text-brand-forest font-sans">
                  Your Experience <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-brand-olive font-sans">
                  {comment.length} / 1000 characters
                </span>
              </div>
              <textarea
                id="review-comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                minLength={3}
                maxLength={1000}
                required
                placeholder="Describe the aroma, longevity, steeping ritual, or your impression of this formulation..."
                className="w-full px-4 py-3 rounded-md border border-brand-gold/30 bg-brand-ivory text-brand-forest text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 font-sans leading-relaxed"
              />
            </div>

            {/* Error & Success Feedback Alerts */}
            {errorMessage && (
              <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans font-medium">
                {successMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-brand-forest hover:bg-brand-olive text-brand-ivory text-xs font-semibold uppercase tracking-widest rounded-md transition-colors disabled:opacity-50 cursor-pointer font-sans"
            >
              {isSubmitting ? "Submitting Review..." : "Submit Review for Moderation"}
            </button>
          </form>
        ) : (
          /* Guest Prompt */
          <div className="text-center py-6 bg-brand-beige/30 rounded-lg border border-dashed border-brand-gold/30 space-y-4">
            <p className="font-sans text-sm text-brand-olive">
              Sign in to share your thoughts on this formulation.
            </p>
            <div>
              <Link
                href={`/login?redirectTo=/product/${productSlug}#reviews`}
                className="inline-block px-6 py-2.5 bg-brand-forest hover:bg-brand-olive text-brand-ivory text-xs font-semibold uppercase tracking-widest rounded-md transition-colors font-sans"
              >
                Sign In to Write a Review
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Approved Reviews List */}
      <div className="space-y-6">
        <h3 className="font-serif text-xl font-semibold text-brand-forest">
          Customer Feedback ({totalReviews})
        </h3>

        {totalReviews === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-brand-gold/15 p-8 space-y-2">
            <p className="font-serif text-lg text-brand-forest font-semibold">
              No reviews yet
            </p>
            <p className="font-sans text-sm text-brand-olive">
              Be the first to review this formulation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {summary.reviews.map((rev: CustomerReviewDTO) => (
              <div
                key={rev.id}
                className="bg-white rounded-xl p-6 border border-brand-gold/15 space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <StarRating rating={rev.rating} size="sm" />
                    <span className="font-sans text-xs font-semibold text-brand-forest">
                      {rev.authorName}
                    </span>
                  </div>
                  <span className="font-sans text-[11px] text-brand-olive/70">
                    {new Date(rev.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {rev.title && (
                  <h4 className="font-serif text-base font-semibold text-brand-forest">
                    {rev.title}
                  </h4>
                )}

                <p className="font-sans text-sm text-brand-olive leading-relaxed whitespace-pre-line">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
