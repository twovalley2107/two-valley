"use client";

import { useState } from "react";
import {
  generateCloudinarySignatureAction,
  uploadProductImageToCloudinaryAction,
} from "@/actions/cloudinaryActions";

interface ProductImageUploadProps {
  images: Array<{ url: string; altText?: string | null; isPrimary: boolean; sortOrder: number }>;
  onChange: (images: Array<{ url: string; altText?: string | null; isPrimary: boolean; sortOrder: number }>) => void;
}

export function ProductImageUpload({ images, onChange }: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [directUrl, setDirectUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side MIME validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, WEBP, and AVIF images are allowed.");
      return;
    }

    // Client-side size validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size cannot exceed 5 MB.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Step 1: Request signed signature from Server Action (strictly authorized by assertAdminSession)
      const sigRes = await generateCloudinarySignatureAction();

      if (sigRes.success && sigRes.data) {
        const { signature, timestamp, cloudName, apiKey, folder } = sigRes.data;

        // Post signed request to Cloudinary CDN API directly from browser
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadData = await uploadRes.json();

        if (uploadData.secure_url) {
          const newImage = {
            url: uploadData.secure_url,
            altText: altText.trim() || file.name,
            isPrimary: images.length === 0,
            sortOrder: images.length,
          };
          onChange([...images, newImage]);
          setAltText("");
          setUploading(false);
          return;
        }
      }

      // Step 2: Fallback to Server Action direct upload
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        try {
          const serverUploadRes = await uploadProductImageToCloudinaryAction(dataUrl, file.name);
          if (serverUploadRes.success && serverUploadRes.data?.url) {
            const newImage = {
              url: serverUploadRes.data.url,
              altText: altText.trim() || file.name,
              isPrimary: images.length === 0,
              sortOrder: images.length,
            };
            onChange([...images, newImage]);
            setAltText("");
          } else {
            // Local fallback Data URL preview if Cloudinary credentials not configured in dev
            const newImage = {
              url: dataUrl,
              altText: altText.trim() || file.name,
              isPrimary: images.length === 0,
              sortOrder: images.length,
            };
            onChange([...images, newImage]);
            setAltText("");
          }
        } catch {
          const newImage = {
            url: dataUrl,
            altText: altText.trim() || file.name,
            isPrimary: images.length === 0,
            sortOrder: images.length,
          };
          onChange([...images, newImage]);
          setAltText("");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
      return;
    } catch (err: any) {
      setError(err?.message || "Failed to upload image to Cloudinary.");
      setUploading(false);
    }
  };

  const handleAddDirectUrl = () => {
    if (!directUrl.trim()) return;

    try {
      new URL(directUrl.trim());
    } catch {
      setError("Please enter a valid image URL.");
      return;
    }

    setError(null);
    const newImage = {
      url: directUrl.trim(),
      altText: altText.trim() || "Product image",
      isPrimary: images.length === 0,
      sortOrder: images.length,
    };

    onChange([...images, newImage]);
    setDirectUrl("");
    setAltText("");
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (images[index]?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-base text-brand-ivory">Product Images</h3>

      {error && (
        <div className="p-3 bg-rose-900/30 border border-rose-500/30 text-rose-200 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Grid of current images */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`relative group rounded-lg border p-2 bg-brand-charcoal flex flex-col gap-2 ${
              img.isPrimary ? "border-brand-gold" : "border-brand-gold/10"
            }`}
          >
            <div className="aspect-square relative overflow-hidden rounded bg-black/40">
              <img
                src={img.url}
                alt={img.altText || "Product preview"}
                className="w-full h-full object-cover"
              />
              {img.isPrimary && (
                <span className="absolute top-1 left-1 bg-brand-gold text-brand-forest text-[10px] font-bold px-1.5 py-0.5 rounded">
                  PRIMARY
                </span>
              )}
            </div>

            <p className="text-[11px] text-brand-ivory/60 truncate" title={img.url}>
              {img.altText || "No alt text"}
            </p>

            <div className="flex items-center justify-between mt-auto pt-1 border-t border-brand-gold/10">
              {!img.isPrimary && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(idx)}
                  className="text-[11px] text-brand-gold hover:underline"
                >
                  Make Primary
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="text-[11px] text-rose-400 hover:text-rose-300 ml-auto"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Controls */}
      <div className="p-4 border border-brand-gold/10 rounded-lg bg-brand-charcoal/50 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">
              Upload Image File (Cloudinary Storage)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-xs text-brand-ivory/60 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-brand-gold/10 file:text-brand-gold hover:file:bg-brand-gold/20"
            />
            {uploading && <p className="text-[11px] text-brand-gold mt-1">Uploading image...</p>}
          </div>

          <div>
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">
              Alt Text / Caption
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g. Darjeeling Second Flush 100g Pouch"
              className="w-full bg-black/30 border border-brand-gold/20 rounded px-3 py-1.5 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold"
            />
          </div>
        </div>

        {/* Or Direct URL Input */}
        <div className="pt-2 border-t border-brand-gold/10 flex items-center gap-2">
          <input
            type="url"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            placeholder="Or enter direct image URL (e.g. https://images.unsplash.com/...)"
            className="flex-1 bg-black/30 border border-brand-gold/20 rounded px-3 py-1.5 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold"
          />
          <button
            type="button"
            onClick={handleAddDirectUrl}
            className="px-3 py-1.5 bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold text-xs font-medium rounded transition-colors"
          >
            Add URL
          </button>
        </div>
      </div>
    </div>
  );
}
