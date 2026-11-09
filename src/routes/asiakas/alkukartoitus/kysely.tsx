import { createFileRoute } from "@tanstack/react-router";
import { ClientIntakeWizardPage } from "@/pages/client/ClientIntakePage";

export const Route = createFileRoute("/asiakas/alkukartoitus/kysely")({
  head: () => ({
    meta: [
      { title: "Alkukartoitus – OmaTahti" },
      { name: "description", content: "Vaiheittainen kysely vammasta, kivusta, oireista ja toimintakyvystä." },
      { property: "og:title", content: "Alkukartoitus – OmaTahti" },
      { property: "og:description", content: "Vaiheittainen kysely vammasta, kivusta, oireista ja toimintakyvystä." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClientIntakeWizardPage,
});
