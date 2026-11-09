import type { Client, ExerciseSession } from "@/types";

const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

/** Only completed sessions count. Interrupted sessions never count. */
export function completedSessions(sessions: ExerciseSession[]) {
  return sessions.filter((s) => s.status === "completed");
}

/** Consecutive training days ending today or yesterday. */
export function currentStreak(sessions: ExerciseSession[], now = new Date()): number {
  const days = new Set(completedSessions(sessions).map((s) => dayKey(s.date)));
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor.toISOString()))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor.toISOString()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function sessionsInLastDays(sessions: ExerciseSession[], days: number, now = new Date()) {
  const from = now.getTime() - days * 86400000;
  return completedSessions(sessions).filter((s) => new Date(s.date).getTime() >= from).length;
}

export function openNotifications(client: Client, role: "client" | "physio") {
  return client.notifications.filter((n) => !n.handled && n.audience.includes(role));
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fi-FI", { day: "numeric", month: "numeric" });
}

const SHORT_DAYS = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];

/** Last N days (oldest first), whether a completed session happened that day. */
export function trainedLastDays(sessions: ExerciseSession[], n: number, now = new Date()) {
  const days = new Set(completedSessions(sessions).map((s) => dayKey(s.date)));
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (n - 1 - i));
    return { label: SHORT_DAYS[d.getDay()] ?? "", trained: days.has(dayKey(d.toISOString())) };
  });
}

/** Completed sessions in the current Mon–Sun week, indexed Mon=0 … Sun=6. */
export function sessionsByWeekday(sessions: ExerciseSession[], now = new Date()) {
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const s of completedSessions(sessions)) {
    const d = new Date(s.date);
    if (d >= monday && d.getTime() < monday.getTime() + 7 * 86400000) counts[(d.getDay() + 6) % 7]! += 1;
  }
  return counts;
}
