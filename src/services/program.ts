// Program persistence: the assigned program lives on the client in the shared store,
// so the physio's changes show up in the client's views right away.
import { updateData } from "@/services/storage";
import { addExercise, removeExercise, replaceProgram, startSelfGuided } from "@/features/program/programLogic";
import type { AssignedProgram } from "@/types";

function updateProgram(clientId: string, fn: (p: AssignedProgram | undefined) => AssignedProgram | undefined) {
  updateData((d) => ({
    ...d,
    clients: d.clients.map((c) => {
      if (c.id !== clientId) return c;
      const next = fn(c.program);
      return next ? { ...c, program: next } : c;
    }),
  }));
}

/** Client starts self-guided training on the rule-based program (no physio approval needed). */
export function startSelfGuidedProgram(clientId: string) {
  updateProgram(clientId, (p) => (p ? startSelfGuided(p) : p));
}

/** Physio switches the client to another ready-made program. */
export function physioReplaceProgram(clientId: string, programId: string) {
  updateProgram(clientId, (p) => replaceProgram(p, programId));
}

export function physioAddExercise(clientId: string, exerciseId: string) {
  updateProgram(clientId, (p) => (p ? addExercise(p, exerciseId) : p));
}

export function physioRemoveExercise(clientId: string, exerciseId: string) {
  updateProgram(clientId, (p) => (p ? removeExercise(p, exerciseId) : p));
}
