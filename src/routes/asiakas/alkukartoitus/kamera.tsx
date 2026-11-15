import { createFileRoute } from "@tanstack/react-router";
import { ClientBaselinePage } from "@/pages/client/ClientBaselinePage";
export const Route = createFileRoute("/asiakas/alkukartoitus/kamera")({
  head: () => ({ meta: [
    { title: "Lähtötason kameratesti – OmaTahti" },
    { name: "description", content: "Alkukartoituksen kehoaluekohtaiset lähtötasotestit ja kamera-arviot." },
    { property: "og:title", content: "Lähtötason kameratesti – OmaTahti" },
    { property: "og:description", content: "Alkukartoituksen kehoaluekohtaiset lähtötasotestit ja kamera-arviot." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: ClientBaselinePage,
});