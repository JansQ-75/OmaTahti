import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { PageHeader, SoftCard } from "@/components/common/Section";
import { useAppData } from "@/hooks/useAppData";
import { bodyAreaLabel } from "@/data/bodyAreas";
import { getProgram } from "@/data/programs";
import { sortForPhysio } from "@/features/physio/physioLogic";

export function PhysioClientsPage() {
  const data = useAppData();
  if (!data) return null;

  return (
    <div>
      <PageHeader title="Asiakkaat" subtitle="Avaa asiakkaan tiedot kortista." />
      <div className="grid gap-4 md:grid-cols-2">
        {sortForPhysio(data.clients).map((c) => {
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
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm">
                  Kuntoutuksen tila:{" "}
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
