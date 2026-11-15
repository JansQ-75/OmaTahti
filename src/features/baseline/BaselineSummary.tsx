import { baselineComparison } from "./baselineLogic";
import type { BaselineResult, Client } from "@/types";

export function baselineValue(result?: BaselineResult) {
  if (!result) return "Ei vielä tehty";
  return result.rangeDegrees !== undefined ? `${result.rangeDegrees}°` : `${result.durationSeconds} s · ${result.groundTouches} maakosketusta`;
}
export function BaselineSummary({ client }: { client: Client }) {
  if (!client.baselineResults?.length) return null;
  const latestRange = [...client.assessments].filter(a => a.kind === "follow-up" && a.movement === "nilkan liikealue" && a.side === client.intake?.side).sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  const latestBalance = [...client.sessions].filter(s => s.status === "completed" && s.balance?.source === "camera").sort((a, b) => a.date.localeCompare(b.date)).at(-1)?.balance;
  return <section className="space-y-3" aria-label="Lähtötason kamera-arviot">
    <h2 className="text-xl font-semibold">Lähtötason kamera-arviot</h2>
    <dl className="divide-y divide-border">{baselineComparison(client).map(({ test, affected, other }) => <div key={test.id} className="py-3">
      <dt className="font-semibold">{test.name}</dt>
      <dd className="mt-1 grid gap-2 sm:grid-cols-2"><p>Kuntoutettava puoli: <strong>{baselineValue(affected)}</strong></p><p>Toinen puoli: <strong>{baselineValue(other)}</strong></p></dd>
      {affected && <dd className="mt-2 text-sm text-muted-foreground">{new Date(affected.date).toLocaleDateString("fi-FI")} · luotettavuus {Math.round(affected.confidence * 100)} % · kuvattu {affected.view}</dd>}
      {test.exercise === "ankle-flex" && latestRange?.valueDegrees !== undefined && <dd className="mt-2 text-sm">Viimeisin harjoitteluarvio: <strong>{latestRange.valueDegrees}°</strong>{affected?.rangeDegrees !== undefined && <> · muutos lähtötasosta {latestRange.valueDegrees - affected.rangeDegrees > 0 ? "+" : ""}{latestRange.valueDegrees - affected.rangeDegrees}°</>}</dd>}
      {test.exercise === "single-leg-balance" && latestBalance && <dd className="mt-2 text-sm">Viimeisin harjoitteluarvio: <strong>{latestBalance.steadySeconds} s · {latestBalance.groundTouches} maakosketusta</strong></dd>}
    </div>)}</dl>
    <p className="text-sm text-muted-foreground">2D-kamera-arvio, ei kliininen mittaus. Vertaa vain samalla kuvausasetelmalla. Nilkan liikealue ei ole yksittäinen koukistuskulma.</p>
  </section>;
}