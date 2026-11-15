import { updateData } from "./storage";
import { allBaselineTestsDone, getBaselineTests, validBaselineResult } from "@/features/baseline/baselineLogic";
import { applyIntakeToProgram } from "@/features/program/programLogic";
import type { BaselineResult } from "@/types";

export function saveBaselineResult(clientId: string, result: BaselineResult) {
  let saved = false;
  updateData(data => ({ ...data, clients: data.clients.map(client => {
    if (client.id !== clientId || !client.intake || client.baselineStatus === "done" || result.bodyArea !== client.intake.bodyArea) return client;
    const test = getBaselineTests(client.intake.bodyArea).find(t => t.id === result.testId);
    if (!test || !validBaselineResult(result, test) || !["vasen", "oikea"].includes(result.side)) return client;
    saved = true;
    return { ...client, baselineStatus: "pending", baselineResults: [...(client.baselineResults ?? []).filter(r => r.testId !== result.testId || r.side !== result.side), result] };
  }) }));
  return saved;
}
export function finalizeBaseline(clientId: string) {
  let saved = false;
  updateData(data => ({ ...data, clients: data.clients.map(client => {
    if (client.id !== clientId || !client.intake || client.baselineStatus === "done" || !allBaselineTestsDone(client)) return client;
    const intake = { ...client.intake, completedAt: new Date().toISOString() };
    const program = applyIntakeToProgram(client.program, intake);
    const { program: _program, intakeDraft: _draft, ...rest } = client;
    saved = true;
    const results = client.baselineResults ?? [];
    const range = results.filter(r => r.rangeDegrees !== undefined && r.side === intake.side);
    const assessments = range.map(r => {
      const other = results.find(o => o.testId === r.testId && o.side !== r.side);
      return { id: `baseline-${r.testId}-${r.date}`, date: r.date, movement: "nilkan liikealue", kind: "baseline" as const, side: r.side,
        ...(r.rangeDegrees !== undefined ? { valueDegrees: r.rangeDegrees } : {}), ...(other?.rangeDegrees !== undefined ? { otherSideDegrees: other.rangeDegrees } : {}),
        setup: { view: r.view }, confidence: r.confidence, source: "camera" as const };
    });
    return { ...rest, intake, baselineStatus: "done", assessments: [...client.assessments, ...assessments], ...(program ? { program } : {}) };
  }) }));
  return saved;
}