import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockPaymentAdapter } from "@/lib/payments/mockAdapter";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get("x-signature") ||
      request.headers.get("x-mock-signature") ||
      "";

    // 1. Signature Verification
    const isValidSignature = await mockPaymentAdapter.verifyWebhookSignature(
      rawBody,
      signature
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    // 2. Parse Webhook Payload
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const payload = mockPaymentAdapter.parseWebhookPayload(parsedBody);

    if (!payload.orderId && !payload.orderNumber) {
      return NextResponse.json(
        { error: "Missing order identifier in webhook payload." },
        { status: 400 }
      );
    }

    // 3. Resolve Order from Database
    const order = await db.order.findFirst({
      where: {
        OR: [
          { id: payload.orderId },
          { orderNumber: payload.orderNumber },
        ],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found in database." },
        { status: 404 }
      );
    }

    // 4. Idempotency Check
    if (order.paymentStatus !== PaymentStatus.UNPAID) {
      return NextResponse.json(
        { message: "Webhook already processed for this order." },
        { status: 200 }
      );
    }

    if (payload.status === "FAILED") {
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.FAILED,
          status: OrderStatus.CANCELLED,
        },
      });
      return NextResponse.json(
        { message: "Order payment marked as FAILED." },
        { status: 200 }
      );
    }

    // 5. Atomic Stock Decrement & Payment Confirmation Transaction
    try {
      await db.$transaction(async (tx) => {
        for (const item of order.items) {
          // Find corresponding ProductVariant
          const variants = await tx.productVariant.findMany({
            where: {
              productId: item.productId,
              ...(item.variantName ? { volumeWeight: item.variantName } : {}),
            },
          });

          const variant = variants[0];
          if (!variant) {
            throw new Error(`INSUFFICIENT_STOCK_ROLLBACK:${item.productId}`);
          }

          // Atomic Conditional Decrement: stockQuantity >= item.quantity
          const updated = await tx.productVariant.updateMany({
            where: {
              id: variant.id,
              stockQuantity: { gte: item.quantity },
            },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });

          if (updated.count === 0) {
            // Stock insufficient - trigger clean multi-item transaction rollback!
            throw new Error(`INSUFFICIENT_STOCK_ROLLBACK:${item.productId}`);
          }

          // Also keep base product stock quantity updated
          await tx.product.updateMany({
            where: {
              id: item.productId,
              stockQuantity: { gte: item.quantity },
            },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });
        }

        // Update Order Status to PAID / PROCESSING
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            status: OrderStatus.PROCESSING,
            paymentTxnId: payload.transactionId,
          },
        });
      });

      return NextResponse.json(
        { success: true, orderNumber: order.orderNumber },
        { status: 200 }
      );
    } catch (txError: any) {
      if (
        txError?.message &&
        txError.message.startsWith("INSUFFICIENT_STOCK_ROLLBACK")
      ) {
        // Stock exhaustion post-payment handling:
        // Mark payment as PAID so customer funds are acknowledged, record event log alert
        await db.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            status: OrderStatus.PROCESSING,
            paymentTxnId: payload.transactionId,
          },
        });

        await db.eventLog.create({
          data: {
            sessionId: order.sessionId || "system_webhook",
            profileId: order.profileId,
            eventType: "inventory_exhausted_post_payment",
            metadata: JSON.stringify({
              orderId: order.id,
              orderNumber: order.orderNumber,
              error: txError.message,
            }),
          },
        });

        return NextResponse.json(
          {
            success: true,
            warning: "Payment confirmed; inventory exhaustion flagged for admin review.",
            orderNumber: order.orderNumber,
          },
          { status: 200 }
        );
      }

      throw txError;
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error processing payment webhook." },
      { status: 500 }
    );
  }
}
