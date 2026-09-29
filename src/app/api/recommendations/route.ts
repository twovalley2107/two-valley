import { NextRequest, NextResponse } from "next/server";
import { getRecommendations, getCrossCategoryPairing } from "@/lib/recommendations";
import { z } from "zod";

const querySchema = z.object({
  productId: z.string().min(1, "productId parameter is required."),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 4))
    .pipe(
      z.number().int("Limit must be an integer.").min(1, "Limit must be at least 1.").max(12, "Limit cannot exceed 12.")
    ),
  type: z.enum(["same-category", "cross-category"]).optional().default("same-category"),
});

/**
 * GET /api/recommendations (TV-13-002)
 *
 * Query Parameters:
 * - productId (required): Unique ID of source product
 * - limit (optional, default 4): Number of recommendations to return (1-12)
 * - type (optional, default "same-category"): "same-category" | "cross-category"
 *
 * Returns safe JSON array of RecommendationProductDTO items.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const rawLimit = searchParams.get("limit");
    const rawType = searchParams.get("type");

    // 1. Zod input validation
    const parsed = querySchema.safeParse({
      productId: productId ?? undefined,
      limit: rawLimit ?? undefined,
      type: rawType ?? undefined,
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Invalid query parameters.";
      return NextResponse.json(
        { success: false, error: firstIssue },
        { status: 400 }
      );
    }

    const { productId: validProductId, limit, type } = parsed.data;

    // 2. Cross-category pairing route
    if (type === "cross-category") {
      const pairingResult = await getCrossCategoryPairing(validProductId);
      if (!pairingResult.success) {
        if (pairingResult.error === "Target product not found.") {
          return NextResponse.json(
            { success: false, error: pairingResult.error },
            { status: 404 }
          );
        }
        return NextResponse.json(
          { success: false, error: pairingResult.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data: pairingResult.data ? [pairingResult.data] : [],
      });
    }

    // 3. Same-category recommendations route
    const result = await getRecommendations(validProductId, limit);
    if (!result.success) {
      if (result.error === "Target product not found.") {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data || [],
    });
  } catch (error) {
    console.error("Error handling /api/recommendations request:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
