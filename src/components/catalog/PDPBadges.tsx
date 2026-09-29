interface PDPBadgesProps {
  mood?: string | null;
  occasion?: string | null;
  useCase?: string | null;
  pairingTags?: string | null;
}

export function PDPBadges({ mood, occasion, useCase, pairingTags }: PDPBadgesProps) {
  const hasBadges = Boolean(mood || occasion || useCase || pairingTags);

  if (!hasBadges) return null;

  return (
    <div className="space-y-3 font-sans pt-4 border-t border-brand-gold/15">
      <div className="text-[10px] uppercase font-bold tracking-widest text-brand-olive">
        Contextual Attributes & Pairing
      </div>

      <div className="flex flex-wrap gap-2">
        {mood && (
          <div className="flex items-center space-x-1.5 bg-brand-beige border border-brand-gold/25 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-brand-gold font-bold">Vibe:</span>
            <span className="font-medium text-brand-forest">{mood}</span>
          </div>
        )}

        {occasion && (
          <div className="flex items-center space-x-1.5 bg-brand-beige border border-brand-gold/25 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-brand-gold font-bold">Occasion:</span>
            <span className="font-medium text-brand-forest">{occasion}</span>
          </div>
        )}

        {useCase && (
          <div className="flex items-center space-x-1.5 bg-brand-beige border border-brand-gold/25 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-brand-gold font-bold">Use Case:</span>
            <span className="font-medium text-brand-forest">{useCase}</span>
          </div>
        )}

        {pairingTags && (
          <div className="flex items-center space-x-1.5 bg-brand-beige border border-brand-gold/25 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-brand-gold font-bold">Pairs With:</span>
            <span className="font-medium text-brand-forest">{pairingTags}</span>
          </div>
        )}
      </div>
    </div>
  );
}
