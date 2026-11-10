import { Link } from "@tanstack/react-router";
import { ClipboardCheck, Play } from "lucide-react";
import { ComingSoon, PageHeader, SoftCard } from "@/components/common/Section";
import { getProgram } from "@/data/programs";
import { formatDate } from "@/features/intake/IntakeSummary";
import { ProgramExerciseList } from "@/features/program/ProgramProposal";
import { useActiveClient } from "@/hooks/useAppData";

const btnPrimary =
  "mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-lg font-semibold text-primary-foreground hover:bg-primary/90";

/** The client's current program, read from the shared store (physio changes show up here at once). */
export function ClientExercisesPage() {
  const client = useActiveClient();
  if (!client) return null;
  const p = client.program;
  const template = p ? getProgram(p.programId) : undefined;

  return (
    <div className="space-y-5">
      <PageHeader title="Harjoitukset" subtitle="Nykyinen harjoitusohjelmasi" />

      {!p ? (
        <SoftCard className="text-center">
          <ClipboardCheck className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 text-lg font-semibold">Sinulla ei ole vielä harjoitusohjelmaa</p>
          <p className="mt-1 text-muted-foreground">Ohjelma muodostetaan alkukartoituksen vastaustesi perusteella.</p>
          <Link to="/asiakas/alkukartoitus" className={btnPrimary}>
            Siirry alkukartoitukseen
          </Link>
        </SoftCard>
      ) : (
        <SoftCard>
          <h2 className="text-xl font-semibold">{template?.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {template?.phase} · {p.timesPerWeek === 7 ? "joka päivä" : `${p.timesPerWeek} kertaa viikossa`}
          </p>
          <p className="mt-1 text-sm font-medium text-primary">
            {p.origin === "physio"
              ? `Fysioterapeutti päivitti ohjelmaa ${formatDate(p.approvedAt)}`
              : "Muodostettu automaattisesti alkukartoituksesi perusteella"}
          </p>
          {p.physioInstructions && (
            <p className="mt-3 rounded-xl bg-primary-soft p-3 text-sm">
              <span className="font-semibold">Fysioterapeutin ohje: </span>
              {p.physioInstructions}
            </p>
          )}
          <div className="mt-4">
            <ProgramExerciseList exercises={p.exercises} />
          </div>
          {p.status === "proposed" && (
            <Link to="/asiakas/alkukartoitus" className={btnPrimary}>
              <Play className="h-5 w-5" /> Aloita itsenäinen harjoittelu
            </Link>
          )}
        </SoftCard>
      )}

      <ComingSoon title="Harjoituksen aloittaminen, ohjeet ja keskeyttäminen" phase={4}>
        Pian voit aloittaa harjoituksen tästä ja kirjata sen tehdyksi tai keskeytetyksi.
      </ComingSoon>
    </div>
  );
}
