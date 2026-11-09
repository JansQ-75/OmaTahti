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
