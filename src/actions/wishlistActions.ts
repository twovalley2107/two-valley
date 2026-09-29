"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { ClientProduct, ActionResult } from "@/types";
import { serializeProductsForClient } from "@/lib/serializers/productSerializer";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

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

/**
 * Helper to identify active user session (authenticated profileId or guest sessionId).
 */
async function getActiveSessionContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { profileId: user.id, sessionId: null };
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value || null;

  return { profileId: null, sessionId };
}

/**
 * Adds a product to the user's wishlist (authenticated profile or guest session).
 */
export async function addToWishlist(productId: string): Promise<ActionResult<{ isWishlisted: boolean }>> {
  if (!productId || typeof productId !== "string") {
    return { success: false, error: "Invalid product identifier." };
  }

  try {
    // 1. Verify product exists in database
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: "Product not found." };
    }

    // 2. Identify active context
    const { profileId, sessionId } = await getActiveSessionContext();

    if (!profileId && !sessionId) {
      return { success: false, error: "No active session available." };
    }

    // 3. Enforce uniqueness & create/upsert
    if (profileId) {
      const existing = await db.wishlistItem.findUnique({
        where: {
          profileId_productId: {
            profileId,
            productId,
          },
        },
      });

      if (!existing) {
        await db.wishlistItem.create({
          data: {
            profileId,
            productId,
          },
        });
      }
    } else if (sessionId) {
      const existing = await db.wishlistItem.findUnique({
        where: {
          sessionId_productId: {
            sessionId,
            productId,
          },
        },
      });

      if (!existing) {
        await db.wishlistItem.create({
          data: {
            sessionId,
            productId,
          },
        });
      }
    }

    revalidatePath("/wishlist");
    revalidatePath(`/product/${product.slug}`);

    return { success: true, data: { isWishlisted: true } };
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return { success: false, error: "Failed to add item to wishlist." };
  }
}

/**
 * Removes a product from the user's wishlist.
 */
export async function removeFromWishlist(productId: string): Promise<ActionResult<{ isWishlisted: boolean }>> {
  if (!productId || typeof productId !== "string") {
    return { success: false, error: "Invalid product identifier." };
  }

  try {
    const { profileId, sessionId } = await getActiveSessionContext();

    if (profileId) {
      await db.wishlistItem.deleteMany({
        where: {
          profileId,
          productId,
        },
      });
    } else if (sessionId) {
      await db.wishlistItem.deleteMany({
        where: {
          sessionId,
          productId,
        },
      });
    }

    revalidatePath("/wishlist");

    return { success: true, data: { isWishlisted: false } };
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return { success: false, error: "Failed to remove item from wishlist." };
  }
}

/**
 * Checks if a specific product is currently wishlisted by the active user.
 */
export async function checkIsWishlisted(productId: string): Promise<ActionResult<{ isWishlisted: boolean }>> {
  if (!productId || typeof productId !== "string") {
    return { success: true, data: { isWishlisted: false } };
  }

  try {
    const { profileId, sessionId } = await getActiveSessionContext();

    if (profileId) {
      const item = await db.wishlistItem.findUnique({
        where: {
          profileId_productId: {
            profileId,
            productId,
          },
        },
      });
      return { success: true, data: { isWishlisted: Boolean(item) } };
    }

    if (sessionId) {
      const item = await db.wishlistItem.findUnique({
        where: {
          sessionId_productId: {
            sessionId,
            productId,
          },
        },
      });
      return { success: true, data: { isWishlisted: Boolean(item) } };
    }

    return { success: true, data: { isWishlisted: false } };
  } catch (error) {
    console.error("Error checking wishlist status:", error);
    return { success: true, data: { isWishlisted: false } };
  }
}

/**
 * Retrieves all wishlisted products for the active session with full relations.
 */
export async function getWishlist(): Promise<ActionResult<ClientProduct[]>> {
  try {
    const { profileId, sessionId } = await getActiveSessionContext();

    if (!profileId && !sessionId) {
      return { success: true, data: [] };
    }

    const where = profileId ? { profileId } : { sessionId: sessionId! };

    const items = await db.wishlistItem.findMany({
      where,
      include: {
        product: {
          include: defaultProductIncludes,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const products = items.map((item) => item.product);

    return { success: true, data: serializeProductsForClient(products) };
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return { success: false, error: "Failed to retrieve wishlist items." };
  }
}

/**
 * Retrieves the count of wishlisted items for active session badge display.
 */
export async function getWishlistCount(): Promise<ActionResult<number>> {
  try {
    const { profileId, sessionId } = await getActiveSessionContext();

    if (!profileId && !sessionId) {
      return { success: true, data: 0 };
    }

    const where = profileId ? { profileId } : { sessionId: sessionId! };
    const count = await db.wishlistItem.count({ where });

    return { success: true, data: count };
  } catch (error) {
    console.error("Error fetching wishlist count:", error);
    return { success: true, data: 0 };
  }
}
