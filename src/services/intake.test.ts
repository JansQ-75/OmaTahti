import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { completeIntake, saveIntakeDraft } from "./intake";
import { getData, resetDemoData } from "./storage";
import { completeBaselineForTest } from "@/test/baselineFixture";
import type { Intake } from "@/types";

function savedIntake(): Intake {
  const intake = getData().clients.find((c) => c.id === "client-aino")?.intake;
  if (!intake) throw new Error("Missing seed intake");
  return { ...intake, completedAt: new Date().toISOString() };
}

describe("intake store correction rules", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-15T07:34:00.000Z"));
    resetDemoData();
  });
  afterEach(() => vi.useRealTimers());

  it("saves questionnaire without unlocking or generating a program", () => {
    expect(completeIntake("client-mikko", savedIntake())).toBe(true);
    const client = getData().clients.find((c) => c.id === "client-mikko");
    expect(client?.program).toBeUndefined();
    expect(client?.intake?.completedAt).toBe("");
    expect(client?.baselineStatus).toBe("pending");
    expect(client?.assessments).toEqual([]);
  });

  it("corrections preserve the first save time rather than extending the two hours", () => {
    const intake = savedIntake();
    completeIntake("client-mikko", intake);
    completeBaselineForTest("client-mikko");
    vi.setSystemTime(new Date("2026-11-15T09:33:00.000Z"));
    expect(completeIntake("client-mikko", { ...intake, goals: "Korjattu tavoite", completedAt: new Date().toISOString() })).toBe(true);
    const client = getData().clients.find((c) => c.id === "client-mikko");
    expect(client?.intake?.goals).toBe("Korjattu tavoite");
    expect(client?.intake?.completedAt).toBe("2026-11-15T07:34:00.000Z");
  });

  it("rejects draft writes and final saves at the deadline even if editing started earlier", () => {
    const intake = savedIntake();
    completeIntake("client-mikko", intake);
    completeBaselineForTest("client-mikko");
    vi.setSystemTime(new Date("2026-11-15T09:33:00.000Z"));
    saveIntakeDraft("client-mikko", { step: 8, answers: { goals: "Luonnos" } });
    const before = getData().clients.find((c) => c.id === "client-mikko");
    vi.setSystemTime(new Date("2026-11-15T09:34:00.000Z"));
    saveIntakeDraft("client-mikko", { step: 8, answers: { goals: "Liian myöhään" } });
    expect(completeIntake("client-mikko", { ...intake, goals: "Liian myöhään" })).toBe(false);
    expect(getData().clients.find((c) => c.id === "client-mikko")).toEqual(before);
    const stored = JSON.parse(localStorage.getItem("omatahti:data") ?? "{}");
    expect(stored.clients.find((c: { id: string }) => c.id === "client-mikko").intake.goals).toBe(intake.goals);
  });
});