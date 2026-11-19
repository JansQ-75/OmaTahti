import type { AppData, Client } from "@/types";
import { buildPhysioTestClients } from "./physioTestClients";

export const DATA_VERSION = 11;

// Dates are relative to "today" so the demo always looks current.
// Built lazily (never at module scope).
function daysAgo(n: number, hour = 17): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function buildClientA(): Client {
  // Story: ankle sprain 4 weeks ago, 3 weeks in program. Pain improving,
  // mobility improving, but activity dropped last week and pain spiked once.
  // Days since Monday of the current week (Mon=0). Today and future days stay empty.
  const weekIdx = (new Date().getDay() + 6) % 7;
  const allSessionDays: [number, string][] = [
    [34, "ankle-flex"],
    [32, "single-leg-balance"],
    [30, "ankle-flex"],
    [28, "heel-raise"],
    [27, "ankle-flex"],
    [25, "band-eversion"],
    [23, "single-leg-balance"],
    [22, "ankle-flex"],
    [20, "ankle-flex"],
    [18, "single-leg-balance"],
    [16, "ankle-flex"],
    [14, "heel-raise"],
    [12, "ankle-flex"],
    [10, "band-eversion"],
    [9, "single-leg-balance"],
    [4, "single-leg-balance"],
    [3, "ankle-flex"],
    [2, "heel-raise"],
    [1, "ankle-flex"],
  ];
  const sessionDays = allSessionDays.filter(([d]) => d > weekIdx);
  const ALL = ["ankle-flex", "single-leg-balance", "heel-raise", "band-eversion"];
  // Current week: up to 3 past days (oldest first): full+singles, full, 2 singles.
  const pastDays = Array.from({ length: weekIdx }, (_, i) => weekIdx - i).slice(-3);
  type Plan = { kind: "full" | "single"; ids: string[] };
  const weekPlan: Plan[][] = ([
    [{ kind: "full", ids: ALL }, { kind: "single", ids: ["ankle-flex"] }, { kind: "single", ids: ["single-leg-balance"] }],
    [{ kind: "full", ids: ALL }],
    [{ kind: "single", ids: ["ankle-flex"] }, { kind: "single", ids: ["heel-raise"] }],
  ] as Plan[][]).slice(3 - pastDays.length);
  const weekSessions = pastDays.flatMap((d, di) =>
    (weekPlan[di] ?? []).map((s, si) => ({
      id: `a-w${di}-${si}`,
      exerciseId: s.ids[0] ?? "ankle-flex",
      date: daysAgo(d, 9 + si * 4),
      status: "completed" as const,
      painBefore: 2,
      painAfter: 2,
      kind: s.kind,
      exerciseIds: s.ids,
      ...(s.ids.includes("single-leg-balance") ? { balance: { steadySeconds: 27, groundTouches: 1, source: "camera" as const } } : {}),
      trackingSource: (s.ids[0] === "ankle-flex" || s.ids[0] === "single-leg-balance" ? "camera" : "none") as "camera" | "none",
    })),
  );
  const painBy: Record<number, number> = { 34: 7, 32: 6, 30: 6, 28: 6, 27: 5, 25: 5, 23: 5, 22: 5, 20: 5, 18: 5, 16: 4, 14: 4, 12: 3, 10: 3, 9: 3, 4: 3, 3: 2, 2: 3, 1: 2 };

  return {
    id: "client-aino",
    name: "Aino Lahtinen",
    firstName: "Aino",
    baselineStatus: "done",
    intake: {
      completedAt: daysAgo(35, 10),
      age: 34,
      sex: "nainen",
      goalSport: "ei",
      regularExercise: "kyllä",
      previousInjuries: "Sama nilkka nyrjähti kevyesti 5 vuotta sitten.",
      bodyArea: "ankle",
      side: "oikea",
      injuryType: "Nilkan nivelsidevamma (nyrjähdys)",
      mechanism: "Nilkka kääntyi sisäänpäin polkujuoksussa.",
      injuryDate: daysAgo(42, 18),
      painLocation: "Ulkokehräsen etupuoli",
      painAtRest: 2,
      painLevel: 5,
      symptoms: ["Turvotus", "Jäykkyys", "Epävakauden tunne (nilkka pettää)"],
      weightBearing: "ontuen",
      walkingTolerance: "10–30 min",
      difficultActivities: ["Portaat", "Pidempi kävely", "Juoksu"],
      perceivedMobility: "kohtalainen",
      otherSymptoms: "Lievä turvotus iltaisin.",
      goals: "Palata polkujuoksuun kesään mennessä.",
      redFlags: [],
    },
    program: {
      programId: "ankle-sprain-early",
      status: "active",
      origin: "physio",
      timesPerWeek: 4,
      approvedAt: daysAgo(35, 14),
      physioInstructions: "Tee tasapainoharjoitus aluksi tuolin vieressä. Kipu saa olla korkeintaan 3/10.",
      exercises: [
        { exerciseId: "ankle-flex", sets: 3, reps: 15 },
        { exerciseId: "single-leg-balance", sets: 3, holdSeconds: 30 },
        { exerciseId: "heel-raise", sets: 3, reps: 12 },
        { exerciseId: "band-eversion", sets: 3, reps: 12 },
      ],
    },
    sessions: [
      ...sessionDays.map(([d, ex], i) => ({
        id: `a-s${i}`,
        exerciseId: ex,
        date: daysAgo(d),
        status: "completed" as const,
        painBefore: painBy[d] ?? 0,
        painAfter: painBy[d] ?? 0,
        kind: "single" as const,
        exerciseIds: [ex],
        ...(ex === "single-leg-balance"
          ? { balance: { steadySeconds: ({ 18: 8, 9: 18, 4: 26 } as Record<number, number>)[d] ?? 0, groundTouches: ({ 18: 5, 9: 3, 4: 1 } as Record<number, number>)[d] ?? 0, source: "camera" as const } }
          : {}),
        trackingSource: (ex === "ankle-flex" || ex === "single-leg-balance" ? "camera" : "none") as
          | "camera"
          | "none",
      })),
      ...weekSessions,
      {
        id: "a-s-int",
        exerciseId: "heel-raise",
        date: daysAgo(6),
        status: "interrupted",
        interruptReason: "Kipu nilkan ulkosyrjällä",
        painBefore: 3,
        painAfter: 5,
        trackingSource: "none",
      },
    ],
    painLog: [
      { id: "a-p0a", date: daysAgo(35), level: 7, source: "client-reported", comment: "Turvotusta ja särkyä" },
      { id: "a-p0b", date: daysAgo(31), level: 6, source: "client-reported" },
      { id: "a-p0c", date: daysAgo(27), level: 6, source: "client-reported" },
      { id: "a-p0d", date: daysAgo(24), level: 5, source: "client-reported" },
      { id: "a-p1", date: daysAgo(21), level: 5, source: "client-reported", comment: "Jomottaa iltaisin" },
      { id: "a-p2", date: daysAgo(17), level: 4, source: "client-reported" },
      { id: "a-p3", date: daysAgo(13), level: 4, source: "client-reported" },
      { id: "a-p4", date: daysAgo(10), level: 3, source: "client-reported" },
      { id: "a-p5", date: daysAgo(6), level: 5, source: "client-reported", comment: "Pistävää kipua varpaille noustessa" },
      { id: "a-p6", date: daysAgo(3), level: 3, source: "client-reported" },
      { id: "a-p7", date: daysAgo(1), level: 2, source: "client-reported" },
    ],
    assessments: [
      {
        id: "a-m0",
        date: daysAgo(35, 11),
        movement: "nilkan koukistus",
        kind: "baseline",
        side: "oikea",
        valueDegrees: 5,
        otherSideDegrees: 24,
        setup: { view: "sivulta", distanceMeters: 2, lighting: "hyvä" },
        confidence: 0.84,
        source: "camera",
      },
      {
        id: "a-m0b",
        date: daysAgo(28, 17),
        movement: "nilkan koukistus",
        kind: "follow-up",
        side: "oikea",
        valueDegrees: 7,
        otherSideDegrees: 25,
        setup: { view: "sivulta", distanceMeters: 2, lighting: "hyvä" },
        confidence: 0.8,
        source: "camera",
      },
      {
        id: "a-m0c",
        date: daysAgo(21, 11),
        movement: "nilkan koukistus",
        kind: "follow-up",
        side: "oikea",
        valueDegrees: 10,
        otherSideDegrees: 24,
        setup: { view: "sivulta", distanceMeters: 2, lighting: "hyvä" },
        confidence: 0.82,
        source: "camera",
      },
      {
        id: "a-m1",
        date: daysAgo(12, 17),
        movement: "nilkan koukistus",
        kind: "follow-up",
        side: "oikea",
        valueDegrees: 15,
        otherSideDegrees: 25,
        setup: { view: "sivulta", distanceMeters: 2, lighting: "hyvä" },
        confidence: 0.78,
        source: "camera",
      },
      {
        id: "a-m2",
        date: daysAgo(1, 17),
        movement: "nilkan koukistus",
        kind: "follow-up",
        side: "oikea",
        valueDegrees: 19,
        otherSideDegrees: 24,
        setup: { view: "sivulta", distanceMeters: 2, lighting: "kohtalainen" },
        confidence: 0.71,
        source: "camera",
      },
    ],
    messages: [
      { id: "a-msg1", date: daysAgo(20, 9), from: "physio", text: "Hei Aino! Ohjelmasi on nyt käytössä. Kerro, jos jokin harjoitus tuntuu hankalalta." },
      { id: "a-msg2", date: daysAgo(6, 19), from: "client", text: "Varpaille nousu sattui tänään ulkosyrjään, keskeytin harjoituksen." },
      { id: "a-msg3", date: daysAgo(5, 8), from: "physio", text: "Kiitos tiedosta. Pidä varpaille nousussa pari päivän tauko ja tee liikkuvuusharjoitusta. Seurataan tilannetta." },
      { id: "a-msg4", date: daysAgo(1, 20), from: "client", text: "Nyt tuntuu paremmalta, kipu 2/10. Voinko palata varpaille nousuun?" },
    ],
    notifications: [
      {
        id: "a-n1",
        date: daysAgo(5, 7),
        type: "activity-dropping",
        text: "Harjoittelu väheni selvästi viime viikolla (1 harjoituskerta, tavoite 4).",
        audience: ["client"],
        handled: false,
        source: "rule-based",
      },
    ],
    messagesReadAt: { client: daysAgo(5, 9), physio: daysAgo(2, 9) },
  };
}

function buildClientB(): Client {
  // Story: brand-new client who has not started the intake yet.
  return {
    id: "client-mikko",
    name: "Mikko Virtanen",
    firstName: "Mikko",
    baselineStatus: "pending",
    sessions: [],
    painLog: [],
    assessments: [],
    messages: [],
    notifications: [],
  };
}

export function buildSeedData(): AppData {
  return {
    version: DATA_VERSION,
    activeClientId: "client-aino",
    clients: [buildClientA(), buildClientB(), ...buildPhysioTestClients()],
  };
}
