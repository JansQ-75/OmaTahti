import type { BodyArea } from "@/types";
import type { CameraExercise } from "@/features/workout/cameraLogic";

export interface BaselineTest {
  id: string;
  name: string;
  exercise: CameraExercise;
  durationSeconds: number;
  view: "sivulta" | "edestä";
  setup: string;
  instruction: string;
}

export const BASELINE_TESTS: Partial<Record<BodyArea, readonly BaselineTest[]>> = {
  ankle: [
    { id: "ankle-range", name: "Nilkan liikelaajuus", exercise: "ankle-flex", durationSeconds: 12, view: "sivulta",
      setup: "Istu tuolilla. Aseta laite sivullesi nilkan korkeudelle niin, että polvi, nilkka ja koko paljas jalkaterä näkyvät sivulta.",
      instruction: "Koukista ja ojenna nilkkaa rauhallisesti kivun sallimissa rajoissa. Älä pakota liikettä." },
    { id: "ankle-balance", name: "Yhden jalan seisonta", exercise: "single-leg-balance", durationSeconds: 30, view: "edestä",
      setup: "Aseta laite tukevasti noin 2–3 metrin päähän. Koko vartalon ja molempien jalkojen tulee näkyä edestä. Seiso tukevan tuolin vieressä.",
      instruction: "Seiso testattavalla jalalla ja nosta toinen jalka irti lattiasta. Ota tuolista tukea tarvittaessa. Lopeta, jos kipu estää testin." },
  ],
};