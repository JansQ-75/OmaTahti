import { createFileRoute } from "@tanstack/react-router";
import { PhysioMessagesPage } from "@/pages/physio/PhysioMessagesPage";

export const Route = createFileRoute("/fysioterapeutti/viestit")({
  validateSearch: (s: Record<string, unknown>): { asiakas?: string } =>
    typeof s.asiakas === "string" ? { asiakas: s.asiakas } : {},
  head: () => ({
    meta: [
      { title: "Viestit – OmaTahti" },
      { name: "description", content: "Asiakkaiden viestit." },
      { property: "og:title", content: "Viestit – OmaTahti" },
      { property: "og:description", content: "Asiakkaiden viestit." },
    ],
  }),
  component: function Page() {
    const { asiakas } = Route.useSearch();
    return <PhysioMessagesPage clientId={asiakas} />;
  },
});
