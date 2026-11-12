import { describe, expect, it } from "vitest";
import type { Client } from "@/types";
import { unreadCount } from "./messageLogic";

const client = {
  messages: [
    { id: "1", date: "2026-11-01T10:00:00Z", from: "physio", text: "a" },
    { id: "2", date: "2026-11-05T10:00:00Z", from: "client", text: "b" },
    { id: "3", date: "2026-11-06T10:00:00Z", from: "client", text: "c" },
  ],
  messagesReadAt: { physio: "2026-11-05T12:00:00Z", client: "2026-11-02T00:00:00Z" },
} as unknown as Client;

describe("unreadCount", () => {
  it("counts only the other role's messages after the last read", () => {
    expect(unreadCount(client, "physio")).toBe(1);
    expect(unreadCount(client, "client")).toBe(0);
  });
  it("own messages never count as unread", () => {
    expect(unreadCount({ ...client, messagesReadAt: {} }, "client")).toBe(1);
  });
});
