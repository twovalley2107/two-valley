"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/actions/authActions";

interface NavItem {
  label: string;
  href: string;
  iconPath: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    iconPath:
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    label: "Products",
    href: "/admin/products",
    iconPath:
      "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    iconPath:
      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    label: "Orders",
    href: "/admin/orders",
    iconPath:
      "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    label: "Customers",
    href: "/admin/customers",
    iconPath:
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    label: "Reviews",
    href: "/admin/reviews",
    iconPath:
      "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    iconPath:
      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string): boolean => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push("/admin/login");
    router.refresh();
  };

  const NavList = () => (
    <nav aria-label="Admin navigation" className="flex-1">
      <ul className="flex flex-col gap-1 mt-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-sans
                  transition-colors duration-150
                  ${
                    active
                      ? "text-brand-gold bg-brand-gold/10 border-l-2 border-brand-gold font-semibold pl-[14px]"
                      : "text-brand-ivory/70 hover:text-brand-ivory hover:bg-brand-ivory/5 border-l-2 border-transparent"
                  }
                `}
              >
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                </svg>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}

        <li>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-sans text-red-300 hover:text-red-100 hover:bg-red-950/40 border-l-2 border-transparent transition-colors duration-150 text-left mt-2"
          >
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR (lg+) ─────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:sticky lg:top-0 bg-brand-forest border-r border-brand-gold/10 px-4 py-6 flex-shrink-0 text-brand-ivory shadow-xl"
        aria-label="Admin sidebar"
      >
        {/* Brand wordmark */}
        <div className="px-2 mb-6 flex items-center gap-3">
          <Image
            src="/brand/two-valley-logo.png"
            alt="Two Valley — Pure Natural Finest"
            width={40}
            height={40}
            className="h-10 w-10 object-contain rounded-full bg-brand-ivory/10 p-0.5 border border-brand-gold/30 flex-shrink-0"
          />
          <div>
            <span className="font-serif text-base tracking-wide text-brand-gold leading-tight block">
              Two Valley
            </span>
            <span className="text-[10px] text-brand-ivory/50 font-sans tracking-wider block uppercase">
              Management Portal
            </span>
          </div>
        </div>

        <NavList />

        {/* Admin identity footer */}
        <div className="mt-auto pt-4 border-t border-brand-gold/10 px-2">
          <p className="text-[10px] uppercase tracking-wider text-brand-gold/70 font-sans">
            Signed in as
          </p>
          <p className="text-xs text-brand-ivory/80 font-sans truncate mt-0.5 font-medium" title={adminName}>
            {adminName}
          </p>
        </div>
      </aside>

      {/* ── MOBILE TOPBAR (< lg) ─────────────────────────────────────────── */}
      <div className="lg:hidden sticky top-0 z-30 bg-brand-charcoal/95 backdrop-blur-md border-b border-brand-gold/20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/two-valley-logo.png"
              alt="Two Valley — Pure Natural Finest"
              width={32}
              height={32}
              className="h-8 w-8 object-contain rounded-full border border-brand-gold/30 p-0.5 bg-brand-ivory/10"
            />
            <span className="font-serif text-base text-brand-gold">Two Valley Admin</span>
          </div>

          {/* Hamburger button */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-admin-nav"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="p-2 rounded-lg text-brand-ivory/60 hover:text-brand-ivory hover:bg-brand-ivory/5 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown nav */}
        {mobileOpen && (
          <div
            id="mobile-admin-nav"
            className="border-t border-brand-gold/10 bg-brand-forest px-4 pb-4 shadow-2xl"
          >
            <NavList />
          </div>
        )}
      </div>
    </>
  );
}
