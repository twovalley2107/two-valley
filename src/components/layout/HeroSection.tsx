import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-ivory py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-gold/20">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-beige/70 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-brand-gold/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        {/* Main Content Area */}
        <div className="lg:col-span-7 space-y-7 text-center lg:text-left flex flex-col justify-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-beige border border-brand-gold/35 mx-auto lg:mx-0 w-fit">
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
            <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-brand-forest">
              Highland Botanicals & Single-Estate Teas
            </span>
          </div>

          {/* Hero H1 Heading */}
          <h1 className="font-serif text-[38px] sm:text-5xl lg:text-7xl font-bold text-brand-forest leading-[1.12] tracking-tight">
            Botanical Elegance <br className="hidden sm:inline" />
            <span className="text-brand-olive italic font-normal">Meets High-Altitude</span> Purity
          </h1>

          {/* Hero Supporting Description */}
          <p className="font-sans text-base sm:text-lg lg:text-xl text-brand-olive max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Handcrafted extrait de parfum and single-estate mountain teas, harvested from pristine valleys and blended for serene sensory living.
          </p>

          {/* Dual Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 font-sans">
            <Link
              href="/perfumes"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-gold text-brand-charcoal hover:bg-brand-gold/90 font-semibold text-xs sm:text-sm uppercase tracking-widest shadow-md hover:shadow-lg transition-all duration-200 text-center"
            >
              Explore Perfumes
            </Link>
            <Link
              href="/teas"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-brand-forest text-brand-forest hover:bg-brand-forest hover:text-brand-ivory font-semibold text-xs sm:text-sm uppercase tracking-widest transition-all duration-200 text-center"
            >
              Discover Teas
            </Link>
          </div>

          {/* Mobile-Only Showcase */}
          <div className="block lg:hidden my-6">
            <div className="relative mx-auto max-w-sm sm:max-w-md aspect-square rounded-3xl overflow-hidden border border-brand-gold/30 shadow-xl bg-brand-beige">
              <Image
                src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800"
                alt="Two Valley Botanical Collection"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Subtle Brand Pillars Checklist (Metrics) */}
          <div className="pt-6 border-t border-brand-gold/20 grid grid-cols-3 gap-4 text-center lg:text-left font-sans text-xs text-brand-olive">
            <div>
              <div className="font-serif text-xl sm:text-2xl text-brand-forest font-semibold">100%</div>
              <div className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold mt-0.5">Organic Extraction</div>
            </div>
            <div>
              <div className="font-serif text-xl sm:text-2xl text-brand-forest font-semibold">Single-Estate</div>
              <div className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold mt-0.5">Mountain Harvest</div>
            </div>
            <div>
              <div className="font-serif text-xl sm:text-2xl text-brand-forest font-semibold">Artisanal</div>
              <div className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold mt-0.5">Small Batch Craft</div>
            </div>
          </div>
        </div>

        {/* Desktop Product Showcase Frame */}
        <div className="hidden lg:block lg:col-span-5 relative">
          <div className="relative mx-auto max-w-md lg:max-w-none aspect-square rounded-3xl overflow-hidden border border-brand-gold/30 shadow-2xl bg-brand-beige">
            <Image
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800"
              alt="Two Valley Botanical Collection"
              fill
              priority
              sizes="500px"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
