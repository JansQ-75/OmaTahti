import { describe, expect, it } from "vitest";
import { baselineCountdownWord, baselineStartWord } from "./baselineLogic";
describe("baseline camera words", () => {
  it("shows HYVÄ ASENTO at 5 and 4", () => { expect(baselineCountdownWord("ankle-flex", 4)).toBe("HYVÄ ASENTO"); expect(baselineCountdownWord("single-leg-balance", 5)).toBe("HYVÄ ASENTO"); });
  it("shows prepare cue from 3", () => { expect(baselineCountdownWord("ankle-flex", 3)).toBe("VALMISTAUDU LIIKUTTAMAAN NILKKAA"); expect(baselineCountdownWord("single-leg-balance", 1)).toBe("VALMISTAUDU NOSTAMAAN JALKA"); });
  it("start words", () => { expect(baselineStartWord("ankle-flex")).toBe("LIIKUTA NILKKAA"); expect(baselineStartWord("single-leg-balance")).toBe("NOSTA JALKA"); });
});
