"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { shippingAddressSchema, ShippingAddressInput } from "@/lib/validation/checkout";
import { initializeCheckout } from "@/actions/checkoutActions";
import { trackEvent } from "@/lib/telemetry";

interface CheckoutFormProps {
  userEmail?: string;
  userName?: string;
}

export function CheckoutForm({ userEmail = "", userName = "" }: CheckoutFormProps) {
  const router = useRouter();
  const { items } = useCartStore();
  const [step, setStep] = useState<1 | 2>(1);

  const [contactEmail, setContactEmail] = useState(userEmail);
  const [address, setAddress] = useState<ShippingAddressInput>({
    fullName: userName,
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current && items.length > 0) {
      trackedRef.current = true;
      const subtotalVal = items
        .reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)
        .toFixed(2);
      const itemCountVal = items.reduce((acc, item) => acc + item.quantity, 0);

      trackEvent("checkout_start", {
        itemCount: itemCountVal,
        subtotal: subtotalVal,
      });
    }
  }, [items]);

  const handleInputChange = (field: keyof ShippingAddressInput, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validateStep1 = () => {
    setServerError(null);
    const newErrors: Record<string, string> = {};

    if (!contactEmail || !/\S+@\S+\.\S+/.test(contactEmail)) {
      newErrors.contactEmail = "Valid email address is required.";
    }

    const res = shippingAddressSchema.safeParse(address);
    if (!res.success) {
      res.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as string] = issue.message;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmitCheckout = () => {
    if (!validateStep1()) return;

    if (items.length === 0) {
      setServerError("Your cart is empty.");
      return;
    }

    startTransition(async () => {
      const payload = {
        contactEmail,
        shippingAddress: address,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      };

      const res = await initializeCheckout(payload);

      if (!res.success || !res.data) {
        setServerError(res.error || "Failed to initialize checkout.");
        return;
      }

      // Handle Mock Payment Redirect
      if (res.data.redirectUrl) {
        router.push(res.data.redirectUrl);
      } else {
        router.push(`/checkout/confirmation?orderNumber=${encodeURIComponent(res.data.orderNumber)}`);
      }
    });
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Progress Wizard Header */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-brand-gold/20 pb-4 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
        <button
          onClick={() => setStep(1)}
          className={`flex items-center space-x-1.5 sm:space-x-2 ${
            step === 1 ? "text-brand-forest" : "text-brand-olive hover:text-brand-gold"
          }`}
        >
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-forest text-brand-ivory flex items-center justify-center text-[10px] shrink-0">
            1
          </span>
          <span className="truncate">Shipping & Contact</span>
        </button>

        <span className="hidden sm:inline text-brand-gold/40">&bull;&bull;&bull;</span>

        <button
          onClick={() => validateStep1() && setStep(2)}
          disabled={step === 1}
          className={`flex items-center space-x-1.5 sm:space-x-2 ${
            step === 2 ? "text-brand-forest" : "text-brand-olive/50 cursor-not-allowed"
          }`}
        >
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-beige border border-brand-gold/30 text-brand-forest flex items-center justify-center text-[10px] shrink-0">
            2
          </span>
          <span className="truncate">Review & Payment</span>
        </button>
      </div>

      {serverError && (
        <div role="alert" aria-live="polite" className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
          <strong>Checkout Error:</strong> {serverError}
        </div>
      )}

      {step === 1 ? (
        /* STEP 1: CONTACT & SHIPPING ADDRESS */
        <form onSubmit={handleProceedToReview} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-brand-forest">
              Contact Details
            </h3>
            <div>
              <label htmlFor="checkout-email" className="block text-xs font-semibold text-brand-olive uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                id="checkout-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="your.email@example.com"
                aria-invalid={Boolean(errors.contactEmail)}
                aria-describedby={errors.contactEmail ? "err-contactEmail" : undefined}
                className="w-full px-4 py-3 rounded-xl bg-brand-beige/40 border border-brand-gold/30 focus:border-brand-gold focus:outline-none text-xs text-brand-forest"
              />
              {errors.contactEmail && (
                <p id="err-contactEmail" role="alert" className="text-[11px] text-red-700 mt-1">{errors.contactEmail}</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4 pt-4 border-t border-brand-gold/15">
            <h3 className="font-serif text-lg font-semibold text-brand-forest">
              Shipping Sanctuary Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="shipping-fullname" className="block text-xs font-semibold text-brand-olive uppercase tracking-wider mb-1">
                  Recipient Full Name *
                </label>
                <input
                  id="shipping-fullname"
                  type="text"
                  value={address.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="First and Last Name"
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "err-fullName" : undefined}
                  className="w-full px-4 py-3 rounded-xl bg-brand-beige/40 border border-brand-gold/30 focus:border-brand-gold focus:outline-none text-xs text-brand-forest"
                />
                {errors.fullName && <p id="err-fullName" role="alert" className="text-[11px] text-red-700 mt-1">{errors.fullName}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="shipping-addressLine1" className="block text-xs font-semibold text-brand-olive uppercase tracking-wider mb-1">
                  Address Line 1 *
                </label>
                <input
                  id="shipping-addressLine1"
                  type="text"
                  value={address.addressLine1}
                  onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                  placeholder="Street Address, P.O. Box"
                  aria-invalid={Boolean(errors.addressLine1)}
                  aria-describedby={errors.addressLine1 ? "err-addressLine1" : undefined}
                  className="w-full px-4 py-3 rounded-xl bg-brand-beige/40 border border-brand-gold/30 focus:border-brand-gold focus:outline-none text-xs text-brand-forest"
                />
                {errors.addressLine1 && <p id="err-addressLine1" role="alert" className="text-[11px] text-red-700 mt-1">{errors.addressLine1}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="shipping-addressLine2" className="block text-xs font-semibold text-brand-olive uppercase tracking-wider mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  id="shipping-addressLine2"
                  type="text"
                  value={address.addressLine2 || ""}
                  onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                  placeholder="Apartment, Suite, Unit, Building"
                  className="w-full px-4 py-3 rounded-xl bg-brand-beige/40 border border-brand-gold/30 focus:border-brand-gold focus:outline-none text-xs text-brand-forest"
                />
              </div>

              <div>
                <label htmlFor="shipping-city" className="block text-xs font-semibold text-brand-olive uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  id="shipping-city"
                  type="text"
                  value={address.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  aria-invalid={Boolean(errors.city)}
                  aria-describedby={errors.city ? "err-city" : undefined}
                  className="w-full px-4 py-3 rounded-xl bg-brand-beige/40 border border-brand-gold/30 focus:border-brand-gold focus:outline-none text-xs text-brand-forest"
                />
                {errors.city && <p id="err-city" role="alert" className="text-[11px] text-red-700 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="shipping-state" className="block text-xs font-semibold text-brand-olive uppercase tracking-wider mb-1">
                  State / Province *
                </label>
                <input
                  id="shipping-state"
                  type="text"
                  value={address.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  aria-invalid={Boolean(errors.state)}
                  aria-describedby={errors.state ? "err-state" : undefined}
                  className="w-full px-4 py-3 rounded-xl bg-brand-beige/40 border border-brand-gold/30 focus:border-brand-gold focus:outline-none text-xs text-brand-forest"
                />
                {errors.state && <p id="err-state" role="alert" className="text-[11px] text-red-700 mt-1">{errors.state}</p>}
              </div>

              <div>
                <label htmlFor="shipping-postalCode" className="block text-xs font-semibold text-brand-olive uppercase tracking-wider mb-1">
                  Postal Code *
                </label>
                <input
                  id="shipping-postalCode"
                  type="text"
                  value={address.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  aria-invalid={Boolean(errors.postalCode)}
                  aria-describedby={errors.postalCode ? "err-postalCode" : undefined}
                  className="w-full px-4 py-3 rounded-xl bg-brand-beige/40 border border-brand-gold/30 focus:border-brand-gold focus:outline-none text-xs text-brand-forest"
                />
                {errors.postalCode && <p id="err-postalCode" role="alert" className="text-[11px] text-red-700 mt-1">{errors.postalCode}</p>}
              </div>

              <div>
                <label htmlFor="shipping-country" className="block text-xs font-semibold text-brand-olive uppercase tracking-wider mb-1">
                  Country *
                </label>
                <input
                  id="shipping-country"
                  type="text"
                  value={address.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  aria-invalid={Boolean(errors.country)}
                  aria-describedby={errors.country ? "err-country" : undefined}
                  className="w-full px-4 py-3 rounded-xl bg-brand-beige/40 border border-brand-gold/30 focus:border-brand-gold focus:outline-none text-xs text-brand-forest"
                />
                {errors.country && <p id="err-country" role="alert" className="text-[11px] text-red-700 mt-1">{errors.country}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="shipping-phone" className="block text-xs font-semibold text-brand-olive uppercase tracking-wider mb-1">
                  Phone Number (for delivery notifications) *
                </label>
                <input
                  id="shipping-phone"
                  type="tel"
                  value={address.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "err-phone" : undefined}
                  className="w-full px-4 py-3 rounded-xl bg-brand-beige/40 border border-brand-gold/30 focus:border-brand-gold focus:outline-none text-xs text-brand-forest"
                />
                {errors.phone && <p id="err-phone" role="alert" className="text-[11px] text-red-700 mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-xl bg-brand-forest text-brand-ivory font-semibold text-xs uppercase tracking-widest hover:bg-brand-olive transition-colors shadow-md"
          >
            Continue to Order Review &rarr;
          </button>
        </form>
      ) : (
        /* STEP 2: ORDER REVIEW & PAYMENT TRIGGER */
        <div className="space-y-6">
          <div className="bg-brand-beige/60 border border-brand-gold/20 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-brand-gold/15 pb-3">
              <h3 className="font-serif text-lg font-semibold text-brand-forest">
                Delivery & Contact Summary
              </h3>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-brand-gold hover:text-brand-forest underline underline-offset-4"
              >
                Edit Details
              </button>
            </div>

            <div className="text-xs text-brand-olive space-y-1 leading-relaxed">
              <p className="font-semibold text-brand-forest">{address.fullName}</p>
              <p>{contactEmail} &bull; {address.phone}</p>
              <p>{address.addressLine1} {address.addressLine2 ? `, ${address.addressLine2}` : ""}</p>
              <p>{address.city}, {address.state} {address.postalCode}, {address.country}</p>
            </div>
          </div>

          {/* Payment Handoff Container */}
          <div className="bg-brand-beige/60 border border-brand-gold/20 rounded-2xl p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold text-brand-forest">
              Payment Gateway Handoff
            </h3>
            <p className="text-xs text-brand-olive leading-relaxed">
              Your order session will be initialized securely with provider-neutral encryption. Stock is validated against database values before creation.
            </p>

            <button
              onClick={handleSubmitCheckout}
              disabled={isPending}
              className="w-full py-4 px-6 rounded-xl bg-brand-gold text-brand-charcoal font-semibold text-xs uppercase tracking-widest hover:bg-brand-gold/90 transition-all shadow-md flex items-center justify-center space-x-2 border border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-forest disabled:opacity-50"
            >
              {isPending ? (
                <span>Initializing Secure Payment...</span>
              ) : (
                <span>Authorize & Complete Purchase &rarr;</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
