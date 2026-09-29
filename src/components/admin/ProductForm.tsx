"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductImageUpload } from "./ProductImageUpload";
import { createProduct, updateProduct } from "@/actions/adminActions";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  initialData?: any;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialData?.id);
  const [activeTab, setActiveTab] = useState<"basic" | "sensory" | "variants" | "images" | "recommendation">("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Slug manual override flag
  const [isSlugManual, setIsSlugManual] = useState(Boolean(initialData?.slug));

  // Core Form State
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || (categories[0]?.id || ""));
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [salePrice, setSalePrice] = useState(initialData?.salePrice ? String(initialData.salePrice) : "");
  const [stockQuantity, setStockQuantity] = useState<number>(initialData?.stockQuantity ?? 10);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured ?? false);

  // Sensory Notes Metadata
  const [fragranceFamily, setFragranceFamily] = useState(initialData?.fragranceFamily || "");
  const [teaType, setTeaType] = useState(initialData?.teaType || "");
  const [origin, setOrigin] = useState(initialData?.origin || "");
  const [caffeineLevel, setCaffeineLevel] = useState(initialData?.caffeineLevel || "");
  const [steepingGuide, setSteepingGuide] = useState(initialData?.steepingGuide || "");
  const [mood, setMood] = useState(initialData?.mood || "");
  const [occasion, setOccasion] = useState(initialData?.occasion || "");
  const [useCase, setUseCase] = useState(initialData?.useCase || "");
  const [pairingTags, setPairingTags] = useState(initialData?.pairingTags || "");
  const [tags, setTags] = useState(initialData?.tags || "");

  // Sensory Attributes List
  const [sensoryAttributes, setSensoryAttributes] = useState<
    Array<{ attributeType: "TOP_NOTE" | "HEART_NOTE" | "BASE_NOTE" | "FLAVOUR_NOTE"; name: string }>
  >(initialData?.sensoryAttributes || []);

  // Variants List
  const [variants, setVariants] = useState<
    Array<{ volumeWeight: string; priceOverride: string; stockQuantity: number; sku: string }>
  >(
    initialData?.variants?.map((v: any) => ({
      volumeWeight: v.volumeWeight,
      priceOverride: v.priceOverride ? String(v.priceOverride) : "",
      stockQuantity: v.stockQuantity,
      sku: v.sku,
    })) || []
  );

  // Images List
  const [images, setImages] = useState<
    Array<{ url: string; altText?: string | null; isPrimary: boolean; sortOrder: number }>
  >(
    initialData?.images?.map((img: any) => ({
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })) || []
  );

  // Handle Name Input & Live Slug Generation
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && !isSlugManual) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setIsSlugManual(Boolean(val.trim()));
  };

  // Determine Category Mode (Perfume vs Tea)
  const selectedCat = categories.find((c) => c.id === categoryId) || categories[0];
  const isTea = selectedCat?.name?.toLowerCase().includes("tea") ?? false;
  const isPerfume = !isTea;

  // Dynamic Add Helpers
  const addSensoryAttribute = (type: "TOP_NOTE" | "HEART_NOTE" | "BASE_NOTE" | "FLAVOUR_NOTE") => {
    setSensoryAttributes((prev) => [
      ...prev,
      { attributeType: type, name: "" },
    ]);
  };

  const removeSensoryAttribute = (idx: number) => {
    setSensoryAttributes((prev) => prev.filter((_, i) => i !== idx));
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        volumeWeight: isTea ? "100g" : "50ml",
        priceOverride: "",
        stockQuantity: 10,
        sku: `${sku || "SKU"}-VAR-${prev.length + 1}`,
      },
    ]);
  };

  const removeVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      slug: slug || generateSlug(name),
      sku: sku || undefined,
      categoryId,
      description,
      price,
      salePrice: salePrice ? salePrice : null,
      stockQuantity: Number(stockQuantity),
      isFeatured,
      fragranceFamily: isPerfume ? fragranceFamily || null : null,
      teaType: isTea ? teaType || null : null,
      origin: origin || null,
      caffeineLevel: isTea ? caffeineLevel || null : null,
      steepingGuide: isTea ? steepingGuide || null : null,
      mood: mood || null,
      occasion: occasion || null,
      useCase: useCase || null,
      pairingTags: pairingTags || null,
      tags: tags || null,
      sensoryAttributes: sensoryAttributes.filter((a) => a.name.trim().length > 0),
      variants: variants.filter((v) => v.volumeWeight.trim().length > 0),
      images,
    };

    try {
      let res;
      if (isEdit) {
        res = await updateProduct({ id: initialData.id, ...payload });
      } else {
        res = await createProduct(payload);
      }

      if (!res.success) {
        setError(res.error || "Failed to save product.");
        setLoading(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An error occurred while saving product.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-rose-900/40 border border-rose-500/40 text-rose-200 text-sm rounded-lg" role="alert">
          {error}
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-brand-gold/20 overflow-x-auto pb-1">
        {[
          { key: "basic", label: "Basic Details" },
          { key: "sensory", label: isTea ? "Tea Sensory & Notes" : "Fragrance Pyramid & Notes" },
          { key: "variants", label: "Variants" },
          { key: "images", label: `Images (${images.length})` },
          { key: "recommendation", label: "Recommendation Metadata" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-xs font-sans rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-brand-gold text-brand-forest font-semibold"
                : "text-brand-ivory/60 hover:text-brand-ivory hover:bg-brand-ivory/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BASIC DETAILS */}
      {activeTab === "basic" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-brand-charcoal/40 p-5 rounded-lg border border-brand-gold/10">
          <div>
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={isTea ? "e.g. Kashmiri Kahwa Saffron Blend" : "e.g. Valley Mist Extrait"}
              className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">
              Category *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-brand-charcoal">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">
              Slug (URL Key) <span className="text-brand-gold/60 text-[10px]">(Optional — Auto-generated)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="e.g. valley-mist-extrait"
              className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">
              SKU (Stock Keeping Unit) <span className="text-brand-gold/60 text-[10px]">(Optional — Auto-generated)</span>
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder={isTea ? "e.g. TV-TEA-KASHMIRI" : "e.g. TV-PERF-VALLEY"}
              className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">
              Regular Price ($) *
            </label>
            <input
              type="text"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 145.00"
              className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">
              Sale Price ($) <span className="text-brand-gold/60 text-[10px]">(Optional)</span>
            </label>
            <input
              type="text"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="Optional discount price"
              className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">
              Base Stock Quantity *
            </label>
            <input
              type="number"
              min={0}
              required
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-brand-gold/30 bg-black/40 text-brand-gold focus:ring-brand-gold"
            />
            <label htmlFor="isFeatured" className="text-xs font-sans text-brand-ivory/90">
              Featured Product (Showcase on Homepage)
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">
              Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed sensory and origin description..."
              className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold"
            />
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY-SPECIFIC SENSORY & ATTRIBUTES */}
      {activeTab === "sensory" && (
        <div className="space-y-6 bg-brand-charcoal/40 p-5 rounded-lg border border-brand-gold/10 font-sans">
          {/* Category-Specific Fields */}
          {isPerfume ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-brand-ivory/70 mb-1">Fragrance Family</label>
                <input
                  type="text"
                  value={fragranceFamily}
                  onChange={(e) => setFragranceFamily(e.target.value)}
                  placeholder="e.g. Fresh Woody, Floral Oriental, Citrus Spice"
                  className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory"
                />
              </div>
              <div>
                <label className="block text-xs text-brand-ivory/70 mb-1">Origin / Sourcing Field</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Grasse France, Kannauj India"
                  className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-brand-ivory/70 mb-1">Tea Type</label>
                <input
                  type="text"
                  value={teaType}
                  onChange={(e) => setTeaType(e.target.value)}
                  placeholder="e.g. Loose Leaf Black Tea, First Flush Oolong"
                  className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory"
                />
              </div>
              <div>
                <label className="block text-xs text-brand-ivory/70 mb-1">Tea Origin</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Darjeeling High-Altitude Estate"
                  className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory"
                />
              </div>
              <div>
                <label className="block text-xs text-brand-ivory/70 mb-1">Caffeine Level</label>
                <select
                  value={caffeineLevel}
                  onChange={(e) => setCaffeineLevel(e.target.value)}
                  className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory"
                >
                  <option value="">Select Caffeine Level</option>
                  <option value="Caffeine-Free">Caffeine-Free</option>
                  <option value="Low Caffeine">Low Caffeine</option>
                  <option value="Medium Caffeine">Medium Caffeine</option>
                  <option value="High Caffeine">High Caffeine</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs text-brand-ivory/70 mb-1">Steeping Guide</label>
                <input
                  type="text"
                  value={steepingGuide}
                  onChange={(e) => setSteepingGuide(e.target.value)}
                  placeholder="e.g. Steep 1 tsp at 90°C for 3-4 minutes"
                  className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory"
                />
              </div>
            </div>
          )}

          {/* Dynamic Sensory Notes / Pyramid List */}
          <div className="space-y-3 pt-4 border-t border-brand-gold/10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-serif text-brand-gold uppercase tracking-wider">
                {isPerfume ? "Fragrance Pyramid (Top, Heart & Base Notes)" : "Tea Flavour & Aromatic Notes"}
              </h4>
              <div className="flex items-center gap-2">
                {isPerfume ? (
                  <>
                    <button
                      type="button"
                      onClick={() => addSensoryAttribute("TOP_NOTE")}
                      className="text-[11px] px-2 py-1 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold rounded"
                    >
                      + Top Note
                    </button>
                    <button
                      type="button"
                      onClick={() => addSensoryAttribute("HEART_NOTE")}
                      className="text-[11px] px-2 py-1 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold rounded"
                    >
                      + Heart Note
                    </button>
                    <button
                      type="button"
                      onClick={() => addSensoryAttribute("BASE_NOTE")}
                      className="text-[11px] px-2 py-1 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold rounded"
                    >
                      + Base Note
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => addSensoryAttribute("FLAVOUR_NOTE")}
                    className="text-[11px] px-2 py-1 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold rounded"
                  >
                    + Flavour Note
                  </button>
                )}
              </div>
            </div>

            {sensoryAttributes.length === 0 && (
              <p className="text-xs text-brand-ivory/40 italic">No notes added yet. Click above to add notes.</p>
            )}

            {sensoryAttributes.map((attr, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <select
                  value={attr.attributeType}
                  onChange={(e) => {
                    const updated = [...sensoryAttributes];
                    updated[idx].attributeType = e.target.value as any;
                    setSensoryAttributes(updated);
                  }}
                  className="bg-black/40 border border-brand-gold/20 rounded px-3 py-1.5 text-xs text-brand-ivory"
                >
                  <option value="TOP_NOTE">TOP NOTE</option>
                  <option value="HEART_NOTE">HEART NOTE</option>
                  <option value="BASE_NOTE">BASE NOTE</option>
                  <option value="FLAVOUR_NOTE">FLAVOUR NOTE</option>
                </select>

                <input
                  type="text"
                  value={attr.name}
                  onChange={(e) => {
                    const updated = [...sensoryAttributes];
                    updated[idx].name = e.target.value;
                    setSensoryAttributes(updated);
                  }}
                  placeholder={isPerfume ? "Note name (e.g. Bergamot, Jasmine, Cedarwood)" : "Flavour note (e.g. Muscatel Grape, Honey, Saffron)"}
                  className="flex-1 bg-black/40 border border-brand-gold/20 rounded px-3 py-1.5 text-xs text-brand-ivory"
                />

                <button
                  type="button"
                  onClick={() => removeSensoryAttribute(idx)}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: VARIANTS */}
      {activeTab === "variants" && (
        <div className="space-y-4 bg-brand-charcoal/40 p-5 rounded-lg border border-brand-gold/10 font-sans">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-serif text-brand-gold uppercase tracking-wider">Product Volume & Weight Variants</h4>
            <button
              type="button"
              onClick={addVariant}
              className="text-xs text-brand-gold hover:underline"
            >
              + Add Variant
            </button>
          </div>

          {variants.length === 0 && (
            <p className="text-xs text-brand-ivory/50 italic">No variants added. Product will sell under base price and stock.</p>
          )}

          {variants.map((variant, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-black/30 rounded border border-brand-gold/10 items-center">
              <div>
                <label className="block text-[10px] text-brand-ivory/60 mb-0.5">Volume / Weight</label>
                <input
                  type="text"
                  value={variant.volumeWeight}
                  onChange={(e) => {
                    const updated = [...variants];
                    updated[idx].volumeWeight = e.target.value;
                    setVariants(updated);
                  }}
                  placeholder={isTea ? "e.g. 100g Pouch" : "e.g. 50ml Bottle"}
                  className="w-full bg-black/50 border border-brand-gold/20 rounded px-2.5 py-1 text-xs text-brand-ivory"
                />
              </div>

              <div>
                <label className="block text-[10px] text-brand-ivory/60 mb-0.5">Variant SKU</label>
                <input
                  type="text"
                  value={variant.sku}
                  onChange={(e) => {
                    const updated = [...variants];
                    updated[idx].sku = e.target.value;
                    setVariants(updated);
                  }}
                  placeholder="Auto-generated if empty"
                  className="w-full bg-black/50 border border-brand-gold/20 rounded px-2.5 py-1 text-xs text-brand-ivory"
                />
              </div>

              <div>
                <label className="block text-[10px] text-brand-ivory/60 mb-0.5">Price Override ($)</label>
                <input
                  type="text"
                  value={variant.priceOverride}
                  onChange={(e) => {
                    const updated = [...variants];
                    updated[idx].priceOverride = e.target.value;
                    setVariants(updated);
                  }}
                  placeholder="Optional override"
                  className="w-full bg-black/50 border border-brand-gold/20 rounded px-2.5 py-1 text-xs text-brand-ivory"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] text-brand-ivory/60 mb-0.5">Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={variant.stockQuantity}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].stockQuantity = Number(e.target.value);
                      setVariants(updated);
                    }}
                    className="w-full bg-black/50 border border-brand-gold/20 rounded px-2.5 py-1 text-xs text-brand-ivory"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  className="text-xs text-rose-400 hover:text-rose-300 pt-3"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: IMAGES */}
      {activeTab === "images" && (
        <div className="bg-brand-charcoal/40 p-5 rounded-lg border border-brand-gold/10">
          <ProductImageUpload images={images} onChange={setImages} />
        </div>
      )}

      {/* TAB 5: RECOMMENDATION METADATA */}
      {activeTab === "recommendation" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-brand-charcoal/40 p-5 rounded-lg border border-brand-gold/10 font-sans">
          <div>
            <label className="block text-xs text-brand-ivory/70 mb-1">Target Mood</label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g. Meditative Calm, Uplifting Morning, Evening Opulence"
              className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory"
            />
          </div>

          <div>
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">Target Occasion</label>
            <input
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="e.g. Daily Reflection, Gifting, Special Celebration"
              className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory"
            />
          </div>

          <div>
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">Use Case</label>
            <input
              type="text"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="e.g. Workday Focus, Evening Wind-Down"
              className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory"
            />
          </div>

          <div>
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">Sensory Pairing Tags</label>
            <input
              type="text"
              value={pairingTags}
              onChange={(e) => setPairingTags(e.target.value)}
              placeholder={isTea ? "e.g. Valley Mist Extrait" : "e.g. Darjeeling First Flush Tea"}
              className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-sans text-brand-ivory/70 mb-1">Search & Recommendation Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated search keywords e.g. fresh, woody, cardamom, darjeeling"
              className="w-full bg-black/40 border border-brand-gold/20 rounded px-3 py-2 text-xs text-brand-ivory"
            />
          </div>
        </div>
      )}

      {/* Submit Button Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-gold/20">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-4 py-2 text-xs font-sans text-brand-ivory/60 hover:text-brand-ivory rounded transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-brand-gold text-brand-forest font-semibold text-xs rounded hover:bg-brand-gold/90 transition-colors shadow-lg disabled:opacity-50"
        >
          {loading ? "Saving Product..." : isEdit ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
