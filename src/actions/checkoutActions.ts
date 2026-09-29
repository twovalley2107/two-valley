"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { ActionResult } from "@/types";
import { cookies } from "next/headers";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { initializeCheckoutSchema, InitializeCheckoutInput } from "@/lib/validation/checkout";
import { mockPaymentAdapter } from "@/lib/payments/mockAdapter";
import { PaymentInitResult } from "@/lib/payments/types";

const FREE_SHIPPING_THRESHOLD_CENTS = 20000; // $200.00
const STANDARD_SHIPPING_FEE_CENTS = 1500; // $15.00

export type CheckoutSessionResult = PaymentInitResult & {
  orderNumber: string;
};

/**
 * Server Action: Validates cart line items against authoritative DB stock & pricing,
 * creates a PENDING / UNPAID Order in database, and initializes a payment session.
 */
export async function initializeCheckout(
  formData: InitializeCheckoutInput
): Promise<ActionResult<CheckoutSessionResult>> {
  // 1. Zod Validation
  const parseResult = initializeCheckoutSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues?.[0]?.message || "Invalid checkout payload.",
    };
  }

  const { contactEmail, shippingAddress, items } = parseResult.data;

  try {
    let profileId: string | null = null;
    let sessionId: string | null = null;

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) profileId = user.id;
    } catch {
      // Outside Next.js request context (e.g. standalone test script)
    }

    try {
      const cookieStore = await cookies();
      sessionId = cookieStore.get("session_id")?.value || null;
    } catch {
      // Outside Next.js request context
    }

    // Default guest session for testing if outside request context
    if (!profileId && !sessionId) {
      sessionId = "guest_checkout_session";
    }

    // 3. Authoritative DB Revalidation & Integer-Cents Price Calculation
    let subtotalCents = 0;
    const validatedOrderItems: {
      productId: string;
      variantName: string;
      quantity: number;
      unitPriceCents: number;
      totalPriceCents: number;
    }[] = [];

    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: {
            where: { id: item.variantId },
          },
        },
      });

      if (!product) {
        return { success: false, error: "One or more products no longer exist in catalog." };
      }

      const variant = product.variants[0];
      if (!variant) {
        return { success: false, error: `Selected size/variant not found for product "${product.name}".` };
      }

      if (variant.stockQuantity <= 0) {
        return { success: false, error: `"${product.name} (${variant.volumeWeight})" is out of stock.` };
      }

      if (item.quantity > variant.stockQuantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Only ${variant.stockQuantity} unit(s) available.`,
        };
      }

      // Calculate unit price from DB authoritative price override or product price
      const effectivePriceDecimal = variant.priceOverride ?? product.price;
      const unitPriceCents = Math.round(Number(effectivePriceDecimal) * 100);
      const lineTotalCents = unitPriceCents * item.quantity;

      subtotalCents += lineTotalCents;

      validatedOrderItems.push({
        productId: product.id,
        variantName: variant.volumeWeight,
        quantity: item.quantity,
        unitPriceCents,
        totalPriceCents: lineTotalCents,
      });
    }

    // Calculate shipping fee & total using integer cents
    const shippingFeeCents = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_FEE_CENTS;
    const taxCents = 0;
    const totalCents = subtotalCents + shippingFeeCents + taxCents;

    // 4. Generate Unique Order Number
    const orderNumber = `TV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 5. Create Order & OrderItems in Database
    const order = await db.order.create({
      data: {
        orderNumber,
        profileId,
        sessionId: profileId ? null : sessionId,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
        paymentProvider: mockPaymentAdapter.providerName,
        subtotal: new Prisma.Decimal((subtotalCents / 100).toFixed(2)),
        tax: new Prisma.Decimal((taxCents / 100).toFixed(2)),
        shippingFee: new Prisma.Decimal((shippingFeeCents / 100).toFixed(2)),
        total: new Prisma.Decimal((totalCents / 100).toFixed(2)),
        shippingAddress: shippingAddress as unknown as Prisma.InputJsonValue,
        contactEmail,
        contactPhone: shippingAddress.phone || null,
        items: {
          create: validatedOrderItems.map((oi) => ({
            productId: oi.productId,
            variantName: oi.variantName,
            quantity: oi.quantity,
            unitPrice: new Prisma.Decimal((oi.unitPriceCents / 100).toFixed(2)),
            totalPrice: new Prisma.Decimal((oi.totalPriceCents / 100).toFixed(2)),
          })),
        },
      },
    });

    // 6. Invoke PaymentAdapter Session Creation (Passing amountInCents)
    const paymentInitResult = await mockPaymentAdapter.createPaymentSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountInCents: totalCents,
      currency: "USD",
      customerEmail: contactEmail,
      returnUrl: `/checkout/confirmation?orderNumber=${encodeURIComponent(order.orderNumber)}`,
    });

    return {
      success: true,
      data: {
        ...paymentInitResult,
        orderNumber: order.orderNumber,
      },
    };
  } catch (error) {
    console.error("Checkout initialization error:", error);
    return {
      success: false,
      error: "An error occurred while creating your order. Please try again.",
    };
  }
}

/**
 * Server Action: Fetches order summary by orderNumber with ownership verification.
 */
export async function getOrderConfirmation(orderNumber: string): Promise<ActionResult<{
  orderNumber: string;
  createdAt: string;
  contactEmail: string;
  shippingAddress: any;
  status: string;
  paymentStatus: string;
  subtotal: string;
  shippingFee: string;
  tax: string;
  total: string;
  items: {
    id: string;
    productName: string;
    variantName: string | null;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    image: string;
  }[];
}>> {
  if (!orderNumber || typeof orderNumber !== "string") {
    return { success: false, error: "Invalid order number." };
  }

  try {
    let profileId: string | null = null;
    let sessionId: string | null = null;

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) profileId = user.id;
    } catch {
      // Outside request context
    }

    try {
      const cookieStore = await cookies();
      sessionId = cookieStore.get("session_id")?.value || null;
    } catch {
      // Outside request context
    }

    const order = await db.order.findUnique({
      where: { orderNumber },
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
      return { success: false, error: "Order not found." };
    }

    // Ownership Verification
    const isOwner =
      (profileId && order.profileId === profileId) ||
      (sessionId && order.sessionId === sessionId);

    if (!isOwner) {
      return { success: false, error: "Unauthorized access to order details." };
    }

    const itemsFormatted = order.items.map((item) => ({
      id: item.id,
      productName: item.product.name,
      variantName: item.variantName,
      quantity: item.quantity,
      unitPrice: `$${Number(item.unitPrice).toFixed(2)}`,
      totalPrice: `$${Number(item.totalPrice).toFixed(2)}`,
      image: item.product.images[0]?.url || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800",
    }));

    return {
      success: true,
      data: {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        contactEmail: order.contactEmail,
        shippingAddress: order.shippingAddress,
        status: order.status,
        paymentStatus: order.paymentStatus,
        subtotal: `$${Number(order.subtotal).toFixed(2)}`,
        shippingFee: `$${Number(order.shippingFee).toFixed(2)}`,
        tax: `$${Number(order.tax).toFixed(2)}`,
        total: `$${Number(order.total).toFixed(2)}`,
        items: itemsFormatted,
      },
    };
  } catch (error) {
    console.error("Error fetching order confirmation:", error);
    return { success: false, error: "Failed to load order confirmation details." };
  }
}
