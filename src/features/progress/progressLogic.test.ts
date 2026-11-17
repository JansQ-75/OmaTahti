import { describe, expect, it } from "vitest";
import { painAdvice, weekActivity, weekExerciseCounts } from "./progressLogic";
import type { ExerciseSession, PainEntry } from "@/types";

const pain = (level: number, date: string): PainEntry => ({ id: date, date, level, source: "client-reported" });

describe("painAdvice", () => {
  it("shows advice when pain rises by 3 vs the latest entry", () => {
    expect(painAdvice(5, [pain(2, "2026-11-01")]).show).toBe(true);
  });
  it("does not show advice for a rise of 2 below 7", () => {
    expect(painAdvice(4, [pain(2, "2026-11-01")]).show).toBe(false);
  });
  it("shows advice when pain is 7/10 even without a jump", () => {
    expect(painAdvice(7, [pain(6, "2026-11-01")]).show).toBe(true);
  });
});

describe("weekly activity", () => {
  const now = new Date("2026-11-11T12:00:00"); // Wednesday
  const s = (date: string, extra: Partial<ExerciseSession>): ExerciseSession => ({
    id: date + (extra.kind ?? ""), exerciseId: "ankle-flex", date, status: "completed", ...extra,
  });
  const sessions = [
    s("2026-11-09T10:00:00", { kind: "full", exerciseIds: ["ankle-flex", "heel-raise"] }),
    s("2026-11-10T10:00:00", { kind: "single" }),
    s("2026-11-10T11:00:00", { kind: "single", status: "interrupted" }),
    s("2026-11-02T10:00:00", { kind: "single" }), // last week
  ];
  it("splits full sessions and single exercises per weekday, ignoring interrupted", () => {
    const w = weekActivity(sessions, now);
    expect(w[0]).toMatchObject({ day: "Ma", kokonainen: 1, yksittainen: 0 });
    expect(w[1]).toMatchObject({ day: "Ti", kokonainen: 0, yksittainen: 1 });
  });
  it("counts every exercise in a full session", () => {
    expect(weekExerciseCounts(sessions, now)).toEqual({ "ankle-flex": 2, "heel-raise": 1 });
  });
});

import { balanceLevel, symmetryIndex } from "./progressLogic";
describe("symmetry index", () => {
  it("terve puoli is 100", () => {
    expect(symmetryIndex(24, 24)).toBe(100);
    expect(symmetryIndex(19, 24)).toBe(79);
    expect(symmetryIndex(9, 24)).toBe(38);
  });
});
describe("balance level", () => {
  it("maps seconds and touches to 5 levels", () => {
    expect(balanceLevel(8, 0)).toBe(1);
    expect(balanceLevel(15, 0)).toBe(2);
    expect(balanceLevel(25, 0)).toBe(3);
    expect(balanceLevel(30, 2)).toBe(3);
    expect(balanceLevel(30, 0)).toBe(4);
    expect(balanceLevel(30, 0, true)).toBe(5);
  });
});

import { weekDots as _weekDots } from "./progressLogic";
describe("weekDots", () => {
  const now = new Date(2026, 10, 11, 12); // Wed
  const at = new Date(2026, 10, 11, 9).toISOString();
  const s = (id: string) => ({ id: id + Math.random(), exerciseId: id, date: at, status: "completed" as const, kind: "single" as const });
  it("4x same exercise does not complete a 4-exercise program", () => {
    const d = _weekDots([s("a"), s("a"), s("a"), s("a")], ["a", "b", "c", "d"], now)[2]!;
    expect(d.dots).toBe(4);
    expect(d.complete).toBe(false);
  });
  it("all distinct exercises separately completes the day", () => {
    const d = _weekDots([s("a"), s("b"), s("c"), s("d")], ["a", "b", "c", "d"], now)[2]!;
    expect(d.complete).toBe(true);
  });
});

import { confidenceLevel, rangeDots } from "./progressLogic";
describe("confidenceLevel", () => {
  it("colours ≥80 % green, 70–79 % yellow, <70 % red", () => {
    expect(confidenceLevel(0.82)).toBe("good");
    expect(confidenceLevel(0.8)).toBe("good");
    expect(confidenceLevel(0.71)).toBe("moderate");
    expect(confidenceLevel(0.69)).toBe("weak");
  });
});
describe("rangeDots", () => {
  const now = new Date(2026, 10, 17, 12);
  const at = (d: number) => new Date(2026, 10, 17 - d, 9).toISOString();
  it("covers 14 days and ignores interrupted and older sessions", () => {
    const r = rangeDots([
      { id: "1", exerciseId: "a", date: at(0), status: "completed" },
      { id: "2", exerciseId: "a", date: at(13), status: "completed" },
      { id: "3", exerciseId: "a", date: at(14), status: "completed" },
      { id: "4", exerciseId: "a", date: at(2), status: "interrupted" },
    ], ["a"], 14, now);
    expect(r.rows).toHaveLength(14);
    expect(r.totals["a"]).toBe(2);
    expect(r.rows[13]!.complete).toBe(true);
  });
});
