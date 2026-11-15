import { describe, expect, it } from "vitest";
import { liftedKneeIndex, updateButterfly } from "./butterflyLogic";

const obs = { reliable: true, lifted: true };
const knee = { x: .6, y: .5, visibility: .9 };
describe("workout butterfly", () => {
  it("uses the free right knee when the rehabilitated left leg supports, and vice versa", () => {
    expect(liftedKneeIndex("vasen")).toBe(26);
    expect(liftedKneeIndex("oikea")).toBe(25);
  });
  it("appears only when the free leg is raised with a reliable knee", () => {
    expect(updateButterfly(null, { ...obs, lifted: false }, knee, 1000)).toBeNull();
    expect(updateButterfly(null, obs, { ...knee, visibility: .44 }, 1000)).toBeNull();
    expect(updateButterfly(null, obs, { ...knee, visibility: .45 }, 1000)).toMatchObject({ x: .6, y: .5, motion: "calm" });
  });
  it("smooths movement rather than jumping straight to the new point", () => {
    const initial = updateButterfly(null, obs, knee, 1000);
    const next = updateButterfly(initial, obs, { ...knee, x: .7 }, 1100);
    expect(next?.x).toBeGreaterThan(.6);
    expect(next?.x).toBeLessThan(.7);
    expect(next?.motion).toBe("flutter");
  });
  it("briefly holds the last position without inventing motion when tracking is lost", () => {
    const initial = updateButterfly(null, obs, knee, 1000);
    expect(updateButterfly(initial, { reliable: false }, knee, 1500)).toEqual(initial);
    expect(updateButterfly(initial, { reliable: false }, knee, 1501)).toBeNull();
  });
  it("takes off briefly on lowering the leg, then returns on a reliable new lift", () => {
    const initial = updateButterfly(null, obs, knee, 1000);
    const grounded = { ...obs, lifted: false };
    const flight = updateButterfly(initial, grounded, knee, 1100);
    expect(flight?.motion).toBe("takeoff");
    expect(updateButterfly(flight, grounded, knee, 2000)).toBeNull();
    expect(updateButterfly(flight, obs, knee, 1500)).toMatchObject({ motion: "calm", takeoffAt: null });
  });
});