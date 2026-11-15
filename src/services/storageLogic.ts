import type { AppData } from "@/types";

/** Discard retired synthetic estimates without deleting actual workout records or intake. */
export function removeSimulatedEstimates(data: AppData): AppData {
  return {
    ...data,
    clients: data.clients.map((client) => ({
      ...client,
      assessments: client.assessments.filter((a) => a.source === "camera"),
      sessions: client.sessions.map((session) => ({
        ...session,
        trackingSource: session.trackingSource === "camera" ? "camera" : "none",
        balance: session.balance?.source === "camera" ? session.balance : undefined,
        sets: session.sets?.map((set) => ({
          ...set,
          tracking: set.tracking?.source === "camera" ? set.tracking : undefined,
        })),
      })),
    })),
  };
}