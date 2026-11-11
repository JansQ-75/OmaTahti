import { Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { SoftCard, SourceBadge } from "@/components/common/Section";
import { bodyAreaLabel } from "@/data/bodyAreas";
import { getExercise } from "@/data/exercises";
import { IntakeSummary, formatDate, timeSince } from "@/features/intake/IntakeSummary";
import { answersFromIntake } from "@/features/intake/intakeLogic";
import { hasContacted, progressSummary } from "@/features/physio/physioLogic";
import { ProgressCharts } from "@/features/progress/ProgressCharts";
import { PhysioProgramEditor } from "@/features/program/PhysioProgramEditor";
import { useAppData } from "@/hooks/useAppData";
import type { Client } from "@/types";

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
          {hasContacted(client) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
              <MessageCircle className="h-3.5 w-3.5" /> Ottanut yhteyttä
            </span>
          )}
        </div>
        <p className="mt-1 text-muted-foreground">
          {client.intake
            ? `${bodyAreaLabel(client.intake.bodyArea)} (${client.intake.side}) · ${client.intake.injuryType} · vammasta ${timeSince(client.intake.injuryDate)}`
            : client.intakeDraft
              ? "Alkukartoitus kesken"
              : "Alkukartoitus tekemättä"}
        </p>
      </div>

      <ContactsCard client={client} />
      <PhysioProgramEditor client={client} />
      <ProgressCard client={client} />
      <section>
        <h2 className="mb-3 text-lg font-semibold">Edistymisen kaaviot</h2>
        <ProgressCharts client={client} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Alkukartoitus</h2>
        {client.intake ? (
          <IntakeSummary audience="physio" answers={answersFromIntake(client.intake)} completedAt={client.intake.completedAt} />
        ) : (
          <SoftCard className="text-muted-foreground">
            {client.intakeDraft ? "Asiakas on aloittanut alkukartoituksen, mutta ei ole vielä tallentanut sitä." : "Asiakas ei ole vielä tehnyt alkukartoitusta."}
          </SoftCard>
        )}
      </section>
    </div>
  );
}

function BackLink() {
  return (
    <Link to="/fysioterapeutti/asiakkaat" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
      <ArrowLeft className="h-4 w-4" /> Asiakkaat
    </Link>
  );
}

function ContactsCard({ client }: { client: Client }) {
  const recent = client.messages.slice(-4);
  return (
    <SoftCard>
      <h2 className="text-lg font-semibold">Yhteydenotot</h2>
      {recent.length === 0 ? (
        <p className="mt-2 text-muted-foreground">Asiakas ei ole vielä ottanut yhteyttä.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {recent.map((m) => (
            <li key={m.id} className={`rounded-xl p-3 text-sm ${m.from === "client" ? "bg-primary-soft" : "bg-muted"}`}>
              <p className="text-xs font-medium text-muted-foreground">
                {m.from === "client" ? client.firstName : "Sinä"} · {formatDate(m.date)}
              </p>
              <p className="mt-0.5">{m.text}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-sm text-muted-foreground">Viesteihin vastaaminen tulee vaiheessa 6.</p>
    </SoftCard>
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
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Figure label="Harjoituskerrat 14 pv" value={s.target ? `${s.completed} / ${s.target}` : String(s.completed)} />
            <Figure label="Keskeytetyt 14 pv" value={String(s.interrupted)} />
            <Figure label="Harjoitusputki" value={`${s.streak} pv`} />
            <Figure label="Viimeisin kipu" value={s.latestPain ? `${s.latestPain.level}/10` : "–"} />
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
                <SourceBadge source={assessments.some((a) => a.source === "simulated") ? "simulated" : "camera"} />
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
