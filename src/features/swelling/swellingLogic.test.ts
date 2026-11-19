import { describe, expect, it } from "vitest";
import { needsSwellingAdvice, SWELLING_OPTIONS } from "./swellingLogic";

describe("swelling", () => {
  it("has four options in order", () => {
    expect(SWELLING_OPTIONS.map((o) => o.label)).toEqual(["Ei ollenkaan", "Väheni", "Pysyi ennallaan", "Lisääntyi"]);
  });
  it("advice only when unchanged or increased", () => {
    expect(needsSwellingAdvice("lisaantyi")).toBe(true);
    expect(needsSwellingAdvice("ennallaan")).toBe(true);
    expect(needsSwellingAdvice("vaheni")).toBe(false);
    expect(needsSwellingAdvice("ei-ollenkaan")).toBe(false);
  });
});
