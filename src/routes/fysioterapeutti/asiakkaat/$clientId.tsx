import { createFileRoute } from "@tanstack/react-router";
import { PhysioClientPage } from "@/pages/physio/PhysioClientPage";

export const Route = createFileRoute("/fysioterapeutti/asiakkaat/$clientId")({
  head: () => ({
    meta: [
      { title: "Asiakkaan tiedot – OmaTahti" },
      { name: "description", content: "Asiakkaan alkukartoitus, harjoitusohjelma, edistyminen ja yhteydenotot." },
      { property: "og:title", content: "Asiakkaan tiedot – OmaTahti" },
      { property: "og:description", content: "Asiakkaan alkukartoitus, harjoitusohjelma, edistyminen ja yhteydenotot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PhysioClientRoute,
});

function PhysioClientRoute() {
  const { clientId } = Route.useParams();
  return <PhysioClientPage clientId={clientId} />;
}
