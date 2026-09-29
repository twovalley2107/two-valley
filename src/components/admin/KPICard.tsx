export interface KPICardProps {
  /** Short label shown below the value, e.g. "Today's Orders" */
  label: string;
  /** Pre-formatted display value, e.g. "12" or "$4,820.00" */
  value: string;
  /** Optional supporting text shown below the label */
  subtitle?: string;
  /**
   * When true, renders an amber/warning accent instead of the standard gold.
   * Use for low-stock counts, pending items, or out-of-stock alerts.
   */
  alert?: boolean;
}

/**
 * KPICard — Pure display Server Component for admin dashboard metrics.
 * Accepts no interactive props and requires no client-side JavaScript.
 * Receives pre-formatted string values only — no Decimal or numeric math here.
 */
export function KPICard({ label, value, subtitle, alert = false }: KPICardProps) {
  return (
    <div
      className={`
        relative rounded-2xl p-6 flex flex-col gap-2
        bg-brand-charcoal/50 border
        transition-all duration-200
        ${alert
          ? "border-amber-500/40 hover:border-amber-500/60"
          : "border-brand-gold/20 hover:border-brand-gold/40"
        }
      `}
    >
      {/* Alert indicator dot */}
      {alert && (
        <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-amber-400" />
      )}

      {/* Primary value */}
      <p
        className={`text-3xl font-serif tracking-tight leading-none ${
          alert ? "text-amber-400" : "text-brand-gold"
        }`}
      >
        {value}
      </p>

      {/* Label */}
      <p className="text-sm font-sans text-brand-ivory/70 leading-snug">{label}</p>

      {/* Optional subtitle / context */}
      {subtitle && (
        <p className="text-xs font-sans text-brand-ivory/40 leading-snug">{subtitle}</p>
      )}
    </div>
  );
}
