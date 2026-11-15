import { Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Client } from "@/types";
export function IntakePending({ client }: { client: Client }) {
  return <section className="space-y-3 border-l-4 border-primary bg-primary-soft p-5" role="status">
    <h2 className="text-xl font-semibold">Alkukartoitus on kesken</h2>
    <p>{client.intake ? "Kyselyn vastaukset on tallennettu. Tee vielä lähtötason kameratestit, niin harjoitusohjelmasi avautuu." : "Täytä kysely ja tee lähtötason kameratestit, niin harjoitusohjelmasi avautuu."}</p>
    <Button asChild size="lg" className="h-auto min-h-12 whitespace-normal"><Link to={client.intake ? "/asiakas/alkukartoitus/kamera" : "/asiakas/alkukartoitus/kysely"}><Camera />{client.intake ? "Jatka kameratestiin" : "Jatka alkukartoitusta"}</Link></Button>
  </section>;
}