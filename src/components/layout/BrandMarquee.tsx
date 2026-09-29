export function BrandMarquee() {
  const items = [
    "PURE BOTANICAL EXTRACTION",
    "SINGLE-ESTATE TEAS",
    "ARTISANAL SMALL BATCH",
    "100% ORGANIC HARVEST",
    "DIRECT TRADE SOURCING",
    "SENSORY RITUAL LIVING",
  ];

  return (
    <div className="w-full bg-brand-beige/80 border-b border-brand-gold/25 py-4 overflow-hidden select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        {/* First Loop */}
        <div className="flex items-center space-x-8 sm:space-x-12 shrink-0">
          {items.map((item, idx) => (
            <div key={`m1-${idx}`} className="flex items-center space-x-8 sm:space-x-12">
              <span className="font-sans text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase text-brand-forest">
                {item}
              </span>
              <span className="text-brand-gold text-xs font-serif font-bold">✦</span>
            </div>
          ))}
        </div>

        {/* Second Loop for seamless continuous scroll */}
        <div className="flex items-center space-x-8 sm:space-x-12 shrink-0" aria-hidden="true">
          {items.map((item, idx) => (
            <div key={`m2-${idx}`} className="flex items-center space-x-8 sm:space-x-12">
              <span className="font-sans text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase text-brand-forest">
                {item}
              </span>
              <span className="text-brand-gold text-xs font-serif font-bold">✦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
