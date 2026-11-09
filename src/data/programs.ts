import type { RehabProgram } from "@/types";

// Programs are pure data: add new ones here without touching the UI.
export const PROGRAMS: RehabProgram[] = [
  {
    id: "ankle-sprain-early",
    name: "Nilkan nivelsidevamma – liikkeelle paluu",
    bodyArea: "ankle",
    goal: "Palauttaa nilkan liikkuvuus, tasapaino ja voima arjen liikkumiseen.",
    phase: "Vaihe 2: Liikkuvuus ja kuormituksen lisääminen",
    suitability: "Lievät ja keskivaikeat nilkan nyrjähdykset. Ei sovellu, jos jalalle ei voi varata.",
    exercises: [
      { exerciseId: "ankle-flex", sets: 3, reps: 15 },
      { exerciseId: "single-leg-balance", sets: 3, holdSeconds: 30 },
      { exerciseId: "heel-raise", sets: 3, reps: 12 },
      { exerciseId: "band-eversion", sets: 3, reps: 12 },
    ],
  },
];

export const getProgram = (id: string) => PROGRAMS.find((p) => p.id === id);
