import { createFileRoute } from "@tanstack/react-router";
import { ClientExercisesPage } from "@/pages/client/ClientExercisesPage";

export const Route = createFileRoute("/asiakas/harjoitukset")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Harjoitukset – OmaTahti" },
      { name: "description", content: "Aktiivisen kuntoutusohjelman harjoitukset." },
      { property: "og:title", content: "Harjoitukset – OmaTahti" },
      { property: "og:description", content: "Aktiivisen kuntoutusohjelman harjoitukset." },
    ],
  }),
  component: ClientExercisesPage,
});
