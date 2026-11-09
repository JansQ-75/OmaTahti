import { Link } from "@tanstack/react-router";
import { Bell, ChartLine, ClipboardList, Flame, MessageCircle, Play } from "lucide-react";
import { SoftCard, SourceBadge } from "@/components/common/Section";
import { SwitchRoleButton } from "@/components/navigation/RoleActions";
import { useActiveClient } from "@/hooks/useAppData";
import { bodyAreaLabel } from "@/data/bodyAreas";
import { getProgram } from "@/data/programs";
import { currentStreak, openNotifications, sessionsInLastDays } from "@/utils/progress";

export function ClientHomePage() {
  const client = useActiveClient();
  if (!client) return null;

  const program = client.program ? getProgram(client.program.programId) : undefined;
  const streak = currentStreak(client.sessions);
  const weekCount = sessionsInLastDays(client.sessions, 7);
  const target = client.program?.timesPerWeek ?? 0;
  const notes = openNotifications(client, "client");
  const unreadFromPhysio = client.messages.filter((m) => m.from === "physio").slice(-1)[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground">Hyvää päivää,</p>
          <h1 className="text-3xl font-bold">{client.firstName}</h1>
        </div>
        <SwitchRoleButton />
      </div>

      {program && (
        <SoftCard className="bg-[image:var(--gradient-hero)]">
          <p className="text-sm font-medium text-primary">Aktiivinen kuntoutusohjelma</p>
          <h2 className="mt-1 text-xl font-semibold">{program.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {client.intake && `${bodyAreaLabel(client.intake.bodyArea)} (${client.intake.side}) · `}
            {program.phase}
          </p>
          <Link
            to="/asiakas/harjoitukset"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto sm:inline-flex"
          >
            <Play className="h-5 w-5" /> Aloita päivän harjoitukset
          </Link>
        </SoftCard>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <SoftCard>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft">
              <Flame className="h-6 w-6 text-accent" />
            </span>
            <div>
              <p className="text-3xl font-bold">{streak}</p>
              <p className="text-sm text-muted-foreground">peräkkäistä harjoittelupäivää</p>
            </div>
          </div>
        </SoftCard>
        <SoftCard>
          <p className="text-sm text-muted-foreground">Harjoituskerrat 7 päivän aikana</p>
          <p className="mt-1 text-3xl font-bold">
            {weekCount}
            <span className="text-lg font-medium text-muted-foreground"> / {target}</span>
          </p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-success"
              style={{ width: `${Math.min(100, target ? (weekCount / target) * 100 : 0)}%` }}
            />
          </div>
        </SoftCard>
      </div>

      {(notes.length > 0 || unreadFromPhysio) && (
        <SoftCard>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Bell className="h-5 w-5 text-primary" /> Ilmoitukset
          </h2>
          <ul className="mt-3 space-y-3">
            {unreadFromPhysio && (
              <li className="rounded-xl bg-primary-soft p-3 text-sm">
                <p className="font-medium">Viesti fysioterapeutilta</p>
                <p className="mt-0.5 text-muted-foreground">{unreadFromPhysio.text}</p>
              </li>
            )}
            {notes.map((n) => (
              <li key={n.id} className="rounded-xl bg-warning-soft p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{n.text}</p>
                  <SourceBadge source="rule-based" />
                </div>
                <Link to="/asiakas/viestit" className="mt-1 inline-block text-primary underline-offset-2 hover:underline">
                  Kerro fysioterapeutille, miten harjoittelu sujuu →
                </Link>
              </li>
            ))}
          </ul>
        </SoftCard>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            { to: "/asiakas/harjoitukset", label: "Koko harjoitusohjelma", icon: ClipboardList },
            { to: "/asiakas/edistyminen", label: "Oma edistyminen", icon: ChartLine },
            { to: "/asiakas/viestit", label: "Ota yhteyttä fysioterapeuttiin", icon: MessageCircle },
          ] as const
        ).map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 font-medium shadow-[var(--shadow-card)] transition-colors hover:bg-secondary"
          >
            <a.icon className="h-5 w-5 text-primary" /> {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
