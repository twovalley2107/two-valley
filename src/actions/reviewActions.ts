"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { ActionResult } from "@/types";
import { z } from "zod";

/**
 * Public Customer DTO for approved reviews.
 * Strictly excludes private customer data, email, profileId, or security tokens.
 */
export interface CustomerReviewDTO {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: string;
  authorName: string;
}

/**
 * Summary of approved product reviews, including average rating and distribution.
 */
export interface ProductReviewSummary {
  reviews: CustomerReviewDTO[];
  totalCount: number;
  averageRating: number;
  ratingCounts: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

const submitReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required."),
  rating: z
    .number()
    .int("Rating must be a whole number.")
    .min(1, "Rating must be between 1 and 5 stars.")
    .max(5, "Rating must be between 1 and 5 stars."),
  title: z
    .string()
    .trim()
    .max(100, "Title cannot exceed 100 characters.")
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  comment: z
    .string()
    .trim()
    .min(3, "Review comment must be at least 3 characters.")
    .max(1000, "Review comment cannot exceed 1000 characters."),
});

/**
 * Server Action: Submit a customer product review (TV-12-001).
 *
 * Requirements:
 * 1. Requires authenticated Supabase session.
 * 2. Resolves Profile using server-side identity mapping.
 * 3. Validates inputs via Zod schema.
 * 4. Verifies product exists in database.
 * 5. Prevents duplicate review per profile and product (application-level protection).
 * 6. Always sets isApproved = false (pending admin moderation).
 */
export async function submitReview(
  input: unknown
): Promise<ActionResult<{ id: string; message: string }>> {
  // 1. Zod input validation first
  const parsed = submitReviewSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Invalid review input.";
    return { success: false, error: firstIssue };
  }

  const { productId, rating, title, comment } = parsed.data;

  // 2. Server-side Supabase authentication check
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch (_authErr) {
    // If request store or session is absent, user remains null
    user = null;
  }

  if (!user) {
    return {
      success: false,
      error: "Authentication required to submit a review. Please sign in.",
    };
  }

  try {
    // 3. Resolve authenticated Profile (Phase 3 identity mapping)
    const profile = await db.profile.findUnique({
      where: { id: user.id },
    });

    if (!profile) {
      return {
        success: false,
        error: "User profile not found.",
      };
    }

    // 4. Verify product existence to prevent orphan reviews
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return {
        success: false,
        error: "Referenced product does not exist.",
      };
    }

    // 5. Application-level duplicate review check
    const existingReview = await db.review.findFirst({
      where: {
        productId,
        profileId: profile.id,
      },
    });

    if (existingReview) {
      return {
        success: false,
        error: "You have already submitted a review for this product.",
      };
    }

    // 6. Create Review with isApproved = false (ALWAYS pending moderation!)
    const review = await db.review.create({
      data: {
        productId,
        profileId: profile.id,
        rating,
        title: title ?? null,
        comment,
        isApproved: false,
      },
    });

    return {
      success: true,
      data: {
        id: review.id,
        message: "Thank you! Your review has been submitted and is awaiting moderation.",
      },
    };
  } catch (error) {
    console.error("Error submitting product review:", error);
    return {
      success: false,
      error: "Failed to submit review. Please try again.",
    };
  }
}

/**
 * Server Action: Fetches approved reviews for a given product (TV-12-001).
 *
 * Requirements:
 * 1. Returns ONLY reviews where isApproved = true.
 * 2. Computes average rating (rounded to 1 decimal place) and star distribution.
 * 3. Returns safe Customer DTOs without exposing email or security fields.
 */
export async function getApprovedReviews(
  productId: string
): Promise<ActionResult<ProductReviewSummary>> {
  if (!productId || typeof productId !== "string") {
    return { success: false, error: "Invalid product identifier." };
  }

  try {
    // Query ONLY isApproved = true reviews
    const reviews = await db.review.findMany({
      where: {
        productId: productId.trim(),
        isApproved: true,
      },
      include: {
        profile: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalCount = reviews.length;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sumRatings = 0;

    const safeReviews: CustomerReviewDTO[] = reviews.map((r) => {
      sumRatings += r.rating;
      if (r.rating >= 1 && r.rating <= 5) {
        ratingCounts[r.rating as keyof typeof ratingCounts] =
          (ratingCounts[r.rating as keyof typeof ratingCounts] || 0) + 1;
      }

      return {
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        authorName: r.profile?.name?.trim() || "Verified Customer",
      };
    });

    const averageRating =
      totalCount > 0 ? Number((sumRatings / totalCount).toFixed(1)) : 0;

    return {
      success: true,
      data: {
        reviews: safeReviews,
        totalCount,
        averageRating,
        ratingCounts,
      },
    };
  } catch (error) {
    console.error(`Error fetching approved reviews for product '${productId}':`, error);
    return {
      success: false,
      error: "Failed to load product reviews.",
    };
  }
}
