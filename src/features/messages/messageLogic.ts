import type { Client, Role } from "@/types";

/** Messages from the other role sent after `role` last opened the thread. */
export function unreadCount(client: Client, role: Role) {
  const readAt = client.messagesReadAt?.[role];
  const from = readAt ? new Date(readAt).getTime() : -Infinity;
  return client.messages.filter((m) => m.from !== role && new Date(m.date).getTime() > from).length;
}

export const MAX_MESSAGE_LENGTH = 1000;

/** Trimmed text if it can be sent, otherwise null (empty or too long). */
export function validMessageText(text: string): string | null {
  const t = text.trim();
  return t.length === 0 || t.length > MAX_MESSAGE_LENGTH ? null : t;
}

/** Latest message of a thread, if any. */
export function lastMessage(client: Client) {
  return client.messages[client.messages.length - 1];
}
