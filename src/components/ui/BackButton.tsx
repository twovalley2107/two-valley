"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

interface BackButtonProps {
  fallbackHref: string;
  label: string;
  variant?: "customer" | "admin";
  className?: string;
}

export function BackButton({
  fallbackHref,
  label,
  variant = "customer",
  className = "",
}: BackButtonProps) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        if (
          referrerUrl.origin === window.location.origin &&
          referrerUrl.pathname !== window.location.pathname
        ) {
          setCanGoBack(true);
        }
      } catch {
        setCanGoBack(false);
      }
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (canGoBack) {
      e.preventDefault();
      router.back();
    }
  };

  const variantStyles =
    variant === "admin"
      ? "text-brand-gold hover:text-brand-ivory hover:bg-brand-gold/10 border border-brand-gold/20"
      : "text-brand-forest hover:text-brand-gold hover:bg-brand-beige/60 border border-brand-gold/20";

  return (
    <Link
      href={fallbackHref}
      onClick={handleClick}
      className={`inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors py-2 px-3.5 rounded-xl min-h-[44px] shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-gold ${variantStyles} ${className}`}
    >
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span>{label}</span>
    </Link>
  );
}
