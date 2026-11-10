import { Link } from "@tanstack/react-router";
import { ChevronRight, MessageCircle } from "lucide-react";
import { PageHeader, SoftCard } from "@/components/common/Section";
import { useAppData } from "@/hooks/useAppData";
import { bodyAreaLabel } from "@/data/bodyAreas";
import { getProgram } from "@/data/programs";
import { hasContacted, lastClientMessage, sortForPhysio } from "@/features/physio/physioLogic";
import { formatDate } from "@/features/intake/IntakeSummary";

export function PhysioClientsPage() {
  const data = useAppData();
  if (!data) return null;

  return (
    <div>
      <PageHeader title="Asiakkaat" subtitle="Yhteyttä ottaneet asiakkaat näkyvät ensimmäisenä. Avaa asiakkaan tiedot kortista." />
      <div className="grid gap-4 md:grid-cols-2">
        {sortForPhysio(data.clients).map((c) => {
          const contacted = hasContacted(c);
          const last = lastClientMessage(c);
          const status = !c.program
            ? "Ei vielä ohjelmaa"
            : c.program.status === "active"
              ? "Käynnissä"
              : c.program.status === "self-guided"
                ? "Itsenäinen harjoittelu (automaattinen ohjelma)"
                : "Automaattinen ohjelma, asiakas ei ole vielä aloittanut";
          const programName = c.program ? getProgram(c.program.programId)?.name : undefined;
          return (
            <Link
              key={c.id}
              to="/fysioterapeutti/asiakkaat/$clientId"
              params={{ clientId: c.id }}
              className="block rounded-2xl transition-transform hover:-translate-y-0.5"
              aria-label={`Avaa asiakkaan ${c.name} tiedot`}
            >
              <SoftCard className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{c.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {c.intake ? `${bodyAreaLabel(c.intake.bodyArea)} (${c.intake.side})` : c.intakeDraft ? "Alkukartoitus kesken" : "Alkukartoitus tekemättä"}
                    </p>
                  </div>
                  {contacted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
                      <MessageCircle className="h-3.5 w-3.5" /> Ottanut yhteyttä
                    </span>
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                {last && (
                  <p className="mt-3 line-clamp-2 rounded-xl bg-primary-soft p-2.5 text-sm">
                    <span className="text-muted-foreground">{formatDate(last.date)}: </span>
                    {last.text}
                  </p>
                )}
                {c.intake && (
                  <p className="mt-3 text-sm">
                    Alkukartoitus tehty {formatDate(c.intake.completedAt)} · kipu liikkuessa {c.intake.painLevel}/10
                    {c.intake.redFlags.length > 0 && <span className="ml-1 font-semibold text-destructive">· hälytysmerkkejä</span>}
                  </p>
                )}
                <p className="mt-3 text-sm">
                  Ohjelman tila:{" "}
                  <span className={c.program?.status === "active" ? "font-medium text-success" : "font-medium text-accent-foreground"}>
                    {status}
                  </span>
                </p>
                {programName && <p className="mt-1 text-sm text-muted-foreground">{programName}</p>}
                <p className="mt-3 text-sm font-semibold text-primary">Avaa tiedot →</p>
              </SoftCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
