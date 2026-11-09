import { createFileRoute } from "@tanstack/react-router";
import { ClientExercisesPage } from "@/pages/client/ClientPlaceholders";

export const Route = createFileRoute("/asiakas/harjoitukset")({
  head: () => ({
    meta: [
      { title: "Harjoitukset – OmaTahti" },
      { name: "description", content: "Aktiivisen kuntoutusohjelman harjoitukset." },
      { property: "og:title", content: "Harjoitukset – OmaTahti" },
      { property: "og:description", content: "Aktiivisen kuntoutusohjelman harjoitukset." },
    ],
  }),
  component: ClientExercisesPage,
});
