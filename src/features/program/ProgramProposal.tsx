import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ChevronDown, Info, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SoftCard } from "@/components/common/Section";
import { getExercise } from "@/data/exercises";
import { getProgram } from "@/data/programs";
import { needsProfessional } from "@/features/intake/intakeLogic";
import { startSelfGuidedProgram } from "@/services/program";
import type { ReactNode } from "react";
import type { Client, ProgramExercise } from "@/types";
import { dosageText } from "./programLogic";

/** List of program exercises with dosage and notes; reusable in the physio view. */
export function ProgramExerciseList({
  exercises,
  action,
}: {
  exercises: ProgramExercise[];
  /** Optional per-exercise control, e.g. the physio's remove button. */
  action?: (e: ProgramExercise) => ReactNode;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <ol className="space-y-2">
      {exercises.map((e, i) => {
        const ex = getExercise(e.exerciseId);
        const open = openId === e.exerciseId;
        return (
          <li key={e.exerciseId} className="rounded-xl border border-border bg-card p-3">
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary">
                {i + 1}
              </span>
              {ex?.images && (
                <img
                  src={ex.images.start}
                  alt={`${ex.name}: alkuasento`}
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{ex?.name ?? e.exerciseId}</p>
                <p className="text-sm text-muted-foreground">
                  {dosageText(e)}
                  {ex && ` · ${ex.category}`}
                </p>
                {ex && <p className="mt-0.5 text-sm">{ex.purpose}</p>}
                {e.note && <p className="mt-1 text-sm font-medium text-primary">{e.note}</p>}
                {ex && (
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : e.exerciseId)}
                    className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    {open ? "Piilota ohjeet" : "Näytä suoritusohjeet"}
                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
              {action && <div className="shrink-0 self-center">{action(e)}</div>}
            </div>
            {ex && open && (
              <div className="mt-3 border-t border-border pt-3">
                {ex.images && (
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <figure>
                      <img
                        src={ex.images.start}
                        alt={`${ex.name}: alkuasento`}
                        className="w-full rounded-lg object-cover"
                        loading="lazy"
                      />
                      <figcaption className="mt-1 text-center text-xs text-muted-foreground">1. Alkuasento</figcaption>
                    </figure>
                    <figure>
                      <img
                        src={ex.images.end}
                        alt={`${ex.name}: loppuasento`}
                        className="w-full rounded-lg object-cover"
                        loading="lazy"
                      />
                      <figcaption className="mt-1 text-center text-xs text-muted-foreground">2. Loppuasento</figcaption>
                    </figure>
                  </div>
                )}
                <ol className="list-decimal space-y-1 pl-5 text-sm">
                  {ex.instructions.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Tavoiteltu liike: </span>
                  {ex.targetMovement}
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Shows the rule-based program built from the intake and lets the client start
 * self-guided training. Physio-set programs are not shown here.
 */
export function ProgramProposal({ client }: { client: Client }) {
  const navigate = useNavigate();
  const p = client.program;

  if (!p && client.intake && needsProfessional(client.intake)) {
    return (
      <SoftCard className="mb-5 bg-destructive-soft">
        <p className="flex items-center gap-2 text-lg font-semibold">
          <AlertTriangle className="h-5 w-5" /> Harjoitusohjelmaa ei muodostettu
        </p>
        <p className="mt-1">
          Vastauksissasi on merkkejä, joiden vuoksi vamma pitää tutkia ennen omatoimista harjoittelua. Ota yhteyttä
          lääkäriin tai fysioterapeuttiin.
        </p>
      </SoftCard>
    );
  }
  if (!p || p.origin !== "rule-based") return null;

  const template = getProgram(p.programId);
  const started = p.status === "self-guided";

  const start = () => {
    startSelfGuidedProgram(client.id);
    toast.success("Itsenäinen harjoittelu aloitettu");
    navigate({ to: "/asiakas" });
  };

  return (
    <SoftCard className="mb-5 bg-[image:var(--gradient-hero)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" /> Sinulle muodostettu harjoitusohjelma
        </p>
        <span
          className={
            started
              ? "inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success"
              : "inline-flex rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-foreground"
          }
        >
          {started ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" /> Itsenäinen harjoittelu käynnissä
            </>
          ) : (
            "Valmis aloitettavaksi"
          )}
        </span>
      </div>
      <h2 className="mt-1 text-xl font-semibold">{template?.name}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {template?.phase} · {p.timesPerWeek === 7 ? "joka päivä" : `${p.timesPerWeek} kertaa viikossa`}
      </p>
      {template && <p className="mt-2">{template.goal}</p>}

      <div className="mt-4">
        <ProgramExerciseList exercises={p.exercises} />
      </div>

      {p.reasons && p.reasons.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Miksi tämä ohjelma?</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {p.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {p.cautions && p.cautions.length > 0 && (
        <ul className="mt-4 space-y-2">
          {p.cautions.map((c) => (
            <li key={c} className="flex gap-2 rounded-xl bg-warning-soft p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {c}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 flex gap-2 rounded-xl bg-card/70 p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Ohjelma on muodostettu automaattisesti vastaustesi perusteella ennalta määritellyillä säännöillä. Se ei ole
        diagnoosi, eikä fysioterapeutti ole vielä tarkistanut sitä. Harjoittele kivun sallimissa rajoissa. Fysioterapeutti
        voi myöhemmin muuttaa ohjelmaa.
      </p>

      {!started && (
        <button
          type="button"
          onClick={start}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex sm:w-auto"
        >
          <Play className="h-5 w-5" /> Aloita itsenäinen harjoittelu
        </button>
      )}
    </SoftCard>
  );
}
