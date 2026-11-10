import { beforeEach, describe, expect, it } from "vitest";
import { getData, resetDemoData, setActiveClient } from "@/services/storage";
import { completeIntake, saveIntakeDraft } from "@/services/intake";
import { physioAddExercise, physioRemoveExercise, physioReplaceProgram, startSelfGuidedProgram } from "@/services/program";

describe("demo clients", () => {
  beforeEach(() => {
    localStorage.clear();
    resetDemoData();
  });

  it("Mikko starts without intake, program or progress", () => {
    const m = getData().clients.find((c) => c.id === "client-mikko")!;
    expect(m.intake).toBeUndefined();
    expect(m.program).toBeUndefined();
    expect(m.sessions).toHaveLength(0);
    expect(m.painLog).toHaveLength(0);
  });

  it("switching active client and saving Mikko's draft leaves Aino untouched", () => {
    const ainoBefore = JSON.stringify(getData().clients.find((c) => c.id === "client-aino"));
    setActiveClient("client-mikko");
    expect(getData().activeClientId).toBe("client-mikko");
    saveIntakeDraft("client-mikko", { step: 2, answers: { age: 52 } });
    expect(JSON.stringify(getData().clients.find((c) => c.id === "client-aino"))).toBe(ainoBefore);
  });

  it("saving Mikko's intake stores a rule-based program he can start without approval", () => {
    const aino = getData().clients.find((c) => c.id === "client-aino")!;
    completeIntake("client-mikko", { ...aino.intake!, injuryDate: new Date().toISOString() });
    expect(getData().clients.find((c) => c.id === "client-mikko")!.program).toMatchObject({
      programId: "ankle-sprain-acute",
      status: "proposed",
      origin: "rule-based",
    });
    startSelfGuidedProgram("client-mikko");
    const stored = JSON.parse(localStorage.getItem("omatahti:data")!);
    expect(stored.clients.find((c: { id: string }) => c.id === "client-mikko").program.status).toBe("self-guided");
  });

  it("re-saving Aino's intake keeps her physio-approved program", () => {
    const before = getData().clients.find((c) => c.id === "client-aino")!;
    completeIntake("client-aino", { ...before.intake!, painLevel: 8 });
    expect(getData().clients.find((c) => c.id === "client-aino")!.program).toEqual(before.program);
  });

  it("physio changes are stored and are what the client reads", () => {
    physioReplaceProgram("client-aino", "ankle-sprain-acute");
    physioAddExercise("client-aino", "heel-raise");
    physioRemoveExercise("client-aino", "band-eversion");
    const stored = JSON.parse(localStorage.getItem("omatahti:data")!);
    const p = stored.clients.find((c: { id: string }) => c.id === "client-aino").program;
    expect(p).toMatchObject({ programId: "ankle-sprain-acute", status: "active", origin: "physio" });
    expect(p.exercises.map((e: { exerciseId: string }) => e.exerciseId)).toEqual(["ankle-flex", "heel-raise"]);
    expect(p.physioInstructions).toMatch(/tuolin vieressä/);
  });

  it("the physio can give Mikko a program after his intake, without him starting anything", () => {
    const aino = getData().clients.find((c) => c.id === "client-aino")!;
    completeIntake("client-mikko", aino.intake!);
    physioRemoveExercise("client-mikko", "heel-raise");
    const m = getData().clients.find((c) => c.id === "client-mikko")!;
    expect(m.program).toMatchObject({ status: "active", origin: "physio" });
    expect(m.program!.exercises.some((e) => e.exerciseId === "heel-raise")).toBe(false);
  });

  it("reset restores both clients and Aino as active", () => {
    setActiveClient("client-mikko");
    const aino = getData().clients.find((c) => c.id === "client-aino")!;
    completeIntake("client-mikko", aino.intake!);
    resetDemoData();
    const d = getData();
    expect(d.activeClientId).toBe("client-aino");
    expect(d.clients.find((c) => c.id === "client-mikko")!.intake).toBeUndefined();
    expect(d.clients.find((c) => c.id === "client-aino")!.program?.status).toBe("active");
  });
});
