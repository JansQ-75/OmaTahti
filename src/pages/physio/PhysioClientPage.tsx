import { Link } from "@tanstack/react-router";
import { BaselineSummary } from "@/features/baseline/BaselineSummary";
import { intakeComplete } from "@/features/baseline/baselineLogic";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { SoftCard, SourceBadge } from "@/components/common/Section";
import { bodyAreaLabel } from "@/data/bodyAreas";
import { getExercise } from "@/data/exercises";
import { IntakeSummary, formatDate, timeSince } from "@/features/intake/IntakeSummary";
import { answersFromIntake } from "@/features/intake/intakeLogic";
import { progressSummary } from "@/features/physio/physioLogic";
import { ProgressCharts } from "@/features/progress/ProgressCharts";
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

      <PhysioSituationSummaryCard client={client} />
      <ProgressCard client={client} />

      <Fold title="Harjoitusohjelma">
        <PhysioProgramEditor client={client} bare />
      </Fold>

      <Fold title="Alkukartoitus">
        {client.intake && !intakeComplete(client) && <p className="mb-4 font-semibold text-primary">Alkukartoitus on kesken · kameratestit puuttuvat</p>}
        <BaselineSummary client={client} />
        {client.intake ? (
          <IntakeSummary audience="physio" answers={answersFromIntake(client.intake)} completedAt={client.intake.completedAt} />
        ) : (
          <p className="text-muted-foreground">
            {client.intakeDraft ? "Asiakas on aloittanut alkukartoituksen, mutta ei ole vielä tallentanut sitä." : "Asiakas ei ole vielä tehnyt alkukartoitusta."}
          </p>
        )}
      </Fold>
    </div>
  );
}

function Fold({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-3xl border border-border bg-card shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-lg font-semibold">
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
  const interrupted = client.sessions.filter((x) => x.status === "interrupted").slice(-3).reverse();
  const assessments = [...client.assessments].sort((a, b) => a.date.localeCompare(b.date));
  const empty = client.sessions.length === 0 && client.painLog.length === 0 && assessments.length === 0;

  return (
    <SoftCard>
      <h2 className="text-lg font-semibold">Edistyminen ja kipuseuranta</h2>
      {empty ? (
        <p className="mt-2 text-muted-foreground">Harjoittelu- ja kipukirjauksia ei vielä ole.</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Figure label="Harjoituskerrat 2 viikon aikana" value={s.target ? `${s.completed} / ${s.target}` : String(s.completed)} />
            <Figure label="Keskeytetyt harjoitukset 2 viikon aikana" value={String(s.interrupted)} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Vain loppuun asti tehdyt harjoitukset lasketaan harjoituskerroiksi.</p>

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
                  </li>
                ))}
              </ul>
            </div>
          )}

          {assessments.length > 0 && (
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">Liikkuvuusarviot</h3>
                <SourceBadge source="camera" />
              </div>
              <ul className="mt-2 divide-y divide-border text-sm">
                {assessments.map((a) => (
                  <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2">
                    <span>
                      {formatDate(a.date)} · {a.movement} ({a.kind === "baseline" ? "lähtötaso" : "seuranta"})
                    </span>
                    <span className="font-medium">
                      {a.valueDegrees ?? "–"}°{a.otherSideDegrees !== undefined && <span className="font-normal text-muted-foreground"> (toinen puoli {a.otherSideDegrees}°)</span>}
                    </span>
                    <span className="w-full text-xs text-muted-foreground">
                      Kuvattu {a.setup.view}, {a.setup.distanceMeters} m, valaistus {a.setup.lighting} · luotettavuus {Math.round(a.confidence * 100)} %
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-muted-foreground">Kamera-arvio, ei kliininen mittaus.</p>
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
