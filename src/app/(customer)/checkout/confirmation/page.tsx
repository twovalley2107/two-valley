import { Metadata } from "next";
import Link from "next/link";
import { getOrderConfirmation } from "@/actions/checkoutActions";
import { ConfirmationContent } from "@/components/checkout/ConfirmationContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Confirmation — Two Valley",
  description: "View your confirmed Two Valley formulation order.",
};

interface ConfirmationPageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const resolvedParams = await searchParams;
  const orderNumber = resolvedParams.orderNumber || "";

  if (!orderNumber) {
    return (
      <div className="min-h-screen bg-brand-ivory py-16 px-4 font-sans flex items-center justify-center">
        <div className="bg-brand-beige/60 border border-brand-gold/20 rounded-2xl p-10 text-center max-w-md space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-brand-forest">
            Order Reference Missing
          </h2>
          <p className="text-xs text-brand-olive leading-relaxed">
            No valid order reference was provided. Please check your confirmation link or visit your account.
          </p>
          <Link
            href="/perfumes"
            className="inline-block py-3 px-6 rounded-xl bg-brand-forest text-brand-ivory text-xs font-semibold uppercase tracking-widest hover:bg-brand-olive transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  const res = await getOrderConfirmation(orderNumber);

  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen bg-brand-ivory py-16 px-4 font-sans flex items-center justify-center">
        <div className="bg-brand-beige/60 border border-brand-gold/20 rounded-2xl p-10 text-center max-w-md space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-brand-forest">
            Order Not Accessible
          </h2>
          <p className="text-xs text-brand-olive leading-relaxed">
            {res.error || "You do not have authorization to view this order confirmation."}
          </p>
          <Link
            href="/"
            className="inline-block py-3 px-6 rounded-xl bg-brand-forest text-brand-ivory text-xs font-semibold uppercase tracking-widest hover:bg-brand-olive transition-colors"
          >
            Return to Sanctuary Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-ivory py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <ConfirmationContent order={res.data} />
    </div>
  );
}
