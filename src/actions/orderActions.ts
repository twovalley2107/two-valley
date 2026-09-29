"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { ActionResult } from "@/types";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: string;
  itemCount: number;
  firstItemImage: string;
  firstItemName: string;
}

export interface CustomerOrderItem {
  id: string;
  productId: string;
  productName: string;
  variantName: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  image: string;
}

export interface CustomerOrderDetail {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: string;
  shippingFee: string;
  tax: string;
  total: string;
  contactEmail: string;
  contactPhone: string | null;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  items: CustomerOrderItem[];
}

/**
 * Server Action: Fetches all orders belonging to the authenticated Profile.
 * Enforces server-side authentication and profileId scoping.
 */
export async function getCustomerOrders(): Promise<ActionResult<CustomerOrderSummary[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required to view order history." };
    }

    // Resolve authenticated profile (Phase 3 identity mapping)
    const profile = await db.profile.findUnique({
      where: { id: user.id },
    });

    if (!profile) {
      return { success: false, error: "User profile not found." };
    }

    // Server-side ownership-scoped query
    const orders = await db.order.findMany({
      where: {
        profileId: profile.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    const safeOrders: CustomerOrderSummary[] = orders.map((order) => {
      const firstItem = order.items[0];
      const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
      const firstItemImage =
        firstItem?.product.images.find((img) => img.isPrimary)?.url ||
        firstItem?.product.images[0]?.url ||
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800";

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: `$${Number(order.total).toFixed(2)}`,
        itemCount,
        firstItemImage,
        firstItemName: firstItem ? `${firstItem.product.name}${firstItem.variantName ? ` (${firstItem.variantName})` : ""}` : "Formulation",
      };
    });

    return { success: true, data: safeOrders };
  } catch (error) {
    console.error("Error fetching customer order history:", error);
    return { success: false, error: "Failed to load order history." };
  }
}

/**
 * Server Action: Fetches specific order details for the authenticated Profile.
 * Strictly ownership-scoped (`orderNumber` AND `profileId = profile.id`) to prevent IDOR vulnerabilities.
 */
export async function getCustomerOrderDetail(
  orderNumber: string
): Promise<ActionResult<CustomerOrderDetail>> {
  if (!orderNumber || typeof orderNumber !== "string") {
    return { success: false, error: "Invalid order identifier." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required to view order details." };
    }

    const profile = await db.profile.findUnique({
      where: { id: user.id },
    });

    if (!profile) {
      return { success: false, error: "User profile not found." };
    }

    // Ownership-scoped query: orderNumber AND profileId MUST match in database query!
    const order = await db.order.findFirst({
      where: {
        orderNumber,
        profileId: profile.id,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      // Do NOT reveal whether order exists for another customer.
      return { success: false, error: "Order not found." };
    }

    // Deserialize structured shippingAddress JSON safely
    const shippingAddress = typeof order.shippingAddress === "string"
      ? JSON.parse(order.shippingAddress)
      : (order.shippingAddress as any) || {};

    const items: CustomerOrderItem[] = order.items.map((item) => ({
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
    }));

    return {
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        paymentStatus: order.paymentStatus,
        subtotal: `$${Number(order.subtotal).toFixed(2)}`,
        shippingFee: `$${Number(order.shippingFee).toFixed(2)}`,
        tax: `$${Number(order.tax).toFixed(2)}`,
        total: `$${Number(order.total).toFixed(2)}`,
        contactEmail: order.contactEmail,
        contactPhone: order.contactPhone,
        shippingAddress: {
          fullName: shippingAddress.fullName || "",
          addressLine1: shippingAddress.addressLine1 || "",
          addressLine2: shippingAddress.addressLine2 || "",
          city: shippingAddress.city || "",
          state: shippingAddress.state || "",
          postalCode: shippingAddress.postalCode || "",
          country: shippingAddress.country || "",
          phone: shippingAddress.phone || "",
        },
        items,
      },
    };
  } catch (error) {
    console.error("Error fetching order detail:", error);
    return { success: false, error: "Failed to load order detail." };
  }
}
