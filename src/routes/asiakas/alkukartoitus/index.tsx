import { createFileRoute } from "@tanstack/react-router";
import { ClientIntakePage } from "@/pages/client/ClientIntakePage";

export const Route = createFileRoute("/asiakas/alkukartoitus/")({
  head: () => ({
    meta: [
      { title: "Alkukartoituksen yhteenveto – OmaTahti" },
      { name: "description", content: "Yhteenveto vammasta, kivusta, oireista ja toimintakyvystä." },
      { property: "og:title", content: "Alkukartoituksen yhteenveto – OmaTahti" },
      { property: "og:description", content: "Yhteenveto vammasta, kivusta, oireista ja toimintakyvystä." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClientIntakePage,
});
