// Pure rules for the rehab program: rule-based suggestion from the intake
// (no AI), and the physio's later edits. All functions are deterministic.
import { EXERCISES, getExercise } from "@/data/exercises";
import { PROGRAMS, getProgram } from "@/data/programs";
import { needsProfessional } from "@/features/intake/intakeLogic";
import type { AssignedProgram, Intake, ProgramExercise, ProgramStage } from "@/types";

export type ProgramInput = Pick<
  Intake,
  | "bodyArea"
  | "injuryDate"
  | "painAtRest"
  | "painLevel"
  | "symptoms"
  | "weightBearing"
  | "walkingTolerance"
  | "perceivedMobility"
  | "redFlags"
>;

export type Recommendation =
  | { kind: "program"; program: AssignedProgram }
  | { kind: "see-professional"; reasons: string[] }
  | { kind: "unavailable"; reasons: string[] };

// Symptom answers that change the program (see src/data/intake.ts).
export const SYMPTOM_STIFFNESS = "Jäykkyys";
export const SYMPTOM_INSTABILITY = "Epävakauden tunne (nilkka pettää)";
export const SYMPTOM_SWELLING = "Turvotus";
export const SYMPTOMS_TO_CHECK = ["Kipu yöllä", "Naksuminen tai lukkiutuminen"];

const DAY_MS = 86_400_000;

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c.getTime();
}

export function daysSinceInjury(injuryDate: string, today: Date = new Date()): number {
  return Math.max(0, Math.round((startOfDay(today) - startOfDay(new Date(injuryDate))) / DAY_MS));
}

/** Stage rules: gentle start for fresh or painful injuries, strength focus when walking is easy. */
export function chooseStage(i: ProgramInput, today: Date = new Date()): { stage: ProgramStage; reasons: string[] } {
  const days = daysSinceInjury(i.injuryDate, today);
  const early: string[] = [];
  if (days < 7) early.push(`Vammasta on kulunut vasta ${days} päivää, joten aloitetaan varovasti liikkuvuudesta.`);
  if (i.painLevel >= 6) early.push(`Kipu liikkuessa on ${i.painLevel}/10, joten kuormitusta ei vielä lisätä.`);
  if (i.painAtRest >= 4) early.push(`Kipu levossa on ${i.painAtRest}/10, joten harjoittelu on aluksi kevyttä.`);
  if (i.walkingTolerance === "alle 10 min")
    early.push("Kävely onnistuu alle 10 minuuttia kerrallaan, joten tasapaino- ja voimaharjoitukset lisätään myöhemmin.");
  if (early.length > 0) return { stage: 1, reasons: early };

  if (
    days >= 21 &&
    i.painLevel <= 2 &&
    i.painAtRest <= 1 &&
    i.weightBearing === "normaalisti" &&
    i.walkingTolerance === "yli 30 min"
  ) {
    return {
      stage: 3,
      reasons: [
        "Kipu on vähäistä, jalalle varaaminen onnistuu normaalisti ja kävely sujuu yli 30 minuuttia, joten painopiste on voimassa ja tasapainossa.",
      ],
    };
  }

  return {
    stage: 2,
    reasons: [
      `Kipu liikkuessa on ${i.painLevel}/10 ja jalalle voi varata, joten liikkuvuuden rinnalle lisätään tasapaino- ja voimaharjoituksia.`,
    ],
  };
}

const categoryOf = (exerciseId: string) => getExercise(exerciseId)?.category;

/** Builds the rule-based program suggestion from the intake answers. */
export function recommendProgram(i: ProgramInput, now: Date = new Date()): Recommendation {
  if (needsProfessional(i)) {
    return {
      kind: "see-professional",
      reasons: [
        "Vastauksissasi on merkkejä, joiden vuoksi vamma pitää tutkia ennen omatoimista harjoittelua. Ota yhteyttä lääkäriin tai fysioterapeuttiin.",
      ],
    };
  }

  const candidates = PROGRAMS.filter((p) => p.bodyArea === i.bodyArea);
  if (candidates.length === 0) {
    return { kind: "unavailable", reasons: ["Tälle kehon alueelle ei ole vielä valmista harjoitusohjelmaa."] };
  }

  const { stage, reasons } = chooseStage(i, now);
  // Exact stage, otherwise the closest lower stage, otherwise the gentlest available.
  const template =
    candidates.find((p) => p.stage === stage) ??
    [...candidates].filter((p) => p.stage < stage).sort((a, b) => b.stage - a.stage)[0] ??
    [...candidates].sort((a, b) => a.stage - b.stage)[0]!;

  const cautions: string[] = [];
  let exercises: ProgramExercise[] = template.exercises.map((e) => ({ ...e }));

  if (i.perceivedMobility === "heikko" || i.symptoms.includes(SYMPTOM_STIFFNESS)) {
    exercises = exercises.map((e) =>
      categoryOf(e.exerciseId) === "liikkuvuus" && e.reps ? { ...e, reps: e.reps + 5 } : e,
    );
    reasons.push("Liikkuvuusharjoituksessa on enemmän toistoja, koska nilkka tuntuu jäykältä.");
  }

  const hasBalance = exercises.some((e) => categoryOf(e.exerciseId) === "tasapaino");
  if (hasBalance && i.weightBearing === "ontuen") {
    exercises = exercises.map((e) =>
      categoryOf(e.exerciseId) === "tasapaino" ? { ...e, note: "Tee tuolin vieressä ja ota tukea kädellä." } : e,
    );
    reasons.push("Tasapainoharjoitus tehdään tuen kanssa, koska kävelet vielä ontuen.");
  }
  if (i.symptoms.includes(SYMPTOM_INSTABILITY)) {
    if (hasBalance) reasons.push("Tasapainoharjoitus on erityisen tärkeä, koska nilkka tuntuu pettävän.");
    else cautions.push("Nilkka tuntuu pettävän: tasapainoharjoitukset lisätään, kun jalalle varaaminen onnistuu ongelmitta.");
  }

  if (i.symptoms.includes(SYMPTOM_SWELLING))
    cautions.push("Turvotukseen auttavat kylmä, kompressio ja kohoasento harjoittelun jälkeen.");
  if (i.symptoms.some((s) => SYMPTOMS_TO_CHECK.includes(s)))
    cautions.push("Kerroit oireesta, joka kannattaa näyttää fysioterapeutille. Lopeta harjoittelu, jos oire pahenee.");

  return {
    kind: "program",
    program: {
      programId: template.id,
      status: "proposed",
      origin: "rule-based",
      timesPerWeek: template.timesPerWeek,
      exercises,
      createdAt: now.toISOString(),
      reasons,
      cautions,
    },
  };
}

/**
 * What happens to the client's program when the intake is saved:
 * a physio-set program is never touched; a rule-based one is (re)generated,
 * keeping self-guided training going; red flags remove a rule-based program.
 */
export function applyIntakeToProgram(
  current: AssignedProgram | undefined,
  intake: ProgramInput,
  now: Date = new Date(),
): AssignedProgram | undefined {
  if (current && current.origin !== "rule-based") return current;
  const rec = recommendProgram(intake, now);
  if (rec.kind !== "program") return undefined;
  if (current?.status === "self-guided") {
    return { ...rec.program, status: "self-guided", ...(current.startedAt ? { startedAt: current.startedAt } : {}) };
  }
  return rec.program;
}

/** Client starts training on the rule-based suggestion without physio approval. */
export function startSelfGuided(p: AssignedProgram, now: Date = new Date()): AssignedProgram {
  if (p.status !== "proposed") return p;
  return { ...p, status: "self-guided", startedAt: now.toISOString() };
}

// ---- Physio edits (UI arrives in phase 3). Every edit is approved at the moment it is made. ----

const approve = (p: AssignedProgram, now: Date): AssignedProgram => ({
  ...p,
  status: "active",
  origin: "physio",
  approvedAt: now.toISOString(),
});

/** Physio switches the client to another program template. */
export function replaceProgram(current: AssignedProgram | undefined, programId: string, now: Date = new Date()) {
  const t = getProgram(programId);
  if (!t) return current;
  return approve(
    {
      programId: t.id,
      status: "active",
      origin: "physio",
      timesPerWeek: t.timesPerWeek,
      exercises: t.exercises.map((e) => ({ ...e })),
      ...(current?.physioInstructions ? { physioInstructions: current.physioInstructions } : {}),
      ...(current?.createdAt ? { createdAt: current.createdAt } : {}),
      ...(current?.startedAt ? { startedAt: current.startedAt } : {}),
    },
    now,
  );
}

/** Physio adds a single exercise (default dosage from the exercise library); duplicates are ignored. */
export function addExercise(p: AssignedProgram, exerciseId: string, now: Date = new Date()): AssignedProgram {
  const ex = EXERCISES.find((e) => e.id === exerciseId);
  if (!ex || p.exercises.some((e) => e.exerciseId === exerciseId)) return p;
  const entry: ProgramExercise = {
    exerciseId,
    sets: ex.sets,
    ...(ex.reps !== undefined ? { reps: ex.reps } : {}),
    ...(ex.holdSeconds !== undefined ? { holdSeconds: ex.holdSeconds } : {}),
  };
  return approve({ ...p, exercises: [...p.exercises, entry] }, now);
}

/** Physio removes a single exercise; the last exercise cannot be removed (swap the program instead). */
export function removeExercise(p: AssignedProgram, exerciseId: string, now: Date = new Date()): AssignedProgram {
  if (p.exercises.length <= 1 || !p.exercises.some((e) => e.exerciseId === exerciseId)) return p;
  return approve({ ...p, exercises: p.exercises.filter((e) => e.exerciseId !== exerciseId) }, now);
}

/** Finnish dosage text, e.g. "3 × 15 toistoa" or "3 × 30 s". */
export function dosageText(e: ProgramExercise): string {
  if (e.holdSeconds) return `${e.sets} × ${e.holdSeconds} s`;
  return `${e.sets} × ${e.reps ?? 0} toistoa`;
}
