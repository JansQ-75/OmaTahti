import { expect, it } from "vitest";
import { buildSeedData } from "@/data/seed";
import type { AppData } from "@/types";
import { removeSimulatedEstimates } from "./storageLogic";

it("removes legacy simulated estimates but preserves completed workouts and intake", () => {
  const data = buildSeedData();
  const client = data.clients[0];
  if (!client) throw new Error("Missing demo client");
  const camera = { source: "camera", confidence: .95, view: "edestä", side: "vasen", groundTouches: 1 };
  const legacy = JSON.parse(JSON.stringify(data));
  legacy.clients[0].assessments = [{ id: "fake", source: "simulated" }, { id: "real", source: "camera" }];
  legacy.clients[0].sessions = [{
    id: "old", status: "completed", exerciseId: "single-leg-balance", date: "2026-11-15",
    trackingSource: "simulated",
    balance: { source: "simulated", steadySeconds: 30, groundTouches: 0 },
    sets: [{ exerciseId: "single-leg-balance", done: 30, target: 30, unit: "seconds", tracking: { ...camera, source: "simulated" } }],
  }, { id: "real", status: "completed", trackingSource: "camera", balance: { source: "camera", steadySeconds: 30, groundTouches: 1 }, sets: [{ tracking: camera }] }];
  const cleaned = removeSimulatedEstimates(legacy as AppData).clients[0];
  expect(cleaned?.assessments.map(a => a.id)).toEqual(["real"]);
  expect(cleaned?.sessions[0]).toMatchObject({ status: "completed", trackingSource: "none", sets: [{ done: 30, target: 30 }] });
  expect(cleaned?.sessions[0]?.balance).toBeUndefined();
  expect(cleaned?.sessions[0]?.sets?.[0]?.tracking).toBeUndefined();
  expect(cleaned?.sessions[1]?.sets?.[0]?.tracking).toEqual(camera);
  expect(cleaned?.sessions[1]?.balance?.groundTouches).toBe(1);
  expect(cleaned?.intake).toEqual(client.intake);
});