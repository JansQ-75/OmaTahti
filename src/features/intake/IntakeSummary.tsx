import type { ReactNode } from "react";
import { AlertTriangle, Pencil } from "lucide-react";
import { SoftCard, SourceBadge } from "@/components/common/Section";
import { bodyAreaLabel } from "@/data/bodyAreas";
import { INTAKE_STEPS, needsProfessional, type IntakeAnswers, type IntakeStepId } from "./intakeLogic";

export function formatDate(iso?: string) {
  if (!iso) return "–";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "–" : d.toLocaleDateString("fi-FI");
}

export function timeSince(iso?: string, now = new Date()) {
  if (!iso) return "–";
  const days = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000));
  if (days < 14) return `${days} ${days === 1 ? "päivä" : "päivää"}`;
  return `${Math.floor(days / 7)} viikkoa`;
}

const list = (items?: string[]) => (items === undefined ? "–" : items.length === 0 ? "Ei mitään" : items.join(", "));

/**
 * Clear summary of the client's own intake answers. Used for the saved intake and
 * for the review step of the wizard (with edit buttons).
 */
export function IntakeSummary({
  answers,
  completedAt,
  onEdit,
}: {
  answers: IntakeAnswers;
  completedAt?: string | undefined;
  onEdit?: ((step: IntakeStepId) => void) | undefined;
}) {
  const a = answers;
  const stop = needsProfessional(a);

  return (
    <div className="space-y-4">
      {stop && (
        <div role="alert" className="rounded-2xl border-2 border-destructive/40 bg-destructive-soft p-5">
          <p className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="h-5 w-5 text-destructive" /> Hakeudu ammattilaisen arvioon
          </p>
          <p className="mt-1 text-sm">
            Vastauksesi perusteella nilkka kannattaa näyttää lääkärille tai fysioterapeutille ennen omatoimista
            harjoittelua. Kiireellisessä tilanteessa soita 112.
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {a.weightBearing === "ei pysty" && <li>En pysty varaamaan jalalle</li>}
            {a.redFlags?.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <KeyFigure label="Kipu levossa" value={a.painAtRest !== undefined ? `${a.painAtRest}/10` : "–"} />
        <KeyFigure label="Kipu liikkuessa" value={a.painLevel !== undefined ? `${a.painLevel}/10` : "–"} />
        <KeyFigure label="Vammasta" value={timeSince(a.injuryDate)} />
      </div>

      <Block title="Vamma" step="injury" onEdit={onEdit}>
        <Row label="Alue" value={a.bodyArea ? `${bodyAreaLabel(a.bodyArea)}, ${a.side ?? "–"}` : "–"} />
        <Row label="Vamman tyyppi" value={a.injuryType} />
        <Row label="Miten vamma syntyi" value={a.mechanism} />
        <Row label="Vamman päivämäärä" value={formatDate(a.injuryDate)} />
        <Row label="Aiemmat vammat" value={a.previousInjuries?.trim() || "Ei aiempia vammoja"} />
      </Block>

      <Block title="Kipu ja oireet" step="pain" onEdit={onEdit}>
        <Row label="Kipu tuntuu" value={a.painLocation} />
        <Row label="Oireet" value={list(a.symptoms)} />
        <Row label="Muut oireet" value={a.otherSymptoms?.trim() || "–"} />
      </Block>

      <Block title="Toimintakyky" step="function" onEdit={onEdit}>
        <Row label="Jalalle varaaminen" value={a.weightBearing} />
        <Row label="Kävely kerrallaan" value={a.walkingTolerance} />
        <Row label="Nilkan liikkuvuus (oma arvio)" value={a.perceivedMobility} />
        <Row label="Vaikeat toiminnot" value={list(a.difficultActivities)} />
      </Block>

      <Block title="Tavoite" step="goals" onEdit={onEdit}>
        <p className="text-base">{a.goals?.trim() || "–"}</p>
      </Block>

      <Block title="Perustiedot" step="basics" onEdit={onEdit}>
        <Row label="Ikä" value={a.age !== undefined ? `${a.age} v` : "–"} />
        <Row label="Sukupuoli" value={a.sex} />
      </Block>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <SourceBadge source="client-reported" />
        {completedAt && <span>Täytetty {formatDate(completedAt)}.</span>}
        <span>Yhteenveto perustuu omiin vastauksiisi, eikä se ole diagnoosi.</span>
      </div>
    </div>
  );
}

function KeyFigure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-primary-soft p-3 text-center">
      <p className="text-xl font-bold sm:text-2xl">{value}</p>
      <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
    </div>
  );
}

function Block({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: IntakeStepId;
  onEdit?: ((step: IntakeStepId) => void) | undefined;
  children: ReactNode;
}) {
  const stepTitle = INTAKE_STEPS.find((s) => s.id === step)?.title;
  return (
    <SoftCard>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(step)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-primary hover:bg-primary-soft"
            aria-label={`Muokkaa: ${stepTitle}`}
          >
            <Pencil className="h-4 w-4" /> Muokkaa
          </button>
        )}
      </div>
      <div className="divide-y divide-border">{children}</div>
    </SoftCard>
  );
}

function Row({ label, value }: { label: string; value?: string | undefined }) {
  return (
    <div className="grid gap-0.5 py-2 sm:grid-cols-[14rem_1fr] sm:gap-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "–"}</p>
    </div>
  );
}
