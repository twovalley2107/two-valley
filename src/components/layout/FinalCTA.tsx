import Link from "next/link";
import Image from "next/image";

export function FinalCTA() {
  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-brand-forest text-brand-ivory overflow-hidden border-t border-brand-gold/25">
      {/* Background Decorative Graphic */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=2000&auto=format&fit=crop"
          alt="Two Valley Sourcing Landscape"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-gold/20 border border-brand-gold/40">
          <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
          <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-brand-gold">
            Serene Botanical Living
          </span>
        </div>

        <h2 className="font-serif text-4xl sm:text-6xl font-bold text-brand-gold tracking-tight leading-tight">
          Find Your Botanical Ritual
        </h2>

        <p className="font-sans text-base sm:text-xl text-brand-ivory/85 max-w-2xl mx-auto leading-relaxed">
          Experience handcrafted extraits de parfum and rare single-estate tea flushes harvested from pristine mountain valleys. Complimentary worldwide delivery on all curated collections.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4 font-sans">
          <Link
            href="/perfumes"
            className="w-full sm:w-auto px-9 py-4.5 rounded-xl bg-brand-gold text-brand-charcoal hover:bg-brand-gold/90 font-semibold text-xs sm:text-sm uppercase tracking-widest shadow-2xl hover:shadow-brand-gold/20 transition-all duration-200 text-center"
          >
            Explore Perfumes
          </Link>
          <Link
            href="/teas"
            className="w-full sm:w-auto px-9 py-4.5 rounded-xl border-2 border-brand-ivory text-brand-ivory hover:bg-brand-ivory hover:text-brand-forest font-semibold text-xs sm:text-sm uppercase tracking-widest transition-all duration-200 text-center"
          >
            Discover Teas
          </Link>
        </div>
      </div>
    </section>
  );
}
