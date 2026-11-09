import { createFileRoute } from "@tanstack/react-router";
import { PhysioHomePage } from "@/pages/physio/PhysioHomePage";

export const Route = createFileRoute("/fysioterapeutti/")({
  head: () => ({
    meta: [
      { title: "Fysioterapeutin etusivu – OmaTahti" },
      { name: "description", content: "Uudet viestit, ilmoitukset ja huomiota vaativat asiakkaat." },
      { property: "og:title", content: "Fysioterapeutin etusivu – OmaTahti" },
      { property: "og:description", content: "Uudet viestit, ilmoitukset ja huomiota vaativat asiakkaat." },
    ],
  }),
  component: PhysioHomePage,
});
