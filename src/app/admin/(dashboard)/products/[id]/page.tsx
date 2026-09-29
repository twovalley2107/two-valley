import { notFound } from "next/navigation";
import { assertAdminSession } from "@/lib/auth/assertAdminSession";
import { getAdminProductDetail } from "@/actions/adminActions";
import { ProductForm } from "@/components/admin/ProductForm";
import { BackButton } from "@/components/ui/BackButton";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await assertAdminSession();

  const { id } = await params;

  const [productRes, categories] = await Promise.all([
    getAdminProductDetail(id),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!productRes.success || !productRes.data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <BackButton fallbackHref="/admin/products" label="Back to Products" variant="admin" />

      <div>
        <h1 className="font-serif text-2xl text-brand-ivory tracking-wide">
          Edit Product: {productRes.data.name}
        </h1>
        <p className="text-xs text-brand-ivory/60 font-sans mt-0.5">
          Update catalog details, sensory notes, variants, images, and recommendation metadata.
        </p>
      </div>

      <ProductForm categories={categories} initialData={productRes.data} />
    </div>
  );
}
