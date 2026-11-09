# OmaTahti – architecture proposal and phased plan

Frontend-only, clickable prototype. All UI text in Finnish. Demo data + localStorage. No backend, login or external APIs.

## Two adjustments to the spec

- **Routing:** this project uses TanStack Router (file-based) instead of React Router. Same result: every view is a real URL with working back/forward.
- **No App.tsx:** the root layout file (`src/routes/__root.tsx`) is the thin composition layer that App.tsx would be (providers + outlet). Route files stay thin and only render page components.

## Folder structure

```text
src/
  routes/                 thin route files (URL -> page)
  pages/                  page components (client/, physio/, shared/)
  layouts/                ClientLayout, PhysioLayout, ExerciseFullscreenLayout
  components/
    ui/                   shadcn base components
    common/               Card, BigButton, ProgressRing, StreakBadge, PainScale, Disclaimer, EmptyState
    navigation/           BottomNav, SideNav, RoleSwitchButton
  features/
    roles/                role state + RoleGuard (prevents wrong-role access)
    intake/               step-by-step intake wizard, steps, summary
    programs/             rule-based program selection (selectProgram)
    exercises/            ExerciseCard, ExerciseDetail, ExerciseRunner, CompletionSummary
    tracking/             completions, streak, pain log, progress charts
    camera/               camera permission, MediaPipe pose, per-exercise analyzers, feedback
    gamification/         animation registry, OrangeJuiceGame
    messaging/            threads, composer, send confirmation
    notifications/        rule engine (pain rising, activity dropping, new message...)
    ai-summary/           SummaryProvider interface + rule-based implementation
  services/               storage (localStorage repository), one service per data domain
  data/                   demo client(s), programs (ankle first), exercises, body areas
  types/                  Client, Intake, Program, Exercise, Completion, PainEntry, Message, Notification, MotionResult
  hooks/                  useClient, useProgram, useStreak, usePainLog, useMessages, useNotifications
  utils/                  dates, angles/geometry, formatting
```

Key extensibility rules:
- Programs and exercises are pure data; adding knee/shoulder/etc. = adding data files. Body areas not yet built show "Tulossa" buttons.
- Each exercise declares its own motion analysis target (e.g. ankle dorsiflexion angle), so camera analysis is per-exercise, not generic.
- Storage goes through a service layer, so a real database can replace localStorage later.
- AI summary goes through a provider interface; demo uses a rule-based provider clearly labelled as such.
- Data is always labelled by source: client-reported, camera estimate, rule-based observation, AI summary.

## Navigation and routes

```text
/                              Role selection (logo, slogan, "Jatka asiakkaana" / "Jatka fysioterapeuttina")

Client (bottom nav on mobile, sidebar on desktop: Etusivu, Harjoitukset, Edistyminen, Viestit)
/asiakas                       Home: greeting, program, streak, notifications, "Aloita päivän harjoitukset", "Vaihda roolia"
/asiakas/alkukartoitus         Intake wizard (back/next) -> summary -> program selection or "see a professional" stop
/asiakas/lahtotaso             Baseline camera assessment (skippable)
/asiakas/paivan-harjoitukset   Today's exercise list (route A)
/asiakas/harjoitukset          Full program view (route B)
/asiakas/harjoitukset/$id      Exercise instructions + "Aloita harjoitus"
/asiakas/harjoitukset/$id/suoritus    Fullscreen runner (camera, collapsible instructions, pause)
/asiakas/harjoitukset/$id/yhteenveto  Summary, pain 0-10, comment, confirm done
/asiakas/edistyminen           Charts: activity, streak, pain, motion results
/asiakas/viestit               Messages with physio

Physio (sidebar on desktop, bottom nav on mobile: Etusivu, Asiakkaat, Viestit)
/fysioterapeutti               Home: new messages, open notifications, clients needing attention, "Vaihda roolia"
/fysioterapeutti/asiakkaat     Client list
/fysioterapeutti/asiakkaat/$id Client view with tabs: Yhteenveto, Alkukartoitus, Kuntoutusohjelma,
                               Harjoittelun seuranta, Kivun seuranta, Liikeanalyysi, Viestit
/fysioterapeutti/viestit       All conversations
```

Role guards redirect to `/` if the wrong role opens a section. Both roles read the same shared demo client data, so the physio sees what the client did.

## Main components (responsibilities)

- **RoleGuard / role store** – stores selected role, protects role sections, "Vaihda roolia" clears it and goes to `/`.
- **IntakeWizard** – multi-step form, saves progress, produces IntakeSummary.
- **selectProgram()** – rules: body area -> program; pain/function -> phase and exercise variants; red flags -> "contact professional" instead of a program.
- **ExerciseRunner** – runs sets/reps; completion only after confirming in CompletionSummary.
- **PoseTracker + exercise analyzers** – MediaPipe landmarks, per-exercise angle/rep logic, green/yellow/red feedback, no corrective feedback when tracking is unreliable, never stores video.
- **OrangeJuiceGame** – oranges squeeze on detected ankle reps, glass fills/overflows, resets per set; clearly marked "simuloitu" when real tracking is off.
- **Notification engine** – rule checks over pain log, completions and messages; shown on both homes, suggests messaging the physio.
- **AiSummaryProvider** – rule-based summary for physio, labelled as prototype support, not a clinical decision.
- **Program editor (physio)** – proposed changes stay pending until the physio approves them.

## Demo data (seeded on first visit, shared model for both clients)

- **Client A – ongoing (~3 weeks):** completed ankle intake, baseline assessment, active program of 3–4 exercises, 8–10 completions spread over 3 weeks, improving pain trend, 2–3 repeat assessments of the same movement (with camera setup + confidence), 3–4 messages, at least one notification needing physio attention, progress summary. All dates and values tell one consistent story.
- **Client B – starting:** completed intake, baseline done or pending, proposed program awaiting physio approval, no exercise history.
- Fictional data only. Changes persist across role switches. Visible "Palauta demodata" restores everything (messages, notifications, completions, measurements).
- Supports scenario A (review progress) and scenario B (review intake, edit and approve program).
- Seed data model created in phase 1; fields filled as each phase adds its feature.

## Phases (from the spec)

1. Base structure, visual identity, role selection, both layouts and navigation, role home pages.
2. Client intake wizard (ankle ligament injury first), localStorage, summary, program selection. Plus guided baseline movement assessment: camera position/distance/lighting instructions, selected movement estimates saved locally as baseline (with camera setup metadata), skippable with "Tee myöhemmin", results labelled camera-based vs simulated. Pose analysis core built here and reused in phase 7.
3. Physio home, client list, intake view, choose/edit/assign program.
4. Client program and exercise instructions (based on the STADA ankle guide), start and mark done. The ankle demo program has at most 4 exercises: 1–2 with real camera tracking and at most 2 others that use a clearly labelled simulated mode.
5. Completion records, pain before/after, progress charts (Recharts), streak.
6. Messaging and rule-based notifications in both roles.
7. Camera tracking with MediaPipe Pose, real tracking for only 1–2 carefully chosen exercises (e.g. seated ankle flexion/extension filmed from the side, and single-leg balance filmed from the front). Each tracked exercise specifies required camera angle, distance and lighting guidance. All other exercises use a clearly labelled simulated mode. Feedback is suppressed (shown as "Kamera ei tunnista liikettä riittävän hyvin") whenever landmark confidence is low; detecting a movement is never presented as judging its correctness.
   Detected repetitions are emitted as events that the orange game consumes.
8. Orange-juice gamification tied to detected (or clearly simulated) repetitions.
   Physio "Liikeanalyysi" tab (filled in phases 7–9): baseline and later estimates over time, compared only for the same movement and similar camera setup, with source badges (kamera-arvio / simuloitu / asiakkaan ilmoittama) and a "not a clinical measurement" note.
9. Summaries and rule-based "AI" feedback, clearly labelled.
10. End-to-end check of all paths on mobile and desktop, persistence after refresh, polish.

After each phase: verify the app runs, earlier features still work, all buttons work, and report what is real vs simulated.

## Technical notes

- Stack: TanStack Start + React 19 + TypeScript + Vite + Tailwind v4 + shadcn; Recharts for charts; `@mediapipe/tasks-vision` loaded only in the browser (phase 7).
- localStorage is read after page load to avoid hydration mismatches; demo data seeds on first visit, with a "Palauta demodata" reset option.
- Design direction (proposed for phase 1): calm, warm health look — soft sage/teal primary, warm off-white background, a warm orange accent (ties to the orange game), rounded cards, large touch targets, friendly readable typeface (not Inter/Poppins).
