// Pure rules for one guided training session (phase 4). Deterministic and tested.
import type { ExerciseSession, ProgramExercise, SetResult } from "@/types";

export interface WorkoutState {
  exIndex: number; // current exercise in the program
  setIndex: number; // 0-based current set
  reps: number; // reps done in the current set
  seconds: number; // seconds held in the current set
  finished: boolean;
  /** Results of confirmed sets, including partial ones. */
  log: SetResult[];
}

export const initialWorkout = (startAt = 0): WorkoutState => ({
  exIndex: startAt,
  setIndex: 0,
  reps: 0,
  seconds: 0,
  finished: false,
  log: [],
});

export const isHold = (e: ProgramExercise) => !!e.holdSeconds;

/** Marks the current set done; moves to the next set, the next exercise, or finishes. */
export function completeSet(s: WorkoutState, exercises: ProgramExercise[], single = false): WorkoutState {
  if (s.finished) return s;
  const ex = exercises[s.exIndex];
  if (!ex) return { ...s, finished: true };
  const hold = isHold(ex);
  const target = (hold ? ex.holdSeconds : ex.reps) ?? 0;
  const done = Math.min(target, hold ? s.seconds : s.reps);
  s = { ...s, log: [...s.log, { exerciseId: ex.exerciseId, done, target, unit: hold ? "seconds" : "reps" }] };
  if (s.setIndex + 1 < ex.sets) return { ...s, setIndex: s.setIndex + 1, reps: 0, seconds: 0 };
  return single ? { ...s, finished: true, reps: 0, seconds: 0 } : nextExercise(s, exercises);
}

export function nextExercise(s: WorkoutState, exercises: ProgramExercise[]): WorkoutState {
  const exIndex = s.exIndex + 1;
  if (exIndex >= exercises.length) return { ...s, finished: true, reps: 0, seconds: 0 };
  return { ...s, exIndex, setIndex: 0, reps: 0, seconds: 0, finished: false };
}

/** One rep done; a full set completes automatically. */
export function addRep(s: WorkoutState, exercises: ProgramExercise[], single = false): WorkoutState {
  const ex = exercises[s.exIndex];
  if (!ex || s.finished || isHold(ex)) return s;
  const reps = s.reps + 1;
  return reps >= (ex.reps ?? 0) ? completeSet({ ...s, reps }, exercises, single) : { ...s, reps };
}

/** One second of a hold; the set completes when the target time is reached. */
export function tick(s: WorkoutState, exercises: ProgramExercise[], single = false): WorkoutState {
  const ex = exercises[s.exIndex];
  if (!ex || s.finished || !isHold(ex)) return s;
  const seconds = s.seconds + 1;
  return seconds >= (ex.holdSeconds ?? 0) ? completeSet({ ...s, seconds }, exercises, single) : { ...s, seconds };
}

/** Segment state for the top progress bar. */
export function exerciseSegments(s: WorkoutState, count: number) {
  return Array.from({ length: count }, (_, i) =>
    s.finished || i < s.exIndex ? "done" : i === s.exIndex ? "current" : "upcoming",
  );
}

/**
 * The stored record of a session. Completed only when every exercise was done;
 * an interrupted session keeps the reason and never counts toward completions.
 */
export function buildSession(
  s: WorkoutState,
  exercises: ProgramExercise[],
  opts: { id: string; single?: boolean; now?: Date; interruptReason?: string; comment?: string; painAfter?: number },
): ExerciseSession {
  const interrupted = opts.interruptReason !== undefined || !s.finished;
  const at = exercises[Math.min(s.exIndex, exercises.length - 1)];
  return {
    id: opts.id,
    exerciseId: interrupted || opts.single ? (at?.exerciseId ?? "") : (exercises[0]?.exerciseId ?? ""),
    date: (opts.now ?? new Date()).toISOString(),
    status: interrupted ? "interrupted" : "completed",
    ...(interrupted ? { interruptReason: opts.interruptReason ?? "Ei syytä" } : {}),
    ...(opts.comment ? { comment: opts.comment } : {}),
    trackingSource: s.log.some(r => r.tracking?.source === "camera") ? "camera" : s.log.some(r => r.tracking?.source === "simulated") ? "simulated" : "none",
    ...balanceResult(s.log),
    kind: opts.single ? "single" : "full",
    ...(!interrupted
      ? { exerciseIds: opts.single ? [at?.exerciseId ?? ""] : exercises.map((e) => e.exerciseId) }
      : {}),
    ...(s.log.length ? { sets: s.log } : {}),
    ...(opts.painAfter !== undefined ? { painAfter: opts.painAfter } : {}),
  };
}

export const INTERRUPT_REASONS = [
  "Kipu lisääntyi",
  "Nilkka tuntui epävakaalta",
  "Väsymys",
  "Ajanpuute",
  "Ohje oli epäselvä",
  "Muu syy",
];

/** Label for the confirm button: shows what was actually done in this set. */
export function confirmLabel(done: number, target: number, hold: boolean) {
  return `Kuittaa sarja (${Math.min(done, target)} / ${target} ${hold ? "s" : "toistoa"} tehty)`;
}

function balanceResult(log: SetResult[]): Partial<ExerciseSession> {
 const last = log.filter(r => r.exerciseId === "single-leg-balance" && r.tracking?.groundTouches !== undefined).at(-1);
 if (!last?.tracking || last.tracking.groundTouches === undefined) return {};
 return { balance: { steadySeconds: last.done, groundTouches: last.tracking.groundTouches, source: last.tracking.source, ...(last.tracking.sway !== undefined ? {sway:last.tracking.sway}:{}), confidence:last.tracking.confidence } };
}
