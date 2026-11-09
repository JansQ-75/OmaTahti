import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, HeartPulse, Stethoscope } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { ResetDemoButton } from "@/components/navigation/RoleActions";
import { setRole } from "@/services/storage";
import illustration from "@/assets/welcome-illustration.jpg";
import type { Role } from "@/types";

export function RoleSelectPage() {
  const navigate = useNavigate();

  const choose = (role: Role) => {
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
            <button
              onClick={() => choose("client")}
              className="group flex items-center gap-4 rounded-2xl bg-primary p-5 text-left text-primary-foreground shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
            >
              <HeartPulse className="h-8 w-8 shrink-0" />
              <span className="flex-1">
                <span className="block text-lg font-semibold">Jatka asiakkaana</span>
                <span className="block text-sm opacity-85">Harjoitukset, edistyminen ja viestit</span>
              </span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => choose("physio")}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left text-foreground shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
            >
              <Stethoscope className="h-8 w-8 shrink-0 text-primary" />
              <span className="flex-1">
                <span className="block text-lg font-semibold">Jatka fysioterapeuttina</span>
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
