// Browser-independent estimates. Thresholds are technical noise filters, not rehab targets.
export type CameraExercise = "ankle-flex" | "single-leg-balance";
export interface Point { x: number; y: number; visibility?: number }
export type CameraHint = "ASETU KUVAAN" | "KAUEMMAS" | "LÄHEMMÄS" | "LISÄÄ VALOA";
export interface Observation { reliable: boolean; hint?: CameraHint; dots?: Point[]; angle?: number; lifted?: boolean; center?: number; touching?: boolean }
export function observe(points: Point[], exercise: CameraExercise, side: "vasen" | "oikea", width: number, height: number): Observation {
  const left = side === "vasen";
  const ids = exercise === "ankle-flex" ? (left ? [25,27,29,31] : [26,28,30,32]) : [11,12,23,24,25,26,27,28,29,30,31,32];
  if (!points.length) return { reliable: false };
  const found = ids.map(i => points[i]).filter((q): q is Point => !!q);
  const inside = (q: Point) => q.x > .02 && q.x < .98 && q.y > .02 && q.y < .98;
  const dots = found.filter(q => (q.visibility ?? 0) >= .75 && inside(q));
  if (found.length < ids.length) return { reliable: false, hint: "ASETU KUVAAN", dots };
  if (found.some(q => !inside(q))) return { reliable: false, hint: "KAUEMMAS", dots };
  if (found.some(q => (q.visibility ?? 0) < .75)) return { reliable: false, hint: found.every(q => (q.visibility ?? 0) < .3) ? "ASETU KUVAAN" : "LISÄÄ VALOA", dots };
  const p = (i: number) => points[i] ?? { x: 0, y: 0 };
  if (exercise === "ankle-flex") {
    const k = p(left ? 25 : 26), a = p(left ? 27 : 28), h = p(left ? 29 : 30), t = p(left ? 31 : 32);
    const ux = (k.x-a.x)*width, uy = (k.y-a.y)*height, vx = (t.x-h.x)*width, vy = (t.y-h.y)*height;
    const len = Math.hypot(ux,uy)*Math.hypot(vx,vy);
    if (len < 150) return { reliable: false, hint: "LÄHEMMÄS", dots };
    return { reliable: true, dots, center: a.x, angle: Math.acos(Math.max(-1,Math.min(1,(ux*vx+uy*vy)/len)))*180/Math.PI };
  }
  const support = p(left ? 27 : 28), free = p(left ? 28 : 27);
  const torso = Math.abs((p(23).y+p(24).y-p(11).y-p(12).y)/2);
  if (torso < .12) return { reliable: false, hint: "LÄHEMMÄS", dots };
  const lifted = support.y-free.y > torso*.12;
  return { reliable: true, dots, lifted, touching: !lifted, center: (p(11).x+p(12).x+p(23).x+p(24).x)/4 };
}
export interface RepTracker { min: number; max: number; smooth: number; phase: "low" | "high"; lastRep: number }
export function calibrated(min: number, max: number): boolean { return max-min >= 3; }
export function trackRep(s: RepTracker, angle: number, now: number) {
  const smooth = s.smooth*.65+angle*.35;
  const span = s.max-s.min;
  const low = s.min+span*.3, high = s.min+span*.7;
  let phase = s.phase; let rep = false;
  if (smooth >= high) phase = "high";
  if (smooth <= low && phase === "high" && now-s.lastRep >= 700) { phase = "low"; rep = true; }
  return { state: { ...s, smooth, phase, lastRep: rep ? now : s.lastRep }, rep };
}
export function readyElapsed(start: number | null, now: number, reliable: boolean) {
  if (!reliable) return { start: null, countdown: null, ready: false };
  const since = start ?? now;
  const elapsed = now-since;
  return { start: since, countdown: elapsed >= 1000 ? Math.max(1, 3-Math.floor((elapsed-1000)/1000)) : null, ready: elapsed >= 4000 };
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
