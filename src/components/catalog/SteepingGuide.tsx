import { SensoryAttribute } from "@prisma/client";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface SteepingGuideProps {
  steepingGuide?: string | null;
  origin?: string | null;
  caffeineLevel?: string | null;
  teaType?: string | null;
  sensoryAttributes?: SensoryAttribute[];
}

export function SteepingGuide({
  steepingGuide,
  origin,
  caffeineLevel,
  teaType,
  sensoryAttributes = [],
}: SteepingGuideProps) {
  const flavourNotes = sensoryAttributes.filter(
    (a) => a.attributeType === "FLAVOUR_NOTE" || a.attributeType === "TEA_NOTE"
  );

  // Parse caffeine strength meter level (0 to 100)
  const getCaffeineMeterWidth = (level?: string | null) => {
    if (!level) return "50%";
    const lower = level.toLowerCase();
    if (lower.includes("high")) return "85%";
    if (lower.includes("medium")) return "60%";
    if (lower.includes("low")) return "30%";
    if (lower.includes("free") || lower.includes("none")) return "5%";
    return "50%";
  };

  return (
    <ScrollReveal>
      <div className="bg-brand-beige/50 border border-brand-gold/20 rounded-2xl p-6 space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-brand-gold/15 pb-3">
        <h3 className="font-serif text-lg font-semibold text-brand-forest">
          Steeping & Origin Profile
        </h3>
        {teaType && (
          <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-brand-forest bg-brand-ivory border border-brand-gold/30 px-2.5 py-1 rounded-full">
            {teaType}
          </span>
        )}
      </div>

      {/* 4 Iconography Metric Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Metric 1: Water Temp */}
        <div className="bg-brand-ivory/80 p-4 rounded-xl border border-brand-gold/15 flex items-center space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-brand-beige flex items-center justify-center text-brand-forest flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-brand-olive">Water Temp</div>
            <div className="font-serif text-sm font-semibold text-brand-forest">90°C / 195°F</div>
          </div>
        </div>

        {/* Metric 2: Steep Time */}
        <div className="bg-brand-ivory/80 p-4 rounded-xl border border-brand-gold/15 flex items-center space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-brand-beige flex items-center justify-center text-brand-forest flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-brand-olive">Steep Time</div>
            <div className="font-serif text-sm font-semibold text-brand-forest">3 &ndash; 4 Mins</div>
          </div>
        </div>

        {/* Metric 3: Origin Estate */}
        <div className="bg-brand-ivory/80 p-4 rounded-xl border border-brand-gold/15 flex items-center space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-brand-beige flex items-center justify-center text-brand-forest flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-brand-olive">Origin Estate</div>
            <div className="font-serif text-sm font-semibold text-brand-forest truncate">{origin || "Single Estate"}</div>
          </div>
        </div>

        {/* Metric 4: Caffeine Level Meter */}
        <div className="bg-brand-ivory/80 p-4 rounded-xl border border-brand-gold/15 flex items-center space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-brand-beige flex items-center justify-center text-brand-forest flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
          <div className="w-full">
            <div className="text-[10px] uppercase font-bold tracking-wider text-brand-olive flex justify-between">
              <span>Caffeine</span>
              <span className="font-semibold text-brand-forest">{caffeineLevel || "Medium"}</span>
            </div>
            <div className="w-full h-1.5 bg-brand-beige rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-brand-gold rounded-full transition-all duration-500"
                style={{ width: getCaffeineMeterWidth(caffeineLevel) }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Flavour Notes List if available */}
      {flavourNotes.length > 0 && (
        <div className="bg-brand-ivory/80 p-4 rounded-xl border border-brand-gold/15 space-y-2">
          <div className="text-[10px] uppercase font-bold tracking-wider text-brand-olive">Flavour Notes</div>
          <div className="flex flex-wrap gap-1.5">
            {flavourNotes.map((note) => (
              <span
                key={note.id}
                className="font-sans text-xs font-medium text-brand-forest bg-brand-beige px-3 py-1 rounded-md border border-brand-gold/20"
              >
                {note.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Steeping Narrative */}
      {steepingGuide && (
        <p className="text-xs text-brand-olive leading-relaxed bg-brand-ivory/40 p-3.5 rounded-xl border border-brand-gold/10 italic">
          &ldquo;{steepingGuide}&rdquo;
        </p>
      )}
    </div>
  </ScrollReveal>
);
}
