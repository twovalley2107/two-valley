import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout — Two Valley",
  description: "Complete your Two Valley artisanal perfume and tea order securely.",
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userEmail = user?.email || "";
  let userName = "";

  if (user) {
    const profile = await db.profile.findUnique({
      where: { id: user.id },
    });
    if (profile?.name) {
      userName = profile.name;
    }
  }

  return (
    <div className="min-h-screen bg-brand-ivory py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Editorial Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-brand-gold">
            Sanctuary Checkout
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-forest">
            Complete Your Formulation Order
          </h1>
          <p className="font-sans text-xs sm:text-sm text-brand-olive leading-relaxed">
            Provide your recipient shipping address and finalize your luxury artisanal order.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 bg-brand-beige/30 border border-brand-gold/20 rounded-2xl p-6 sm:p-8 shadow-sm">
            <CheckoutForm userEmail={userEmail} userName={userName} />
          </div>

          <div className="lg:col-span-5">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
