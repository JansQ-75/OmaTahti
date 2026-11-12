import { updateData } from "./storage";
import { validMessageText } from "@/features/messages/messageLogic";
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

/** Appends a message to the client's shared thread; the sender has read everything up to now. */
export function sendMessage(clientId: string, from: Role, text: string): boolean {
  const t = validMessageText(text);
  if (!t) return false;
  const now = new Date().toISOString();
  updateData((d) => ({
    ...d,
    clients: d.clients.map((c) =>
      c.id === clientId
        ? {
            ...c,
            messages: [...c.messages, { id: `msg-${Date.now()}`, date: now, from, text: t }],
            messagesReadAt: { ...c.messagesReadAt, [from]: now },
          }
        : c,
    ),
  }));
  return true;
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
