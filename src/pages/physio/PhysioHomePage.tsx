import { Link } from "@tanstack/react-router";
import { AlertTriangle, MessageCircle, Users } from "lucide-react";
import { PageHeader, SoftCard, SourceBadge } from "@/components/common/Section";
import { SwitchRoleButton } from "@/components/navigation/RoleActions";
import { useAppData } from "@/hooks/useAppData";
import { formatDate, openNotifications } from "@/utils/progress";

export function PhysioHomePage() {
  const data = useAppData();
  if (!data) return null;

  const alerts = data.clients.flatMap((c) =>
    openNotifications(c, "physio").map((n) => ({ ...n, clientName: c.name })),
  );
  const latestClientMessages = data.clients
    .map((c) => ({ client: c, msg: [...c.messages].reverse().find((m) => m.from === "client") }))
    .filter((x) => x.msg);
  const needAttention = data.clients.filter((c) => openNotifications(c, "physio").length > 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Hei, Laura" subtitle="Fysioterapeutin etusivu" action={<SwitchRoleButton />} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={MessageCircle} value={latestClientMessages.length} label="Uusia viestejä" />
        <Stat icon={AlertTriangle} value={alerts.length} label="Käsittelemättömiä ilmoituksia" />
        <Stat icon={Users} value={needAttention.length} label="Asiakasta vaatii huomiota" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SoftCard>
          <h2 className="text-lg font-semibold">Käsittelemättömät ilmoitukset</h2>
          <ul className="mt-3 space-y-3">
            {alerts.map((a) => (
              <li key={a.id} className="rounded-xl bg-warning-soft p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{a.clientName}</span>
                  <SourceBadge source="rule-based" />
                </div>
                <p className="mt-1">{a.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(a.date)}</p>
              </li>
            ))}
          </ul>
        </SoftCard>

        <SoftCard>
          <h2 className="text-lg font-semibold">Uusimmat viestit asiakkailta</h2>
          <ul className="mt-3 space-y-3">
            {latestClientMessages.map(({ client, msg }) => (
              <li key={client.id} className="rounded-xl bg-primary-soft p-3 text-sm">
                <span className="font-semibold">{client.name}</span>
                <p className="mt-1 text-muted-foreground">{msg!.text}</p>
              </li>
            ))}
          </ul>
        </SoftCard>
      </div>

      <Link
        to="/fysioterapeutti/asiakkaat"
        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground hover:bg-primary/90"
      >
        <Users className="h-5 w-5" /> Avaa asiakaslista
      </Link>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Users; value: number; label: string }) {
  return (
    <SoftCard className="flex items-center gap-4">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft">
        <Icon className="h-6 w-6 text-primary" />
      </span>
      <div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </SoftCard>
  );
}
