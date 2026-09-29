import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  addressLine1: z.string().min(3, "Address line 1 must be at least 3 characters."),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State/Province is required."),
  postalCode: z.string().min(3, "Postal code is required."),
  country: z.string().min(2, "Country is required."),
  phone: z.string().min(7, "Valid phone number is required."),
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required."),
  variantId: z.string().min(1, "Variant ID is required."),
  quantity: z.number().int().positive("Quantity must be greater than zero."),
});

export const initializeCheckoutSchema = z.object({
  contactEmail: z.string().email("Valid contact email is required."),
  shippingAddress: shippingAddressSchema,
  items: z.array(checkoutItemSchema).min(1, "Cart cannot be empty for checkout."),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type InitializeCheckoutInput = z.infer<typeof initializeCheckoutSchema>;
