import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/Section";
import { MessageThread } from "@/features/messages/MessageThread";
import { lastMessage, unreadCount } from "@/features/messages/messageLogic";
import { useAppData } from "@/hooks/useAppData";
import { markMessagesRead } from "@/services/messages";

export function PhysioMessagesPage({ clientId }: { clientId?: string }) {
  const data = useAppData();
  const clients = data?.clients ?? [];
  const selected = clients.find((c) => c.id === clientId) ?? clients.find((c) => c.messages.length > 0) ?? clients[0];
  const selectedId = selected?.id;
  const count = selected?.messages.length;
  useEffect(() => {
    if (selectedId) markMessagesRead("physio", selectedId);
  }, [selectedId, count]);

  return (
    <div>
      <PageHeader title="Viestit" subtitle="Keskustelut asiakkaiden kanssa" />
      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <ul className="space-y-2" aria-label="Keskustelut">
          {clients.map((c) => {
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
        {selected && (
          <section aria-label={`Keskustelu: ${selected.name}`}>
            <h2 className="mb-3 text-lg font-semibold">{selected.name}</h2>
            <MessageThread client={selected} role="physio" emptyText={`Ei viestejä. Voit aloittaa keskustelun ${selected.firstName}n kanssa.`} />
          </section>
        )}
      </div>
    </div>
  );
}
