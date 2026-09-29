import { assertAdminSession } from "@/lib/auth/assertAdminSession";
import { ProductForm } from "@/components/admin/ProductForm";
import { BackButton } from "@/components/ui/BackButton";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await assertAdminSession();

  let categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  if (categories.length === 0) {
    await db.category.createMany({
      data: [
        {
          name: "Artisanal Perfumes",
          slug: "artisanal-perfumes",
          description: "Handcrafted botanical extrait de parfum bridging high-altitude blossoms and rare woods.",
        },
        {
          name: "Single-Estate Teas",
          slug: "single-estate-teas",
          description: "Rare-harvest, single-estate tea leaves harvested from pristine mountain valleys.",
        },
      ],
      skipDuplicates: true,
    });
    categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });
  }

  return (
    <div className="space-y-6">
      <BackButton fallbackHref="/admin/products" label="Back to Products" variant="admin" />

      <div>
        <h1 className="font-serif text-2xl text-brand-ivory tracking-wide">Create New Product</h1>
        <p className="text-xs text-brand-ivory/60 font-sans mt-0.5">
          Add a new luxury tea or fragrance formulation to the catalog.
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
