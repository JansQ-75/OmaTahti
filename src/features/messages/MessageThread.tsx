import { useEffect, useRef, useState } from "react";
import { FileText, Image, Send, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage } from "@/services/messages";
import { MAX_MESSAGE_LENGTH, validMessageText } from "./messageLogic";
import type { Client, Role } from "@/types";

function stamp(iso: string) {
  return new Date(iso).toLocaleString("fi-FI", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** One shared thread per client; both roles read and write the same stored messages. */
export function MessageThread({ client, role, emptyText }: { client: Client; role: Role; emptyText: string }) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [client.messages.length]);

  const submit = () => {
    if (sendMessage(client.id, role, text)) setText("");
  };
  const otherName = role === "client" ? "Fysioterapeutti Laura" : client.firstName;

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-[55vh] space-y-3 overflow-y-auto rounded-3xl border border-border bg-card p-4" aria-live="polite">
        {client.messages.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">{emptyText}</p>
        ) : (
          client.messages.map((m) => {
            const mine = m.from === role;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted"}`}>
                  <p className={`text-xs ${mine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {mine ? "Sinä" : otherName} · {stamp(m.date)}
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={2}
          placeholder="Kirjoita viesti…"
          aria-label="Viesti"
          className="min-h-12 flex-1 rounded-2xl"
        />
        <Button type="submit" disabled={!validMessageText(text)} className="h-12 rounded-2xl">
          <Send className="h-4 w-4" /> Lähetä
        </Button>
      </form>
      <div className="-mt-2 flex gap-1" aria-label="Liitteet">
        {[
          { Icon: Image, label: "Liitä kuva" },
          { Icon: Video, label: "Liitä video" },
          { Icon: FileText, label: "Liitä tiedosto" },
        ].map(({ Icon, label }) => (
          <Button key={label} type="button" variant="ghost" size="icon" aria-label={label} title={label} className="rounded-full text-muted-foreground">
            <Icon className="h-5 w-5" />
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Viestit eivät ole kiireellisiä yhteydenottoja. Äkillisessä tilanteessa ota yhteys terveydenhuoltoon.</p>
    </div>
  );
}
