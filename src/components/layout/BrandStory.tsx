import Image from "next/image";

export function BrandStory() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-beige/50 border-y border-brand-gold/15">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Narrative Banner Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="font-sans text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-brand-gold">
              Our Sourcing Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-forest leading-tight">
              Crafted by Altitude, <br />
              <span className="text-brand-olive italic font-normal">Guided by Nature</span>
            </h2>
            <p className="font-sans text-base sm:text-lg text-brand-olive leading-relaxed">
              Two Valley was born at the convergence of two pristine mountain landscapes: high-altitude floral fields where rare botanicals yield volatile aromatic essences, and mist-veiled tea estates producing hand-rolled whole leaf flushes.
            </p>
            <p className="font-sans text-base text-brand-olive/90 leading-relaxed">
              We eliminate synthetic extenders, artificial colorants, and mass-market processing. Every bottle of extrait de parfum is aged in small wooden vats, and every batch of tea is direct-harvested during peak seasonal flushes.
            </p>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-brand-gold/20">
              <Image
                src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1000&auto=format&fit=crop"
                alt="High-Altitude Tea Estate & Botanical Garden"
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* 3 Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="bg-brand-ivory p-8 rounded-2xl border border-brand-gold/15 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-brand-beige flex items-center justify-center text-brand-forest font-serif text-xl font-bold border border-brand-gold/20">
              I
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-brand-forest">
              Pure Steam Distillation
            </h3>
            <p className="font-sans text-sm sm:text-base text-brand-olive leading-relaxed">
              Our floral essences are extracted using low-temperature copper alembic steam distillation, preserving fragile top notes and natural aromatic complexities.
            </p>
          </div>

          <div className="bg-brand-ivory p-8 rounded-2xl border border-brand-gold/15 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-brand-beige flex items-center justify-center text-brand-forest font-serif text-xl font-bold border border-brand-gold/20">
              II
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-brand-forest">
              Single-Estate Terroir
            </h3>
            <p className="font-sans text-sm sm:text-base text-brand-olive leading-relaxed">
              Harvested exclusively from micro-lots in Darjeeling, Assam, and high mountain valleys. Unblended, single-origin leaves celebrated for rich terroir nuance.
            </p>
          </div>

          <div className="bg-brand-ivory p-8 rounded-2xl border border-brand-gold/15 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-brand-beige flex items-center justify-center text-brand-forest font-serif text-xl font-bold border border-brand-gold/20">
              III
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-brand-forest">
              Sensory Alignment
            </h3>
            <p className="font-sans text-sm sm:text-base text-brand-olive leading-relaxed">
              Designed as complementary rituals — pairing grounding woody fragrances with warming spiced chais or crisp floral extraits with meditative green teas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
