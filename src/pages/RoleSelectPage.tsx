import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, HeartPulse, Stethoscope } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { ResetDemoButton } from "@/components/navigation/RoleActions";
import { setActiveClient, setRole } from "@/services/storage";
import { useAppData } from "@/hooks/useAppData";
import illustration from "@/assets/welcome-illustration.jpg";
import type { Client, Role } from "@/types";

function clientStatus(c: Client): string {
  if (c.program?.status === "active") return "Kuntoutus käynnissä";
  if (c.intake) return "Alkukartoitus tehty";
  if (c.intakeDraft) return "Uusi asiakas · alkukartoitus kesken";
  return "Uusi asiakas · alkukartoitus tekemättä";
}

export function RoleSelectPage() {
  const navigate = useNavigate();

  const data = useAppData();
  const choose = (role: Role, clientId?: string) => {
    if (clientId) setActiveClient(clientId);
    setRole(role);
    navigate({ to: role === "client" ? "/asiakas" : "/fysioterapeutti" });
  };

  return (
    <div className="min-h-screen bg-[image:var(--gradient-hero)]">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 md:grid-cols-2 md:px-10">
        <div>
          <Logo />
          <h1 className="mt-10 text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Kuntoutusta omaan tahtiin!
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            OmaTahti auttaa sinua tekemään kuntoutusharjoitukset kotona silloin kun sinulle sopii – ja pitää
            fysioterapeuttisi ajan tasalla edistymisestäsi.
          </p>

          <div className="mt-8 flex max-w-md flex-col gap-3">
            <p className="text-sm font-semibold text-foreground">Jatka asiakkaana</p>
            {(data?.clients ?? []).map((c) => (
              <button
                key={c.id}
                onClick={() => choose("client", c.id)}
                className="group flex items-center gap-4 rounded-2xl bg-primary p-5 text-left text-primary-foreground shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
              >
                <HeartPulse className="h-8 w-8 shrink-0" />
                <span className="flex-1">
                  <span className="block text-lg font-semibold">{c.name}</span>
                  <span className="block text-sm opacity-85">{clientStatus(c)}</span>
                </span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            ))}
            <p className="mt-3 text-sm font-semibold text-foreground">Jatka fysioterapeuttina</p>
            <button
              onClick={() => choose("physio")}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left text-foreground shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
            >
              <Stethoscope className="h-8 w-8 shrink-0 text-primary" />
              <span className="flex-1">
                <span className="block text-lg font-semibold">Fysioterapeutti Laura</span>
                <span className="block text-sm text-muted-foreground">Asiakkaat, seuranta ja ilmoitukset</span>
              </span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <p className="mt-6 max-w-md text-xs text-muted-foreground">
            Tämä on esittelyprototyyppi. Kaikki tiedot ovat kuvitteellisia ja tallentuvat vain tähän selaimeen.
            OmaTahti ei korvaa terveydenhuollon ammattilaista.
          </p>
          <ResetDemoButton className="mt-2 -ml-3" />
        </div>

        <img
          src={illustration}
          alt="Nainen tekee nilkan venytystä kotona"
          className="hidden w-full rounded-3xl object-cover shadow-[var(--shadow-card)] md:block"
          width={1024}
          height={896}
        />
      </div>
    </div>
  );
}
