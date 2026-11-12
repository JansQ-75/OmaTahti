import { useState } from "react";
import { Info, Plus, Trash2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
export function PhysioProgramEditor({ client, bare = false }: { client: Client; bare?: boolean }) {
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
    <Wrapper bare={bare}>
      {!bare && <h2 className="text-lg font-semibold">Harjoitusohjelma</h2>}

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
          <Select value="" onValueChange={(id) => setSwapTo(alternatives.find((t) => t.id === id) ?? null)}>
            <SelectTrigger className="mt-2 w-full sm:max-w-md" aria-label={p ? "Vaihda toiseen valmiiseen ohjelmaan" : "Valitse valmis ohjelma"}>
              <SelectValue placeholder="Valitse ohjelma…" />
            </SelectTrigger>
            <SelectContent>
              {alternatives.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} · {t.phase} · {t.exercises.length} harjoitusta
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
    </Wrapper>
  );
}

function Wrapper({ bare, children }: { bare: boolean; children: React.ReactNode }) {
  return bare ? <div>{children}</div> : <SoftCard>{children}</SoftCard>;
}
