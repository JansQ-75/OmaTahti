import { describe, expect, it } from "vitest";
import { unreadCount, validMessageText } from "./messageLogic";
import type { Client } from "@/types";

const base = {
  messages: [
    { id: "1", date: "2026-11-01T10:00:00Z", from: "client", text: "a" },
    { id: "2", date: "2026-11-03T10:00:00Z", from: "client", text: "b" },
    { id: "3", date: "2026-11-04T10:00:00Z", from: "physio", text: "c" },
  ],
  messagesReadAt: { physio: "2026-11-02T00:00:00Z" },
} as unknown as Client;

describe("messages", () => {
  it("counts only the other role's messages after last read", () => {
    expect(unreadCount(base, "physio")).toBe(1);
    expect(unreadCount(base, "client")).toBe(1);
  });
  it("rejects empty messages and trims text", () => {
    expect(validMessageText("   ")).toBeNull();
    expect(validMessageText("  hei ")).toBe("hei");
  });
});
