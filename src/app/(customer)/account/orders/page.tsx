import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerOrders } from "@/actions/orderActions";
import { OrderHistoryList } from "@/components/customer/OrderHistoryList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order History — Two Valley",
  description: "View your Two Valley order history and formulation archives.",
};

export default async function CustomerOrdersPage() {
  const res = await getCustomerOrders();

  if (!res.success && res.error === "Authentication required to view order history.") {
    redirect("/login");
  }

  const orders = res.success && res.data ? res.data : [];

  return (
    <div className="min-h-screen bg-brand-ivory py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-brand-olive">
          <Link href="/account" className="hover:text-brand-gold transition-colors font-medium">
            My Account
          </Link>
          <span>/</span>
          <span className="text-brand-forest font-semibold">Order History</span>
        </div>

        {/* Page Header */}
        <div className="space-y-2 border-b border-brand-gold/20 pb-6">
          <span className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-brand-gold">
            Sanctuary Archives
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-brand-forest">
            Order History
          </h1>
          <p className="text-xs sm:text-sm text-brand-olive">
            Review your previously acquired extrait de parfum formulations and single-estate tea flushes.
          </p>
        </div>

        {/* Order History List */}
        <OrderHistoryList orders={orders} />
      </div>
    </div>
  );
}
