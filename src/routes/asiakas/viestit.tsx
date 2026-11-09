import { createFileRoute } from "@tanstack/react-router";
import { ClientMessagesPage } from "@/pages/client/ClientPlaceholders";

export const Route = createFileRoute("/asiakas/viestit")({
  head: () => ({
    meta: [
      { title: "Viestit – OmaTahti" },
      { name: "description", content: "Viestit fysioterapeutin kanssa." },
      { property: "og:title", content: "Viestit – OmaTahti" },
      { property: "og:description", content: "Viestit fysioterapeutin kanssa." },
    ],
  }),
  component: ClientMessagesPage,
});
