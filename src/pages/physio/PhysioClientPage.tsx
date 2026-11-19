import { swellingLabel } from "@/features/swelling/swellingLogic";
import { Link } from "@tanstack/react-router";
import { BaselineSummary } from "@/features/baseline/BaselineSummary";
import { intakeComplete } from "@/features/baseline/baselineLogic";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";
import { SoftCard } from "@/components/common/Section";
import { bodyAreaLabel } from "@/data/bodyAreas";
import { getExercise } from "@/data/exercises";
import { IntakeSummary, formatDate, timeSince } from "@/features/intake/IntakeSummary";
import { answersFromIntake } from "@/features/intake/intakeLogic";
import { progressSummary } from "@/features/physio/physioLogic";
import { DotWeek, ProgressCharts } from "@/features/progress/ProgressCharts";
import { rangeDots } from "@/features/progress/progressLogic";
import { PhysioProgramEditor } from "@/features/program/PhysioProgramEditor";
import { useAppData } from "@/hooks/useAppData";
import type { Client } from "@/types";
import { PhysioSituationSummaryCard } from "@/features/summary/SummaryCards";

/** Everything about one client for the physio: contacts, program, progress and intake. */
export function PhysioClientPage({ clientId }: { clientId: string }) {
  const data = useAppData();
  if (!data) return null;
  const client = data.clients.find((c) => c.id === clientId);

  if (!client) {
    return (
      <div>
        <BackLink />
        <SoftCard className="mt-4">Asiakasta ei löytynyt.</SoftCard>
      </div>
    );
  }

    return (
    <div className="space-y-5">
      <BackLink />
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold md:text-3xl">{client.name}</h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          {client.intake
            ? `${bodyAreaLabel(client.intake.bodyArea)} (${client.intake.side}) · ${client.intake.injuryType} · vammasta ${timeSince(client.intake.injuryDate)}`
            : client.intakeDraft
              ? "Alkukartoitus kesken"
              : "Alkukartoitus tekemättä"}
        </p>
      </div>

      {/* Responsiivinen 2-sarakkeinen grid: 1 sarake mobiilissa/tabletissa, 2 saraketta xl-koossa (≥1280px) */}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        {/* VASEN SARAKE */}
        <div className="space-y-5">
          <PhysioSituationSummaryCard client={client} />

          <Fold title="Harjoitusohjelma">
            <PhysioProgramEditor client={client} bare />
          </Fold>

          <Fold title="Alkukartoitus">
            {client.intake && !intakeComplete(client) && (
              <p className="mb-4 font-semibold text-primary">
                Alkukartoitus on kesken · kameratestit puuttuvat
              </p>
            )}
            <BaselineSummary client={client} />
            {client.intake ? (
              <IntakeSummary
                audience="physio"
                answers={answersFromIntake(client.intake)}
                completedAt={client.intake.completedAt}
              />
            ) : (
              <p className="text-muted-foreground">
                {client.intakeDraft
                  ? "Asiakas on aloittanut alkukartoituksen, mutta ei ole vielä tallentanut sitä."
                  : "Asiakas ei ole vielä tehnyt alkukartoitusta."}
              </p>
            )}
          </Fold>
        </div>

        {/* OIKEA SARAKE */}
        <div className="space-y-5">
          <ProgressCard client={client} />
        </div>
      </div>
    </div>
  );

}

function Fold({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-3xl border border-border bg-card shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-xl font-bold tracking-tight sm:text-2xl">
        {title}
        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  );
}

function BackLink() {
  return (
    <Link to="/fysioterapeutti/asiakkaat" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
      <ArrowLeft className="h-4 w-4" /> Asiakkaat
    </Link>
  );
}

function ProgressCard({ client }: { client: Client }) {
  const s = progressSummary(client, 14);
  const [showAll, setShowAll] = useState(false);
  const allInterrupted = client.sessions.filter((x) => x.status === "interrupted").reverse();
  const interrupted = showAll ? allInterrupted : allInterrupted.slice(0, 3);
  const assessments = [...client.assessments].sort((a, b) => a.date.localeCompare(b.date));
  const empty = client.sessions.length === 0 && client.painLog.length === 0 && assessments.length === 0;

  return (
    <SoftCard>
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Edistyminen ja kipuseuranta</h2>
      {empty ? (
        <p className="mt-2 text-muted-foreground">Harjoittelu- ja kipukirjauksia ei vielä ole.</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Figure label="Harjoituskerrat 2 viikon aikana" value={s.target ? `${s.completed} / ${s.target}` : String(s.completed)} />
            <Figure label="Keskeytetyt harjoitukset 2 viikon aikana" value={String(s.interrupted)} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Vain loppuun asti tehdyt harjoitukset lasketaan harjoituskerroiksi.</p>

          <TwoWeekTraining client={client} />

          {client.sessions.some((x) => x.swellingAfter) && (
            <div className="mt-5">
              <h3 className="font-semibold">Turvotus harjoitusten jälkeen</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {client.sessions.filter((x) => x.swellingAfter).slice(-5).reverse().map((x) => (
                  <li key={x.id}>{formatDate(x.date)} · {swellingLabel(x.swellingAfter!)}</li>
                ))}
              </ul>
            </div>
          )}

          {interrupted.length > 0 && (
            <div className="mt-5">
              <h3 className="font-semibold">Keskeytetyt harjoitukset</h3>
              <ul className="mt-2 space-y-2">
                {interrupted.map((x) => (
                  <li key={x.id} className="rounded-xl bg-warning-soft p-3 text-sm">
                    <span className="font-medium">{getExercise(x.exerciseId)?.name}</span> · {formatDate(x.date)}
                    {x.interruptReason && <> · {x.interruptReason}</>}
                    {x.painBefore !== undefined && x.painAfter !== undefined && (
                      <span className="text-muted-foreground">
                        {" "}
                        (kipu {x.painBefore}/10 → {x.painAfter}/10)
                      </span>
                    )}
                    {x.swellingAfter && <span className="text-muted-foreground"> · turvotus: {swellingLabel(x.swellingAfter).toLowerCase()}</span>}
                  </li>
                ))}
              </ul>
              {allInterrupted.length > 3 && (
                <button type="button" onClick={() => setShowAll(!showAll)} className="mt-2 min-h-10 text-sm font-semibold text-primary hover:underline">
                  {showAll ? "Näytä vähemmän" : `Näytä kaikki (${allInterrupted.length})`}
                </button>
              )}
            </div>
          )}

        </>
      )}
      <div className="mt-5">
        <ProgressCharts client={client} compact showMobilityChart />
      </div>
    </SoftCard>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-primary-soft p-3 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function TwoWeekTraining({ client }: { client: Client }) {
  const programIds = client.program?.exercises.map((e) => e.exerciseId) ?? [];
  const { rows, totals } = rangeDots(client.sessions, programIds, 14);
  const ids = [...new Set([...programIds, ...Object.keys(totals)])];
  return (
    <div className="mt-5">
      <h3 className="font-semibold">Harjoittelu 2 viikon aikana</h3>
      <p className="mt-1 text-xs text-muted-foreground">Yksi pallo = yksi tehty liike. Vihreä päivä = kaikki ohjelman liikkeet tehty. Keskeytetyt eivät näy.</p>
      <div className="mt-3"><DotWeek rows={rows} programIds={programIds} cols={14} /></div>
      <ul className="mt-3 divide-y divide-border text-sm">
        {ids.map((id) => (
          <li key={id} className="flex justify-between gap-3 py-2">
            <span>{getExercise(id)?.name ?? id}</span>
            <span className="font-semibold">{totals[id] ?? 0} krt</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
