import { z } from "zod";

export const sensoryAttributeInputSchema = z.object({
  attributeType: z.enum(["TOP_NOTE", "HEART_NOTE", "BASE_NOTE", "FLAVOUR_NOTE"]),
  name: z.string().trim().min(1, "Attribute name cannot be empty."),
});

export const productVariantInputSchema = z.object({
  volumeWeight: z.string().trim().min(1, "Volume/Weight label is required."),
  priceOverride: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Price override must be a valid monetary decimal string.",
    }),
  stockQuantity: z
    .number()
    .int("Stock must be a whole integer.")
    .min(0, "Stock quantity cannot be negative."),
  sku: z.string().trim().toUpperCase().min(2, "Variant SKU is required."),
});

export const productImageInputSchema = z.object({
  url: z.string().trim().url("Must be a valid URL."),
  altText: z.string().trim().optional().nullable(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters.").max(100),
  slug: z
    .string()
    .trim()
    .lowercase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens.")
    .optional()
    .or(z.literal("")),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .or(z.literal("")),
  description: z.string().trim().min(10, "Description must be at least 10 characters."),
  price: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid monetary string (e.g. 150.00)."),
  salePrice: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Sale price must be a valid monetary string (e.g. 120.00).",
    }),
  stockQuantity: z
    .number()
    .int("Stock must be a whole integer.")
    .min(0, "Stock quantity cannot be negative."),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().min(1, "Category is required."),
  fragranceFamily: z.string().trim().optional().nullable(),
  teaType: z.string().trim().optional().nullable(),
  origin: z.string().trim().optional().nullable(),
  caffeineLevel: z.string().trim().optional().nullable(),
  steepingGuide: z.string().trim().optional().nullable(),
  mood: z.string().trim().optional().nullable(),
  occasion: z.string().trim().optional().nullable(),
  useCase: z.string().trim().optional().nullable(),
  pairingTags: z.string().trim().optional().nullable(),
  tags: z.string().trim().optional().nullable(),
  sensoryAttributes: z.array(sensoryAttributeInputSchema).optional(),
  variants: z.array(productVariantInputSchema).optional(),
  images: z.array(productImageInputSchema).optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().min(1, "Product ID is required for updates."),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type SensoryAttributeInput = z.infer<typeof sensoryAttributeInputSchema>;
export type ProductVariantInput = z.infer<typeof productVariantInputSchema>;
export type ProductImageInput = z.infer<typeof productImageInputSchema>;
