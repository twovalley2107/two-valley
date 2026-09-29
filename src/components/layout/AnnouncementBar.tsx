import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="bg-brand-forest text-brand-ivory text-[11px] sm:text-xs font-sans tracking-[0.18em] font-semibold py-2.5 px-4 text-center border-b border-brand-gold/20 flex items-center justify-center gap-3">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
      <span className="uppercase text-brand-gold/90">
        Complimentary Delivery &amp; Express Dispatch on Orders Above ₹3000
      </span>
      <span className="hidden md:inline text-brand-ivory/40">|</span>
      <Link
        href="/collections"
        className="hidden md:inline text-brand-ivory hover:text-brand-gold transition-colors underline underline-offset-4 uppercase font-semibold text-[10px] tracking-[0.2em]"
      >
        Shop New Harvest
      </Link>
    </div>
  );
}
