import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { BodyArea } from "@/types";
import { PageHeader, SoftCard } from "@/components/common/Section";
import { useAppData } from "@/hooks/useAppData";
import { BODY_AREAS, bodyAreaLabel } from "@/data/bodyAreas";
import { getProgram } from "@/data/programs";
import { countWithoutIntake, filterForPhysio } from "@/features/physio/physioLogic";

export function PhysioClientsPage() {
  const data = useAppData();
  const [query, setQuery] = useState("");
  const [areas, setAreas] = useState<BodyArea[]>([]);
  const [withoutIntake, setWithoutIntake] = useState(false);
  if (!data) return null;
  const visible = filterForPhysio(data.clients, { query, areas, onlyWithoutIntake: withoutIntake });
  const count = (a: BodyArea) => data.clients.filter((c) => c.intake?.bodyArea === a).length;
  const noIntake = countWithoutIntake(data.clients);
  const toggle = (a: BodyArea) => setAreas((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));
  const chosen = [...areas.map(bodyAreaLabel), ...(withoutIntake ? ["Alkukartoitus tekemättä"] : [])];
  const areaText = chosen.length === 0 ? "Kaikki" : chosen.length === 1 ? chosen[0]! : `${chosen.length} valittu`;
  const clearAll = () => { setQuery(""); setAreas([]); setWithoutIntake(false); };

  return (
    <div>
      <PageHeader title="Asiakkaat" subtitle="Avaa asiakkaan tiedot kortista." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Hae nimellä (esim. Aino)…" aria-label="Hae asiakasta nimellä" className="pl-9 pr-9" />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Tyhjennä haku" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between sm:w-64">
              Suodatus: {areaText}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-2">
            {BODY_AREAS.map((b) => (
              <label key={b.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                <Checkbox checked={areas.includes(b.id)} onCheckedChange={() => toggle(b.id)} />
                <span className={count(b.id) === 0 ? "text-muted-foreground" : ""}>{b.label} ({count(b.id)})</span>
              </label>
            ))}
            <div className="my-1 border-t border-border" />
            <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
              <Checkbox checked={withoutIntake} onCheckedChange={() => setWithoutIntake((v) => !v)} />
              <span className={noIntake === 0 ? "text-muted-foreground" : ""}>Alkukartoitus tekemättä ({noIntake})</span>
            </label>
            <button type="button" onClick={() => { setAreas([]); setWithoutIntake(false); }} className="mt-1 w-full border-t border-border px-2 pt-2 text-left text-sm text-primary">
              Tyhjennä valinnat
            </button>
          </PopoverContent>
        </Popover>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">Näytetään {visible.length} asiakasta</p>
      {visible.length === 0 && (
        <SoftCard className="text-center">
          <p className="font-semibold">Ei tuloksia</p>
          <p className="mt-1 text-sm text-muted-foreground">Ei asiakkaita valituilla hakuehdoilla.</p>
          <Button variant="outline" className="mt-3" onClick={clearAll}>Tyhjennä suodatukset</Button>
        </SoftCard>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((c) => {
          const status = !c.program
            ? "Ei vielä ohjelmaa"
            : c.program.status === "active"
              ? "Käynnissä"
              : c.program.status === "self-guided"
                ? "Itsenäinen harjoittelu (automaattinen ohjelma)"
                : "Automaattinen ohjelma, asiakas ei ole vielä aloittanut";
          const programName = c.program ? getProgram(c.program.programId)?.name : undefined;
          return (
            <Link
              key={c.id}
              to="/fysioterapeutti/asiakkaat/$clientId"
              params={{ clientId: c.id }}
              className="block rounded-2xl transition-transform hover:-translate-y-0.5"
              aria-label={`Avaa asiakkaan ${c.name} tiedot`}
            >
              <SoftCard className="h-full">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{c.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {c.intake ? `${bodyAreaLabel(c.intake.bodyArea)} (${c.intake.side})` : c.intakeDraft ? "Alkukartoitus kesken" : "Alkukartoitus tekemättä"}
                    </p>
                  </div>
                  <ChevronRight className="h-7 w-7 shrink-0 self-center text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm">
                  Kuntoutuksen tila:{" "}
                  <span className={c.program?.status === "active" ? "font-medium text-success" : "font-medium text-accent-foreground"}>
                    {status}
                  </span>
                </p>
                {programName && <p className="mt-1 text-sm text-muted-foreground">{programName}</p>}
                
              </SoftCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
