import { createFileRoute } from "@tanstack/react-router";
import { ClientProgressPage } from "@/pages/client/ClientPlaceholders";

export const Route = createFileRoute("/asiakas/edistyminen")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Edistyminen – OmaTahti" },
      { name: "description", content: "Harjoittelun aktiivisuus, kipu ja kuntoutuksen eteneminen." },
      { property: "og:title", content: "Edistyminen – OmaTahti" },
      { property: "og:description", content: "Harjoittelun aktiivisuus, kipu ja kuntoutuksen eteneminen." },
    ],
  }),
  component: ClientProgressPage,
});
