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

/** Conversation list order: newest last message first; no messages last, alphabetically. Unread does not affect order. */
export function sortConversations(clients: Client[]): Client[] {
  const t = (c: Client) => { const m = lastMessage(c); return m ? new Date(m.date).getTime() : null; };
  return [...clients].sort((a, b) => {
    const ta = t(a), tb = t(b);
    if (ta !== null && tb !== null) return tb - ta;
    if (ta !== null) return -1;
    if (tb !== null) return 1;
    return a.name.localeCompare(b.name, "fi");
  });
}

/** Case-insensitive name filter. */
export function filterConversations(clients: Client[], query: string): Client[] {
  const q = query.trim().toLocaleLowerCase("fi");
  return q ? clients.filter((c) => c.name.toLocaleLowerCase("fi").includes(q)) : clients;
}
