import type { Client, ExerciseSession, PainEntry, Message } from "@/types";
type MobilityAssessment = Client["assessments"][number];

// 50 physio-only test clients (never used by the client role). Deterministic
// pseudo-random variety; dates relative to today, built lazily.
function daysAgo(n: number, hour = 17): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const FIRST = ["Elina","Juha","Sanna","Ville","Katja","Antti","Laura","Teemu","Riikka","Markus","Heidi","Jari","Noora","Petri","Johanna","Sami","Emilia","Tuomas","Minna","Lauri","Satu","Jussi","Henna","Olli","Kaisa"];
const LAST = ["Korhonen","Nieminen","Mäkinen","Hämäläinen","Laine","Heikkinen","Koskinen","Järvinen","Lehtonen","Saarinen","Salminen","Heinonen","Niemi","Kinnunen","Turunen","Salo","Rantanen","Karjalainen","Tuominen","Lindholm"];
const FEMALE = new Set(["Elina","Sanna","Katja","Laura","Riikka","Heidi","Noora","Johanna","Emilia","Minna","Satu","Henna","Kaisa"]);
const MECH = ["Nilkka kääntyi koripallossa.","Liukastui jäisellä jalkakäytävällä.","Astui kuoppaan lenkillä.","Kompastui portaissa.","Laskeutui hypystä toisen jalalle salibandyssä."];
const GOALS = ["Palata juoksuharrastukseen.","Kävellä kivutta töihin.","Palata joukkueharjoituksiin.","Jaksaa pitkät metsälenkit koiran kanssa.","Tanssia taas ilman pelkoa."];
const MSG_CLIENT = ["Voinko lisätä toistoja, tuntuu helpolta?","Nilkka turposi eilisen jälkeen, onko normaalia?","Kiitos, ohjelma toimii hyvin!","Tasapainoharjoitus on vaikea, voinko ottaa tukea?","Kipu nousi portaissa, pitäisikö keventää?","Ehdin harjoitella vain kerran tällä viikolla."];
const INT_REASONS = ["Kipu lisääntyi","Ajanpuute","Väsymys","Turvotus lisääntyi"];
const EX = ["ankle-flex","single-leg-balance","heel-raise","band-eversion"];

function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

type Profile = "improving" | "worsening" | "inactive" | "stable" | "new";

function buildClient(i: number): Client {
  const r = rng(i + 1);
  const pick = <T,>(a: T[]): T => a[Math.floor(r() * a.length)] as T;
  const firstName = FIRST[i % FIRST.length] as string;
  const lastName = LAST[(i * 7) % LAST.length] as string;
  const id = `test-${String(i + 1).padStart(2, "0")}`;
  const profiles: Profile[] = ["improving","improving","worsening","inactive","stable","improving","new"];
  const profile = profiles[i % profiles.length] as Profile;
  const weeks = profile === "new" ? 1 : 3 + (i % 8); // 1–10 weeks
  const start = weeks * 7;
  const side = i % 2 === 0 ? "oikea" : "vasen";
  const startPain = 5 + Math.floor(r() * 4);
  const stage = profile === "new" ? "ankle-sprain-acute" : weeks >= 7 ? "ankle-sprain-return" : "ankle-sprain-early";

  const painAt = (d: number) => {
    const t = 1 - d / start; // 0 → 1 over time
    let p = startPain;
    if (profile === "improving") p = startPain - t * (startPain - 1);
    if (profile === "worsening") p = startPain - t * 2 + (d < 10 ? 3 : 0);
    if (profile === "stable" || profile === "inactive") p = startPain - t * 2;
    return Math.max(0, Math.min(10, Math.round(p + (r() - 0.5))));
  };

  const sessions: ExerciseSession[] = [];
  const painLog: PainEntry[] = [];
  for (let d = start - 1; d >= 1; d--) {
    if (profile === "inactive" && d < 14) continue;
    if (r() > 0.55) continue;
    const ex = pick(EX);
    const pain = painAt(d);
    const interrupted = r() < (profile === "worsening" ? 0.3 : 0.08);
    const sid = `${id}-s${d}`;
    if (interrupted) {
      sessions.push({ id: sid, exerciseId: ex, date: daysAgo(d), status: "interrupted", interruptReason: profile === "worsening" ? "Kipu lisääntyi" : pick(INT_REASONS), painBefore: pain, painAfter: Math.min(10, pain + 2), trackingSource: "none" });
    } else {
      const full = r() < 0.4;
      const progress = 1 - d / start;
      sessions.push({
        id: sid, exerciseId: full ? "ankle-flex" : ex, date: daysAgo(d), status: "completed",
        painBefore: pain, painAfter: pain,
        kind: full ? "program" : "single",
        exerciseIds: full ? EX : [ex],
        ...(!full && ex === "single-leg-balance"
          ? { balance: { steadySeconds: Math.round(6 + progress * 22 * r() + progress * 4), groundTouches: Math.max(0, Math.round(5 - progress * 5)), source: "camera" as const } }
          : {}),
        trackingSource: ex === "ankle-flex" || ex === "single-leg-balance" ? "camera" : "none",
      } as ExerciseSession);
    }
    if (d % 4 === 0) painLog.push({ id: `${id}-p${d}`, date: daysAgo(d, 20), level: pain, source: "client-reported" });
  }

  const healthy = 22 + Math.floor(r() * 6);
  const baseVal = Math.round(healthy * (0.35 + r() * 0.15));
  const nAssess = profile === "new" ? 1 : Math.min(6, 2 + Math.floor(weeks / 2));
  const assessments: MobilityAssessment[] = Array.from({ length: nAssess }, (_, k) => {
    const d = Math.round(start - 1 - (k * (start - 2)) / Math.max(1, nAssess - 1));
    const t = nAssess === 1 ? 0 : k / (nAssess - 1);
    const gain = profile === "worsening" ? 0.25 : profile === "inactive" ? 0.3 : 0.55;
    return {
      id: `${id}-m${k}`, date: daysAgo(Math.max(1, d), 11), movement: "nilkan koukistus",
      kind: k === 0 ? "baseline" : "follow-up", side,
      valueDegrees: Math.min(healthy, Math.round(baseVal + t * gain * healthy)), otherSideDegrees: healthy,
      setup: { view: "sivulta", distanceMeters: 2, lighting: pick(["hyvä","kohtalainen"]) },
      confidence: Math.round((0.62 + r() * 0.3) * 100) / 100, source: "camera",
    } as MobilityAssessment;
  });

  const messages: Message[] = [
    { id: `${id}-msg1`, date: daysAgo(start - 1, 9), from: "physio", text: `Hei ${firstName}! Ohjelmasi on käytössä. Kerro, jos jokin tuntuu hankalalta.` },
  ];
  if (profile !== "new") {
    const msgText = profile === "worsening" ? (MSG_CLIENT[4] as string) : profile === "inactive" ? (MSG_CLIENT[5] as string) : pick(MSG_CLIENT);
    messages.push({ id: `${id}-msg2`, date: daysAgo(1 + (i % 5), 19), from: "client", text: msgText });
  }

  const sessionsByDate = sessions; // already chronological
  return {
    id,
    name: `${firstName} ${lastName}`,
    firstName,
    baselineStatus: "done",
    intake: {
      completedAt: daysAgo(start, 10),
      age: 20 + Math.floor(r() * 50),
      sex: FEMALE.has(firstName) ? "nainen" : "mies",
      goalSport: i % 3 === 0 ? "kyllä" : "ei",
      regularExercise: i % 4 === 3 ? "ei" : "kyllä",
      previousInjuries: r() < 0.3 ? "Aiempi nyrjähdys samassa nilkassa." : "",
      bodyArea: "ankle",
      side,
      injuryType: "Nilkan nivelsidevamma (nyrjähdys)",
      mechanism: pick(MECH),
      injuryDate: daysAgo(start + 5, 18),
      painLocation: "Ulkokehräsen etupuoli",
      painAtRest: Math.max(0, startPain - 3),
      painLevel: startPain,
      symptoms: r() < 0.5 ? ["Turvotus", "Jäykkyys"] : ["Jäykkyys", "Epävakauden tunne (nilkka pettää)"],
      weightBearing: startPain > 6 ? "ontuen" : "normaalisti",
      walkingTolerance: startPain > 6 ? "alle 10 min" : "10–30 min",
      difficultActivities: ["Portaat", "Pidempi kävely"],
      perceivedMobility: startPain > 6 ? "heikko" : "kohtalainen",
      otherSymptoms: "",
      goals: pick(GOALS),
      redFlags: [],
    },
    program: {
      programId: stage,
      status: "active",
      origin: "physio",
      timesPerWeek: 3 + (i % 3),
      approvedAt: daysAgo(start, 14),
      physioInstructions: "Kipu saa olla harjoitellessa korkeintaan 3/10.",
      exercises: [
        { exerciseId: "ankle-flex", sets: 3, reps: 15 },
        { exerciseId: "single-leg-balance", sets: 3, holdSeconds: 30 },
        { exerciseId: "heel-raise", sets: 3, reps: 12 },
        { exerciseId: "band-eversion", sets: 3, reps: 12 },
      ],
    },
    sessions: sessionsByDate,
    painLog,
    assessments,
    messages,
    notifications: [],
    messagesReadAt: { client: daysAgo(0, 8), physio: daysAgo(i % 3 === 0 ? 10 : 0, 8) },
  } as Client;
}

export function buildPhysioTestClients(count = 50): Client[] {
  return Array.from({ length: count }, (_, i) => buildClient(i));
}
