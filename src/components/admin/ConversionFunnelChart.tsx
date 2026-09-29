"use client";

import { EventCountFunnelStage } from "@/actions/analyticsActions";

interface ConversionFunnelChartProps {
  stages: EventCountFunnelStage[];
}

export function ConversionFunnelChart({ stages }: ConversionFunnelChartProps) {
  const maxCount = stages.length > 0 ? Math.max(...stages.map((s) => s.count), 1) : 1;

  return (
    <div className="bg-brand-charcoal border border-brand-gold/10 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-base text-brand-gold">Event-Count Conversion Funnel</h3>
          <p className="text-[11px] text-brand-ivory/50 font-sans mt-0.5">
            Aggregated telemetry event occurrences across storefront interactions.
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {stages.map((stage) => {
          const widthPercent = Math.max(5, Math.min(100, (stage.count / maxCount) * 100));

          return (
            <div key={stage.stageNumber} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="font-medium text-brand-ivory flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-gold/20 text-brand-gold text-[10px] flex items-center justify-center font-bold">
                    {stage.stageNumber}
                  </span>
                  {stage.stageName}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-brand-ivory/60 text-[11px]">
                    Step Conv: <strong className="text-brand-gold">{stage.conversionFromPreviousPercent}</strong>
                  </span>
                  <span className="text-brand-ivory font-bold">{stage.count} events</span>
                </div>
              </div>

              {/* Funnel Visual Bar */}
              <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-brand-gold/10">
                <div
                  className="h-full bg-gradient-to-r from-brand-gold to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {stages.length > 0 && (
        <div className="pt-3 border-t border-brand-gold/10 flex items-center justify-between text-xs text-brand-ivory/70">
          <span>Overall Funnel Conversion Rate (Views → Purchases)</span>
          <span className="font-bold text-brand-gold text-sm">
            {stages[stages.length - 1]?.overallConversionPercent || "0.0%"}
          </span>
        </div>
      )}
    </div>
  );
}
