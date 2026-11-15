import { baselineSteps } from "@/features/baseline/baselineLogic";
import { getData } from "@/services/storage";
import { finalizeBaseline, saveBaselineResult } from "@/services/baseline";
// Test-only estimates: never imported by application code or stored as demo measurements.
export function completeBaselineForTest(clientId: string) {
  const client = getData().clients.find(c => c.id === clientId);
  if (!client?.intake) throw new Error("Missing test intake");
  for (const { test, side } of baselineSteps(client.intake)) saveBaselineResult(clientId, {
    testId: test.id, bodyArea: client.intake.bodyArea, side, date: new Date().toISOString(), source: "camera", confidence: .95, view: test.view,
    ...(test.exercise === "ankle-flex" ? { rangeDegrees: 25 } : { durationSeconds: 30, groundTouches: 1, sway: .02 }),
  });
  return finalizeBaseline(clientId);
}