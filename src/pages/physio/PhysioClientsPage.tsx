import { PageHeader, SoftCard } from "@/components/common/Section";
import { useAppData } from "@/hooks/useAppData";
import { bodyAreaLabel } from "@/data/bodyAreas";
import { openNotifications } from "@/utils/progress";

export function PhysioClientsPage() {
  const data = useAppData();
  if (!data) return null;

  return (
    <div>
      <PageHeader title="Asiakkaat" subtitle="Asiakaskohtainen näkymä avautuu vaiheessa 3." />
      <div className="grid gap-4 md:grid-cols-2">
        {data.clients.map((c) => {
          const alerts = openNotifications(c, "physio").length;
          const status = c.program?.status === "active" ? "Käynnissä" : "Odottaa hyväksyntää";
          return (
            <SoftCard key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{c.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {c.intake ? `${bodyAreaLabel(c.intake.bodyArea)} (${c.intake.side})` : "Alkukartoitus kesken"}
                  </p>
                </div>
                {alerts > 0 && (
                  <span className="rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                    {alerts} ilmoitusta
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm">
                Ohjelman tila:{" "}
                <span className={c.program?.status === "active" ? "font-medium text-success" : "font-medium text-accent-foreground"}>
                  {status}
                </span>
              </p>
            </SoftCard>
          );
        })}
      </div>
    </div>
  );
}
