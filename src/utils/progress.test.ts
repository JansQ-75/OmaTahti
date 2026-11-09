import { describe, expect, it } from "vitest";
import { completedSessions, currentStreak } from "./progress";
import type { ExerciseSession } from "@/types";

const now = new Date("2026-11-09T12:00:00");
const at = (daysBack: number, status: ExerciseSession["status"] = "completed"): ExerciseSession => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysBack);
  return { id: `${daysBack}${status}`, exerciseId: "x", date: d.toISOString(), status };
};

describe("progress rules", () => {
  it("interrupted sessions do not count as completed", () => {
    expect(completedSessions([at(0), at(1, "interrupted")])).toHaveLength(1);
  });

  it("interrupted sessions do not extend the streak", () => {
    expect(currentStreak([at(0), at(1, "interrupted"), at(2)], now)).toBe(1);
  });

  it("counts consecutive completed days", () => {
    expect(currentStreak([at(0), at(1), at(2)], now)).toBe(3);
  });
});
