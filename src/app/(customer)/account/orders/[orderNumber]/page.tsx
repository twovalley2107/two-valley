import { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCustomerOrderDetail } from "@/actions/orderActions";
import { OrderDetailView } from "@/components/customer/OrderDetailView";
import { BackButton } from "@/components/ui/BackButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Detail — Two Valley",
  description: "View itemized Two Valley order formulation details.",
};

interface CustomerOrderDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function CustomerOrderDetailPage({ params }: CustomerOrderDetailPageProps) {
  const resolvedParams = await params;
  const orderNumber = resolvedParams.orderNumber || "";

  const res = await getCustomerOrderDetail(orderNumber);

  if (!res.success && res.error === "Authentication required to view order details.") {
    redirect("/login");
  }

  // IDOR & Existence Guard: If order is not found or profileId doesn't match, return Next.js notFound()
  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-brand-ivory py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation: Back Button + Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <BackButton fallbackHref="/account/orders" label="Back to Orders" />

          <div className="flex items-center space-x-2 text-xs text-brand-olive">
            <Link href="/account" className="hover:text-brand-gold transition-colors font-medium">
              My Account
            </Link>
            <span>/</span>
            <Link href="/account/orders" className="hover:text-brand-gold transition-colors font-medium">
              Order History
            </Link>
            <span>/</span>
            <span className="text-brand-forest font-semibold">{orderNumber}</span>
          </div>
        </div>

        {/* Order Detail Content */}
        <OrderDetailView order={res.data} />
      </div>
    </div>
  );
}
