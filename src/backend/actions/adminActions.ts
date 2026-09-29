"use server";

import { db } from "@/lib/db";
import { assertAdminSession } from "@/lib/auth/assertAdminSession";
import { ActionResult } from "@/types";
import { PaymentStatus, OrderStatus, Role, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  createProductSchema,
  updateProductSchema,
} from "@/lib/validation/adminProduct";
import {
  updateOrderStatusSchema,
  updateInventoryStockSchema,
} from "@/lib/validation/adminOrder";

/**
 * Returns the start of the current calendar day in Asia/Kolkata (IST, UTC+05:30).
 */
function getISTStartOfToday(): Date {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const nowUTC = Date.now();
  const nowIST = new Date(nowUTC + IST_OFFSET_MS);
  const midnightIST = new Date(
    Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate())
  );
  return new Date(midnightIST.getTime() - IST_OFFSET_MS);
}

/**
 * Aggregate KPI metrics for the admin dashboard.
 */
export interface AdminDashboardKPIs {
  todayOrderCount: number;
  pendingOrderCount: number;
  totalRevenuePaid: string;
  todayRevenuePaid: string;
  lowStockProductCount: number;
  outOfStockProductCount: number;
  pendingReviewCount: number;
  totalCustomerCount: number;
}

export async function getAdminDashboardKPIs(): Promise<ActionResult<AdminDashboardKPIs>> {
  await assertAdminSession();

  try {
    const istToday = getISTStartOfToday();

    const [
      todayOrderCount,
      totalRevenue,
      todayRevenue,
      pendingOrderCount,
      lowStockCount,
      outOfStockCount,
      pendingReviewCount,
      customerCount,
    ] = await Promise.all([
      db.order.count({ where: { createdAt: { gte: istToday } } }),
      db.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: PaymentStatus.PAID },
      }),
      db.order.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: PaymentStatus.PAID,
          createdAt: { gte: istToday },
        },
      }),
      db.order.count({ where: { status: OrderStatus.PENDING } }),
      db.product.count({ where: { stockQuantity: { lte: 15 } } }),
      db.product.count({ where: { stockQuantity: { equals: 0 } } }),
      db.review.count({ where: { isApproved: false } }),
      db.profile.count({ where: { role: Role.CUSTOMER } }),
    ]);

    const formatRevenue = (decimal: { toNumber?: () => number } | null): string => {
      const amount =
        decimal && typeof decimal.toNumber === "function"
          ? decimal.toNumber()
          : Number(decimal ?? 0);
      return `$${amount.toFixed(2)}`;
    };

    return {
      success: true,
      data: {
        todayOrderCount,
        pendingOrderCount,
        totalRevenuePaid: formatRevenue(totalRevenue._sum.total),
        todayRevenuePaid: formatRevenue(todayRevenue._sum.total),
        lowStockProductCount: lowStockCount,
        outOfStockProductCount: outOfStockCount,
        pendingReviewCount,
        totalCustomerCount: customerCount,
      },
    };
  } catch (error) {
    console.error("Error fetching admin dashboard KPIs:", error);
    return { success: false, error: "Failed to load dashboard metrics." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TV-16-001 & TV-16-002: PRODUCT MANAGEMENT ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryName: string;
  price: string;
  salePrice: string | null;
  stockQuantity: number;
  isFeatured: boolean;
  image: string;
  updatedAt: string;
}

export async function getAdminProducts(params?: {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}): Promise<ActionResult<{ products: AdminProductListItem[]; total: number; pages: number }>> {
  await assertAdminSession();

  try {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 15;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (params?.search && params.search.trim().length > 0) {
      const query = params.search.trim();
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
      ];
    }

    if (params?.categoryId && params.categoryId.trim().length > 0) {
      where.categoryId = params.categoryId.trim();
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          category: { select: { name: true } },
          images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        },
      }),
      db.product.count({ where }),
    ]);

    const formatted: AdminProductListItem[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      categoryName: p.category.name,
      price: `$${Number(p.price).toFixed(2)}`,
      salePrice: p.salePrice ? `$${Number(p.salePrice).toFixed(2)}` : null,
      stockQuantity: p.stockQuantity,
      isFeatured: p.isFeatured,
      image: p.images[0]?.url || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800",
      updatedAt: p.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: {
        products: formatted,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching admin product list:", error);
    return { success: false, error: "Failed to load admin products." };
  }
}

export async function getAdminProductDetail(id: string): Promise<ActionResult<any>> {
  await assertAdminSession();

  if (!id) return { success: false, error: "Product ID is required." };

  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        sensoryAttributes: true,
        variants: { orderBy: { sku: "asc" } },
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      },
    });

    if (!product) return { success: false, error: "Product not found." };

    return {
      success: true,
      data: {
        ...product,
        price: Number(product.price).toFixed(2),
        salePrice: product.salePrice ? Number(product.salePrice).toFixed(2) : null,
        variants: product.variants.map((v) => ({
          ...v,
          priceOverride: v.priceOverride ? Number(v.priceOverride).toFixed(2) : null,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching admin product detail:", error);
    return { success: false, error: "Failed to load product detail." };
  }
}

export async function createProduct(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  await assertAdminSession();

  const parseResult = createProductSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Invalid product data.",
    };
  }

  const data = parseResult.data;

  // Auto-generate slug if omitted
  const slug = data.slug && data.slug.length > 0
    ? data.slug
    : data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

  // Auto-generate SKU if omitted
  const sku = data.sku && data.sku.length > 0
    ? data.sku
    : `TV-${data.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase() || "PROD"}-${Math.floor(100 + Math.random() * 900)}`;

  try {
    // Uniqueness checks
    const [existingSlug, existingSku] = await Promise.all([
      db.product.findUnique({ where: { slug } }),
      db.product.findUnique({ where: { sku } }),
    ]);

    if (existingSlug) return { success: false, error: "A product with this slug already exists." };
    if (existingSku) return { success: false, error: "A product with this SKU already exists." };

    const product = await db.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: data.name,
          slug,
          sku,
          description: data.description,
          price: new Prisma.Decimal(data.price),
          salePrice: data.salePrice ? new Prisma.Decimal(data.salePrice) : null,
          stockQuantity: data.stockQuantity,
          isFeatured: data.isFeatured ?? false,
          categoryId: data.categoryId,
          fragranceFamily: data.fragranceFamily || null,
          teaType: data.teaType || null,
          origin: data.origin || null,
          caffeineLevel: data.caffeineLevel || null,
          steepingGuide: data.steepingGuide || null,
          mood: data.mood || null,
          occasion: data.occasion || null,
          useCase: data.useCase || null,
          pairingTags: data.pairingTags || null,
          tags: data.tags || null,
        },
      });

      if (data.sensoryAttributes && data.sensoryAttributes.length > 0) {
        await tx.sensoryAttribute.createMany({
          data: data.sensoryAttributes.map((attr) => ({
            productId: created.id,
            attributeType: attr.attributeType,
            name: attr.name,
          })),
        });
      }

      if (data.variants && data.variants.length > 0) {
        await tx.productVariant.createMany({
          data: data.variants.map((v) => ({
            productId: created.id,
            volumeWeight: v.volumeWeight,
            sku: v.sku,
            stockQuantity: v.stockQuantity,
            priceOverride: v.priceOverride ? new Prisma.Decimal(v.priceOverride) : null,
          })),
        });
      }

      if (data.images && data.images.length > 0) {
        await tx.productImage.createMany({
          data: data.images.map((img) => ({
            productId: created.id,
            url: img.url,
            altText: img.altText || null,
            isPrimary: img.isPrimary ?? false,
            sortOrder: img.sortOrder ?? 0,
          })),
        });
      }

      return created;
    });

    revalidatePath("/products");
    revalidatePath(`/product/${product.slug}`);
    revalidatePath("/admin/products");

    return { success: true, data: { id: product.id, slug: product.slug } };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Failed to create product." };
  }
}

export async function updateProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  await assertAdminSession();

  const parseResult = updateProductSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Invalid update data.",
    };
  }

  const { id, ...data } = parseResult.data;

  try {
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Product not found." };

    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.slug ? { slug: data.slug } : {}),
          ...(data.sku ? { sku: data.sku } : {}),
          ...(data.description ? { description: data.description } : {}),
          ...(data.price ? { price: new Prisma.Decimal(data.price) } : {}),
          ...(data.salePrice !== undefined
            ? { salePrice: data.salePrice ? new Prisma.Decimal(data.salePrice) : null }
            : {}),
          ...(data.stockQuantity !== undefined ? { stockQuantity: data.stockQuantity } : {}),
          ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
          ...(data.categoryId ? { categoryId: data.categoryId } : {}),
          ...(data.fragranceFamily !== undefined ? { fragranceFamily: data.fragranceFamily } : {}),
          ...(data.teaType !== undefined ? { teaType: data.teaType } : {}),
          ...(data.origin !== undefined ? { origin: data.origin } : {}),
          ...(data.caffeineLevel !== undefined ? { caffeineLevel: data.caffeineLevel } : {}),
          ...(data.steepingGuide !== undefined ? { steepingGuide: data.steepingGuide } : {}),
          ...(data.mood !== undefined ? { mood: data.mood } : {}),
          ...(data.occasion !== undefined ? { occasion: data.occasion } : {}),
          ...(data.useCase !== undefined ? { useCase: data.useCase } : {}),
          ...(data.pairingTags !== undefined ? { pairingTags: data.pairingTags } : {}),
          ...(data.tags !== undefined ? { tags: data.tags } : {}),
        },
      });

      if (data.sensoryAttributes) {
        await tx.sensoryAttribute.deleteMany({ where: { productId: id } });
        if (data.sensoryAttributes.length > 0) {
          await tx.sensoryAttribute.createMany({
            data: data.sensoryAttributes.map((attr) => ({
              productId: id,
              attributeType: attr.attributeType,
              name: attr.name,
            })),
          });
        }
      }

      if (data.variants) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        if (data.variants.length > 0) {
          await tx.productVariant.createMany({
            data: data.variants.map((v) => ({
              productId: id,
              volumeWeight: v.volumeWeight,
              sku: v.sku,
              stockQuantity: v.stockQuantity,
              priceOverride: v.priceOverride ? new Prisma.Decimal(v.priceOverride) : null,
            })),
          });
        }
      }

      if (data.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (data.images.length > 0) {
          await tx.productImage.createMany({
            data: data.images.map((img) => ({
              productId: id,
              url: img.url,
              altText: img.altText || null,
              isPrimary: img.isPrimary ?? false,
              sortOrder: img.sortOrder ?? 0,
            })),
          });
        }
      }
    });

    revalidatePath("/products");
    revalidatePath(`/product/${existing.slug}`);
    revalidatePath("/admin/products");

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product." };
  }
}

export async function deleteProduct(productId: string): Promise<ActionResult<{ id: string }>> {
  await assertAdminSession();

  if (!productId) return { success: false, error: "Product ID is required." };

  try {
    // Financial history preservation check: block deletion if product is in OrderItem
    const orderItemCount = await db.orderItem.count({ where: { productId } });

    if (orderItemCount > 0) {
      return {
        success: false,
        error: "Cannot delete product with existing customer order history.",
      };
    }

    const deleted = await db.product.delete({
      where: { id: productId },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");

    return { success: true, data: { id: deleted.id } };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TV-16-003: INVENTORY MANAGEMENT ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  type: "product" | "variant";
  productId: string;
  productName: string;
  variantLabel: string | null;
  sku: string;
  categoryName: string;
  stockQuantity: number;
}

export async function getAdminInventory(params?: {
  search?: string;
  stockFilter?: "all" | "low" | "out";
}): Promise<ActionResult<InventoryItem[]>> {
  await assertAdminSession();

  try {
    const products = await db.product.findMany({
      include: {
        category: { select: { name: true } },
        variants: true,
      },
      orderBy: { name: "asc" },
    });

    const items: InventoryItem[] = [];

    for (const p of products) {
      // If product has variants, include variant stock items
      if (p.variants.length > 0) {
        for (const v of p.variants) {
          items.push({
            id: v.id,
            type: "variant",
            productId: p.id,
            productName: p.name,
            variantLabel: v.volumeWeight,
            sku: v.sku,
            categoryName: p.category.name,
            stockQuantity: v.stockQuantity,
          });
        }
      } else {
        // Base product stock item
        items.push({
          id: p.id,
          type: "product",
          productId: p.id,
          productName: p.name,
          variantLabel: "Standard",
          sku: p.sku,
          categoryName: p.category.name,
          stockQuantity: p.stockQuantity,
        });
      }
    }

    // Apply filtering
    let filtered = items;

    if (params?.search && params.search.trim().length > 0) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (i) => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)
      );
    }

    if (params?.stockFilter === "low") {
      filtered = filtered.filter((i) => i.stockQuantity > 0 && i.stockQuantity <= 15);
    } else if (params?.stockFilter === "out") {
      filtered = filtered.filter((i) => i.stockQuantity === 0);
    }

    return { success: true, data: filtered };
  } catch (error) {
    console.error("Error fetching admin inventory:", error);
    return { success: false, error: "Failed to load inventory data." };
  }
}

export async function updateInventoryStock(input: unknown): Promise<ActionResult<{ updatedCount: number }>> {
  await assertAdminSession();

  const parseResult = updateInventoryStockSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Invalid inventory payload.",
    };
  }

  const { updates } = parseResult.data;

  try {
    let updatedCount = 0;

    await db.$transaction(async (tx) => {
      for (const item of updates) {
        if (item.type === "product") {
          await tx.product.update({
            where: { id: item.id },
            data: { stockQuantity: item.stockQuantity },
          });
          updatedCount++;
        } else if (item.type === "variant") {
          await tx.productVariant.update({
            where: { id: item.id },
            data: { stockQuantity: item.stockQuantity },
          });
          updatedCount++;
        }
      }
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { success: true, data: { updatedCount } };
  } catch (error) {
    console.error("Error updating inventory stock:", error);
    return { success: false, error: "Failed to update inventory stock." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TV-16-004: ORDER MANAGEMENT ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerEmail: string;
  customerName: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: string;
  itemCount: number;
}

export async function getAdminOrders(params?: {
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ActionResult<{ orders: AdminOrderListItem[]; total: number; pages: number }>> {
  await assertAdminSession();

  try {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 15;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.search && params.search.trim().length > 0) {
      const q = params.search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { contactEmail: { contains: q, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          profile: { select: { name: true } },
          items: { select: { quantity: true } },
        },
      }),
      db.order.count({ where }),
    ]);

    const formatted: AdminOrderListItem[] = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt.toISOString(),
      customerEmail: o.contactEmail,
      customerName: o.profile?.name || null,
      status: o.status,
      paymentStatus: o.paymentStatus,
      total: `$${Number(o.total).toFixed(2)}`,
      itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
    }));

    return {
      success: true,
      data: {
        orders: formatted,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return { success: false, error: "Failed to load orders." };
  }
}

export async function getAdminOrderDetail(orderId: string): Promise<ActionResult<any>> {
  await assertAdminSession();

  if (!orderId) return { success: false, error: "Order ID is required." };

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        profile: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    });

    if (!order) return { success: false, error: "Order not found." };

    const shippingAddressObj =
      typeof order.shippingAddress === "string"
        ? JSON.parse(order.shippingAddress)
        : (order.shippingAddress as any) || {};

    return {
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentProvider: order.paymentProvider,
        paymentTxnId: order.paymentTxnId,
        subtotal: `$${Number(order.subtotal).toFixed(2)}`,
        shippingFee: `$${Number(order.shippingFee).toFixed(2)}`,
        tax: `$${Number(order.tax).toFixed(2)}`,
        total: `$${Number(order.total).toFixed(2)}`,
        contactEmail: order.contactEmail,
        contactPhone: order.contactPhone,
        shippingAddress: shippingAddressObj,
        trackingNumber: shippingAddressObj.trackingNumber || null,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          variantName: item.variantName,
          quantity: item.quantity,
          unitPrice: `$${Number(item.unitPrice).toFixed(2)}`,
          totalPrice: `$${Number(item.totalPrice).toFixed(2)}`,
          image:
            item.product.images.find((img) => img.isPrimary)?.url ||
            item.product.images[0]?.url ||
            "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800",
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching order detail:", error);
    return { success: false, error: "Failed to load order detail." };
  }
}

export async function updateOrderStatus(input: unknown): Promise<ActionResult<{ id: string; status: OrderStatus }>> {
  await assertAdminSession();

  const parseResult = updateOrderStatusSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Invalid order status payload.",
    };
  }

  const { orderId, status, trackingNumber } = parseResult.data;

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return { success: false, error: "Order not found." };

    // State machine transition validation
    const current = order.status;
    if (current === OrderStatus.DELIVERED || current === OrderStatus.CANCELLED) {
      return {
        success: false,
        error: `Cannot update order status from terminal state ${current}.`,
      };
    }

    if (status === OrderStatus.DELIVERED && current !== OrderStatus.SHIPPED) {
      return {
        success: false,
        error: "Order must be in SHIPPED status before transitioning to DELIVERED.",
      };
    }

    // Persist tracking number into shippingAddress JSON column without overwriting existing address fields
    const currentShipping =
      typeof order.shippingAddress === "string"
        ? JSON.parse(order.shippingAddress)
        : (order.shippingAddress as any) || {};

    const updatedShipping = {
      ...currentShipping,
      ...(trackingNumber !== undefined ? { trackingNumber: trackingNumber || undefined } : {}),
    };

    // Execute status transition
    await db.$transaction(async (tx) => {
      // CRITICAL INVENTORY RULE: IF AND ONLY IF order.paymentStatus === PAID and transitioning to CANCELLED,
      // restore BOTH ProductVariant.stockQuantity and Product.stockQuantity by item.quantity!
      if (status === OrderStatus.CANCELLED && order.paymentStatus === PaymentStatus.PAID) {
        for (const item of order.items) {
          // Increment Product.stockQuantity
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });

          // Increment matching ProductVariant.stockQuantity
          const variants = await tx.productVariant.findMany({
            where: {
              productId: item.productId,
              ...(item.variantName ? { volumeWeight: item.variantName } : {}),
            },
          });

          if (variants[0]) {
            await tx.productVariant.update({
              where: { id: variants[0].id },
              data: { stockQuantity: { increment: item.quantity } },
            });
          }
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          shippingAddress: updatedShipping,
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, data: { id: orderId, status } };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Failed to update order status." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TV-16-005: REVIEW MODERATION ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminReviewListItem {
  id: string;
  productId: string;
  productName: string;
  reviewerName: string;
  rating: number;
  title: string | null;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export async function getAdminReviews(
  statusFilter: "pending" | "approved" | "all" = "pending"
): Promise<ActionResult<AdminReviewListItem[]>> {
  await assertAdminSession();

  try {
    const where: Prisma.ReviewWhereInput = {};
    if (statusFilter === "pending") where.isApproved = false;
    if (statusFilter === "approved") where.isApproved = true;

    const reviews = await db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        profile: { select: { name: true, email: true } },
      },
    });

    const formatted: AdminReviewListItem[] = reviews.map((r) => ({
      id: r.id,
      productId: r.product.id,
      productName: r.product.name,
      reviewerName: r.profile?.name || r.profile?.email || "Anonymous",
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isApproved: r.isApproved,
      createdAt: r.createdAt.toISOString(),
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    return { success: false, error: "Failed to load review moderation queue." };
  }
}

export async function approveReview(reviewId: string): Promise<ActionResult<{ id: string }>> {
  await assertAdminSession();

  if (!reviewId) return { success: false, error: "Review ID is required." };

  try {
    const review = await db.review.update({
      where: { id: reviewId },
      data: { isApproved: true },
      include: { product: { select: { slug: true } } },
    });

    revalidatePath("/admin/reviews");
    if (review.product?.slug) {
      revalidatePath(`/product/${review.product.slug}`);
    }

    return { success: true, data: { id: reviewId } };
  } catch (error) {
    console.error("Error approving review:", error);
    return { success: false, error: "Failed to approve review." };
  }
}

export async function rejectReview(reviewId: string): Promise<ActionResult<{ id: string }>> {
  await assertAdminSession();

  if (!reviewId) return { success: false, error: "Review ID is required." };

  try {
    const deleted = await db.review.delete({
      where: { id: reviewId },
    });

    revalidatePath("/admin/reviews");

    return { success: true, data: { id: deleted.id } };
  } catch (error) {
    console.error("Error rejecting review:", error);
    return { success: false, error: "Failed to reject review." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TV-16-006: CUSTOMER MANAGEMENT ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminCustomerListItem {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
  orderCount: number;
  totalSpentPaid: string;
}

export async function getAdminCustomers(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ActionResult<{ customers: AdminCustomerListItem[]; total: number; pages: number }>> {
  await assertAdminSession();

  try {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 15;
    const skip = (page - 1) * limit;

    const where: Prisma.ProfileWhereInput = {};

    if (params?.search && params.search.trim().length > 0) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    const [profiles, total] = await Promise.all([
      db.profile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          orders: {
            where: { paymentStatus: PaymentStatus.PAID },
            select: { total: true },
          },
        },
      }),
      db.profile.count({ where }),
    ]);

    const formatted: AdminCustomerListItem[] = profiles.map((p) => {
      const totalSpent = p.orders.reduce((sum, o) => sum + Number(o.total), 0);
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role,
        createdAt: p.createdAt.toISOString(),
        orderCount: p.orders.length,
        totalSpentPaid: `$${totalSpent.toFixed(2)}`,
      };
    });

    return {
      success: true,
      data: {
        customers: formatted,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching admin customers:", error);
    return { success: false, error: "Failed to load customer directory." };
  }
}

export async function getAdminCustomerDetail(profileId: string): Promise<ActionResult<any>> {
  await assertAdminSession();

  if (!profileId) return { success: false, error: "Customer Profile ID is required." };

  try {
    const profile = await db.profile.findUnique({
      where: { id: profileId },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            orderNumber: true,
            createdAt: true,
            status: true,
            paymentStatus: true,
            total: true,
          },
        },
        reviews: {
          select: { id: true, rating: true, isApproved: true, createdAt: true },
        },
      },
    });

    if (!profile) return { success: false, error: "Customer profile not found." };

    const totalSpentPaid = profile.orders
      .filter((o) => o.paymentStatus === PaymentStatus.PAID)
      .reduce((sum, o) => sum + Number(o.total), 0);

    return {
      success: true,
      data: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
        orderCount: profile.orders.length,
        totalSpentPaid: `$${totalSpentPaid.toFixed(2)}`,
        reviewCount: profile.reviews.length,
        recentOrders: profile.orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          createdAt: o.createdAt.toISOString(),
          status: o.status,
          paymentStatus: o.paymentStatus,
          total: `$${Number(o.total).toFixed(2)}`,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching customer detail:", error);
    return { success: false, error: "Failed to load customer profile." };
  }
}
