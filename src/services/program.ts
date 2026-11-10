// Program persistence: the assigned program lives on the client in the shared store.
import { updateData } from "@/services/storage";
import { startSelfGuided } from "@/features/program/programLogic";

/** Client starts self-guided training on the rule-based program (no physio approval needed). */
export function startSelfGuidedProgram(clientId: string) {
  updateData((d) => ({
    ...d,
    clients: d.clients.map((c) => (c.id === clientId && c.program ? { ...c, program: startSelfGuided(c.program) } : c)),
  }));
}
