import { Link } from "@tanstack/react-router";
import { Bell, ChartLine, ClipboardCheck, ClipboardList, Flame, MessageCircle, Play } from "lucide-react";
import { SoftCard, SourceBadge } from "@/components/common/Section";
import { SwitchClientButton, SwitchRoleButton } from "@/components/navigation/RoleActions";
import { useActiveClient } from "@/hooks/useAppData";
import { bodyAreaLabel } from "@/data/bodyAreas";
import { getProgram } from "@/data/programs";
import { currentStreak, openNotifications, sessionsByWeekday, trainedLastDays } from "@/utils/progress";

export function ClientHomePage() {
  const client = useActiveClient();
  if (!client) return null;

  const program = client.program ? getProgram(client.program.programId) : undefined;
  const streak = currentStreak(client.sessions);
  const week = sessionsByWeekday(client.sessions);
  const weekCount = week.reduce((a, b) => a + b, 0);
  const target = client.program?.timesPerWeek ?? 0;
  const last7 = trainedLastDays(client.sessions, 7);
  const notes = openNotifications(client, "client");
  const unreadFromPhysio = client.messages.filter((m) => m.from === "physio").slice(-1)[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground">Hyvää päivää,</p>
          <h1 className="text-3xl font-bold">{client.firstName}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <SwitchClientButton />
          <SwitchRoleButton />
        </div>
      </div>

      {(!client.intake || client.intakeDraft) && (
        <SoftCard className="bg-accent-soft">
          <p className="text-sm font-medium text-accent-foreground">Aloita tästä</p>
          <h2 className="mt-1 text-xl font-semibold">
            {client.intakeDraft ? "Alkukartoitus on kesken" : "Tee alkukartoitus"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kerro vammastasi, kivusta ja toimintakyvystä, niin fysioterapeutti voi suunnitella ohjelmasi.
          </p>
          <Link
            to="/asiakas/alkukartoitus/kysely"
            className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-6 text-lg font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <ClipboardCheck className="h-5 w-5" /> {client.intakeDraft ? "Jatka alkukartoitusta" : "Aloita alkukartoitus"}
          </Link>
        </SoftCard>
      )}

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
        <StreakCard streak={streak} days={last7} />
        <WeekBarsCard week={week} weekCount={weekCount} target={target} />
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            { to: "/asiakas/harjoitukset", label: "Koko harjoitusohjelma", icon: ClipboardList },
            { to: "/asiakas/edistyminen", label: "Oma edistyminen", icon: ChartLine },
            { to: "/asiakas/viestit", label: "Ota yhteyttä fysioterapeuttiin", icon: MessageCircle },
            { to: "/asiakas/alkukartoitus", label: "Oma alkukartoitus", icon: ClipboardCheck },
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

const WEEKDAYS: string[] = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];

function StreakCard({ streak, days }: { streak: number; days: { label: string; trained: boolean }[] }) {
  return (
    <SoftCard className="bg-accent-soft">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-card)]">
          <Flame className="h-7 w-7" />
        </span>
        <div>
          <p className="text-3xl font-bold leading-none">
            {streak} <span className="text-lg font-semibold">päivän putki</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {streak > 0 ? "Jatka huomenna, niin putki kasvaa!" : "Aloita uusi putki tänään!"}
          </p>
        </div>
      </div>
      <ol className="mt-4 flex items-center justify-between gap-1" aria-label="Viimeiset 7 päivää">
        {days.map((d, i) => (
          <li key={i} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                d.trained ? "bg-accent text-accent-foreground" : "border-2 border-dashed border-border bg-card text-muted-foreground"
              }`}
            >
              <Flame className="h-4 w-4" />
            </span>
            <span className="text-xs text-muted-foreground">{d.label}</span>
          </li>
        ))}
      </ol>
    </SoftCard>
  );
}

function WeekBarsCard({ week, weekCount, target }: { week: number[]; weekCount: number; target: number }) {
  const max = Math.max(2, ...week);
  const today = (new Date().getDay() + 6) % 7;
  return (
    <SoftCard>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm text-muted-foreground">Tämän viikon harjoitukset</p>
        <p className="text-sm font-semibold">
          {weekCount} / {target} <span className="font-normal text-muted-foreground">tavoite</span>
        </p>
      </div>
      <div className="mt-4 flex h-28 items-end justify-between gap-2" role="img" aria-label="Harjoituskerrat viikonpäivittäin">
        {week.map((n, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-xs font-semibold">{n > 0 ? n : ""}</span>
            <div
              className={`w-full max-w-8 rounded-t-lg ${n > 0 ? "bg-success" : "bg-muted"}`}
              style={{ height: n > 0 ? `${(n / max) * 100}%` : "6px" }}
            />
            <span className={`text-xs ${i === today ? "font-bold text-foreground" : "text-muted-foreground"}`}>{WEEKDAYS[i]}</span>
          </div>
        ))}
      </div>
    </SoftCard>
  );
}
