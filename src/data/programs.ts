import type { RehabProgram } from "@/types";

// Programs are pure data: add new ones here without touching the UI.
// The ankle programs follow the STADA ankle sprain guide (Haapasalo & Koskela):
// mobility first, strength from ~1–2 weeks, balance once weight bearing is easy.
// The rule-based selection (src/features/program/programLogic.ts) picks a program
// by body area and stage.
export const PROGRAMS: RehabProgram[] = [
  {
    id: "ankle-sprain-acute",
    name: "Nilkan nivelsidevamma – varovainen aloitus",
    bodyArea: "ankle",
    stage: 1,
    goal: "Saada nilkka liikkeelle ja vähentää jäykkyyttä ilman rasittavaa kuormitusta.",
    phase: "Vaihe 1: Liikkuvuus kivun sallimissa rajoissa",
    suitability:
      "Tuore vamma tai voimakas kipu. Tasapaino- ja voimaharjoitukset lisätään, kun jalalle varaaminen onnistuu ongelmitta.",
    timesPerWeek: 7,
    exercises: [
      { exerciseId: "ankle-flex", sets: 3, reps: 20, note: "Voit toistaa sarjoja useita kertoja päivässä." },
      { exerciseId: "band-eversion", sets: 3, reps: 15, note: "Ilman vastusta tai kevyellä nauhalla." },
    ],
  },
  {
    id: "ankle-sprain-early",
    name: "Nilkan nivelsidevamma – liikkeelle paluu",
    bodyArea: "ankle",
    stage: 2,
    goal: "Palauttaa nilkan liikkuvuus, tasapaino ja voima arjen liikkumiseen.",
    phase: "Vaihe 2: Liikkuvuus ja kuormituksen lisääminen",
    suitability: "Lievät ja keskivaikeat nilkan nyrjähdykset. Ei sovellu, jos jalalle ei voi varata.",
    timesPerWeek: 4,
    exercises: [
      { exerciseId: "ankle-flex", sets: 3, reps: 15 },
      { exerciseId: "single-leg-balance", sets: 3, holdSeconds: 30 },
      { exerciseId: "heel-raise", sets: 3, reps: 12 },
      { exerciseId: "band-eversion", sets: 3, reps: 12 },
    ],
  },
  {
    id: "ankle-sprain-return",
    name: "Nilkan nivelsidevamma – voima ja tasapaino",
    bodyArea: "ankle",
    stage: 3,
    goal: "Vahvistaa nilkan tukilihaksia ja tasapainoa uusintavammojen ehkäisemiseksi.",
    phase: "Vaihe 3: Voima, tasapaino ja paluu liikuntaan",
    suitability: "Kun kävely sujuu kivutta ja jalalle voi varata normaalisti.",
    timesPerWeek: 4,
    exercises: [
      { exerciseId: "ankle-flex", sets: 2, reps: 20 },
      {
        exerciseId: "single-leg-balance",
        sets: 3,
        holdSeconds: 45,
        note: "Kun asento on helppo, kokeile pehmeällä alustalla, esim. tyynyn päällä.",
      },
      {
        exerciseId: "heel-raise",
        sets: 3,
        reps: 20,
        note: "Pidä paino jalkaterän keskellä, älä anna nilkan kiertyä ulospäin.",
      },
      {
        exerciseId: "band-eversion",
        sets: 3,
        reps: 10,
        note: "Napakka vastus: viimeisten toistojen pitää tuntua raskailta.",
      },
    ],
  },
];

export const getProgram = (id: string) => PROGRAMS.find((p) => p.id === id);
