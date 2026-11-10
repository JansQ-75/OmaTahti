import { createFileRoute } from "@tanstack/react-router";
import { WorkoutPage } from "@/pages/client/WorkoutPage";

export const Route = createFileRoute("/asiakas/harjoitus")({
  validateSearch: (s: Record<string, unknown>): { liike?: number } => {
    const n = Number(s["liike"]);
    return Number.isInteger(n) && n >= 0 ? { liike: n } : {};
  },
  head: () => ({
    meta: [
      { title: "Harjoituskerta – OmaTahti" },
      { name: "description", content: "Ohjattu harjoituskerta liike kerrallaan." },
      { property: "og:title", content: "Harjoituskerta – OmaTahti" },
      { property: "og:description", content: "Ohjattu harjoituskerta liike kerrallaan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkoutRoute,
});

function WorkoutRoute() {
  const { liike } = Route.useSearch();
  return <WorkoutPage startAt={liike ?? 0} />;
}
