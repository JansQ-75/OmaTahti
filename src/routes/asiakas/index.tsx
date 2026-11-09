import { createFileRoute } from "@tanstack/react-router";
import { ClientHomePage } from "@/pages/client/ClientHomePage";

export const Route = createFileRoute("/asiakas/")({
  head: () => ({
    meta: [
      { title: "Asiakkaan etusivu – OmaTahti" },
      { name: "description", content: "Oma kuntoutusohjelma, harjoittelun aktiivisuus ja ilmoitukset." },
      { property: "og:title", content: "Asiakkaan etusivu – OmaTahti" },
      { property: "og:description", content: "Oma kuntoutusohjelma, harjoittelun aktiivisuus ja ilmoitukset." },
    ],
  }),
  component: ClientHomePage,
});
