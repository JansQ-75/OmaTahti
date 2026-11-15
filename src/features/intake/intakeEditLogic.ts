import type { Intake } from "@/types";

export const INTAKE_EDIT_WINDOW_MS = 2 * 60 * 60 * 1000;

export function intakeEditDeadline(intake?: Pick<Intake, "completedAt">): number | null {
  if (!intake) return null;
  const savedAt = Date.parse(intake.completedAt);
  return Number.isFinite(savedAt) ? savedAt + INTAKE_EDIT_WINDOW_MS : null;
}

export function canEditIntake(intake?: Pick<Intake, "completedAt">, now = Date.now()): boolean {
  if (!intake) return true;
  const deadline = intakeEditDeadline(intake);
  return deadline !== null && now >= deadline - INTAKE_EDIT_WINDOW_MS && now < deadline;
}