"use server";

import { db } from "@/lib/db";
import { ProductWithRelations, ClientProduct, ProductFilterParams, ActionResult } from "@/types";
import { serializeProductsForClient } from "@/lib/serializers/productSerializer";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const defaultProductIncludes = {
  category: true,
  variants: {
    orderBy: { sku: "asc" as const },
  },
  images: {
    orderBy: { sortOrder: "asc" as const },
  },
  sensoryAttributes: true,
};

const filterParamsSchema = z.object({
  categorySlug: z.string().optional(),
  fragranceFamily: z.string().optional(),
  teaType: z.string().optional(),
  origin: z.string().optional(),
  mood: z.string().optional(),
  occasion: z.string().optional(),
  caffeineLevel: z.string().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  searchQuery: z.string().optional(),
  includeOutOfStock: z.boolean().optional(),
  sortBy: z.enum(["newest", "price-asc", "price-desc", "name-asc", "featured"]).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});

/**
 * Retrieves all products from the catalog with optional out-of-stock filtering.
 */
export async function getAllProducts(options?: {
  includeOutOfStock?: boolean;
}): Promise<ActionResult<ProductWithRelations[]>> {
  try {
    const where: Prisma.ProductWhereInput = {};
    if (!options?.includeOutOfStock) {
      where.stockQuantity = { gt: 0 };
    }

    const products = await db.product.findMany({
      where,
      include: defaultProductIncludes,
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error("Error fetching all products:", error);
    return {
      success: false,
      error: "Failed to fetch catalog products.",
    };
  }
}

/**
 * Retrieves a single product by its unique slug.
 */
export async function getProductBySlug(
  slug: string
): Promise<ActionResult<ProductWithRelations | null>> {
  if (!slug || typeof slug !== "string") {
    return {
      success: false,
      error: "Invalid product slug provided.",
    };
  }

  try {
    const product = await db.product.findUnique({
      where: { slug: slug.trim() },
      include: defaultProductIncludes,
    });

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error(`Error fetching product slug '${slug}':`, error);
    return {
      success: false,
      error: "Failed to fetch product details.",
    };
  }
}

/**
 * Retrieves all products belonging to a specific category slug.
 */
export async function getProductsByCategory(
  categorySlug: string,
  options?: { includeOutOfStock?: boolean }
): Promise<ActionResult<ProductWithRelations[]>> {
  if (!categorySlug || typeof categorySlug !== "string") {
    return {
      success: false,
      error: "Invalid category slug provided.",
    };
  }

  try {
    const where: Prisma.ProductWhereInput = {
      category: { slug: categorySlug.trim() },
    };

    if (!options?.includeOutOfStock) {
      where.stockQuantity = { gt: 0 };
    }

    const products = await db.product.findMany({
      where,
      include: defaultProductIncludes,
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error(`Error fetching category '${categorySlug}':`, error);
    return {
      success: false,
      error: "Failed to fetch category products.",
    };
  }
}

/**
 * Searches products by query string matching name, description, tags, notes, or mood/occasion.
 */
export async function searchProducts(
  query: string,
  options?: { includeOutOfStock?: boolean }
): Promise<ActionResult<ClientProduct[]>> {
  const trimmed = query?.trim() || "";
  if (!trimmed) {
    return {
      success: true,
      data: [],
    };
  }

  try {
    const where: Prisma.ProductWhereInput = {
      OR: [
        { name: { contains: trimmed, mode: "insensitive" } },
        { description: { contains: trimmed, mode: "insensitive" } },
        { fragranceFamily: { contains: trimmed, mode: "insensitive" } },
        { teaType: { contains: trimmed, mode: "insensitive" } },
        { origin: { contains: trimmed, mode: "insensitive" } },
        { mood: { contains: trimmed, mode: "insensitive" } },
        { occasion: { contains: trimmed, mode: "insensitive" } },
        { tags: { contains: trimmed, mode: "insensitive" } },
        {
          sensoryAttributes: {
            some: {
              name: { contains: trimmed, mode: "insensitive" },
            },
          },
        },
      ],
    };

    if (!options?.includeOutOfStock) {
      where.stockQuantity = { gt: 0 };
    }

    const products = await db.product.findMany({
      where,
      include: defaultProductIncludes,
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: serializeProductsForClient(products),
    };
  } catch (error) {
    console.error(`Error searching products for '${query}':`, error);
    return {
      success: false,
      error: "Failed to perform product search.",
    };
  }
}

/**
 * Retrieves filtered products with flexible criteria and sorting.
 */
export async function getFilteredProducts(
  rawFilters: ProductFilterParams
): Promise<ActionResult<{ products: ProductWithRelations[]; totalCount: number; page: number; totalPages: number }>> {
  const parseResult = filterParamsSchema.safeParse(rawFilters);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues?.[0]?.message || "Invalid filter parameters.",
    };
  }

  const filters = parseResult.data;
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.ProductWhereInput = {};

    if (!filters.includeOutOfStock) {
      where.stockQuantity = { gt: 0 };
    }

    if (filters.categorySlug) {
      where.category = { slug: filters.categorySlug.trim() };
    }

    if (filters.fragranceFamily) {
      where.fragranceFamily = { equals: filters.fragranceFamily.trim(), mode: "insensitive" };
    }

    if (filters.teaType) {
      where.teaType = { equals: filters.teaType.trim(), mode: "insensitive" };
    }

    if (filters.origin) {
      where.origin = { equals: filters.origin.trim(), mode: "insensitive" };
    }

    if (filters.mood) {
      where.mood = { contains: filters.mood.trim(), mode: "insensitive" };
    }

    if (filters.occasion) {
      where.occasion = { contains: filters.occasion.trim(), mode: "insensitive" };
    }

    if (filters.caffeineLevel) {
      where.caffeineLevel = { equals: filters.caffeineLevel.trim(), mode: "insensitive" };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(filters.maxPrice);
      }
    }

    if (filters.searchQuery?.trim()) {
      const query = filters.searchQuery.trim();
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { tags: { contains: query, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };

    if (filters.sortBy === "price-asc") {
      orderBy = { price: "asc" };
    } else if (filters.sortBy === "price-desc") {
      orderBy = { price: "desc" };
    } else if (filters.sortBy === "name-asc") {
      orderBy = { name: "asc" };
    } else if (filters.sortBy === "featured") {
      orderBy = { isFeatured: "desc" };
    }

    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        include: defaultProductIncludes,
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return {
      success: true,
      data: {
        products,
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error("Error executing getFilteredProducts:", error);
    return {
      success: false,
      error: "Failed to retrieve filtered catalog products.",
    };
  }
}
