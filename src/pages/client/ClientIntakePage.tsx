import { Link } from "@tanstack/react-router";
import { ClipboardList, PlayCircle, RotateCcw } from "lucide-react";
import { PageHeader, SoftCard } from "@/components/common/Section";
import { IntakeSummary } from "@/features/intake/IntakeSummary";
import { IntakeWizard } from "@/features/intake/IntakeWizard";
import { INTAKE_STEPS, answersFromIntake } from "@/features/intake/intakeLogic";
import { useActiveClient } from "@/hooks/useAppData";
import { discardIntakeDraft, saveIntakeDraft } from "@/services/intake";

const btnPrimary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-lg font-semibold text-primary-foreground hover:bg-primary/90";
const btnSecondary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 font-semibold hover:bg-secondary";

/** Intake summary page: the saved intake, an unfinished draft, or a start prompt. */
export function ClientIntakePage() {
  const client = useActiveClient();
  if (!client) return null;
  const draft = client.intakeDraft;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Alkukartoitus" subtitle="Yhteenveto vastauksistasi vammasta, kivusta, oireista ja toimintakyvystä" />

      {draft && (
        <SoftCard className="mb-5 bg-accent-soft">
          <p className="text-lg font-semibold">Sinulla on keskeneräinen alkukartoitus</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Jäit kohtaan ”{INTAKE_STEPS[Math.min(draft.step, INTAKE_STEPS.length - 1)]?.title}”. Vastauksesi on tallennettu tälle laitteelle.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/asiakas/alkukartoitus/kysely" className={btnPrimary}>
              <PlayCircle className="h-5 w-5" /> Jatka kartoitusta
            </Link>
            <button type="button" onClick={() => discardIntakeDraft(client.id)} className={btnSecondary}>
              Hylkää keskeneräiset vastaukset
            </button>
          </div>
        </SoftCard>
      )}

      {client.intake ? (
        <>
          <IntakeSummary answers={answersFromIntake(client.intake)} completedAt={client.intake.completedAt} />
          {!draft && (
            <div className="mt-6">
              <Link
                to="/asiakas/alkukartoitus/kysely"
                onClick={() => saveIntakeDraft(client.id, { step: 1, answers: answersFromIntake(client.intake) })}
                className={btnSecondary}
              >
                <RotateCcw className="h-5 w-5" /> Päivitä vastauksia
              </Link>
            </div>
          )}
        </>
      ) : (
        !draft && (
          <SoftCard className="text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-3 text-lg font-semibold">Alkukartoitusta ei ole vielä tehty</p>
            <p className="mt-1 text-muted-foreground">Kartoitus vie noin 5 minuuttia.</p>
            <Link to="/asiakas/alkukartoitus/kysely" className={`${btnPrimary} mt-5`}>
              Aloita alkukartoitus
            </Link>
          </SoftCard>
        )
      )}
    </div>
  );
}

export function ClientIntakeWizardPage() {
  const client = useActiveClient();
  if (!client) return null;
  return <IntakeWizard client={client} />;
}
