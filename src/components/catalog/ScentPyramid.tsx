import { SensoryAttribute } from "@prisma/client";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface ScentPyramidProps {
  sensoryAttributes: SensoryAttribute[];
  fragranceFamily?: string | null;
}

export function ScentPyramid({ sensoryAttributes, fragranceFamily }: ScentPyramidProps) {
  const topNotes = sensoryAttributes.filter(
    (a) => a.attributeType === "TOP_NOTE"
  );
  const heartNotes = sensoryAttributes.filter(
    (a) => a.attributeType === "HEART_NOTE" || a.attributeType === "MIDDLE_NOTE"
  );
  const baseNotes = sensoryAttributes.filter(
    (a) => a.attributeType === "BASE_NOTE"
  );

  const hasNotes = topNotes.length > 0 || heartNotes.length > 0 || baseNotes.length > 0;

  if (!hasNotes && !fragranceFamily) return null;

  return (
    <ScrollReveal>
      <div className="bg-brand-beige/50 border border-brand-gold/20 rounded-2xl p-6 space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-brand-gold/15 pb-3">
        <h3 className="font-serif text-lg font-semibold text-brand-forest">
          Olfactory Fragrance Pyramid
        </h3>
        {fragranceFamily && (
          <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-brand-forest bg-brand-ivory border border-brand-gold/30 px-2.5 py-1 rounded-full">
            {fragranceFamily}
          </span>
        )}
      </div>

      {/* Visual Pyramid Tiers */}
      <div className="space-y-4">
        {/* Top Tier: Top Notes */}
        {topNotes.length > 0 && (
          <div className="bg-brand-ivory/80 p-4 rounded-xl border border-brand-gold/15 space-y-1.5 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-gold" />
              <span className="font-serif text-xs font-semibold uppercase tracking-wider text-brand-forest">
                Top Notes (Head)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {topNotes.map((note) => (
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

        {/* Heart Tier: Heart Notes */}
        {heartNotes.length > 0 && (
          <div className="bg-brand-ivory/80 p-4 rounded-xl border border-brand-gold/15 space-y-1.5 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-olive" />
              <span className="font-serif text-xs font-semibold uppercase tracking-wider text-brand-forest">
                Heart Notes (Heart)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {heartNotes.map((note) => (
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

        {/* Base Tier: Base Notes */}
        {baseNotes.length > 0 && (
          <div className="bg-brand-ivory/80 p-4 rounded-xl border border-brand-gold/15 space-y-1.5 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-forest" />
              <span className="font-serif text-xs font-semibold uppercase tracking-wider text-brand-forest">
                Base Notes (Dry Down)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {baseNotes.map((note) => (
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
      </div>
    </div>
  </ScrollReveal>
);
}
