import { describe, expect, it } from "vitest";
import type { Client } from "@/types";
import { clientWeeklySummary, physioSituationSummary } from "./summaryLogic";

const NOW = new Date("2026-11-16T12:00:00Z"); // Monday

function client(overrides: Partial<Client> = {}): Client {
  return {
    id: "test-client",
    name: "Testi Asiakas",
    firstName: "Testi",
    baselineStatus: "done",
    sessions: [],
    painLog: [],
    assessments: [],
    messages: [],
    notifications: [],
    ...overrides,
  };
}

describe("clientWeeklySummary", () => {
  it("counts only Monday's completed session this week and excludes the interrupted session", () => {
    const result = clientWeeklySummary(client({
      sessions: [
        { id: "1", exerciseId: "ankle-flex", date: "2026-11-16T08:00:00Z", status: "completed" },
        { id: "2", exerciseId: "single-leg-balance", date: "2026-11-15T08:00:00Z", status: "completed" },
        { id: "3", exerciseId: "ankle-flex", date: "2026-11-14T08:00:00Z", status: "interrupted" },
        { id: "4", exerciseId: "ankle-flex", date: "2026-11-08T08:00:00Z", status: "completed" },
      ],
    }), NOW);
    expect(result.sessionsThisWeek).toBe(1);
    expect(result.streak).toBe(2);
  });

  it("returns the latest pain and the 10 degree mobility change", () => {
    const result = clientWeeklySummary(client({
      painLog: [
        { id: "p1", date: "2026-11-01T08:00:00Z", level: 5, source: "client-reported" },
        { id: "p2", date: "2026-11-15T08:00:00Z", level: 2, source: "client-reported" },
      ],
      assessments: [
        { id: "m1", date: "2026-11-01T08:00:00Z", movement: "nilkan koukistus", kind: "baseline", side: "oikea", valueDegrees: 9, setup: { view: "sivulta" }, confidence: 0.8, source: "camera" },
        { id: "m2", date: "2026-11-15T08:00:00Z", movement: "nilkan koukistus", kind: "follow-up", side: "oikea", valueDegrees: 19, setup: { view: "sivulta" }, confidence: 0.8, source: "camera" },
      ],
    }), NOW);
    expect(result.latestPain).toBe(2);
    expect(result.mobilityLatest).toBe(19);
    expect(result.mobilityChange).toBe(10);
  });

  it("uses empty figures rather than inventing data for a new client", () => {
    const result = clientWeeklySummary(client(), NOW);
    expect(result.sessionsThisWeek).toBe(0);
    expect(result.latestPain).toBeNull();
    expect(result.mobilityLatest).toBeNull();
    expect(result.mobilityChange).toBeNull();
    expect(result.hasProgram).toBe(false);
  });
});

describe("physioSituationSummary", () => {
  it("reports weekly activity, 14-day interruptions and measured changes as facts", () => {
    const result = physioSituationSummary(client({
      program: { programId: "p", status: "active", origin: "physio", timesPerWeek: 4, exercises: [] },
      sessions: [
        { id: "1", exerciseId: "ankle-flex", date: "2026-11-16T08:00:00Z", status: "completed" },
        { id: "2", exerciseId: "single-leg-balance", date: "2026-11-15T08:00:00Z", status: "completed", balance: { steadySeconds: 26, groundTouches: 1, source: "camera" } },
        { id: "3", exerciseId: "heel-raise", date: "2026-11-10T08:00:00Z", status: "interrupted", interruptReason: "Kipu" },
        { id: "4", exerciseId: "single-leg-balance", date: "2026-11-01T08:00:00Z", status: "completed", balance: { steadySeconds: 8, groundTouches: 5, source: "camera" } },
      ],
      painLog: [
        { id: "p1", date: "2026-11-01T08:00:00Z", level: 5, source: "client-reported" },
        { id: "p2", date: "2026-11-15T08:00:00Z", level: 2, source: "client-reported" },
      ],
      assessments: [
        { id: "m1", date: "2026-11-01T08:00:00Z", movement: "nilkan koukistus", kind: "baseline", side: "oikea", valueDegrees: 9, setup: { view: "sivulta" }, confidence: 0.8, source: "camera" },
        { id: "m2", date: "2026-11-15T08:00:00Z", movement: "nilkan koukistus", kind: "follow-up", side: "oikea", valueDegrees: 19, setup: { view: "sivulta" }, confidence: 0.8, source: "camera" },
      ],
    }), NOW);
    expect(result.sessionsThisWeek).toBe(1);
    expect(result.weeklyTarget).toBe(4);
    expect(result.interruptedLast14Days).toBe(1);
    expect(result.interruptionReasons).toEqual(["Kipu"]);
    expect(result.painChange).toBe(-3);
    expect(result.mobilityChange).toBe(10);
    expect(result.firstBalanceSeconds).toBe(8);
    expect(result.latestBalanceSeconds).toBe(26);
    expect(result.latestBalanceTouches).toBe(1);
  });

  it("does not turn an interruption into a completion", () => {
    const result = physioSituationSummary(client({
      sessions: [{ id: "1", exerciseId: "ankle-flex", date: "2026-11-16T08:00:00Z", status: "interrupted", interruptReason: "Väsymys" }],
    }), NOW);
    expect(result.sessionsThisWeek).toBe(0);
    expect(result.interruptedLast14Days).toBe(1);
  });
});

describe("physioSummarySentences", () => {
  it("states facts for a new client without advice", async () => {
    const { physioSummarySentences } = await import("./summaryLogic");
    const lines = physioSummarySentences(client({}), new Date(NOW));
    expect(lines[0]).toBe("Alkukartoitus on tekemättä, eikä harjoitusohjelmaa ole vielä aloitettu.");
    expect(lines.join(" ")).not.toMatch(/harkitse|suosittel/i);
  });
});
