import { BASELINE_TESTS, type BaselineTest } from "@/data/baselineTests";
import type { BaselineResult, BodyArea, Client, Intake } from "@/types";

export const getBaselineTests = (bodyArea: BodyArea) => BASELINE_TESTS[bodyArea] ?? [];
export function baselineSteps(intake: Pick<Intake, "bodyArea" | "side">) {
  const other = intake.side === "vasen" ? "oikea" : "vasen";
  return getBaselineTests(intake.bodyArea).flatMap(test => [intake.side, other].map(side => ({ test, side: side as "vasen" | "oikea" })));
}
export function validBaselineResult(result: BaselineResult, test: BaselineTest) {
  return result.source === "camera" && Number.isFinite(result.confidence) && result.confidence >= .8 && result.confidence <= 1 && result.view === test.view &&
    (test.exercise === "ankle-flex"
      ? result.rangeDegrees !== undefined && Number.isFinite(result.rangeDegrees) && result.rangeDegrees >= 0 && result.rangeDegrees <= 180
      : result.durationSeconds === test.durationSeconds && result.groundTouches !== undefined && Number.isInteger(result.groundTouches) && result.groundTouches >= 0 && result.sway !== undefined && Number.isFinite(result.sway) && result.sway >= 0);
}
export function allBaselineTestsDone(client: Client) {
  if (!client.intake) return false;
  const steps = baselineSteps(client.intake);
  return steps.length > 0 && steps.every(({ test, side }) => client.baselineResults?.some(r => r.bodyArea === client.intake?.bodyArea && r.testId === test.id && r.side === side && validBaselineResult(r, test)));
}
// Existing completed demo intakes remain available; new completion is validated on store write.
export const intakeComplete = (client: Client) => !!client.intake?.completedAt && client.baselineStatus === "done";
export const canAccessProgram = (client: Client) => intakeComplete(client) && !!client.program;

export function baselineComparison(client: Client) {
  if (!client.intake) return [];
  return getBaselineTests(client.intake.bodyArea).map(test => ({ test,
    affected: client.baselineResults?.find(r => r.testId === test.id && r.bodyArea === client.intake?.bodyArea && r.side === client.intake?.side),
    other: client.baselineResults?.find(r => r.testId === test.id && r.bodyArea === client.intake?.bodyArea && r.side !== client.intake?.side),
  }));
}