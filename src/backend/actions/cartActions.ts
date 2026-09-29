"use server";

import { db } from "@/lib/db";
import { ActionResult } from "@/types";
import { z } from "zod";

const cartItemValidationSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().int().positive("Quantity must be greater than zero"),
});

const validateCartStockSchema = z.array(cartItemValidationSchema);

export interface CartStockItemValidation {
  productId: string;
  variantId: string;
  isValid: boolean;
  availableStock: number;
  requestedQuantity: number;
  message?: string;
}

export interface CartStockValidationResult {
  isValid: boolean;
  itemValidations: CartStockItemValidation[];
}

/**
 * Server Action: Validates all cart line items against current database stock quantities.
 * Serves as the stock availability gateway prior to checkout progression.
 */
export async function validateCartStock(
  items: { productId: string; variantId: string; quantity: number }[]
): Promise<ActionResult<CartStockValidationResult>> {
  if (!items || !Array.isArray(items)) {
    return { success: false, error: "Invalid cart items payload." };
  }

  const parseResult = validateCartStockSchema.safeParse(items);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues?.[0]?.message || "Invalid cart item parameters provided.",
    };
  }

  const validItems = parseResult.data;

  try {
    const itemValidations: CartStockItemValidation[] = [];
    let overallValid = true;

    for (const item of validItems) {
      // 1. Fetch product & variant from database
      const product = await db.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: {
            where: { id: item.variantId },
          },
        },
      });

      if (!product) {
        overallValid = false;
        itemValidations.push({
          productId: item.productId,
          variantId: item.variantId,
          isValid: false,
          availableStock: 0,
          requestedQuantity: item.quantity,
          message: "Product no longer exists in catalog.",
        });
        continue;
      }

      const variant = product.variants[0];
      if (!variant) {
        overallValid = false;
        itemValidations.push({
          productId: item.productId,
          variantId: item.variantId,
          isValid: false,
          availableStock: 0,
          requestedQuantity: item.quantity,
          message: `Specified size/variant not found for "${product.name}".`,
        });
        continue;
      }

      const availableStock = variant.stockQuantity;

      if (availableStock <= 0) {
        overallValid = false;
        itemValidations.push({
          productId: item.productId,
          variantId: item.variantId,
          isValid: false,
          availableStock: 0,
          requestedQuantity: item.quantity,
          message: `"${product.name} (${variant.volumeWeight})" is out of stock.`,
        });
      } else if (item.quantity > availableStock) {
        overallValid = false;
        itemValidations.push({
          productId: item.productId,
          variantId: item.variantId,
          isValid: false,
          availableStock,
          requestedQuantity: item.quantity,
          message: `Only ${availableStock} unit(s) of "${product.name} (${variant.volumeWeight})" available (requested ${item.quantity}).`,
        });
      } else {
        itemValidations.push({
          productId: item.productId,
          variantId: item.variantId,
          isValid: true,
          availableStock,
          requestedQuantity: item.quantity,
        });
      }
    }

    return {
      success: true,
      data: {
        isValid: overallValid,
        itemValidations,
      },
    };
  } catch (error) {
    console.error("Cart stock validation error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while validating cart stock.",
    };
  }
}
