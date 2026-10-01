import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { telemetryPayloadSchema } from "@/lib/validation/telemetry";
import { PaymentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Read Raw Body
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    // 2. Strict Zod Event-Specific Payload Validation
    const parseResult = telemetryPayloadSchema.safeParse(body);
    if (!parseResult.success) {
      const issueMessage =
        parseResult.error.issues?.[0]?.message || "Invalid telemetry event schema.";
      return NextResponse.json(
        { error: `Validation error: ${issueMessage}` },
        { status: 400 }
      );
    }

    const { eventType, metadata } = parseResult.data;

    // 3. Server-Authoritative Session & Identity Resolution
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const profileId = user ? user.id : null;

    // Guest Session ID from existing middleware cookie
    const sessionId = request.cookies.get("session_id")?.value;
    if (!sessionId && !profileId) {
      return NextResponse.json(
        { error: "Missing active session identifier." },
        { status: 400 }
      );
    }

    const effectiveSessionId = sessionId || `user-${profileId}`;

    // 4. Idempotency & Deduplication Logic
    if (eventType === "purchase_completed") {
      const { orderId, orderNumber } = metadata;

      // Authoritative Order Verification
      const order = await db.order.findFirst({
        where: {
          OR: [{ id: orderId }, { orderNumber }],
        },
      });

      if (!order || order.paymentStatus !== PaymentStatus.PAID) {
        return NextResponse.json(
          { error: "Order payment unconfirmed or invalid order ID." },
          { status: 400 }
        );
      }

      // Check for existing purchase_completed EventLog for this order
      const existingLogs = await db.eventLog.findMany({
        where: {
          eventType: "purchase_completed",
        },
        take: 50,
        orderBy: { createdAt: "desc" },
      });

      const isDuplicate = existingLogs.some((log) => {
        if (!log.metadata) return false;
        try {
          const parsed = JSON.parse(log.metadata);
          return parsed.orderId === orderId || parsed.orderNumber === orderNumber;
        } catch {
          return false;
        }
      });

      if (isDuplicate) {
        // Return 202 Accepted without writing duplicate record
        return NextResponse.json({ success: true, deduplicated: true }, { status: 202 });
      }
    }

    if (eventType === "checkout_start") {
      const recentCheckoutLogs = await db.eventLog.findMany({
        where: {
          eventType: "checkout_start",
          sessionId: effectiveSessionId,
          createdAt: {
            gte: new Date(Date.now() - 60 * 1000), // Within last 60 seconds
          },
        },
      });

      if (recentCheckoutLogs.length > 0) {
        return NextResponse.json({ success: true, deduplicated: true }, { status: 202 });
      }
    }

    if (eventType === "product_view") {
      const { productId } = metadata;
      const recentProductViewLogs = await db.eventLog.findMany({
        where: {
          eventType: "product_view",
          sessionId: effectiveSessionId,
          createdAt: {
            gte: new Date(Date.now() - 10 * 1000), // Within last 10 seconds
          },
        },
        take: 10,
      });

      const isDuplicate = recentProductViewLogs.some((log) => {
        if (!log.metadata) return false;
        try {
          const parsed = JSON.parse(log.metadata);
          return parsed.productId === productId;
        } catch {
          return false;
        }
      });

      if (isDuplicate) {
        return NextResponse.json({ success: true, deduplicated: true }, { status: 202 });
      }
    }

    // 5. Persist EventLog Record
    await db.eventLog.create({
      data: {
        sessionId: effectiveSessionId,
        profileId,
        eventType,
        metadata: JSON.stringify(metadata),
      },
    });

    return NextResponse.json({ success: true }, { status: 202 });
  } catch (error) {
    console.error("Telemetry API error:", error);
    return NextResponse.json(
      { error: "Internal server error processing telemetry event." },
      { status: 500 }
    );
  }
}
