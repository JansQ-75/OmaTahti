import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/Section";
import { MessageThread } from "@/features/messages/MessageThread";
import { filterConversations, lastMessage, sortConversations, unreadCount } from "@/features/messages/messageLogic";
import { useAppData } from "@/hooks/useAppData";
import { markMessagesRead } from "@/services/messages";

export function PhysioMessagesPage({ clientId }: { clientId?: string | undefined }) {
  const data = useAppData();
  const clients = data?.clients ?? [];
  const selected = clients.find((c) => c.id === clientId) ?? clients.find((c) => c.messages.length > 0) ?? clients[0];
  const selectedId = selected?.id;
  const count = selected?.messages.length;
  const [query, setQuery] = useState("");
  // Order is frozen per message count so opening an unread thread never moves it.
  const orderKey = clients.map((c) => `${c.id}:${c.messages.length}`).join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sorted = useMemo(() => sortConversations(clients), [orderKey]);
  const visible = filterConversations(sorted, query);
  useEffect(() => {
    if (selectedId) markMessagesRead("physio", selectedId);
  }, [selectedId, count]);

  return (
    <div>
      <PageHeader title="Viestit" subtitle="Keskustelut asiakkaiden kanssa" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
        <div className="min-w-0 md:sticky md:top-4 md:self-start">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hae asiakasta"
              aria-label="Hae asiakasta"
              className="w-full rounded-2xl border border-border bg-card py-2 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Tyhjennä haku" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        <ul className="max-h-72 md:max-h-[calc(100vh-220px)] space-y-2 overflow-y-auto pr-1" aria-label="Keskustelut">
          {visible.length === 0 && <li className="p-3 text-sm text-muted-foreground">Ei hakutuloksia</li>}
          {visible.map((c) => {
            const last = lastMessage(c);
            const unread = unreadCount(c, "physio");
            const active = c.id === selectedId;
            return (
              <li key={c.id}>
                <Link
                  to="/fysioterapeutti/viestit"
                  search={{ asiakas: c.id }}
                  className={`block rounded-2xl border p-3 ${active ? "border-primary bg-primary-soft" : "border-border bg-card hover:bg-muted"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{c.name}</span>
                    {unread > 0 && (
                      <span className="rounded-full bg-destructive px-2 text-xs font-semibold text-destructive-foreground">{unread}</span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{last ? last.text : "Ei viestejä vielä"}</p>
                </Link>
              </li>
            );
          })}
        </ul>
        </div>
        {selected && (
          <section className="min-w-0 md:sticky md:top-4 md:self-start" aria-label={`Keskustelu: ${selected.name}`}>
            <h2 className="mb-3 text-lg font-semibold">{selected.name}</h2>
            <MessageThread client={selected} role="physio" emptyText="Ei viestejä vielä. Voit aloittaa keskustelun." />
          </section>
        )}
      </div>
    </div>
  );
}
