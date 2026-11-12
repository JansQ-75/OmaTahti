import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/common/Section";
import { IntakeSummary } from "@/features/intake/IntakeSummary";
import { answersFromIntake } from "@/features/intake/intakeLogic";
import { ProgressCharts } from "@/features/progress/ProgressCharts";
import { useActiveClient } from "@/hooks/useAppData";
import { markMessagesRead } from "@/services/messages";

export function ClientProgressPage() {
  const client = useActiveClient();
  return (
    <div className="space-y-5">
      <PageHeader title="Edistyminen" subtitle="Harjoittelu, kipu, liikkuvuus ja tasapaino" />
      {client && <ProgressCharts client={client} />}
      {client && (
        <details className="group rounded-3xl border border-border bg-card shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-lg font-semibold">
            Oma alkukartoitus
            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-5">
            {client.intake ? (
              <IntakeSummary answers={answersFromIntake(client.intake)} completedAt={client.intake.completedAt} />
            ) : (
              <p className="text-muted-foreground">
                Et ole vielä tehnyt alkukartoitusta.{" "}
                <Link to="/asiakas/alkukartoitus/kysely" className="font-medium text-primary hover:underline">
                  Aloita alkukartoitus →
                </Link>
              </p>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

export function ClientMessagesPage() {
  const client = useActiveClient();
  const id = client?.id;
  useEffect(() => {
    if (id) markMessagesRead("client", id);
  }, [id]);
  return (
    <div>
      <PageHeader title="Viestit" subtitle="Yhteydenpito fysioterapeuttiin" />
      <ComingSoon title="Viestien lähettäminen ja lukeminen" phase={6} />
    </div>
  );
}
