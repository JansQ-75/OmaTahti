import { createFileRoute } from "@tanstack/react-router";
import { PhysioMessagesPage } from "@/pages/physio/PhysioMessagesPage";

export const Route = createFileRoute("/fysioterapeutti/viestit")({
  head: () => ({
    meta: [
      { title: "Viestit – OmaTahti" },
      { name: "description", content: "Asiakkaiden viestit." },
      { property: "og:title", content: "Viestit – OmaTahti" },
      { property: "og:description", content: "Asiakkaiden viestit." },
    ],
  }),
  component: PhysioMessagesPage,
});
