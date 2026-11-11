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
