"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/telemetry";

interface ProductViewTrackerProps {
  productId: string;
  slug: string;
  categoryId?: string;
  price?: string;
}

/**
 * Lightweight client component tracker for PDP product_view events.
 * Fires once per PDP mount without converting the PDP page to a Client Component.
 */
export function ProductViewTracker({
  productId,
  slug,
  categoryId,
  price,
}: ProductViewTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current && productId) {
      trackedRef.current = true;
      trackEvent("product_view", {
        productId,
        slug,
        categoryId,
        price,
      });
    }
  }, [productId, slug, categoryId, price]);

  return null;
}
