import { z } from "zod";

export const telemetryEventEnum = z.enum([
  "product_view",
  "search_query",
  "wishlist_add",
  "wishlist_remove",
  "cart_add",
  "cart_remove",
  "checkout_start",
  "purchase_completed",
]);

export type TelemetryEventType = z.infer<typeof telemetryEventEnum>;

const productViewSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  categoryId: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
});

const searchQuerySchema = z.object({
  query: z.string().min(1).max(200),
  resultCount: z.number().int().nonnegative(),
});

const wishlistAddSchema = z.object({
  productId: z.string().min(1),
});

const wishlistRemoveSchema = z.object({
  productId: z.string().min(1),
});

const cartAddSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().positive(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

const cartRemoveSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().positive(),
});

const checkoutStartSchema = z.object({
  itemCount: z.number().int().nonnegative(),
  subtotal: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

const purchaseCompletedSchema = z.object({
  orderId: z.string().min(1),
  orderNumber: z.string().min(1),
  total: z.string().regex(/^\d+(\.\d{1,2})?$/),
  itemCount: z.number().int().nonnegative(),
});

export const telemetryPayloadSchema = z.discriminatedUnion("eventType", [
  z.object({ eventType: z.literal("product_view"), metadata: productViewSchema }),
  z.object({ eventType: z.literal("search_query"), metadata: searchQuerySchema }),
  z.object({ eventType: z.literal("wishlist_add"), metadata: wishlistAddSchema }),
  z.object({ eventType: z.literal("wishlist_remove"), metadata: wishlistRemoveSchema }),
  z.object({ eventType: z.literal("cart_add"), metadata: cartAddSchema }),
  z.object({ eventType: z.literal("cart_remove"), metadata: cartRemoveSchema }),
  z.object({ eventType: z.literal("checkout_start"), metadata: checkoutStartSchema }),
  z.object({ eventType: z.literal("purchase_completed"), metadata: purchaseCompletedSchema }),
]);
