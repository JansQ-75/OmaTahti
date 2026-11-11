import { describe, expect, it } from "vitest";
import { completedSessions } from "@/utils/progress";
import { addRep, buildSession, completeSet, initialWorkout, tick } from "./workoutLogic";

const ex = [
  { exerciseId: "ankle-flex", sets: 2, reps: 3 },
  { exerciseId: "single-leg-balance", sets: 1, holdSeconds: 2 },
];

describe("workout", () => {
  it("full rep count completes the set and moves to the next set", () => {
    let s = initialWorkout();
    for (let i = 0; i < 3; i++) s = addRep(s, ex);
    expect(s).toMatchObject({ exIndex: 0, setIndex: 1, reps: 0 });
  });
  it("last set moves to the next exercise, hold timer finishes the workout", () => {
    let s = completeSet(completeSet(initialWorkout(), ex), ex);
    expect(s.exIndex).toBe(1);
    s = tick(tick(s, ex), ex);
    expect(s.finished).toBe(true);
  });
  it("interrupted session keeps its reason and does not count as completed", () => {
    const s = buildSession(initialWorkout(), ex, { id: "x", interruptReason: "Kipu lisääntyi" });
    expect(s.status).toBe("interrupted");
    expect(s.interruptReason).toBe("Kipu lisääntyi");
    expect(completedSessions([s])).toHaveLength(0);
  });
  it("finished session is completed", () => {
    const s = buildSession({ ...initialWorkout(), finished: true }, ex, { id: "y" });
    expect(s.status).toBe("completed");
  });
});

describe("single exercise mode", () => {
  it("finishing the exercise ends the session without moving on, and it counts as completed", () => {
    let s = initialWorkout(0);
    for (let i = 0; i < 6; i++) s = addRep(s, ex, true);
    expect(s.finished).toBe(true);
    expect(s.exIndex).toBe(0);
    const session = buildSession(s, ex, { id: "x", single: true });
    expect(session).toMatchObject({ status: "completed", exerciseId: "ankle-flex" });
    expect(completedSessions([session])).toHaveLength(1);
  });
});
