import type { Observation, Point } from "./cameraLogic";

export type ButterflyState = {
  x: number; y: number; lastSeen: number; updatedAt: number;
  motion: "calm" | "flutter" | "takeoff"; takeoffAt: number | null;
};

// Decorative feedback only: never feeds timers, contacts or stored estimates.
export function updateButterfly(previous: ButterflyState | null, observation: Observation, knee: Point | undefined, now: number): ButterflyState | null {
  const visible = observation.reliable && knee && (knee.visibility ?? 0) >= .45 &&
    Number.isFinite(knee.x) && Number.isFinite(knee.y) && knee.x > .02 && knee.x < .98 && knee.y > .02 && knee.y < .98;
  if (!visible) return previous && now - previous.lastSeen <= 500 ? previous : null;
  if (!observation.lifted) {
    if (!previous) return null;
    const takeoffAt = previous.takeoffAt ?? now;
    return now - takeoffAt < 900 ? { ...previous, motion: "takeoff", takeoffAt, lastSeen: now, updatedAt: now } : null;
  }
  const dt = previous ? Math.max(1, now - previous.updatedAt) : 100;
  const alpha = 1 - Math.exp(-dt / 180);
  const speed = previous ? Math.hypot(knee.x - previous.x, knee.y - previous.y) / dt * 1000 : 0;
  return {
    x: previous ? previous.x + (knee.x - previous.x) * alpha : knee.x,
    y: previous ? previous.y + (knee.y - previous.y) * alpha : knee.y,
    lastSeen: now, updatedAt: now, takeoffAt: null,
    motion: speed > .12 ? "flutter" : "calm",
  };
}

export function liftedKneeIndex(supportSide: "vasen" | "oikea") {
  return supportSide === "vasen" ? 26 : 25;
}