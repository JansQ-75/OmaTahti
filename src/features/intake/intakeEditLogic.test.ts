import { describe, expect, it } from "vitest";
import { canEditIntake, intakeEditDeadline } from "./intakeEditLogic";

const intake = { completedAt: "2026-11-15T07:34:00.000Z" };

describe("intake correction deadline", () => {
  it("allows corrections for two hours from the first save", () => {
    expect(intakeEditDeadline(intake)).toBe(Date.parse("2026-11-15T09:34:00.000Z"));
    expect(canEditIntake(intake, Date.parse("2026-11-15T09:33:59.999Z"))).toBe(true);
  });
  it("locks at exactly two hours and stays locked a week later", () => {
    expect(canEditIntake(intake, Date.parse("2026-11-15T09:34:00.000Z"))).toBe(false);
    expect(canEditIntake(intake, Date.parse("2026-11-22T07:34:00.000Z"))).toBe(false);
  });
  it("allows a first intake but fails closed for an invalid saved time", () => {
    expect(canEditIntake(undefined)).toBe(true);
    expect(canEditIntake({ completedAt: "invalid" })).toBe(false);
  });
});