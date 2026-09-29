import { TelemetryEventType } from "@/lib/validation/telemetry";

/**
 * Dispatch customer behavioral telemetry events asynchronously to /api/telemetry.
 * Uses navigator.sendBeacon when available with fetch keepalive fallback.
 * Fails gracefully and never blocks or disrupts user experience.
 */
export function trackEvent(
  eventType: TelemetryEventType,
  metadata: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  try {
    const payload = JSON.stringify({ eventType, metadata });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/telemetry", blob);
      if (sent) return;
    }

    fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Silently catch network errors
    });
  } catch {
    // Fail safe
  }
}
