import Link from "next/link";
import Image from "next/image";

export function SensoryRituals() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-ivory border-b border-brand-gold/20">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="font-sans text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-brand-gold">
            The Philosophy of Dual Living
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-brand-forest">
            Two Rituals. One Philosophy.
          </h2>
          <p className="font-sans text-base sm:text-lg text-brand-olive leading-relaxed">
            In our high-altitude valley sanctuaries, aroma and taste are inseparable pillars of sensory wellbeing. Discover how our extraits de parfum and single-estate teas align to transform daily moments into serene mindfulness.
          </p>
        </div>

        {/* 2 Major Ritual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Card 1: The Scent Ritual */}
          <div className="group relative bg-brand-beige/70 rounded-3xl p-8 sm:p-10 border border-brand-gold/30 shadow-lg flex flex-col justify-between overflow-hidden">
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-8 shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop"
                alt="High-Altitude Botanical Extrait de Parfum"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/60 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 bg-brand-gold text-brand-charcoal font-sans text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                Scent Ritual
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-forest">
                Grounding Extrait De Parfum
              </h3>
              <p className="font-sans text-base text-brand-olive leading-relaxed">
                Concentrated botanical extraits distilled from wild mountain blossoms and aged Himalayan cedar. Applied to pulse points to anchor focus and evoke serene natural presence throughout the day.
              </p>
              <div className="pt-4">
                <Link
                  href="/perfumes"
                  className="inline-flex items-center space-x-2 font-sans text-xs sm:text-sm font-semibold uppercase tracking-widest text-brand-forest group-hover:text-brand-gold transition-colors underline underline-offset-4"
                >
                  <span>Explore Extrait Collection</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: The Infusion Ritual */}
          <div className="group relative bg-brand-beige/70 rounded-3xl p-8 sm:p-10 border border-brand-gold/30 shadow-lg flex flex-col justify-between overflow-hidden">
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-8 shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1200&auto=format&fit=crop"
                alt="Single-Estate High-Altitude Mountain Tea"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/60 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 bg-brand-gold text-brand-charcoal font-sans text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                Tea Ritual
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-forest">
                Meditative Single-Estate Infusions
              </h3>
              <p className="font-sans text-base text-brand-olive leading-relaxed">
                Hand-rolled whole leaf tea flushes plucked at dawn from 6,000-foot estates. Steeped in pure mountain spring water to deliver profound clarity, antioxidant warmth, and refined floral taste.
              </p>
              <div className="pt-4">
                <Link
                  href="/teas"
                  className="inline-flex items-center space-x-2 font-sans text-xs sm:text-sm font-semibold uppercase tracking-widest text-brand-forest group-hover:text-brand-gold transition-colors underline underline-offset-4"
                >
                  <span>Discover Single-Estate Flushes</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
