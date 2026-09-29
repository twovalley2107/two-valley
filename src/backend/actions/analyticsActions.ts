"use server";

import { db } from "@/lib/db";
import { assertAdminSession } from "@/lib/auth/assertAdminSession";
import { ActionResult } from "@/types";
import { PaymentStatus, OrderStatus, Prisma } from "@prisma/client";

export type DateRangePreset = "7d" | "30d" | "90d" | "all";

/**
 * Calculates exact Asia/Kolkata (IST, UTC+05:30) calendar-day midnight boundary.
 * Prevents rolling duration errors (Date.now() - N days).
 */
function getISTMidnightBound(preset: DateRangePreset): Date | undefined {
  if (preset === "all") return undefined;
  const daysAgo = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const nowUTC = Date.now();
  const nowIST = new Date(nowUTC + IST_OFFSET_MS);

  // Midnight of IST date minus requested days
  const targetIST = new Date(
    Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate() - daysAgo)
  );

  // Convert IST midnight back to UTC instant for Prisma queries
  return new Date(targetIST.getTime() - IST_OFFSET_MS);
}

// ─────────────────────────────────────────────────────────────────────────────
// TV-17-001: SALES ANALYTICS TYPES & ACTION
// ─────────────────────────────────────────────────────────────────────────────

export interface TopSellingSKU {
  productId: string;
  productName: string;
  variantName: string | null;
  sku: string;
  quantitySold: number;
  totalRevenue: string;
}

export interface FulfillmentStatusCount {
  status: OrderStatus;
  count: number;
}

export interface SalesAnalyticsData {
  netRealizedRevenue: string;
  grossPaidRevenue: string;
  paidActiveOrderCount: number;
  averageOrderValue: string;
  topSellingSKUs: TopSellingSKU[];
  statusBreakdown: FulfillmentStatusCount[];
}

export async function getSalesAnalytics(
  preset: DateRangePreset = "30d"
): Promise<ActionResult<SalesAnalyticsData>> {
  // Layer 3 Defense-in-Depth Admin Authorization Guard
  await assertAdminSession();

  try {
    const startDate = getISTMidnightBound(preset);
    const dateFilter: Prisma.OrderWhereInput = startDate
      ? { createdAt: { gte: startDate } }
      : {};

    const [
      netRevenueAgg,
      grossRevenueAgg,
      paidActiveOrderCount,
      orderItems,
      statusGroup,
    ] = await Promise.all([
      // Net Realized Revenue: paymentStatus = PAID AND status != CANCELLED
      db.order.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: PaymentStatus.PAID,
          status: { not: OrderStatus.CANCELLED },
          ...dateFilter,
        },
      }),

      // Gross Paid Revenue: paymentStatus = PAID
      db.order.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: PaymentStatus.PAID,
          ...dateFilter,
        },
      }),

      // Paid Active Orders Count (matching Net Revenue filters)
      db.order.count({
        where: {
          paymentStatus: PaymentStatus.PAID,
          status: { not: OrderStatus.CANCELLED },
          ...dateFilter,
        },
      }),

      // Top Selling SKUs: OrderItem joined with paid active orders
      db.orderItem.findMany({
        where: {
          order: {
            paymentStatus: PaymentStatus.PAID,
            status: { not: OrderStatus.CANCELLED },
            ...dateFilter,
          },
        },
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
      }),

      // Fulfillment Status Breakdown
      db.order.groupBy({
        by: ["status"],
        _count: { id: true },
        where: dateFilter,
      }),
    ]);

    // Net Revenue & AOV calculations
    const netAmount = netRevenueAgg._sum.total
      ? Number(netRevenueAgg._sum.total)
      : 0;
    const grossAmount = grossRevenueAgg._sum.total
      ? Number(grossRevenueAgg._sum.total)
      : 0;

    const aovNumber =
      paidActiveOrderCount > 0 ? netAmount / paidActiveOrderCount : 0;

    // Aggregate Top SKUs in memory safely
    const skuMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        variantName: string | null;
        sku: string;
        quantitySold: number;
        revenueNumber: number;
      }
    >();

    for (const item of orderItems) {
      const key = `${item.productId}_${item.variantName || "default"}`;
      const existing = skuMap.get(key);
      const itemRev = Number(item.totalPrice);

      if (existing) {
        existing.quantitySold += item.quantity;
        existing.revenueNumber += itemRev;
      } else {
        skuMap.set(key, {
          productId: item.productId,
          productName: item.product.name,
          variantName: item.variantName,
          sku: item.product.sku,
          quantitySold: item.quantity,
          revenueNumber: itemRev,
        });
      }
    }

    const topSellingSKUs: TopSellingSKU[] = Array.from(skuMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10)
      .map((item) => ({
        productId: item.productId,
        productName: item.productName,
        variantName: item.variantName,
        sku: item.sku,
        quantitySold: item.quantitySold,
        totalRevenue: `$${item.revenueNumber.toFixed(2)}`,
      }));

    const statusBreakdown: FulfillmentStatusCount[] = statusGroup.map((g) => ({
      status: g.status,
      count: g._count.id,
    }));

    return {
      success: true,
      data: {
        netRealizedRevenue: `$${netAmount.toFixed(2)}`,
        grossPaidRevenue: `$${grossAmount.toFixed(2)}`,
        paidActiveOrderCount,
        averageOrderValue: `$${aovNumber.toFixed(2)}`,
        topSellingSKUs,
        statusBreakdown,
      },
    };
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    return { success: false, error: "Failed to load sales analytics." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TV-17-002: BEHAVIOURAL TELEMETRY TYPES & ACTION
// ─────────────────────────────────────────────────────────────────────────────

export interface EventCountFunnelStage {
  stageNumber: number;
  stageName: string;
  eventType: string;
  count: number;
  conversionFromPreviousPercent: string;
  overallConversionPercent: string;
}

export interface TopViewedProduct {
  productId: string;
  productName: string;
  slug: string;
  viewCount: number;
}

export interface SearchQueryMetric {
  normalizedQuery: string;
  searchVolume: number;
  avgResultCount: number;
  zeroResultCount: number;
}

export interface WishlistActivityMetric {
  productId: string;
  productName: string;
  addCount: number;
}

export interface BehavioralAnalyticsData {
  isSampled: boolean;
  totalEventsProcessed: number;
  funnel: EventCountFunnelStage[];
  topViewedProducts: TopViewedProduct[];
  topSearchQueries: SearchQueryMetric[];
  topWishlistItems: WishlistActivityMetric[];
}

/**
 * Normalizes raw search queries deterministically prior to aggregation:
 * trim -> lowercase -> collapse repeated internal whitespace.
 */
function normalizeSearchQuery(rawQuery: string): string {
  return rawQuery.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function getBehavioralAnalytics(
  preset: DateRangePreset = "30d"
): Promise<ActionResult<BehavioralAnalyticsData>> {
  // Layer 3 Defense-in-Depth Admin Authorization Guard
  await assertAdminSession();

  try {
    const startDate = getISTMidnightBound(preset);
    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {};

    // Paginated/chunked retrieval of 5,000 records up to 50,000 max cap
    const CHUNK_SIZE = 5000;
    const MAX_CAP = 50000;
    let allLogs: Array<{ id: string; eventType: string; metadata: string | null }> = [];
    let isSampled = false;

    for (let offset = 0; offset < MAX_CAP; offset += CHUNK_SIZE) {
      const chunk = await db.eventLog.findMany({
        where: dateFilter,
        select: { id: true, eventType: true, metadata: true },
        skip: offset,
        take: CHUNK_SIZE,
        orderBy: { createdAt: "desc" },
      });

      allLogs = allLogs.concat(chunk);

      if (chunk.length < CHUNK_SIZE) {
        break; // Fetched all records in range
      }

      if (allLogs.length >= MAX_CAP) {
        isSampled = true;
        break; // Exceeded 50,000 sampling threshold cap
      }
    }

    // 1. Calculate Event-Count Funnel Stages
    const eventCounts: Record<string, number> = {
      product_view: 0,
      cart_add: 0,
      checkout_start: 0,
      purchase_completed: 0,
    };

    // Product view & wishlist aggregations
    const productViewCounts = new Map<string, { slug: string; count: number }>();
    const searchQueryMap = new Map<
      string,
      { totalVolume: number; totalResultsSum: number; zeroResultCount: number }
    >();
    const wishlistCounts = new Map<string, number>();

    for (const log of allLogs) {
      if (log.eventType in eventCounts) {
        eventCounts[log.eventType]++;
      }

      if (!log.metadata) continue;

      try {
        const meta = JSON.parse(log.metadata);

        if (log.eventType === "product_view" && meta.productId) {
          const existing = productViewCounts.get(meta.productId);
          if (existing) {
            existing.count++;
          } else {
            productViewCounts.set(meta.productId, {
              slug: meta.slug || "",
              count: 1,
            });
          }
        } else if (log.eventType === "search_query" && meta.query) {
          const norm = normalizeSearchQuery(meta.query);
          const resultCount = typeof meta.resultCount === "number" ? meta.resultCount : 0;
          const existing = searchQueryMap.get(norm);

          if (existing) {
            existing.totalVolume++;
            existing.totalResultsSum += resultCount;
            if (resultCount === 0) existing.zeroResultCount++;
          } else {
            searchQueryMap.set(norm, {
              totalVolume: 1,
              totalResultsSum: resultCount,
              zeroResultCount: resultCount === 0 ? 1 : 0,
            });
          }
        } else if (log.eventType === "wishlist_add" && meta.productId) {
          const current = wishlistCounts.get(meta.productId) || 0;
          wishlistCounts.set(meta.productId, current + 1);
        }
      } catch {
        // Skip malformed JSON metadata gracefully
      }
    }

    // Build Event-Count Funnel with zero denominator protection
    const s1 = eventCounts.product_view;
    const s2 = eventCounts.cart_add;
    const s3 = eventCounts.checkout_start;
    const s4 = eventCounts.purchase_completed;

    const calcPercent = (numerator: number, denominator: number): string => {
      if (denominator <= 0) return "0.0%";
      return `${((numerator / denominator) * 100).toFixed(1)}%`;
    };

    const funnel: EventCountFunnelStage[] = [
      {
        stageNumber: 1,
        stageName: "Product Views",
        eventType: "product_view",
        count: s1,
        conversionFromPreviousPercent: "100.0%",
        overallConversionPercent: "100.0%",
      },
      {
        stageNumber: 2,
        stageName: "Cart Adds",
        eventType: "cart_add",
        count: s2,
        conversionFromPreviousPercent: calcPercent(s2, s1),
        overallConversionPercent: calcPercent(s2, s1),
      },
      {
        stageNumber: 3,
        stageName: "Checkout Starts",
        eventType: "checkout_start",
        count: s3,
        conversionFromPreviousPercent: calcPercent(s3, s2),
        overallConversionPercent: calcPercent(s3, s1),
      },
      {
        stageNumber: 4,
        stageName: "Purchases Completed",
        eventType: "purchase_completed",
        count: s4,
        conversionFromPreviousPercent: calcPercent(s4, s3),
        overallConversionPercent: calcPercent(s4, s1),
      },
    ];

    // Fetch product names for Top Viewed & Wishlist items
    const productIdsToFetch = Array.from(
      new Set([...productViewCounts.keys(), ...wishlistCounts.keys()])
    );

    const products = await db.product.findMany({
      where: { id: { in: productIdsToFetch } },
      select: { id: true, name: true, slug: true },
    });

    const productNameMap = new Map(products.map((p) => [p.id, p.name]));

    // Top 10 Most-Viewed Products
    const topViewedProducts: TopViewedProduct[] = Array.from(productViewCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([productId, val]) => ({
        productId,
        productName: productNameMap.get(productId) || val.slug || "Unknown Formulation",
        slug: val.slug,
        viewCount: val.count,
      }));

    // Top 10 Search Queries with Zero-Result Count
    const topSearchQueries: SearchQueryMetric[] = Array.from(searchQueryMap.entries())
      .sort((a, b) => b[1].totalVolume - a[1].totalVolume)
      .slice(0, 10)
      .map(([normQuery, data]) => ({
        normalizedQuery: normQuery,
        searchVolume: data.totalVolume,
        avgResultCount: Number((data.totalResultsSum / data.totalVolume).toFixed(1)),
        zeroResultCount: data.zeroResultCount,
      }));

    // Top Wishlist Items
    const topWishlistItems: WishlistActivityMetric[] = Array.from(wishlistCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([productId, count]) => ({
        productId,
        productName: productNameMap.get(productId) || "Unknown Product",
        addCount: count,
      }));

    return {
      success: true,
      data: {
        isSampled,
        totalEventsProcessed: allLogs.length,
        funnel,
        topViewedProducts,
        topSearchQueries,
        topWishlistItems,
      },
    };
  } catch (error) {
    console.error("Error fetching behavioral analytics:", error);
    return { success: false, error: "Failed to load behavioral analytics." };
  }
}
