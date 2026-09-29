import { Category, Product, ProductVariant, ProductImage, SensoryAttribute } from "@prisma/client";

/**
 * Common Server Action result wrapper.
 */
export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Product with all standard relations included.
 */
export type ProductWithRelations = Product & {
  category: Category;
  variants: ProductVariant[];
  images: ProductImage[];
  sensoryAttributes: SensoryAttribute[];
};

/**
 * Safe, serializable representation of ProductVariant for Client Components.
 */
export type ClientProductVariant = Omit<ProductVariant, "priceOverride"> & {
  priceOverride: string | null;
};

/**
 * Safe, serializable representation of ProductWithRelations for Client Components (Server -> Client boundary).
 * Money fields (price, salePrice, variant.priceOverride) are serialized to strings to preserve exact decimal precision.
 */
export type ClientProduct = Omit<Product, "price" | "salePrice"> & {
  price: string;
  salePrice: string | null;
  category: Category;
  variants: ClientProductVariant[];
  images: ProductImage[];
  sensoryAttributes: SensoryAttribute[];
};


/**
 * Safe public recommendation DTO for customer-facing recommendation surfaces.
 */
export interface RecommendationProductDTO {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: string; // Decimal string representation e.g. "145.00"
  salePrice: string | null;
  isFeatured: boolean;
  fragranceFamily: string | null;
  teaType: string | null;
  origin: string | null;
  caffeineLevel: string | null;
  mood: string | null;
  occasion: string | null;
  useCase: string | null;
  pairingTags: string | null;
  tags: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: {
    id: string;
    url: string;
    altText: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }[];
  sensoryAttributes: {
    id: string;
    attributeType: string;
    name: string;
  }[];
  variants: {
    id: string;
    volumeWeight: string;
    priceOverride: string | null;
    sku: string;
  }[];
  similarityScore?: number;
}

/**
 * Filter and search parameters for catalog queries.
 */
export interface ProductFilterParams {
  categorySlug?: string;
  fragranceFamily?: string;
  teaType?: string;
  origin?: string;
  mood?: string;
  occasion?: string;
  caffeineLevel?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  includeOutOfStock?: boolean;
  sortBy?: "newest" | "price-asc" | "price-desc" | "name-asc" | "featured";
  page?: number;
  limit?: number;
}

/**
 * Cart Line Item representation for local state and Zustand store.
 */
export interface CartLineItem {
  productId: string;
  variantId: string;
  productSlug: string;
  name: string;
  variantName: string; // e.g. "50ml", "100g"
  price: string; // Decimal stored as string representation to prevent floating point issues
  image: string;
  quantity: number;
  stockQuantity: number;
}

/**
 * Structured Shipping Address representation.
 */
export interface ShippingAddressStructure {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

/**
 * Telemetry Event representation.
 */
export interface TelemetryEvent {
  eventType:
    | "product_view"
    | "search_query"
    | "wishlist_add"
    | "wishlist_remove"
    | "cart_add"
    | "cart_remove"
    | "checkout_start"
    | "purchase_completed";
  sessionId: string;
  profileId?: string;
  metadata?: Record<string, unknown>;
}

export type {
  PaymentInitParams,
  PaymentInitResult,
  PaymentWebhookPayload,
  PaymentAdapter,
} from "@/lib/payments/types";
