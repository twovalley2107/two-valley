"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SearchModal } from "./SearchModal";
import { CartSlideOver } from "@/components/cart/CartSlideOver";
import { getWishlistCount } from "@/actions/wishlistActions";
import { useCartStore } from "@/lib/store/cartStore";
import { createClient } from "@/lib/supabase/client";

import { getCurrentUserRoleAction } from "@/actions/authActions";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const getCartCount = useCartStore((state) => state.getCartCount);
  const openCart = useCartStore((state) => state.openCart);

  useEffect(() => {
    setIsMounted(true);

    async function checkRole() {
      const res = await getCurrentUserRoleAction();
      if (res.success && res.data) {
        setIsCustomer(res.data.isCustomer);
        setIsAdmin(res.data.isAdmin);
      } else {
        setIsCustomer(false);
        setIsAdmin(false);
      }
    }

    checkRole();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkRole();
    });

    getWishlistCount().then((res) => {
      if (res?.success && typeof res.data === "number") {
        setWishlistCount(res.data);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  const cartCount = isMounted ? getCartCount() : 0;

  return (
    <>
      <header className="sticky top-0 z-40 bg-brand-ivory/95 backdrop-blur-md border-b border-brand-gold/25 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">

          {/* LEFT SECTION: Official Logo + Desktop Navigation Links */}
          <div className="flex items-center space-x-4 lg:space-x-10 min-w-0">
            {/* Official Two Valley Logo (Positioned on the Left) */}
            <Link
              href="/"
              className="group flex items-center gap-2.5 sm:gap-3 focus:outline-none shrink-0"
              title="Two Valley Homepage"
            >
              <Image
                src="/brand/two-valley-logo.png"
                alt="Two Valley — Pure Natural Finest"
                width={56}
                height={56}
                className="h-11 w-11 sm:h-14 sm:w-14 object-contain rounded-full border border-brand-gold/30 p-0.5 bg-brand-ivory shadow-sm transition-transform duration-300 group-hover:scale-105"
                priority
              />
              <div className="flex flex-col text-left min-w-0">
                <span className="font-serif text-lg sm:text-2xl font-bold tracking-[0.06em] text-brand-forest group-hover:text-brand-gold transition-colors duration-300 leading-none truncate">
                  TWO VALLEY
                </span>
                <span className="hidden sm:block font-sans text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-brand-olive font-bold mt-1">
                  Pure • Natural • Finest
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Immediately after logo) */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 font-sans text-sm uppercase tracking-[0.12em] font-semibold text-brand-forest">
              <Link
                href="/"
                className="hover:text-brand-gold transition-colors duration-200 py-1"
              >
                Home
              </Link>
              <Link
                href="/perfumes"
                className="hover:text-brand-gold transition-colors duration-200 py-1"
              >
                Perfumes
              </Link>
              <Link
                href="/teas"
                className="hover:text-brand-gold transition-colors duration-200 py-1"
              >
                Teas
              </Link>
              <Link
                href="/collections"
                className="hover:text-brand-gold transition-colors duration-200 py-1"
              >
                Collections
              </Link>
              <Link
                href="/story"
                className="hover:text-brand-gold transition-colors duration-200 py-1"
              >
                Our Story
              </Link>
            </nav>
          </div>

          {/* RIGHT SECTION: Search, Account, Wishlist, Cart & Mobile Menu Button */}
          <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
            {/* Search Trigger Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              aria-label="Search catalog"
              className="flex items-center space-x-1 text-brand-forest hover:text-brand-gold transition-colors p-1.5 sm:p-2 focus:outline-none focus:ring-1 focus:ring-brand-gold rounded-full"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="hidden xl:inline text-xs font-semibold uppercase tracking-wider">Search</span>
            </button>

            {/* Account Link (Login, Account, or Admin Portal) */}
            <Link
              href={isCustomer ? "/account" : isAdmin ? "/admin" : "/login"}
              aria-label={isCustomer ? "Customer Account" : isAdmin ? "Admin Portal" : "Sign In to Account"}
              className="flex items-center space-x-1 text-brand-forest hover:text-brand-gold transition-colors p-1.5 sm:p-2 focus:outline-none focus:ring-1 focus:ring-brand-gold rounded-full"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="hidden xl:inline text-xs font-semibold uppercase tracking-wider">
                {isCustomer ? "Account" : isAdmin ? "Admin Portal" : "Sign In"}
              </span>
            </Link>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              aria-label={`Wishlist with ${wishlistCount} items`}
              className="relative flex items-center space-x-1 text-brand-forest hover:text-brand-gold transition-colors p-1.5 sm:p-2 focus:outline-none focus:ring-1 focus:ring-brand-gold rounded-full"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-gold text-brand-charcoal font-sans text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={openCart}
              aria-label={`Shopping Cart with ${cartCount} items`}
              className="relative bg-brand-forest text-brand-ivory hover:bg-brand-olive transition-colors py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-xl flex items-center space-x-1.5 sm:space-x-2 text-xs font-semibold tracking-wider uppercase shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-brand-gold text-brand-charcoal font-sans text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              className="p-1.5 sm:p-2 text-brand-forest hover:text-brand-gold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold rounded-lg lg:hidden"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation Menu */}
        {mobileMenuOpen && (
          <nav
            id="mobile-navigation-menu"
            aria-label="Mobile Navigation"
            className="lg:hidden bg-brand-ivory border-b border-brand-gold/20 px-4 pt-4 pb-6 space-y-2 font-sans text-xs uppercase tracking-widest font-medium text-brand-charcoal animate-fadeIn"
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg hover:bg-brand-beige transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              Home
            </Link>
            <Link
              href="/perfumes"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg hover:bg-brand-beige transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              Artisanal Perfumes
            </Link>
            <Link
              href="/teas"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg hover:bg-brand-beige transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              Single-Estate Teas
            </Link>
            <Link
              href="/collections"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg hover:bg-brand-beige transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              Curated Collections
            </Link>
            <Link
              href="/story"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg hover:bg-brand-beige transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              Our Story & Philosophy
            </Link>
            <div className="pt-2 border-t border-brand-gold/15 flex flex-col gap-2">
              <Link
                href={isCustomer ? "/account" : isAdmin ? "/admin" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-lg bg-brand-forest text-brand-ivory font-semibold text-center focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                {isCustomer ? "My Account" : isAdmin ? "Admin Dashboard" : "Sign In to Account"}
              </Link>
              {!isCustomer && !isAdmin && (
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-lg border border-brand-forest text-brand-forest font-semibold text-center hover:bg-brand-beige transition-colors"
                >
                  Create Account
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Instant Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Slide-Over Cart Panel */}
      <CartSlideOver />
    </>
  );
}
