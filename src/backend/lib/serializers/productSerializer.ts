import { ProductWithRelations, ClientProduct } from "@/types";

/**
 * Converts any Decimal, number, or string money value to a clean string representation.
 * Preserves monetary precision without float corruption.
 */
export function serializeMoney(value: unknown): string {
  if (value === null || value === undefined) return "0.00";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toFixed(2);
  if (typeof value === "object" && value !== null) {
    if ("toFixed" in value && typeof (value as any).toFixed === "function") {
      return (value as any).toFixed(2);
    }
    if ("toString" in value && typeof (value as any).toString === "function") {
      return (value as any).toString();
    }
  }
  return String(value);
}

export function serializeNullableMoney(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return serializeMoney(value);
}

/**
 * Serializes a Prisma ProductWithRelations into a plain, RSC-safe ClientProduct DTO.
 * Converts all Decimal money fields (price, salePrice, variant priceOverride) to strings.
 * Ensures zero Prisma Decimal objects remain in the props passed to Client Components.
 */
export function serializeProductForClient(product: ProductWithRelations): ClientProduct {
  return {
    ...product,
    price: serializeMoney(product.price),
    salePrice: serializeNullableMoney(product.salePrice),
    createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
    updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    variants: (product.variants || []).map((v) => ({
      ...v,
      priceOverride: serializeNullableMoney(v.priceOverride),
    })),
    images: (product.images || []).map((img) => ({
      ...img,
    })),
    sensoryAttributes: (product.sensoryAttributes || []).map((sa) => ({
      ...sa,
    })),
    category: {
      ...product.category,
    },
  };
}

/**
 * Serializes an array of ProductWithRelations into ClientProduct DTOs.
 */
export function serializeProductsForClient(products: ProductWithRelations[]): ClientProduct[] {
  return products.map(serializeProductForClient);
}
