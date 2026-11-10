import { Link } from "@tanstack/react-router";
import { MessageCircle, Users } from "lucide-react";
import { PageHeader, SoftCard } from "@/components/common/Section";
import { SwitchRoleButton } from "@/components/navigation/RoleActions";
import { useAppData } from "@/hooks/useAppData";

export function PhysioHomePage() {
  const data = useAppData();
  if (!data) return null;

  const latestClientMessages = data.clients
    .map((c) => ({ client: c, msg: [...c.messages].reverse().find((m) => m.from === "client") }))
    .filter((x) => x.msg);

  return (
    <div className="space-y-6">
      <PageHeader title="Hei, Laura" subtitle="Fysioterapeutin etusivu" action={<SwitchRoleButton />} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/fysioterapeutti/viestit" className="block rounded-3xl transition-transform hover:-translate-y-0.5">
          <Stat icon={MessageCircle} value={latestClientMessages.length} label="Uusia viestejä →" />
        </Link>
      </div>

      <div>
        <SoftCard>
          <h2 className="text-lg font-semibold">Uusimmat viestit asiakkailta</h2>
          <ul className="mt-3 space-y-3">
            {latestClientMessages.map(({ client, msg }) => (
              <li key={client.id}>
                <Link
                  to="/fysioterapeutti/asiakkaat/$clientId"
                  params={{ clientId: client.id }}
                  className="block rounded-xl bg-primary-soft p-3 text-sm transition-colors hover:bg-primary-soft/70"
                >
                  <span className="font-semibold">{client.name}</span>
                  <p className="mt-1 text-muted-foreground">{msg!.text}</p>
                  <p className="mt-1 font-medium text-primary">Avaa asiakkaan tiedot →</p>
                </Link>
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
