import { describe, expect, it } from "vitest";
import {
  addExercise,
  applyIntakeToProgram,
  recommendProgram,
  removeExercise,
  replaceProgram,
  startSelfGuided,
  type ProgramInput,
} from "./programLogic";
import type { AssignedProgram } from "@/types";

const today = new Date("2026-11-10T12:00:00");
const daysAgo = (n: number) => new Date(today.getTime() - n * 86_400_000).toISOString();

const moderate: ProgramInput = {
  bodyArea: "ankle",
  injuryDate: daysAgo(14),
  painAtRest: 1,
  painLevel: 4,
  symptoms: [],
  redFlags: [],
  weightBearing: "normaalisti",
  walkingTolerance: "10–30 min",
  perceivedMobility: "kohtalainen",
};

const programOf = (i: ProgramInput) => {
  const r = recommendProgram(i, today);
  if (r.kind !== "program") throw new Error(`expected a program, got ${r.kind}`);
  return r.program;
};
const ids = (p: AssignedProgram) => p.exercises.map((e) => e.exerciseId);

describe("rule-based program selection", () => {
  it("an injury under 7 days old gets the gentle stage-1 program (mobility only, daily)", () => {
    const p = programOf({ ...moderate, injuryDate: daysAgo(3) });
    expect(p.programId).toBe("ankle-sprain-acute");
    expect(ids(p)).toEqual(["ankle-flex", "band-eversion"]);
    expect(p.timesPerWeek).toBe(7);
  });

  it("pain on movement of 6/10 or more gets the stage-1 program", () => {
    expect(programOf({ ...moderate, painLevel: 6 }).programId).toBe("ankle-sprain-acute");
  });

  it("pain at rest of 4/10 or more gets the stage-1 program", () => {
    expect(programOf({ ...moderate, painAtRest: 4 }).programId).toBe("ankle-sprain-acute");
  });

  it("walking under 10 minutes gets the stage-1 program", () => {
    expect(programOf({ ...moderate, walkingTolerance: "alle 10 min" }).programId).toBe("ankle-sprain-acute");
  });

  it("moderate pain after 2 weeks gets the stage-2 program with all four exercises, 4x/week", () => {
    const p = programOf(moderate);
    expect(p.programId).toBe("ankle-sprain-early");
    expect(ids(p)).toEqual(["ankle-flex", "single-leg-balance", "heel-raise", "band-eversion"]);
    expect(p.timesPerWeek).toBe(4);
  });

  it("3+ weeks, pain ≤2, normal weight bearing and 30+ min walking gets the stage-3 program", () => {
    const p = programOf({ ...moderate, injuryDate: daysAgo(30), painLevel: 2, painAtRest: 0, walkingTolerance: "yli 30 min" });
    expect(p.programId).toBe("ankle-sprain-return");
  });

  it("limping keeps the client out of stage 3 and adds support to the balance exercise", () => {
    const p = programOf({ ...moderate, injuryDate: daysAgo(30), painLevel: 2, painAtRest: 0, walkingTolerance: "yli 30 min", weightBearing: "ontuen" });
    expect(p.programId).toBe("ankle-sprain-early");
    expect(p.exercises.find((e) => e.exerciseId === "single-leg-balance")?.note).toMatch(/tukea/);
  });

  it("stiffness adds 5 reps to the mobility exercise", () => {
    expect(programOf({ ...moderate, symptoms: ["Jäykkyys"] }).exercises[0]).toMatchObject({ exerciseId: "ankle-flex", reps: 20 });
    expect(programOf({ ...moderate, perceivedMobility: "heikko" }).exercises[0]?.reps).toBe(20);
  });

  it("swelling adds a caution", () => {
    expect(programOf({ ...moderate, symptoms: ["Turvotus"] }).cautions?.length).toBe(1);
  });

  it("any red flag or not being able to bear weight gives no program", () => {
    expect(recommendProgram({ ...moderate, redFlags: ["Jalkaterä on kylmä tai sinertävä"] }, today).kind).toBe("see-professional");
    expect(recommendProgram({ ...moderate, weightBearing: "ei pysty" }, today).kind).toBe("see-professional");
  });

  it("a body area without programs gives no program", () => {
    expect(recommendProgram({ ...moderate, bodyArea: "knee" }, today).kind).toBe("unavailable");
  });

  it("the suggestion is rule-based and waits for the client to start it", () => {
    const p = programOf(moderate);
    expect(p).toMatchObject({ status: "proposed", origin: "rule-based" });
    expect(startSelfGuided(p, today)).toMatchObject({ status: "self-guided", startedAt: today.toISOString() });
  });
});

describe("saving the intake again", () => {
  const physio: AssignedProgram = { programId: "ankle-sprain-early", status: "active", origin: "physio", timesPerWeek: 3, exercises: [] };

  it("never changes a physio-set program", () => {
    expect(applyIntakeToProgram(physio, { ...moderate, injuryDate: daysAgo(2) }, today)).toBe(physio);
  });

  it("keeps self-guided training going with the updated program", () => {
    const started = startSelfGuided(programOf(moderate), today);
    const next = applyIntakeToProgram(started, { ...moderate, painLevel: 7 }, today)!;
    expect(next).toMatchObject({ programId: "ankle-sprain-acute", status: "self-guided", startedAt: started.startedAt });
  });

  it("removes a rule-based program when a red flag appears", () => {
    expect(applyIntakeToProgram(programOf(moderate), { ...moderate, redFlags: ["Kova kipu, joka ei helpota levossa"] }, today)).toBeUndefined();
  });
});

describe("physio edits (approved at the moment of the change)", () => {
  const selfGuided = startSelfGuided(programOf({ ...moderate, injuryDate: daysAgo(3) }), today);

  it("switching the program uses the new template and makes it physio-approved", () => {
    const p = replaceProgram(selfGuided, "ankle-sprain-return", today)!;
    expect(p).toMatchObject({ programId: "ankle-sprain-return", status: "active", origin: "physio", approvedAt: today.toISOString() });
    expect(p.exercises).toHaveLength(4);
  });

  it("adding an exercise appends it once and approves the change", () => {
    const p = addExercise(selfGuided, "heel-raise", today);
    expect(ids(p)).toEqual(["ankle-flex", "band-eversion", "heel-raise"]);
    expect(p.status).toBe("active");
    expect(addExercise(p, "heel-raise", today)).toBe(p);
  });

  it("removing an exercise drops only that exercise", () => {
    const p = removeExercise(selfGuided, "band-eversion", today);
    expect(ids(p)).toEqual(["ankle-flex"]);
    expect(p.origin).toBe("physio");
  });
});
