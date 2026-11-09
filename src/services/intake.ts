// Intake persistence: drafts and completed intakes live in the shared store.
import { updateData } from "@/services/storage";
import type { Client, Intake, IntakeDraft } from "@/types";

function updateClient(clientId: string, fn: (c: Client) => Client) {
  updateData((d) => ({ ...d, clients: d.clients.map((c) => (c.id === clientId ? fn(c) : c)) }));
}

export function saveIntakeDraft(clientId: string, draft: Omit<IntakeDraft, "updatedAt">) {
  updateClient(clientId, (c) => ({ ...c, intakeDraft: { ...draft, updatedAt: new Date().toISOString() } }));
}

export function discardIntakeDraft(clientId: string) {
  updateClient(clientId, (c) => {
    const { intakeDraft: _d, ...rest } = c;
    return rest;
  });
}

export function completeIntake(clientId: string, intake: Intake) {
  updateClient(clientId, (c) => {
    const { intakeDraft: _d, ...rest } = c;
    return { ...rest, intake };
  });
}
