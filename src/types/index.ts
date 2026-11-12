// Shared data model for OmaTahti. Both roles read and write these same records.

export type Role = "client" | "physio";

export type BodyArea = "ankle" | "knee" | "shoulder" | "hip" | "wrist" | "back";

export type DataSource = "client-reported" | "camera" | "simulated" | "rule-based" | "ai-summary";

export type WeightBearing = "normaalisti" | "ontuen" | "ei pysty";
export type WalkingTolerance = "yli 30 min" | "10–30 min" | "alle 10 min";

/** Client-reported intake. Everything here is "asiakkaan ilmoittama", never a diagnosis. */
export interface Intake {
  completedAt: string;
  age: number;
  sex: "nainen" | "mies" | "muu" | "ei halua kertoa";
  previousInjuries: string;
  bodyArea: BodyArea;
  side: "vasen" | "oikea";
  injuryType: string; // e.g. "Nilkan nivelsidevamma (nyrjähdys)"
  mechanism: string;
  injuryDate: string;
  painLocation: string;
  painAtRest: number; // 0–10
  painLevel: number; // 0–10, pain on load / activity
  symptoms: string[];
  weightBearing: WeightBearing;
  walkingTolerance: WalkingTolerance;
  difficultActivities: string[];
  perceivedMobility: "hyvä" | "kohtalainen" | "heikko";
  otherSymptoms: string;
  goals: string;
  redFlags: string[];
}

/** Unfinished intake answers, saved locally on every change so the client can continue later. */
export interface IntakeDraft {
  step: number;
  answers: { [K in keyof Omit<Intake, "completedAt">]?: Intake[K] | undefined };
  updatedAt: string;
}

export type ExerciseCategory = "liikkuvuus" | "lihasvoima" | "tasapaino" | "liikehallinta";

export type TrackingMode = "camera" | "simulated";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  purpose: string;
  instructions: string[];
  sets: number;
  reps?: number;
  holdSeconds?: number;
  targetMovement: string;
  tracking: TrackingMode;
  /** Optional start/end pose illustrations (shown side by side). */
  images?: { start: string; end: string };
  /** Optional guidance video (shown in the workout view instead of the image pair). */
  videoUrl?: string;
}

export interface ProgramExercise {
  exerciseId: string;
  sets: number;
  reps?: number;
  holdSeconds?: number;
  note?: string;
}

/** Rehab stage: 1 = early/gentle, 2 = loading increases, 3 = strength, balance and return to activity. */
export type ProgramStage = 1 | 2 | 3;

export interface RehabProgram {
  id: string;
  name: string;
  bodyArea: BodyArea;
  stage: ProgramStage;
  goal: string;
  phase: string;
  suitability: string;
  timesPerWeek: number;
  exercises: ProgramExercise[];
}

export interface AssignedProgram {
  programId: string;
  /**
   * proposed    = rule-based suggestion the client has not started yet
   * self-guided = client trains on the rule-based program without physio approval
   * active      = set or approved by the physio (approval happens at the moment of the change)
   */
  status: "proposed" | "self-guided" | "active";
  origin: "rule-based" | "physio";
  timesPerWeek: number;
  exercises: ProgramExercise[];
  physioInstructions?: string;
  approvedAt?: string;
  createdAt?: string;
  startedAt?: string;
  /** Rule-based: why this program and dosage were chosen (Finnish, shown to client and physio). */
  reasons?: string[];
  /** Rule-based: safety notes derived from the answers. */
  cautions?: string[];
}

export interface ExerciseSession {
  id: string;
  exerciseId: string;
  date: string;
  status: "completed" | "interrupted";
  interruptReason?: string;
  painBefore?: number;
  painAfter?: number;
  comment?: string;
  trackedReps?: number;
  trackingSource?: TrackingMode | "none";
  /** full = whole program session, single = one exercise via its play button. Missing = single. */
  kind?: "full" | "single";
  /** Exercises done in a completed session (falls back to exerciseId). */
  exerciseIds?: string[];
  /** Per-set results: what was actually done vs the target (partial sets are allowed). */
  sets?: SetResult[];
  /** Single-leg balance quality. The timer never stops on a ground touch; touches only describe stability. */
  balance?: { steadySeconds: number; groundTouches: number; source: "camera" | "simulated" };
}

export interface SetResult {
  exerciseId: string;
  done: number;
  target: number;
  unit: "reps" | "seconds";
}

export interface PainEntry {
  id: string;
  date: string;
  level: number;
  comment?: string;
  source: "client-reported";
}

export interface CameraSetup {
  view: "sivulta" | "edestä";
  distanceMeters: number;
  lighting: "hyvä" | "kohtalainen" | "heikko";
}

export interface MovementAssessment {
  id: string;
  date: string;
  movement: string; // e.g. "nilkan koukistus"
  kind: "baseline" | "follow-up";
  side: "vasen" | "oikea";
  valueDegrees?: number;
  otherSideDegrees?: number;
  setup: CameraSetup;
  confidence: number; // 0–1
  source: "camera" | "simulated";
}

export interface Message {
  id: string;
  date: string;
  from: Role;
  text: string;
}

export interface AppNotification {
  id: string;
  date: string;
  type: "pain-rising" | "activity-dropping" | "new-message" | "program-pending" | "function-declining";
  text: string;
  audience: Role[];
  handled: boolean;
  source: "rule-based";
}

export interface Client {
  id: string;
  name: string;
  firstName: string;
  intake?: Intake;
  intakeDraft?: IntakeDraft;
  baselineStatus: "done" | "pending" | "skipped";
  program?: AssignedProgram;
  sessions: ExerciseSession[];
  painLog: PainEntry[];
  assessments: MovementAssessment[];
  messages: Message[];
  notifications: AppNotification[];
  /** When each role last opened this client's messages; newer messages from the other role are unread. */
  messagesReadAt?: Partial<Record<Role, string>>;
}

export interface AppData {
  version: number;
  activeClientId: string; // the client the "Jatka asiakkaana" role uses
  clients: Client[];
}
