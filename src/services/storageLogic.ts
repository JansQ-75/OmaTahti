import type { AppData } from "@/types";

/** Discard retired synthetic estimates without deleting actual workout records or intake. */
export function removeSimulatedEstimates(data: AppData): AppData {
  return {
    ...data,
    clients: data.clients.map((client) => ({
      ...client,
      ...(client.baselineResults ? { baselineResults: client.baselineResults.filter(r => r.source === "camera") } : {}),
      assessments: client.assessments.filter((a) => a.source === "camera"),
      sessions: client.sessions.map((session) => {
        const { balance, sets, ...rest } = session;
        return {
          ...rest,
          trackingSource: session.trackingSource === "camera" ? "camera" as const : "none" as const,
          ...(balance?.source === "camera" ? { balance } : {}),
          ...(sets ? { sets: sets.map((set) => {
            const { tracking, ...result } = set;
            return { ...result, ...(tracking?.source === "camera" ? { tracking } : {}) };
          }) } : {}),
        };
      }),
    })),
  };
}