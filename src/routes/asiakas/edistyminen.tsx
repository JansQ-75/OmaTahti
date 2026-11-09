import { createFileRoute } from "@tanstack/react-router";
import { ClientProgressPage } from "@/pages/client/ClientPlaceholders";

export const Route = createFileRoute("/asiakas/edistyminen")({
  head: () => ({
    meta: [
      { title: "Edistyminen – OmaTahti" },
      { name: "description", content: "Harjoittelun aktiivisuus, kipu ja kuntoutuksen eteneminen." },
      { property: "og:title", content: "Edistyminen – OmaTahti" },
      { property: "og:description", content: "Harjoittelun aktiivisuus, kipu ja kuntoutuksen eteneminen." },
    ],
  }),
  component: ClientProgressPage,
});
