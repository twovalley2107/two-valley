"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@prisma/client";

interface PDPGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function PDPGallery({ images, productName }: PDPGalleryProps) {
  // Sort images by sortOrder and set primary first
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return a.sortOrder - b.sortOrder;
  });

  const primaryImage =
    sortedImages[0]?.url ||
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000";

  const [activeImageUrl, setActiveImageUrl] = useState<string>(primaryImage);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Main Viewport Container */}
      <div
        className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-brand-beige/40 border border-brand-gold/20 shadow-md cursor-crosshair group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={activeImageUrl}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-transform duration-300 ${
            isZoomed ? "scale-125" : "scale-100"
          }`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }
              : undefined
          }
        />
      </div>

      {/* Thumbnail Strip */}
      {sortedImages.length > 1 && (
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-thin">
          {sortedImages.map((img, index) => {
            const isSelected = activeImageUrl === img.url;
            return (
              <button
                key={img.id || index}
                onClick={() => setActiveImageUrl(img.url)}
                aria-label={`Select image ${index + 1} for ${productName}`}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-gold ${
                  isSelected
                    ? "border-brand-gold shadow-md scale-105"
                    : "border-brand-gold/15 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText || `${productName} thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
