import type { Client, Role } from "@/types";

/** Messages from the other role sent after `role` last opened the thread. */
export function unreadCount(client: Client, role: Role) {
  const readAt = client.messagesReadAt?.[role];
  const from = readAt ? new Date(readAt).getTime() : -Infinity;
  return client.messages.filter((m) => m.from !== role && new Date(m.date).getTime() > from).length;
}
