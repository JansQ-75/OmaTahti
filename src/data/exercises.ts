import type { Exercise } from "@/types";

// Ankle demo exercises (STADA ankle sprain guide as the basis).
// Max 4: two with real camera tracking, two clearly simulated.
export const EXERCISES: Exercise[] = [
  {
    id: "ankle-flex",
    name: "Nilkan koukistus ja ojennus",
    category: "liikkuvuus",
    purpose: "Palauttaa nilkan normaali liikelaajuus, erityisesti koukistus kävelyä varten.",
    instructions: [
      "Istu tuolilla, jalka suorana edessä kantapää lattialla.",
      "Vedä varpaita kohti itseäsi niin pitkälle kuin kivuttomasti onnistuu.",
      "Ojenna sitten nilkka rauhallisesti alas.",
    ],
    sets: 3,
    reps: 15,
    targetMovement: "Nilkan koukistus noin 20–30° ja ojennus",
    tracking: "camera",
  },
  {
    id: "single-leg-balance",
    name: "Yhden jalan seisonta",
    category: "tasapaino",
    purpose: "Parantaa nilkan asentotuntoa ja tasapainoa.",
    instructions: [
      "Seiso tukevan tuolin vieressä.",
      "Nosta terve jalka irti lattiasta.",
      "Pidä asento vakaana. Ota tarvittaessa tukea tuolista.",
    ],
    sets: 3,
    holdSeconds: 30,
    targetMovement: "Lantio ja hartiat vakaina yhden jalan varassa",
    tracking: "camera",
  },
  {
    id: "heel-raise",
    name: "Varpaille nousu",
    category: "lihasvoima",
    purpose: "Vahvistaa pohkeen ja nilkan lihaksia.",
    instructions: [
      "Seiso molemmilla jaloilla, ota tukea seinästä.",
      "Nouse rauhallisesti varpaille ja laskeudu hitaasti alas.",
    ],
    sets: 3,
    reps: 12,
    targetMovement: "Kantapäiden nousu ja hallittu lasku",
    tracking: "simulated",
  },
  {
    id: "band-eversion",
    name: "Nilkan ulkokierto kuminauhalla",
    category: "liikehallinta",
    purpose: "Vahvistaa nilkan ulkosyrjän lihaksia, jotka tukevat nivelsiteitä.",
    instructions: [
      "Istu lattialla, kuminauha jalkaterän ympäri.",
      "Käännä jalkaterää ulospäin nauhan vastusta vastaan.",
      "Palauta hitaasti.",
    ],
    sets: 3,
    reps: 12,
    targetMovement: "Jalkaterän kääntö ulospäin",
    tracking: "simulated",
  },
];

export const getExercise = (id: string) => EXERCISES.find((e) => e.id === id);
