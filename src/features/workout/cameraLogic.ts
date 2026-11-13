// Browser-independent estimates. Thresholds are technical noise filters, not rehab targets.
export type CameraExercise = "ankle-flex" | "single-leg-balance";
export interface Point { x: number; y: number; visibility?: number }
export interface Observation { reliable: boolean; angle?: number; lifted?: boolean; center?: number; touching?: boolean }
export function observe(points: Point[], exercise: CameraExercise, side: "vasen" | "oikea", width: number, height: number): Observation {
  const left = side === "vasen";
  const ids = exercise === "ankle-flex" ? (left ? [25,27,29,31] : [26,28,30,32]) : [11,12,23,24,25,26,27,28,29,30,31,32];
  if (!ids.every(i => { const p = points[i]; return p && (p.visibility ?? 0) >= .75 && p.x > .02 && p.x < .98 && p.y > .02 && p.y < .98; })) return { reliable: false };
  const p = (i: number) => points[i] ?? { x: 0, y: 0 };
  if (exercise === "ankle-flex") {
    const k = p(left ? 25 : 26), a = p(left ? 27 : 28), h = p(left ? 29 : 30), t = p(left ? 31 : 32);
    const ux = (k.x-a.x)*width, uy = (k.y-a.y)*height, vx = (t.x-h.x)*width, vy = (t.y-h.y)*height;
    const len = Math.hypot(ux,uy)*Math.hypot(vx,vy);
    if (len < 150) return { reliable: false };
    return { reliable: true, angle: Math.acos(Math.max(-1,Math.min(1,(ux*vx+uy*vy)/len)))*180/Math.PI };
  }
  const support = p(left ? 27 : 28), free = p(left ? 28 : 27);
  const torso = Math.abs((p(23).y+p(24).y-p(11).y-p(12).y)/2);
  if (torso < .12) return { reliable: false };
  const lifted = support.y-free.y > torso*.12;
  return { reliable: true, lifted, touching: !lifted, center: (p(11).x+p(12).x+p(23).x+p(24).x)/4 };
}
export interface RepTracker { min: number; max: number; smooth: number; phase: "low" | "high"; lastRep: number }
export function calibrated(min: number, max: number): boolean { return max-min >= 3; }
export function trackRep(s: RepTracker, angle: number, now: number) {
  const smooth = s.smooth*.65+angle*.35;
  const span = s.max-s.min;
  const low = s.min+span*.3, high = s.max-span*.7;
  let phase = s.phase; let rep = false;
  if (smooth >= high) phase = "high";
  if (smooth <= low && phase === "high" && now-s.lastRep >= 700) { phase = "low"; rep = true; }
  return { state: { ...s, smooth, phase, lastRep: rep ? now : s.lastRep }, rep };
}
export function readyElapsed(start: number | null, now: number, reliable: boolean) {
  if (!reliable) return { start: null, countdown: null, ready: false };
  const since = start ?? now;
  const elapsed = now-since;
  return { start: since, countdown: elapsed >= 2000 ? Math.max(1, 3-Math.floor((elapsed-2000)/1000)) : null, ready: elapsed >= 5000 };
}
export interface TrackingEstimate {
  source: "camera" | "simulated";
  confidence: number;
  view: "sivulta" | "edestä";
  side: "vasen" | "oikea";
  rangeDegrees?: number;
  groundTouches?: number;
  sway?: number; // horizontal torso range relative to frame width; not a clinical score
}
export function validEstimate(reliableMs: number, totalMs: number) { return totalMs >= 3000 && reliableMs/totalMs >= .8; }
