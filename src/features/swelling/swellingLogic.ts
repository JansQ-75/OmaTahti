import type { SwellingAfter } from "@/types";

export const SWELLING_QUESTION = "Turvotustilanne harjoituksen jälkeen:";

export const SWELLING_OPTIONS: { value: SwellingAfter; label: string }[] = [
  { value: "ei-ollenkaan", label: "Ei ollenkaan" },
  { value: "vaheni", label: "Väheni" },
  { value: "ennallaan", label: "Pysyi ennallaan" },
  { value: "lisaantyi", label: "Lisääntyi" },
];

export function swellingLabel(v: SwellingAfter) {
  return SWELLING_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

/** Home advice is shown only when swelling is still present: unchanged or increased. */
export function needsSwellingAdvice(v: SwellingAfter | undefined) {
  return v === "ennallaan" || v === "lisaantyi";
}

export const SWELLING_ADVICE_TITLE = "Turvotuksen omahoito harjoituksen jälkeen";
export const SWELLING_ADVICE = [
  "Kohoasento: nosta nilkka sydämen tason yläpuolelle 15–20 minuutiksi.",
  "Kevyt nilkkapumppaus: liikuta nilkkaa rauhallisesti ylös ja alas kivuttomalla alueella.",
  "Kevennä seuraavaa harjoituskertaa ja anna nilkalle lepoa.",
  "Jos turvotus on voimakasta, kuumottaa tai ei asetu levolla, laita viesti fysioterapeutillesi.",
];
