// Intake persistence: drafts and completed intakes live in the shared store.
import { updateData } from "@/services/storage";
import { applyIntakeToProgram } from "@/features/program/programLogic";
import { canEditIntake } from "@/features/intake/intakeEditLogic";
import type { Client, Intake, IntakeDraft } from "@/types";

function updateClient(clientId: string, fn: (c: Client) => Client) {
  updateData((d) => ({ ...d, clients: d.clients.map((c) => (c.id === clientId ? fn(c) : c)) }));
}

export function saveIntakeDraft(clientId: string, draft: Omit<IntakeDraft, "updatedAt">) {
  updateClient(clientId, (c) => canEditIntake(c.intake)
    ? { ...c, intakeDraft: { ...draft, updatedAt: new Date().toISOString() } } : c);
}

export function discardIntakeDraft(clientId: string) {
  updateClient(clientId, (c) => {
    const { intakeDraft: _d, ...rest } = c;
    return rest;
  });
}

/** Saves the intake and (re)builds the rule-based program; a physio-set program is kept as is. */
export function completeIntake(clientId: string, intake: Intake) {
  let saved = false;
  updateClient(clientId, (c) => {
    if (!canEditIntake(c.intake)) return c;
    // Corrections never restart the original two-hour edit window.
    intake = { ...intake, completedAt: c.intake?.completedAt ?? intake.completedAt };
    const { intakeDraft: _d, program: _p, ...rest } = c;
    const program = applyIntakeToProgram(c.program, intake);
    saved = true;
    return program ? { ...rest, intake, program } : { ...rest, intake };
  });
  return saved;
}
