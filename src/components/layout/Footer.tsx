import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-brand-forest text-brand-ivory font-sans border-t border-brand-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b border-brand-gold/20">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-flex items-center gap-4 group focus:outline-none">
              <Image
                src="/brand/two-valley-logo.png"
                alt="Two Valley — Pure Natural Finest"
                width={96}
                height={96}
                className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 object-contain rounded-full border border-brand-gold/40 p-1 bg-brand-ivory/10 transition-transform duration-300 group-hover:scale-105 shadow-lg"
              />
              <div className="flex flex-col">
                <span className="font-serif text-3xl sm:text-4xl tracking-wider text-brand-gold font-bold leading-none">
                  TWO VALLEY
                </span>
                <span className="block font-sans text-xs sm:text-sm tracking-[0.25em] uppercase text-brand-ivory/90 font-bold mt-1.5">
                  Pure • Natural • Finest
                </span>
              </div>
            </Link>
            <p className="text-base text-brand-ivory/90 leading-relaxed max-w-sm">
              Connecting high-altitude botanical perfume fields and mountain tea gardens. Handcrafted in small batches for serene sensory living.
            </p>
            <div className="pt-1 text-sm text-brand-gold font-mono">
              &copy; {new Date().getFullYear()} Two Valley Botanicals Inc.
            </div>
          </div>

          {/* Col 1: Catalog */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold tracking-wider text-brand-gold uppercase">
              Collections
            </h3>
            <ul className="space-y-3 text-base text-brand-ivory/90">
              <li>
                <Link href="/perfumes" className="hover:text-brand-gold transition-colors">
                  Artisanal Perfumes
                </Link>
              </li>
              <li>
                <Link href="/teas" className="hover:text-brand-gold transition-colors">
                  Single-Estate Teas
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-brand-gold transition-colors">
                  Discovery Sets
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-brand-gold transition-colors">
                  Seasonal Flushes
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: About & Account */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold tracking-wider text-brand-gold uppercase">
              Our House
            </h3>
            <ul className="space-y-3 text-base text-brand-ivory/90">
              <li>
                <Link href="/story" className="hover:text-brand-gold transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/story" className="hover:text-brand-gold transition-colors">
                  Sourcing Philosophy
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-brand-gold transition-colors font-medium text-brand-gold">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-brand-gold transition-colors">
                  My Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Assistance & Admin Access */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold tracking-wider text-brand-gold uppercase">
              Assistance
            </h3>
            <ul className="space-y-3 text-base text-brand-ivory/90">
              <li>
                <Link href="/story" className="hover:text-brand-gold transition-colors">
                  Steeping & Scent Guide
                </Link>
              </li>
              <li>
                <Link href="/story" className="hover:text-brand-gold transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-brand-gold transition-colors text-brand-ivory/60 text-xs">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-brand-ivory/80 space-y-4 sm:space-y-0">
          <div>
            100% Certified Organic & Direct Trade Sourced.
          </div>
          <div className="flex space-x-6">
            <span>Instagram</span>
            <span>Editorial</span>
            <span>Journal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
