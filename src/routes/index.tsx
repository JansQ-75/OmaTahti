import { createFileRoute } from "@tanstack/react-router";
import { RoleSelectPage } from "@/pages/RoleSelectPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OmaTahti – Kuntoutusta omaan tahtiin" },
      { name: "description", content: "Valitse rooli: jatka asiakkaana tai fysioterapeuttina OmaTahti-etäkuntoutusdemossa." },
      { property: "og:title", content: "OmaTahti – Kuntoutusta omaan tahtiin" },
      { property: "og:description", content: "Etäkuntoutuksen demosovellus asiakkaalle ja fysioterapeutille." },
    ],
  }),
  component: RoleSelectPage,
});
