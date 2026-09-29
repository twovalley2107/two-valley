"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DateRangePreset } from "@/actions/analyticsActions";

interface AnalyticsDateFilterProps {
  currentPreset: DateRangePreset;
}

export function AnalyticsDateFilter({ currentPreset }: AnalyticsDateFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePresetChange = (preset: DateRangePreset) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", preset);
    router.push(`/admin/analytics?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 bg-brand-charcoal/40 p-2 rounded-lg border border-brand-gold/10">
      <span className="text-xs text-brand-ivory/60 font-sans px-2">Timeframe (IST):</span>
      {[
        { key: "7d", label: "Last 7 Days" },
        { key: "30d", label: "Last 30 Days" },
        { key: "90d", label: "Last 90 Days" },
        { key: "all", label: "All Time" },
      ].map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => handlePresetChange(tab.key as DateRangePreset)}
          className={`px-3 py-1 text-xs font-sans rounded transition-colors ${
            currentPreset === tab.key
              ? "bg-brand-gold text-brand-forest font-semibold shadow-sm"
              : "text-brand-ivory/60 hover:text-brand-ivory hover:bg-brand-ivory/5"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
