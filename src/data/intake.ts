import type { BodyArea } from "@/types";

// Body-area specific intake options are pure data: a new body area only needs
// an entry here (plus its programs) – the intake wizard UI stays the same.
export interface IntakeAreaOptions {
  injuryTypes: string[];
  mechanisms: string[];
  painLocations: string[];
  symptoms: string[];
  difficultActivities: string[];
  /** Answers that mean the client should see a professional before self-guided exercise. */
  redFlags: string[];
}

export const INTAKE_OPTIONS: Partial<Record<BodyArea, IntakeAreaOptions>> = {
  ankle: {
    injuryTypes: ["Nilkan nivelsidevamma (nyrjähdys)", "En tiedä / ei diagnoosia"],
    mechanisms: [
      "Nilkka kääntyi sisäänpäin",
      "Nilkka kääntyi ulospäin",
      "Astuin harhaan tai kompastuin",
      "Hyppy tai alastulo",
      "Muu syy",
    ],
    painLocations: [
      "Ulkokehrän etupuoli",
      "Ulkokehrän alapuoli",
      "Sisäkehrän seutu",
      "Nilkan etuosa",
      "Akillesjänne / kantapää",
    ],
    symptoms: [
      "Turvotus",
      "Mustelma",
      "Jäykkyys",
      "Epävakauden tunne (nilkka pettää)",
      "Kipu yöllä",
      "Naksuminen tai lukkiutuminen",
    ],
    difficultActivities: [
      "Kävely",
      "Pidempi kävely",
      "Portaat",
      "Epätasainen maasto",
      "Juoksu",
      "Hyppiminen",
      "Seisominen pitkään",
      "Urheilu",
    ],
    redFlags: [
      "En pysty varaamaan jalalle lainkaan (en saa otettua 4 askelta)",
      "Nilkka tai jalkaterä on selvästi virheasennossa",
      "Jalkaterässä on puutumista tai pistelyä",
      "Jalkaterä on kylmä tai sinertävä",
      "Nilkka on kuuma ja punoittava tai minulla on kuumetta",
      "Kova kipu, joka ei helpota levossa",
    ],
  },
};

export const getIntakeOptions = (area?: BodyArea) => (area ? INTAKE_OPTIONS[area] : undefined);
