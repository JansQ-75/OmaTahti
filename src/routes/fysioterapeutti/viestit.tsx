import { createFileRoute } from "@tanstack/react-router";
import { PhysioMessagesPage } from "@/pages/physio/PhysioMessagesPage";

export const Route = createFileRoute("/fysioterapeutti/viestit")({
  validateSearch: (s: Record<string, unknown>): { asiakas?: string } =>
    typeof s["asiakas"] === "string" ? { asiakas: s["asiakas"] } : {},
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Asiakkaiden viestit – OmaTahti" },
      { name: "description", content: "Asiakkaiden viestit." },
      { property: "og:title", content: "Asiakkaiden viestit – OmaTahti" },
      { property: "og:description", content: "Asiakkaiden viestit." },
    ],
  }),
  component: function Page() {
    const { asiakas } = Route.useSearch();
    return <PhysioMessagesPage clientId={asiakas} />;
  },
});
