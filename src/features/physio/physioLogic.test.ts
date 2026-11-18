import { describe, expect, it } from "vitest";
import { buildSeedData } from "@/data/seed";
import { countWithoutIntake, filterForPhysio, hasContacted, progressSummary, sortForPhysio } from "./physioLogic";
import type { ClientFilter } from "./physioLogic";
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

describe("physio client list filters", () => {
  const noFilter: ClientFilter = { query: "", areas: [], onlyWithoutIntake: false };

  it("without filters every client shows, in contact order", () => {
    const r = filterForPhysio(clients(), noFilter);
    expect(r.length).toBe(clients().length);
    expect(r[0]!.id).toBe("client-aino");
  });

  it("the intake option shows only clients with no completed intake", () => {
    const r = filterForPhysio(clients(), { ...noFilter, onlyWithoutIntake: true });
    expect(r.map((c) => c.id)).toContain("client-mikko");
    expect(r.every((c) => !c.intake)).toBe(true);
    expect(r.some((c) => c.id === "client-aino")).toBe(false);
    expect(r.length).toBe(countWithoutIntake(clients()));
  });

  it("body area and the intake option combine: both groups are shown", () => {
    const r = filterForPhysio(clients(), { query: "", areas: ["ankle"], onlyWithoutIntake: true });
    expect(r.some((c) => c.id === "client-aino")).toBe(true);
    expect(r.some((c) => c.id === "client-mikko")).toBe(true);
    expect(r.every((c) => c.intake?.bodyArea === "ankle" || !c.intake)).toBe(true);
  });

  it("a body area with no clients yields nothing on its own", () => {
    expect(filterForPhysio(clients(), { ...noFilter, areas: ["knee"] })).toEqual([]);
  });

  it("the name search always narrows, also inside the intake option", () => {
    const r = filterForPhysio(clients(), { query: "mikko", areas: [], onlyWithoutIntake: true });
    expect(r.map((c) => c.id)).toEqual(["client-mikko"]);
    expect(filterForPhysio(clients(), { query: "ei-oolemassa", areas: [], onlyWithoutIntake: true })).toEqual([]);
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
