// Pure rules for the progress view (client + physio read the same data).
import type { Client, ExerciseSession, MovementAssessment, PainEntry } from "@/types";

export const PAIN_JUMP = 3;
export const PAIN_HIGH = 7;
export const BALANCE_TARGET_S = 30;

/** Calm advice after a workout when pain rose ≥3 vs the latest entry or is ≥7/10. */
export function painAdvice(level: number, painLog: PainEntry[]) {
  const sorted = [...painLog].sort((a, b) => a.date.localeCompare(b.date));
  const previous = sorted.at(-1)?.level;
  const recent = sorted.slice(-3);
  const trend = recent.length ? recent.reduce((t, p) => t + p.level, 0) / recent.length : undefined;
  const jumped = previous !== undefined && level - previous >= PAIN_JUMP;
  const high = level >= PAIN_HIGH;
  return { show: jumped || high, jumped, high, previous, trend: trend === undefined ? undefined : Math.round(trend * 10) / 10 };
}

const short = (iso: string) => new Date(iso).toLocaleDateString("fi-FI", { day: "numeric", month: "numeric" });

export function painSeries(painLog: PainEntry[]) {
  return [...painLog].sort((a, b) => a.date.localeCompare(b.date)).map((p) => ({ date: short(p.date), kipu: p.level }));
}

export function mobilitySeries(assessments: MovementAssessment[], movement = "nilkan koukistus") {
  return assessments
    .filter((a) => a.movement === movement && a.valueDegrees !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((a) => ({
      date: short(a.date),
      kuntoutettava: a.valueDegrees!,
      terve: a.otherSideDegrees,
      ero: a.otherSideDegrees !== undefined ? a.otherSideDegrees - a.valueDegrees! : undefined,
      source: a.source,
    }));
}

/** Balance on the kuntoutettava side only, from completed balance sessions that have a quality estimate. */
export function balanceSeries(sessions: ExerciseSession[]) {
  return sessions
    .filter((s) => s.status === "completed" && s.balance)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => ({ date: short(s.date), sekunnit: s.balance!.steadySeconds, kosketukset: s.balance!.groundTouches, source: s.balance!.source }));
}

function weekStart(now: Date) {
  const m = new Date(now);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

function thisWeek(sessions: ExerciseSession[], now: Date) {
  const m = weekStart(now).getTime();
  return sessions.filter((s) => {
    const t = new Date(s.date).getTime();
    return s.status === "completed" && t >= m && t < m + 7 * 86400000;
  });
}

const DAYS = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];

/** Mon–Sun of the current week: full sessions and single exercises per day. Interrupted never count. */
export function weekActivity(sessions: ExerciseSession[], now = new Date()) {
  const rows = DAYS.map((day) => ({ day, kokonainen: 0, yksittainen: 0 }));
  for (const s of thisWeek(sessions, now)) {
    const r = rows[(new Date(s.date).getDay() + 6) % 7]!;
    if (s.kind === "full") r.kokonainen += 1;
    else r.yksittainen += 1;
  }
  return rows;
}

/** How many times each exercise was done this week (a full session counts every exercise in it). */
export function weekExerciseCounts(sessions: ExerciseSession[], now = new Date()) {
  const counts: Record<string, number> = {};
  for (const s of thisWeek(sessions, now)) {
    for (const id of s.exerciseIds ?? [s.exerciseId]) counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

export function hasProgressData(c: Client) {
  return c.sessions.length > 0 || c.painLog.length > 0 || c.assessments.length > 0;
}

/** Limb symmetry index: kuntoutettava / terve × 100 (terve puoli = 100). */
export function symmetryIndex(kuntoutettava: number, terve: number) {
  if (terve <= 0) return 0;
  return Math.min(100, Math.round((kuntoutettava / terve) * 100));
}

export function symmetrySummary(series: ReturnType<typeof mobilitySeries>) {
  const withBoth = series.filter((m) => m.terve !== undefined);
  const first = withBoth[0];
  const last = withBoth.at(-1);
  if (!first || !last) return undefined;
  const baseline = symmetryIndex(first.kuntoutettava, first.terve!);
  const current = symmetryIndex(last.kuntoutettava, last.terve!);
  return { baseline, current, change: current - baseline, kuntoutettava: last.kuntoutettava, terve: last.terve!, ero: last.terve! - last.kuntoutettava };
}

export const BALANCE_LEVELS = [
  { level: 1, name: "Heikko hallinta", criteria: "Alle 10 s, vaatii tukea" },
  { level: 2, name: "Kohtalainen hallinta", criteria: "10–20 s, selkeää huojuntaa" },
  { level: 3, name: "Hyvä perushallinta", criteria: "20–30 s tai 30 s 1–2 maakosketuksella" },
  { level: 4, name: "Vakaa pito", criteria: "30 s ilman maakosketuksia" },
  { level: 5, name: "Erinomainen hallinta", criteria: "30 s vaivattomasti, ei huojuntaa (vaatii kameraseurannan)" },
] as const;

/** 1–5 balance level. Level 5 needs a sway estimate from camera tracking, so it is not reachable from seconds alone. */
export function balanceLevel(seconds: number, touches: number, steady = false) {
  if (seconds < 10) return 1;
  if (seconds < 20) return 2;
  if (seconds < BALANCE_TARGET_S || touches > 0) return 3;
  return steady ? 5 : 4;
}

/** Share of target achieved (0–100) over a list of set results. */
export function achievementPct(sets: { done: number; target: number }[]) {
  const target = sets.reduce((t, x) => t + x.target, 0);
  return target ? Math.round((sets.reduce((t, x) => t + x.done, 0) / target) * 100) : undefined;
}

/** Per day this week: achievement % of all recorded sets (undefined when no set data). */
export function weekAchievement(sessions: ExerciseSession[], now = new Date()) {
  const rows = DAYS.map(() => [] as { done: number; target: number }[]);
  for (const s of thisWeek(sessions, now)) rows[(new Date(s.date).getDay() + 6) % 7]!.push(...(s.sets ?? []));
  return rows.map(achievementPct);
}

/** Per exercise this week: latest per-set average and first → latest development. */
export function weekExerciseResults(sessions: ExerciseSession[], now = new Date()) {
  const out: Record<string, { first: number; latest: number; target: number; unit: "reps" | "seconds" }> = {};
  const sorted = [...thisWeek(sessions, now)].sort((a, b) => a.date.localeCompare(b.date));
  for (const s of sorted) {
    const byEx: Record<string, NonNullable<ExerciseSession["sets"]>> = {};
    for (const r of s.sets ?? []) (byEx[r.exerciseId] ??= []).push(r);
    for (const [id, rs] of Object.entries(byEx)) {
      const avg = Math.round(rs.reduce((t, r) => t + r.done, 0) / rs.length);
      const cur = out[id];
      out[id] = { first: cur?.first ?? avg, latest: avg, target: rs[0]!.target, unit: rs[0]!.unit };
    }
  }
  return out;
}
