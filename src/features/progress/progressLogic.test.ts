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
