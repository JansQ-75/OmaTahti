import type { Client } from "@/types";
import { completedSessions, currentStreak } from "@/utils/progress";

export interface ClientWeeklySummary {
  sessionsThisWeek: number;
  streak: number;
  latestPain: number | null;
  mobilityLatest: number | null;
  mobilityChange: number | null;
  hasProgram: boolean;
  encouragement: string;
}

export interface PhysioSituationSummary {
  sessionsThisWeek: number;
  weeklyTarget: number | null;
  interruptedLast14Days: number;
  interruptionReasons: string[];
  firstPain: number | null;
  latestPain: number | null;
  painChange: number | null;
  firstMobility: number | null;
  latestMobility: number | null;
  mobilityChange: number | null;
  firstBalanceSeconds: number | null;
  latestBalanceSeconds: number | null;
  latestBalanceTouches: number | null;
  hasData: boolean;
}

function mondayStart(now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function thisWeek(client: Client, now: Date) {
  const start = mondayStart(now).getTime();
  const end = start + 7 * 86400000;
  return completedSessions(client.sessions).filter((session) => {
    const time = new Date(session.date).getTime();
    return time >= start && time < end;
  });
}

function painFacts(client: Client) {
  const entries = [...client.painLog].sort((a, b) => a.date.localeCompare(b.date));
  const first = entries[0]?.level ?? null;
  const latest = entries.at(-1)?.level ?? null;
  return {
    firstPain: first,
    latestPain: latest,
    painChange: entries.length > 1 && first !== null && latest !== null ? latest - first : null,
  };
}

function mobilityFacts(client: Client) {
  const entries = client.assessments
    .filter((assessment) => assessment.movement === "nilkan koukistus" && assessment.valueDegrees !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date));
  const first = entries[0]?.valueDegrees ?? null;
  const latest = entries.at(-1)?.valueDegrees ?? null;
  return {
    firstMobility: first,
    latestMobility: latest,
    mobilityChange: entries.length > 1 && first !== null && latest !== null ? latest - first : null,
  };
}

/** Three factual figures and one warm message for the client's weekly review. */
export function clientWeeklySummary(client: Client, now = new Date()): ClientWeeklySummary {
  const sessionsThisWeek = thisWeek(client, now).length;
  const mobility = mobilityFacts(client);
  const hasProgram = Boolean(client.program);
  let encouragement: string;
  if (sessionsThisWeek > 0) {
    encouragement = `🌟 Hienoa työtä! Olet tehnyt tällä viikolla ${sessionsThisWeek} ${sessionsThisWeek === 1 ? "harjoituksen" : "harjoitusta"}. Jokainen suoritus tukee säännöllistä kuntoutusta.`;
  } else if (!hasProgram) {
    encouragement = "🌟 Aloita alkukartoituksesta. Saat harjoitusohjelman, kun kysely ja kameratestit on tehty.";
  } else {
    encouragement = "🌟 Pienikin askel vie eteenpäin. Jatka harjoittelua omaan tahtiisi.";
  }
  return {
    sessionsThisWeek,
    streak: currentStreak(client.sessions, now),
    latestPain: painFacts(client).latestPain,
    mobilityLatest: mobility.latestMobility,
    mobilityChange: mobility.mobilityChange,
    hasProgram,
    encouragement,
  };
}

/** Factual situation summary only: no treatment suggestions or program-change advice. */
export function physioSituationSummary(client: Client, now = new Date()): PhysioSituationSummary {
  const from = now.getTime() - 14 * 86400000;
  const interruptions = client.sessions
    .filter((session) => session.status === "interrupted" && new Date(session.date).getTime() >= from && new Date(session.date).getTime() <= now.getTime())
    .sort((a, b) => b.date.localeCompare(a.date));
  const balance = completedSessions(client.sessions)
    .filter((session) => session.balance)
    .sort((a, b) => a.date.localeCompare(b.date));
  const firstBalance = balance[0]?.balance;
  const latestBalance = balance.at(-1)?.balance;
  return {
    sessionsThisWeek: thisWeek(client, now).length,
    weeklyTarget: client.program?.timesPerWeek ?? null,
    interruptedLast14Days: interruptions.length,
    interruptionReasons: interruptions.flatMap((session) => session.interruptReason ? [session.interruptReason] : []),
    ...painFacts(client),
    ...mobilityFacts(client),
    firstBalanceSeconds: firstBalance?.steadySeconds ?? null,
    latestBalanceSeconds: latestBalance?.steadySeconds ?? null,
    latestBalanceTouches: latestBalance?.groundTouches ?? null,
    hasData: client.sessions.length > 0 || client.painLog.length > 0 || client.assessments.length > 0,
  };
}
