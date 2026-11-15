import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { baselineSteps, canAccessProgram, getBaselineTests } from "./baselineLogic";
import { completeIntake } from "@/services/intake";
import { finalizeBaseline, saveBaselineResult } from "@/services/baseline";
import { getData, resetDemoData } from "@/services/storage";
import { canEditIntake, intakeEditDeadline } from "@/features/intake/intakeEditLogic";
import { completeBaselineForTest } from "@/test/baselineFixture";
import { physioReplaceProgram, startSelfGuidedProgram } from "@/services/program";
import { saveWorkoutSession } from "@/services/workout";

function mikko() { const c = getData().clients.find(c => c.id === "client-mikko"); if (!c) throw new Error("Missing client"); return c; }
describe("baseline intake rules", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-15T08:17:00Z")); resetDemoData(); const a = getData().clients[0]?.intake; if (!a) throw new Error("Missing intake"); completeIntake("client-mikko", a); });
  afterEach(() => vi.useRealTimers());
  it("selects two ankle tests on both sides, affected side first", () => {
    expect(getBaselineTests("ankle").map(t => t.exercise)).toEqual(["ankle-flex", "single-leg-balance"]);
    expect(baselineSteps({ bodyArea: "ankle", side: "oikea" }).map(s => [s.test.id, s.side])).toEqual([["ankle-range", "oikea"], ["ankle-range", "vasen"], ["ankle-balance", "oikea"], ["ankle-balance", "vasen"]]);
    expect(getBaselineTests("shoulder")).toEqual([]);
  });
  it("questionnaire and a postponed test cannot unlock even a physio program", () => {
    physioReplaceProgram("client-mikko", "ankle-sprain-early");
    expect(canAccessProgram(mikko())).toBe(false);
    expect(finalizeBaseline("client-mikko")).toBe(false);
    startSelfGuidedProgram("client-mikko");
    saveWorkoutSession("client-mikko", { id: "blocked", date: new Date().toISOString(), exerciseId: "ankle-flex", status: "completed" });
    expect(mikko().sessions).toEqual([]);
  });
  it("partial results persist without unlocking and low-confidence estimates are rejected", () => {
    const r = { testId: "ankle-range", bodyArea: "ankle" as const, side: "oikea" as const, date: new Date().toISOString(), source: "camera" as const, confidence: .79, view: "sivulta" as const, rangeDegrees: 12 };
    expect(saveBaselineResult("client-mikko", r)).toBe(false);
    expect(saveBaselineResult("client-mikko", { ...r, confidence: .8 })).toBe(true);
    expect(finalizeBaseline("client-mikko")).toBe(false);
    expect(JSON.parse(localStorage.getItem("omatahti:data") ?? "{}").clients.find((c: {id: string}) => c.id === "client-mikko").baselineResults).toHaveLength(1);
    expect(canAccessProgram(mikko())).toBe(false);
  });
  it("all four tests unlock and are not workout completions", () => {
    expect(completeBaselineForTest("client-mikko")).toBe(true);
    expect(mikko().baselineStatus).toBe("done");
    expect(canAccessProgram(mikko())).toBe(true);
    expect(mikko().baselineResults).toHaveLength(4);
    expect(mikko().sessions).toHaveLength(0);
    expect(mikko().assessments[0]).toMatchObject({ kind: "baseline", movement: "nilkan liikealue", valueDegrees: 25, otherSideDegrees: 25 });
  });
  it("two hours begin at full completion, not questionnaire save", () => {
    vi.setSystemTime(new Date("2026-11-16T10:00:00Z"));
    expect(canEditIntake(mikko().intake)).toBe(true);
    completeBaselineForTest("client-mikko");
    expect(intakeEditDeadline(mikko().intake)).toBe(Date.parse("2026-11-16T12:00:00Z"));
    vi.setSystemTime(new Date("2026-11-16T12:00:00Z"));
    expect(canEditIntake(mikko().intake)).toBe(false);
    expect(finalizeBaseline("client-mikko")).toBe(false);
    expect(mikko().intake?.completedAt).toBe("2026-11-16T10:00:00.000Z");
  });
  it("changing body area invalidates previous tests and locks training again", () => {
    completeBaselineForTest("client-mikko");
    const intake = mikko().intake; if (!intake) throw new Error("Missing intake");
    completeIntake("client-mikko", { ...intake, bodyArea: "knee" });
    expect(mikko().baselineResults).toEqual([]);
    expect(canAccessProgram(mikko())).toBe(false);
  });
});