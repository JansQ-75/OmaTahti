import { describe, expect, it } from "vitest";
import { buildSeedData } from "@/data/seed";
import { hasContacted, progressSummary, sortForPhysio } from "./physioLogic";
import type { Client } from "@/types";

const clients = () => buildSeedData().clients;
const byId = (id: string) => clients().find((c) => c.id === id)!;

describe("physio client list", () => {
  it("Aino has contacted the physio, Mikko has not", () => {
    expect(hasContacted(byId("client-aino"))).toBe(true);
    expect(hasContacted(byId("client-mikko"))).toBe(false);
  });

  it("clients who contacted come first, latest contact first", () => {
    const [aino, mikko] = [byId("client-aino"), byId("client-mikko")];
    const mikkoNew: Client = { ...mikko, messages: [{ id: "m", date: new Date().toISOString(), from: "client", text: "Hei" }] };
    expect(sortForPhysio([mikko, aino]).map((c) => c.id)).toEqual(["client-aino", "client-mikko"]);
    expect(sortForPhysio([aino, mikkoNew]).map((c) => c.id)).toEqual(["client-mikko", "client-aino"]);
  });
});

describe("progress summary", () => {
  it("counts only completed sessions; interrupted ones are counted separately", () => {
    // Aino's seed: 7 completed sessions and 1 interrupted session in the last 14 days, 4x/week.
    const s = progressSummary(byId("client-aino"), 14);
    expect(s.completed).toBe(7);
    expect(s.interrupted).toBe(1);
    expect(s.target).toBe(8);
    expect(s.latestPain?.level).toBe(2);
  });

  it("a new client has nothing to summarise", () => {
    const s = progressSummary(byId("client-mikko"), 14);
    expect(s).toMatchObject({ completed: 0, interrupted: 0, target: 0, streak: 0, pain: [] });
    expect(s.latestPain).toBeUndefined();
  });
});
