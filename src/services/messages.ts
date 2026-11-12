import { updateData } from "./storage";
import type { Role } from "@/types";

/** Marks messages as read for a role; physio without clientId reads all threads. */
export function markMessagesRead(role: Role, clientId?: string) {
  const now = new Date().toISOString();
  updateData((d) => ({
    ...d,
    clients: d.clients.map((c) =>
      !clientId || c.id === clientId ? { ...c, messagesReadAt: { ...c.messagesReadAt, [role]: now } } : c,
    ),
  }));
}

export function dismissNotification(clientId: string, notificationId: string) {
  updateData((d) => ({
    ...d,
    clients: d.clients.map((c) =>
      c.id === clientId
        ? { ...c, notifications: c.notifications.map((n) => (n.id === notificationId ? { ...n, handled: true } : n)) }
        : c,
    ),
  }));
}
