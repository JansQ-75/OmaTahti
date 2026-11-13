// Stores a finished or interrupted training session on the client.
// Starting a proposed rule-based program makes it self-guided (no physio approval needed).
import { updateData } from "@/services/storage";
import { startSelfGuided } from "@/features/program/programLogic";
import type { ExerciseSession, MovementAssessment } from "@/types";

export function saveWorkoutSession(clientId: string, session: ExerciseSession) {
  const assessments: MovementAssessment[] = (session.sets ?? []).flatMap((r, i) => r.tracking?.rangeDegrees !== undefined ? [{
    id: `${session.id}-camera-${i}`, date: session.date, movement: "nilkan liikealue", kind: "follow-up", side: r.tracking.side, valueDegrees: r.tracking.rangeDegrees,
    setup: {view:r.tracking.view}, confidence:r.tracking.confidence, source:r.tracking.source,
  }] : []);
  updateData((d) => ({
    ...d,
    clients: d.clients.map((c) =>
      c.id === clientId
        ? {
            ...c,
            sessions: [...c.sessions, session],
            assessments: [...c.assessments, ...assessments],
            painLog:
              session.painAfter !== undefined
                ? [...c.painLog, { id: `p-${session.id}`, date: session.date, level: session.painAfter, source: "client-reported" as const }]
                : c.painLog,
          }
        : c,
    ),
  }));
}

export function markProgramStarted(clientId: string) {
  updateData((d) => ({
    ...d,
    clients: d.clients.map((c) =>
      c.id === clientId && c.program ? { ...c, program: startSelfGuided(c.program) } : c,
    ),
  }));
}
