import { db } from "@/lib/db";
import { ActionResult, ProductWithRelations, RecommendationProductDTO } from "@/types";

/**
 * Transforms a raw Prisma Product record into a safe, public RecommendationProductDTO.
 * Ensures zero exposure of internal security fields, payment metadata, or private details.
 */
export function toRecommendationDTO(
  product: ProductWithRelations,
  score?: number
): RecommendationProductDTO {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: Number(product.price).toFixed(2),
    salePrice: product.salePrice ? Number(product.salePrice).toFixed(2) : null,
    isFeatured: product.isFeatured,
    fragranceFamily: product.fragranceFamily,
    teaType: product.teaType,
    origin: product.origin,
    caffeineLevel: product.caffeineLevel,
    mood: product.mood,
    occasion: product.occasion,
    useCase: product.useCase,
    pairingTags: product.pairingTags,
    tags: product.tags,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })),
    sensoryAttributes: product.sensoryAttributes.map((sa) => ({
      id: sa.id,
      attributeType: sa.attributeType,
      name: sa.name,
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      volumeWeight: v.volumeWeight,
      priceOverride: v.priceOverride ? Number(v.priceOverride).toFixed(2) : null,
      sku: v.sku,
    })),
    similarityScore: score !== undefined ? Number(score.toFixed(3)) : undefined,
  };
}

/**
 * Computes Jaccard Similarity Index for two arrays of string attributes.
 * J(A,B) = |A ∩ B| / |A ∪ B|
 */
export function calculateJaccardIndex(notesA: string[], notesB: string[]): number {
  if (!notesA.length && !notesB.length) return 0;
  const setA = new Set(notesA.map((n) => n.trim().toLowerCase()));
  const setB = new Set(notesB.map((n) => n.trim().toLowerCase()));

  let intersectionCount = 0;
  setA.forEach((note) => {
    if (setB.has(note)) {
      intersectionCount++;
    }
  });

  const unionCount = new Set([...Array.from(setA), ...Array.from(setB)]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Computes price proximity score P(A,B) within ±25% price band.
 * P(A,B) = 1 - (|PriceA - PriceB| / max(PriceA, PriceB)) if within band, else 0.
 */
export function calculatePriceProximity(priceA: number, priceB: number): number {
  const maxPrice = Math.max(priceA, priceB);
  if (maxPrice <= 0) return 0;

  const diff = Math.abs(priceA - priceB);
  const bandLimit = 0.25 * maxPrice;

  if (diff <= bandLimit) {
    return 1 - diff / maxPrice;
  }
  return 0;
}

/**
 * Computes deterministic similarity score S(A,B) per ARCHITECTURE.md Section 9:
 * S(A,B) = 0.30*C + 0.35*N + 0.20*M + 0.10*P + 0.05*T
 */
export function calculateSimilarityScore(
  target: ProductWithRelations,
  candidate: ProductWithRelations
): number {
  // 1. Category Match C(A,B) - Weight 0.30
  const categoryMatch = target.categoryId === candidate.categoryId ? 1.0 : 0.0;

  // 2. Sensory Notes Match N(A,B) - Weight 0.35 (Jaccard Index)
  const notesTarget = target.sensoryAttributes.map((sa) => sa.name);
  const notesCandidate = candidate.sensoryAttributes.map((sa) => sa.name);
  const notesMatch = calculateJaccardIndex(notesTarget, notesCandidate);

  // 3. Mood & Occasion & UseCase Match M(A,B) - Weight 0.20
  const targetMoodAttrs = [target.mood, target.occasion, target.useCase]
    .filter(Boolean)
    .map((s) => s!.toLowerCase());

  const candidateMoodAttrs = [candidate.mood, candidate.occasion, candidate.useCase]
    .filter(Boolean)
    .map((s) => s!.toLowerCase());

  let moodMatch = 0;
  if (targetMoodAttrs.length > 0 && candidateMoodAttrs.length > 0) {
    let matches = 0;
    targetMoodAttrs.forEach((attr) => {
      if (candidateMoodAttrs.some((candAttr) => candAttr.includes(attr) || attr.includes(candAttr))) {
        matches++;
      }
    });
    moodMatch = matches / targetMoodAttrs.length;
  }

  // 4. Price Tier Proximity P(A,B) - Weight 0.10
  const priceTarget = Number(target.price);
  const priceCandidate = Number(candidate.price);
  const priceMatch = calculatePriceProximity(priceTarget, priceCandidate);

  // 5. Cross-Pairing & Taxonomy Tags T(A,B) - Weight 0.05
  const targetTagTokens = `${target.pairingTags || ""} ${target.tags || ""}`
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((t) => t.length > 2);

  const candidateTagTokens = `${candidate.pairingTags || ""} ${candidate.tags || ""} ${candidate.name}`
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((t) => t.length > 2);

  let tagMatch = 0;
  if (targetTagTokens.length > 0 && candidateTagTokens.length > 0) {
    const intersection = targetTagTokens.filter((token) => candidateTagTokens.includes(token));
    tagMatch = Math.min(1.0, intersection.length / Math.max(targetTagTokens.length, 1));
  }

  // Weighted total score
  const totalScore =
    0.30 * categoryMatch +
    0.35 * notesMatch +
    0.20 * moodMatch +
    0.10 * priceMatch +
    0.05 * tagMatch;

  return Number(totalScore.toFixed(4));
}

/**
 * Deterministic Sorting Helper:
 * 1. Similarity Score DESC
 * 2. isFeatured DESC
 * 3. createdAt DESC
 * 4. id ASC (Final tie-breaker for 100% reproducibility)
 */
function sortCandidatesDeterministically<T extends { similarityScore?: number; isFeatured: boolean; createdAt: Date; id: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const scoreA = a.similarityScore ?? 0;
    const scoreB = b.similarityScore ?? 0;
    if (scoreB !== scoreA) return scoreB - scoreA;

    if (a.isFeatured !== b.isFeatured) {
      return a.isFeatured ? -1 : 1;
    }

    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (timeB !== timeA) return timeB - timeA;

    return a.id.localeCompare(b.id);
  });
}

/**
 * Server Action / Core Utility: Get Same-Category Product Recommendations (TV-13-001).
 *
 * Requirements:
 * 1. Deterministic content-based similarity scoring (NO ML, NO AI).
 * 2. Excludes source product and out-of-stock items (`stockQuantity <= 0`).
 * 3. Primary candidates derived from same-category similarity.
 * 4. Deterministic fallback to same-category featured/recent items if similarity candidates < limit.
 * 5. Returns safe RecommendationProductDTO array.
 */
export async function getRecommendations(
  productId: string,
  limit: number = 4
): Promise<ActionResult<RecommendationProductDTO[]>> {
  if (!productId || typeof productId !== "string") {
    return { success: false, error: "Invalid product identifier provided." };
  }

  const safeLimit = Math.min(Math.max(1, limit), 12);

  try {
    // 1. Fetch Target Product
    const targetProduct = await db.product.findUnique({
      where: { id: productId.trim() },
      include: {
        category: true,
        variants: { orderBy: { sku: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
        sensoryAttributes: true,
      },
    });

    if (!targetProduct) {
      return { success: false, error: "Target product not found." };
    }

    // 2. Query Candidate Products (Same Category, In Stock, Published, Excluding Target)
    const candidates = await db.product.findMany({
      where: {
        id: { not: targetProduct.id },
        stockQuantity: { gt: 0 },
      },
      include: {
        category: true,
        variants: { orderBy: { sku: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
        sensoryAttributes: true,
      },
    });

    // Filter candidates by same category first
    const sameCategoryCandidates = candidates.filter(
      (c) => c.categoryId === targetProduct.categoryId
    );

    // Score same-category candidates
    const sortedCandidates = sortCandidatesDeterministically(
      sameCategoryCandidates.map((c) => ({
        ...c,
        similarityScore: calculateSimilarityScore(targetProduct, c),
      }))
    );

    // Candidates exceeding minimum similarity threshold (> 0.0)
    const highMatchCandidates = sortedCandidates.filter(
      (c) => (c.similarityScore ?? 0) > 0.0
    );

    let selectedProducts = highMatchCandidates.slice(0, safeLimit);

    // Fallback Rule: If fewer candidates than limit, supplement with same-category fallback items
    if (selectedProducts.length < safeLimit) {
      const selectedIds = new Set(selectedProducts.map((p) => p.id));

      const sameCategoryFallback = sortedCandidates.filter(
        (c) => !selectedIds.has(c.id)
      );

      for (const fallbackItem of sameCategoryFallback) {
        if (selectedProducts.length >= safeLimit) break;
        selectedProducts.push(fallbackItem);
        selectedIds.add(fallbackItem.id);
      }

      // If still fewer than limit, supplement with cross-category featured items
      if (selectedProducts.length < safeLimit) {
        const crossCategoryFallback = sortCandidatesDeterministically(
          candidates
            .filter((c) => !selectedIds.has(c.id))
            .map((c) => ({ ...c, similarityScore: 0 }))
        );

        for (const fallbackItem of crossCategoryFallback) {
          if (selectedProducts.length >= safeLimit) break;
          selectedProducts.push(fallbackItem);
          selectedIds.add(fallbackItem.id);
        }
      }
    }

    // Convert to safe public DTOs
    const safeDTOs = selectedProducts.map((p) =>
      toRecommendationDTO(p, p.similarityScore)
    );

    return {
      success: true,
      data: safeDTOs,
    };
  } catch (error) {
    console.error(`Error computing recommendations for product '${productId}':`, error);
    return {
      success: false,
      error: "Failed to generate product recommendations.",
    };
  }
}

/**
 * Server Action / Utility: Get Cross-Category Product Pairing ("Pairs Well With") (TV-13-004).
 *
 * Requirements:
 * 1. Recommends complementary product from opposite category (Perfume <-> Tea).
 * 2. Deterministic match based on pairingTags, mood, occasion, price.
 * 3. CRITICAL: If NO valid cross-category match exists, returns null!
 *    Does NOT return an unrelated fallback product.
 */
export async function getCrossCategoryPairing(
  productId: string
): Promise<ActionResult<RecommendationProductDTO | null>> {
  if (!productId || typeof productId !== "string") {
    return { success: false, error: "Invalid product identifier provided." };
  }

  try {
    const targetProduct = await db.product.findUnique({
      where: { id: productId.trim() },
      include: {
        category: true,
        variants: { orderBy: { sku: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
        sensoryAttributes: true,
      },
    });

    if (!targetProduct) {
      return { success: false, error: "Target product not found." };
    }

    // Fetch candidate products from OPPOSITE category only
    const oppositeCategoryCandidates = await db.product.findMany({
      where: {
        categoryId: { not: targetProduct.categoryId },
        stockQuantity: { gt: 0 },
      },
      include: {
        category: true,
        variants: { orderBy: { sku: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
        sensoryAttributes: true,
      },
    });

    if (oppositeCategoryCandidates.length === 0) {
      return { success: true, data: null };
    }

    // Target tokens from name, category, pairingTags, mood, occasion
    const targetTokens = [
      targetProduct.name,
      targetProduct.category.name,
      targetProduct.pairingTags || "",
      targetProduct.tags || "",
      targetProduct.mood || "",
      targetProduct.occasion || "",
    ]
      .join(" ")
      .toLowerCase()
      .split(/[\s,]+/)
      .filter((t) => t.length > 2);

    // Score each opposite-category candidate
    const scoredPairings = oppositeCategoryCandidates.map((candidate) => {
      const candidateTokens = [
        candidate.name,
        candidate.category.name,
        candidate.pairingTags || "",
        candidate.tags || "",
        candidate.fragranceFamily || "",
        candidate.teaType || "",
        candidate.origin || "",
        candidate.mood || "",
      ]
        .join(" ")
        .toLowerCase()
        .split(/[\s,]+/)
        .filter((t) => t.length > 2);

      // Explicit pairing tag / token overlap
      let tokenOverlap = 0;
      targetTokens.forEach((token) => {
        if (candidateTokens.includes(token)) {
          tokenOverlap++;
        }
      });

      // Mood / occasion overlap
      const moodOverlap =
        targetProduct.mood && candidate.mood &&
        (targetProduct.mood.toLowerCase().includes(candidate.mood.toLowerCase()) ||
          candidate.mood.toLowerCase().includes(targetProduct.mood.toLowerCase()))
          ? 1.0
          : 0.0;

      // Price proximity
      const priceProximity = calculatePriceProximity(
        Number(targetProduct.price),
        Number(candidate.price)
      );

      const crossCategoryScore =
        0.50 * (tokenOverlap > 0 ? Math.min(1.0, tokenOverlap / 2) : 0) +
        0.30 * moodOverlap +
        0.20 * priceProximity;

      return {
        ...candidate,
        similarityScore: Number(crossCategoryScore.toFixed(4)),
        tokenOverlap,
        moodOverlap,
      };
    });

    // Sort deterministically
    const sortedPairings = sortCandidatesDeterministically(scoredPairings);

    const topPairing = sortedPairings[0];

    // CRITICAL (Correction 3): Only return pairing if a valid match exists!
    // Must have a positive score AND at least token or mood overlap or meaningful price match
    if (!topPairing || (topPairing.similarityScore ?? 0) <= 0.0 || (topPairing.tokenOverlap === 0 && topPairing.moodOverlap === 0)) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: toRecommendationDTO(topPairing, topPairing.similarityScore),
    };
  } catch (error) {
    console.error(`Error computing cross-category pairing for product '${productId}':`, error);
    return {
      success: false,
      error: "Failed to generate cross-category product pairing.",
    };
  }
}
