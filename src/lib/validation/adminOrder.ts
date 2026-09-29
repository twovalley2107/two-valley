import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required."),
  status: z.nativeEnum(OrderStatus),
  trackingNumber: z.string().trim().max(100).optional().nullable(),
});

export const updateInventoryStockSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().min(1, "Item ID is required."),
      type: z.enum(["product", "variant"]),
      stockQuantity: z.number().int().min(0, "Stock quantity cannot be negative."),
    })
  ).min(1, "At least one inventory update is required."),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateInventoryStockInput = z.infer<typeof updateInventoryStockSchema>;
