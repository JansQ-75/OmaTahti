import { createFileRoute } from "@tanstack/react-router";
import { PhysioClientsPage } from "@/pages/physio/PhysioClientsPage";

export const Route = createFileRoute("/fysioterapeutti/asiakkaat/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Asiakkaat – OmaTahti" },
      { name: "description", content: "Asiakaslista ja kuntoutusohjelmien tila." },
      { property: "og:title", content: "Asiakkaat – OmaTahti" },
      { property: "og:description", content: "Asiakaslista ja kuntoutusohjelmien tila." },
    ],
  }),
  component: PhysioClientsPage,
});
