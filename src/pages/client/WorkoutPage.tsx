import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, Pause, Play, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { SourceBadge } from "@/components/common/Section";
import { getExercise } from "@/data/exercises";
import { dosageText } from "@/features/program/programLogic";
import {
  INTERRUPT_REASONS,
  addRep,
  buildSession,
  completeSet,
  exerciseSegments,
  initialWorkout,
  isHold,
  nextExercise,
  tick,
} from "@/features/workout/workoutLogic";
import { useActiveClient } from "@/hooks/useAppData";
import { cn } from "@/lib/utils";
import { markProgramStarted, saveWorkoutSession } from "@/services/workout";

const btn =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-base font-semibold disabled:opacity-50";
const primary = `${btn} bg-primary text-primary-foreground hover:bg-primary/90`;
const secondary = `${btn} border border-border bg-card hover:bg-muted`;

/** Full-screen focus mode: one exercise at a time, sets/reps or hold timer, interrupt with a reason. */
export function WorkoutPage({ startAt, single = false }: { startAt: number; single?: boolean }) {
  const client = useActiveClient();
  const navigate = useNavigate();
  const exercises = client?.program?.exercises ?? [];
  const [s, setS] = useState(() => initialWorkout(startAt));
  const [running, setRunning] = useState(false);
  const [interrupting, setInterrupting] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const saved = useRef(false);

  useEffect(() => {
    if (startAt >= exercises.length && exercises.length) setS(initialWorkout(0));
  }, [startAt, exercises.length]);

  // Hold timer
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setS((cur) => tick(cur, exercises, single)), 1000);
    return () => clearInterval(t);
  }, [running, exercises]);

  // Stop the timer whenever the set changes
  useEffect(() => setRunning(false), [s.exIndex, s.setIndex, s.finished]);

  // Save the completed session once
  useEffect(() => {
    if (s.finished && client && !saved.current) {
      saved.current = true;
      markProgramStarted(client.id);
      saveWorkoutSession(client.id, buildSession(s, exercises, { id: `s-${Date.now()}`, single }));
    }
  }, [s, client, exercises]);

  if (!client) return null;
  if (!client.program || exercises.length === 0) {
    return (
      <Overlay>
        <p className="text-lg font-semibold">Sinulla ei ole vielä harjoitusohjelmaa.</p>
        <Link to="/asiakas/harjoitukset" className={`${primary} mt-4`}>
          Takaisin harjoituksiin
        </Link>
      </Overlay>
    );
  }

  const confirmInterrupt = () => {
    if (!reason) return;
    saved.current = true;
    markProgramStarted(client.id);
    saveWorkoutSession(
      client.id,
      buildSession(s, exercises, { id: `s-${Date.now()}`, single, interruptReason: reason, comment: comment.trim() }),
    );
    toast("Harjoitus keskeytetty", { description: "Keskeytetty kerta ei kerrytä suorituksia tai putkea." });
    navigate({ to: "/asiakas/harjoitukset" });
  };

  if (s.finished) {
    return (
      <Overlay>
        <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">{single ? "Hienoa, liike tehty!" : "Hienoa, harjoituskerta tehty!"}</h1>
        <p className="mt-2 text-muted-foreground">
          {single
            ? `${getExercise(exercises[s.exIndex]?.exerciseId ?? "")?.name ?? "Liike"} on tallennettu ja kerryttää harjoitusputkeasi.`
            : `Teit kaikki ${exercises.length} liikettä. Kerta on tallennettu ja kerryttää harjoitusputkeasi.`}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {single ? (
            <Link to="/asiakas/harjoitukset" className={primary}>
              Palaa harjoituksiin
            </Link>
          ) : (
            <>
              <Link to="/asiakas" className={primary}>
                Etusivulle
              </Link>
              <Link to="/asiakas/harjoitukset" className={secondary}>
                Harjoituksiin
              </Link>
            </>
          )}
        </div>
      </Overlay>
    );
  }

  const pe = exercises[s.exIndex]!;
  const ex = getExercise(pe.exerciseId);
  const hold = isHold(pe);
  const target = hold ? (pe.holdSeconds ?? 0) : (pe.reps ?? 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold">{single ? "Yksittäinen liike" : `Liike ${s.exIndex + 1} / ${exercises.length}`}</p>
          <button type="button" onClick={() => setInterrupting(true)} className={`${secondary} min-h-10 px-4 text-sm`}>
            <X className="h-4 w-4" /> {single ? "Keskeytä liike" : "Keskeytä"}
          </button>
        </div>
        <div className="mt-3 flex gap-1.5" aria-hidden>
          {(single
            ? Array.from({ length: pe.sets }, (_, i) => (i < s.setIndex ? "done" : i === s.setIndex ? "current" : "upcoming"))
            : exerciseSegments(s, exercises.length)
          ).map((seg, i) => (
            <div
              key={i}
              className={cn(
                "h-2 flex-1 rounded-full",
                seg === "done" ? "bg-primary" : seg === "current" ? "bg-primary/50" : "bg-muted",
              )}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{ex?.name}</h1>
          {ex?.tracking === "simulated" && <SourceBadge source="simulated" />}
        </div>
        <p className="mt-1 text-muted-foreground">
          {dosageText(pe)} · {ex?.purpose}
        </p>
        {pe.note && <p className="mt-2 text-sm font-medium text-primary">{pe.note}</p>}

        {ex?.videoUrl ? (
          <figure className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
            <video
              src={ex.videoUrl}
              controls
              loop
              muted
              playsInline
              preload="metadata"
              aria-label={`Opastusvideo: ${ex.name}`}
              className="aspect-video w-full bg-black object-cover"
            />
            <figcaption className="px-3 py-2 text-sm font-semibold">Näin liike tehdään</figcaption>
          </figure>
        ) : (
          ex?.images && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {([["1. Alkuasento", ex.images.start], ["2. Loppuasento", ex.images.end]] as const).map(([label, src]) => (
                <figure key={label} className="overflow-hidden rounded-2xl border border-border bg-card">
                  <img src={src} alt={`${ex.name}: ${label}`} className="aspect-square w-full object-cover" />
                  <figcaption className="px-3 py-2 text-sm font-semibold">{label}</figcaption>
                </figure>
              ))}
            </div>
          )
        )}

        <ol className="mt-4 space-y-2 rounded-2xl bg-primary-soft p-4">
          {ex?.instructions.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-semibold text-primary">{i + 1}.</span> {t}
            </li>
          ))}
        </ol>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Sarja {s.setIndex + 1} / {pe.sets}
            {hold && " · Pito"}
          </p>
          {hold ? (
            <>
              <p className="mt-2 text-5xl font-bold tabular-nums" aria-live="polite">
                {s.seconds} <span className="text-2xl text-muted-foreground">/ {target} s</span>
              </p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
                  style={{ width: `${(s.seconds / target) * 100}%` }}
                />
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" className={primary} onClick={() => setRunning((r) => !r)}>
                  {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  {running ? "Tauko" : s.seconds > 0 ? "Jatka" : "Käynnistä"}
                </button>
                <button type="button" className={secondary} onClick={() => setS(completeSet(s, exercises, single))}>
                  <Check className="h-5 w-5" /> Kuittaa sarja tehdyksi
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label={`${s.reps} / ${target} toistoa`}>
                {Array.from({ length: target }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-6 w-6 rounded-full border-2 transition-colors",
                      i < s.reps ? "border-primary bg-primary" : "border-border bg-muted",
                    )}
                  />
                ))}
              </div>
              <p className="mt-3 text-lg font-semibold tabular-nums">
                {s.reps} / {target} toistoa
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" className={primary} onClick={() => setS(addRep(s, exercises, single))}>
                  <Plus className="h-5 w-5" /> Toisto tehty
                </button>
                <button type="button" className={secondary} onClick={() => setS(completeSet(s, exercises, single))}>
                  <Check className="h-5 w-5" /> Kuittaa sarja tehdyksi
                </button>
              </div>
            </>
          )}
        </section>

        {!single && <button
          type="button"
          className="mt-4 self-center text-sm font-medium text-muted-foreground underline"
          onClick={() => setS(nextExercise(s, exercises))}
        >
          {s.exIndex + 1 < exercises.length ? "Siirry seuraavaan liikkeeseen" : "Lopeta viimeinen liike"}
        </button>}
      </div>

      {interrupting && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center">
          <div role="dialog" aria-label={single ? "Keskeytä liike" : "Keskeytä harjoitus"} className="w-full max-w-md rounded-2xl bg-card p-5">
            <h2 className="text-xl font-semibold">{single ? "Keskeytetäänkö liike?" : "Keskeytetäänkö harjoitus?"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Kerro syy. Keskeytetty kerta tallentuu, mutta ei kerrytä suorituksia eikä putkea.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {INTERRUPT_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={reason === r}
                  onClick={() => setReason(r)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium",
                    reason === r ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Lisätietoa (vapaaehtoinen)"
              className="mt-3 w-full rounded-xl border border-border bg-background p-3 text-sm"
              rows={2}
            />
            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <button type="button" className={secondary} onClick={() => setInterrupting(false)}>
                Jatka harjoitusta
              </button>
              <button type="button" className={primary} disabled={!reason} onClick={confirmInterrupt}>
                {single ? "Keskeytä liike" : "Keskeytä harjoitus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-6 text-center">
      <div className="max-w-md">{children}</div>
    </div>
  );
}
