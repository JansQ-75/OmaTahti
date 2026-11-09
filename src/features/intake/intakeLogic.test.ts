import { describe, expect, it } from "vitest";
import { needsProfessional, toIntake, validateStep, type IntakeAnswers } from "./intakeLogic";

const today = new Date("2026-11-09T12:00:00");

const complete: IntakeAnswers = {
  age: 40,
  sex: "nainen",
  bodyArea: "ankle",
  side: "oikea",
  injuryType: "Nilkan nivelsidevamma (nyrjähdys)",
  mechanism: "Nilkka kääntyi sisäänpäin",
  injuryDate: "2026-11-01",
  painAtRest: 1,
  painLevel: 4,
  painLocation: "Ulkokehrän etupuoli",
  symptoms: [],
  redFlags: [],
  weightBearing: "ontuen",
  walkingTolerance: "10–30 min",
  perceivedMobility: "kohtalainen",
  difficultActivities: [],
  goals: "Kävellä kivutta",
};

describe("intake rules", () => {
  it("an injury date in the future is rejected", () => {
    expect(validateStep("injury", { ...complete, injuryDate: "2026-11-10" }, today)).not.toBeNull();
  });

  it("an injury date today is accepted", () => {
    expect(validateStep("injury", { ...complete, injuryDate: "2026-11-09" }, today)).toBeNull();
  });

  it("pain must be on the 0–10 scale", () => {
    expect(validateStep("pain", { ...complete, painLevel: 11 }, today)).not.toBeNull();
    expect(validateStep("pain", { ...complete, painLevel: 10 }, today)).toBeNull();
  });

  it("any red flag means seeing a professional", () => {
    expect(needsProfessional({ redFlags: ["Jalkaterä on kylmä tai sinertävä"] })).toBe(true);
  });

  it("not being able to bear weight means seeing a professional", () => {
    expect(needsProfessional({ redFlags: [], weightBearing: "ei pysty" })).toBe(true);
  });

  it("no red flags and weight bearing means no stop", () => {
    expect(needsProfessional({ redFlags: [], weightBearing: "ontuen" })).toBe(false);
  });

  it("an incomplete intake cannot be saved", () => {
    expect(toIntake({ ...complete, goals: "" }, today)).toBeNull();
    expect(toIntake(complete, today)?.bodyArea).toBe("ankle");
  });
});
