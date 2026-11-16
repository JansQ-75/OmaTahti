import { useEffect, useRef } from "react";
import { intakeComplete } from "@/features/baseline/baselineLogic";
import { IntakePending } from "@/features/baseline/IntakePending";
import { BaselineSummary } from "@/features/baseline/BaselineSummary";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIntakeEditWindow } from "@/features/intake/useIntakeEditWindow";
import { saveIntakeDraft } from "@/services/intake";
import { PageHeader } from "@/components/common/Section";
import { MessageThread } from "@/features/messages/MessageThread";
import { IntakeSummary } from "@/features/intake/IntakeSummary";
import { answersFromIntake } from "@/features/intake/intakeLogic";
import { ProgressCharts } from "@/features/progress/ProgressCharts";
import { useActiveClient } from "@/hooks/useAppData";
import { markMessagesRead } from "@/services/messages";
import { ClientWeeklySummaryCard } from "@/features/summary/SummaryCards";

export function ClientProgressPage() {
  const client = useActiveClient();
  const editable = useIntakeEditWindow(client?.intake);
  const hash = useLocation({ select: (location) => location.hash });
  const intakeSection = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (hash === "oma-alkukartoitus" && intakeSection.current) {
      intakeSection.current.open = true;
      intakeSection.current.scrollIntoView({ block: "start" });
    }
  }, [hash, client?.id]);
  return (
    <div className="space-y-5">
      <PageHeader title="Edistyminen" subtitle="Harjoittelu, kipu, liikkuvuus ja tasapaino" />
      {client && <ProgressCharts client={client} />}
      {client && (
        <details ref={intakeSection} id="oma-alkukartoitus" className="group scroll-mt-5 rounded-3xl border border-border bg-card shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-lg font-semibold">
            Oma alkukartoitus
            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-5">
            {client.intake ? (
              <>
                <IntakeSummary answers={answersFromIntake(client.intake)} completedAt={client.intake.completedAt} />
                <BaselineSummary client={client} />
                {!intakeComplete(client) && <IntakePending client={client} />}
                {editable && intakeComplete(client) && (
                  <Button asChild variant="outline" className="mt-4 min-h-12 px-5 font-semibold">
                    <Link to="/asiakas/alkukartoitus/kysely" onClick={() => {
                      if (!client.intakeDraft) saveIntakeDraft(client.id, { step: 1, answers: answersFromIntake(client.intake) });
                    }}>
                      <RotateCcw /> Päivitä
                    </Link>
                  </Button>
                )}
              </>
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
  const count = client?.messages.length;
  useEffect(() => {
    if (id) markMessagesRead("client", id);
  }, [id, count]);
  return (
    <div>
      <PageHeader title="Viestit" subtitle="Yhteydenpito fysioterapeuttiin" />
      {client && (
        <MessageThread client={client} role="client" emptyText="Ei viestejä vielä. Voit kysyä fysioterapeutilta harjoittelusta tai kertoa kuulumisistasi." />
      )}
    </div>
  );
}
