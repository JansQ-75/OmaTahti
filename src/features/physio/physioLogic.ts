// Pure rules for the physio's client views: who has contacted and a short progress summary.
import type { Client, Message, PainEntry } from "@/types";
import { completedSessions, currentStreak } from "@/utils/progress";

export function lastClientMessage(c: Client): Message | undefined {
  return [...c.messages].reverse().find((m) => m.from === "client");
}

export const hasContacted = (c: Client) => c.messages.some((m) => m.from === "client");

/** Clients who have contacted the physio first (latest contact first), then the rest in demo order. */
export function sortForPhysio(clients: Client[]): Client[] {
  const t = (c: Client) => {
    const m = lastClientMessage(c);
    return m ? new Date(m.date).getTime() : Number.NEGATIVE_INFINITY;
  };
  return clients
    .map((c, i) => ({ c, i }))
    .sort((a, b) => t(b.c) - t(a.c) || a.i - b.i)
    .map((x) => x.c);
}

export interface ProgressSummary {
  /** Completed sessions in the last `days` days (interrupted never count). */
  completed: number;
  interrupted: number;
  /** Target for the same period from the program's times per week. */
  target: number;
  streak: number;
  latestPain?: PainEntry;
  /** Pain entries in the period, oldest first. */
  pain: PainEntry[];
}

export function progressSummary(c: Client, days = 14, now: Date = new Date()): ProgressSummary {
  const from = now.getTime() - days * 86_400_000;
  const inPeriod = (iso: string) => new Date(iso).getTime() >= from;
  const pain = c.painLog.filter((p) => inPeriod(p.date)).sort((a, b) => a.date.localeCompare(b.date));
  const all = [...c.painLog].sort((a, b) => a.date.localeCompare(b.date));
  const latest = all[all.length - 1];
  return {
    completed: completedSessions(c.sessions).filter((s) => inPeriod(s.date)).length,
    interrupted: c.sessions.filter((s) => s.status === "interrupted" && inPeriod(s.date)).length,
    target: Math.round(((c.program?.timesPerWeek ?? 0) * days) / 7),
    streak: currentStreak(c.sessions, now),
    pain,
    ...(latest ? { latestPain: latest } : {}),
  };
}
