import { beforeEach, describe, expect, it } from "vitest";
import { getData, resetDemoData, setActiveClient } from "@/services/storage";
import { completeIntake, saveIntakeDraft } from "@/services/intake";

describe("demo clients", () => {
  beforeEach(() => {
    localStorage.clear();
    resetDemoData();
  });

  it("Mikko starts without intake, program or progress", () => {
    const m = getData().clients.find((c) => c.id === "client-mikko")!;
    expect(m.intake).toBeUndefined();
    expect(m.program).toBeUndefined();
    expect(m.sessions).toHaveLength(0);
    expect(m.painLog).toHaveLength(0);
  });

  it("switching active client and saving Mikko's draft leaves Aino untouched", () => {
    const ainoBefore = JSON.stringify(getData().clients.find((c) => c.id === "client-aino"));
    setActiveClient("client-mikko");
    expect(getData().activeClientId).toBe("client-mikko");
    saveIntakeDraft("client-mikko", { step: 2, answers: { age: 52 } });
    expect(JSON.stringify(getData().clients.find((c) => c.id === "client-aino"))).toBe(ainoBefore);
  });

  it("reset restores both clients and Aino as active", () => {
    setActiveClient("client-mikko");
    const aino = getData().clients.find((c) => c.id === "client-aino")!;
    completeIntake("client-mikko", aino.intake!);
    resetDemoData();
    const d = getData();
    expect(d.activeClientId).toBe("client-aino");
    expect(d.clients.find((c) => c.id === "client-mikko")!.intake).toBeUndefined();
    expect(d.clients.find((c) => c.id === "client-aino")!.program?.status).toBe("active");
  });
});
