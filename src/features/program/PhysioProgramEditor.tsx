import { useState } from "react";
import { ArrowLeftRight, Info, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SoftCard } from "@/components/common/Section";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EXERCISES, getExercise } from "@/data/exercises";
import { PROGRAMS, getProgram } from "@/data/programs";
import { physioAddExercise, physioRemoveExercise, physioReplaceProgram } from "@/services/program";
import type { AssignedProgram, Client, RehabProgram } from "@/types";
import { ProgramExerciseList } from "./ProgramProposal";
import { formatDate } from "@/features/intake/IntakeSummary";

const btnSecondary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50";

export function programStatusText(p: AssignedProgram): string {
  if (p.origin === "physio") return `Fysioterapeutin muokkaama · päivitetty ${formatDate(p.approvedAt)}`;
  if (p.status === "self-guided") return `Automaattinen ohjelma · asiakas harjoittelee itsenäisesti (aloitettu ${formatDate(p.startedAt)})`;
  return "Automaattinen ohjelma · asiakas ei ole vielä aloittanut";
}

/**
 * Physio's program tools: switch to another ready-made program, add or remove single
 * exercises. Every change is saved at once and is visible in the client's views.
 */
export function PhysioProgramEditor({ client }: { client: Client }) {
  const p = client.program;
  const template = p ? getProgram(p.programId) : undefined;
  const [swapTo, setSwapTo] = useState<RehabProgram | null>(null);

  const area = client.intake?.bodyArea;
  const alternatives = PROGRAMS.filter((t) => (!area || t.bodyArea === area) && t.id !== p?.programId);
  const addable = p ? EXERCISES.filter((e) => !p.exercises.some((x) => x.exerciseId === e.id)) : [];

  const confirmSwap = () => {
    if (!swapTo) return;
    physioReplaceProgram(client.id, swapTo.id);
    toast.success(`Ohjelma vaihdettu: ${swapTo.name}`);
    setSwapTo(null);
  };

  return (
    <SoftCard>
      <h2 className="text-lg font-semibold">Harjoitusohjelma</h2>

      {p ? (
        <>
          <p className="mt-2 text-xl font-semibold">{template?.name ?? p.programId}</p>
          <p className="text-sm text-muted-foreground">
            {template?.phase} · {p.timesPerWeek === 7 ? "joka päivä" : `${p.timesPerWeek} kertaa viikossa`}
          </p>
          <p className="mt-1 text-sm font-medium text-primary">{programStatusText(p)}</p>

          {p.physioInstructions && (
            <p className="mt-3 rounded-xl bg-primary-soft p-3 text-sm">
              <span className="font-semibold">Ohje asiakkaalle: </span>
              {p.physioInstructions}
            </p>
          )}

          {p.origin === "rule-based" && p.reasons && p.reasons.length > 0 && (
            <details className="mt-3 rounded-xl bg-muted/60 p-3 text-sm">
              <summary className="cursor-pointer font-medium">Miksi järjestelmä valitsi tämän ohjelman</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {[...p.reasons, ...(p.cautions ?? [])].map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </details>
          )}

          <div className="mt-4">
            <ProgramExerciseList
              exercises={p.exercises}
              action={(e) => {
                const name = getExercise(e.exerciseId)?.name ?? e.exerciseId;
                return (
                  <button
                    type="button"
                    className={btnSecondary}
                    disabled={p.exercises.length <= 1}
                    title={p.exercises.length <= 1 ? "Ohjelmassa on oltava vähintään yksi harjoitus" : undefined}
                    aria-label={`Poista harjoitus: ${name}`}
                    onClick={() => {
                      physioRemoveExercise(client.id, e.exerciseId);
                      toast.success(`Poistettu: ${name}`);
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Poista
                  </button>
                );
              }}
            />
          </div>

          {addable.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold">Lisää harjoitus</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {addable.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    className={btnSecondary}
                    aria-label={`Lisää harjoitus: ${e.name}`}
                    onClick={() => {
                      physioAddExercise(client.id, e.id);
                      toast.success(`Lisätty: ${e.name}`);
                    }}
                  >
                    <Plus className="h-4 w-4" /> {e.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="mt-2 text-muted-foreground">
          Asiakkaalla ei ole harjoitusohjelmaa.
          {client.intake ? " Voit valita hänelle valmiin ohjelman alta." : " Alkukartoitus on vielä tekemättä."}
        </p>
      )}

      {alternatives.length > 0 && (p || client.intake) && (
        <div className="mt-5 border-t border-border pt-4">
          <h3 className="font-semibold">{p ? "Vaihda toiseen valmiiseen ohjelmaan" : "Valitse valmis ohjelma"}</h3>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {alternatives.map((t) => (
              <li key={t.id} className="flex flex-col justify-between gap-2 rounded-xl border border-border p-3">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.phase} · {t.exercises.length} harjoitusta
                  </p>
                </div>
                <button type="button" className={btnSecondary} onClick={() => setSwapTo(t)}>
                  <ArrowLeftRight className="h-4 w-4" /> {p ? "Vaihda tähän ohjelmaan" : "Ota käyttöön"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 flex gap-2 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Tee muutokset asiakkaan yhteydenoton perusteella. Muutokset tallentuvat heti ja näkyvät asiakkaan
        harjoitusnäkymässä. Asiakas voi harjoitella ilman erillistä hyväksyntää.
      </p>

      <AlertDialog open={swapTo !== null} onOpenChange={(o) => !o && setSwapTo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{p ? "Vaihdetaanko ohjelma?" : "Otetaanko ohjelma käyttöön?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {p
                ? `Asiakkaan nykyiset harjoitukset korvataan ohjelman ”${swapTo?.name}” harjoituksilla. Muutos näkyy asiakkaalle heti.`
                : `Ohjelma ”${swapTo?.name}” näkyy asiakkaalle heti.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Peruuta</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSwap}>{p ? "Vaihda ohjelma" : "Ota käyttöön"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SoftCard>
  );
}
