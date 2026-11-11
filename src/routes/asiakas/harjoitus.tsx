import { createFileRoute } from "@tanstack/react-router";
import { WorkoutPage } from "@/pages/client/WorkoutPage";

export const Route = createFileRoute("/asiakas/harjoitus")({
  validateSearch: (s: Record<string, unknown>): { liike?: number; yksittainen?: boolean } => {
    const n = Number(s["liike"]);
    const single = s["yksittainen"] === true || s["yksittainen"] === "true";
    return { ...(Number.isInteger(n) && n >= 0 ? { liike: n } : {}), ...(single ? { yksittainen: true } : {}) };
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
  const { liike, yksittainen } = Route.useSearch();
  return <WorkoutPage key={`${liike}-${yksittainen}`} startAt={liike ?? 0} single={!!yksittainen} />;
}
