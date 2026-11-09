// Pure intake wizard rules: step order, validation and turning answers into an Intake.
import type { Intake, IntakeDraft } from "@/types";

export type IntakeAnswers = IntakeDraft["answers"];

export const INTAKE_STEPS = [
  { id: "intro", title: "Tervetuloa" },
  { id: "basics", title: "Perustiedot" },
  { id: "area", title: "Vamma-alue" },
  { id: "injury", title: "Vamma" },
  { id: "pain", title: "Kipu" },
  { id: "symptoms", title: "Oireet" },
  { id: "function", title: "Toimintakyky" },
  { id: "goals", title: "Tavoitteet" },
  { id: "review", title: "Tarkista vastaukset" },
] as const;

export type IntakeStepId = (typeof INTAKE_STEPS)[number]["id"];

const isPain = (n: unknown) => typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 10;

/** Returns a Finnish message explaining what is missing, or null when the step is complete. */
export function validateStep(step: IntakeStepId, a: IntakeAnswers, today: Date = new Date()): string | null {
  switch (step) {
    case "basics":
      if (typeof a.age !== "number" || a.age < 15 || a.age > 100) return "Kirjoita ikäsi (15–100 vuotta).";
      if (!a.sex) return "Valitse sukupuoli.";
      return null;
    case "area":
      if (!a.bodyArea) return "Valitse kehon alue.";
      if (!a.side) return "Valitse, kumpi puoli.";
      return null;
    case "injury": {
      if (!a.injuryType) return "Valitse vamman tyyppi.";
      if (!a.mechanism?.trim()) return "Kerro, miten vamma syntyi.";
      if (!a.injuryDate) return "Valitse vamman päivämäärä.";
      const d = new Date(a.injuryDate);
      if (Number.isNaN(d.getTime())) return "Valitse vamman päivämäärä.";
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      if (d > endOfToday) return "Vamman päivämäärä ei voi olla tulevaisuudessa.";
      return null;
    }
    case "pain":
      if (!isPain(a.painAtRest)) return "Valitse kipu levossa (0–10).";
      if (!isPain(a.painLevel)) return "Valitse kipu liikkuessa (0–10).";
      if (!a.painLocation) return "Valitse, missä kipu tuntuu.";
      return null;
    case "symptoms":
      if (!a.symptoms || !a.redFlags) return "Vastaa molempiin kysymyksiin (valitse tarvittaessa ”Ei mitään näistä”).";
      return null;
    case "function":
      if (!a.weightBearing) return "Kerro, pystytkö varaamaan jalalle.";
      if (!a.walkingTolerance) return "Kerro, kuinka pitkään pystyt kävelemään.";
      if (!a.perceivedMobility) return "Arvioi nilkan liikkuvuus.";
      if (!a.difficultActivities) return "Valitse vaikeat toiminnot (tai ”Ei mitään näistä”).";
      return null;
    case "goals":
      if (!a.goals?.trim()) return "Kirjoita tavoitteesi.";
      return null;
    default:
      return null;
  }
}

/** The first step that is not yet complete, so a resumed draft never skips a required question. */
export function firstInvalidStep(a: IntakeAnswers): number {
  const idx = INTAKE_STEPS.findIndex((s) => validateStep(s.id, a) !== null);
  return idx === -1 ? INTAKE_STEPS.length - 1 : idx;
}

/** Any red flag means: contact a professional before starting self-guided exercise. */
export function needsProfessional(a: Pick<IntakeAnswers, "redFlags" | "weightBearing">): boolean {
  return (a.redFlags?.length ?? 0) > 0 || a.weightBearing === "ei pysty";
}

export function toIntake(a: IntakeAnswers, now: Date = new Date()): Intake | null {
  if (INTAKE_STEPS.some((s) => validateStep(s.id, a, now) !== null)) return null;
  return {
    completedAt: now.toISOString(),
    age: a.age!,
    sex: a.sex!,
    previousInjuries: a.previousInjuries?.trim() || "Ei aiempia vammoja.",
    bodyArea: a.bodyArea!,
    side: a.side!,
    injuryType: a.injuryType!,
    mechanism: a.mechanism!.trim(),
    injuryDate: a.injuryDate!,
    painLocation: a.painLocation!,
    painAtRest: a.painAtRest!,
    painLevel: a.painLevel!,
    symptoms: a.symptoms!,
    weightBearing: a.weightBearing!,
    walkingTolerance: a.walkingTolerance!,
    difficultActivities: a.difficultActivities!,
    perceivedMobility: a.perceivedMobility!,
    otherSymptoms: a.otherSymptoms?.trim() ?? "",
    goals: a.goals!.trim(),
    redFlags: a.redFlags!,
  };
}

/** Prefill a new draft from an earlier intake so redoing it only needs the changed answers. */
export function answersFromIntake(i?: Intake): IntakeAnswers {
  if (!i) return {};
  const { completedAt: _c, ...rest } = i;
  return rest;
}
