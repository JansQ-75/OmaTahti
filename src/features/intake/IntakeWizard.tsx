import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Clock, ShieldCheck, Smartphone } from "lucide-react";
import { MultiChoice, SingleChoice } from "@/components/common/ChoiceChips";
import { PainScale } from "@/components/common/PainScale";
import { SoftCard } from "@/components/common/Section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BODY_AREAS } from "@/data/bodyAreas";
import { getIntakeOptions } from "@/data/intake";
import { completeIntake, saveIntakeDraft } from "@/services/intake";
import { cn } from "@/lib/utils";
import type { Client } from "@/types";
import { IntakeSummary } from "./IntakeSummary";
import { INTAKE_STEPS, answersFromIntake, toIntake, validateStep, type IntakeAnswers, type IntakeStepId } from "./intakeLogic";

const QUESTION_STEPS = INTAKE_STEPS.length - 2; // intro and review are not question steps

/** Local YYYY-MM-DD for <input type="date">. */
function toDateInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function fromDateInput(v: string) {
  const [y, m, d] = v.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d, 12).toISOString();
}

/**
 * Step-by-step intake. Every answer is saved locally right away (client.intakeDraft),
 * so leaving the page and coming back continues where the client stopped.
 */
export function IntakeWizard({ client }: { client: Client }) {
  const navigate = useNavigate();
  const draft = client.intakeDraft;
  const [error, setError] = useState<string | null>(null);

  // Start a new draft (prefilled from an earlier intake, if any) when none exists.
  useEffect(() => {
    if (!draft) saveIntakeDraft(client.id, { step: 0, answers: answersFromIntake(client.intake) });
  }, [draft, client.id, client.intake]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setError(null);
  }, [draft?.step]);

  if (!draft) return <p className="text-muted-foreground">Ladataan…</p>;

  const stepIndex = Math.min(Math.max(draft.step, 0), INTAKE_STEPS.length - 1);
  const step = INTAKE_STEPS[stepIndex] ?? INTAKE_STEPS[0];
  const a = draft.answers;

  const set = (patch: IntakeAnswers) => {
    saveIntakeDraft(client.id, { step: stepIndex, answers: { ...a, ...patch } });
    setError(null);
  };
  const goTo = (i: number) => saveIntakeDraft(client.id, { step: i, answers: a });
  const goToStep = (id: IntakeStepId) => goTo(INTAKE_STEPS.findIndex((s) => s.id === id));

  const next = () => {
    const msg = validateStep(step.id, a);
    if (msg) return setError(msg);
    goTo(stepIndex + 1);
  };

  const save = () => {
    const intake = toIntake(a);
    if (!intake) {
      const bad = INTAKE_STEPS.find((s) => validateStep(s.id, a) !== null);
      if (bad) goToStep(bad.id);
      return;
    }
    completeIntake(client.id, intake);
    navigate({ to: "/asiakas/alkukartoitus" });
  };

  const opts = getIntakeOptions(a.bodyArea);

  return (
    <div className="mx-auto max-w-2xl">
      {stepIndex > 0 && stepIndex < INTAKE_STEPS.length - 1 && (
        <div className="mb-5">
          <div className="mb-1.5 flex justify-between text-sm text-muted-foreground">
            <span>
              Vaihe {stepIndex} / {QUESTION_STEPS}
            </span>
            <span>Vastaukset tallentuvat automaattisesti</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={QUESTION_STEPS}
            aria-valuenow={stepIndex}
          >
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(stepIndex / QUESTION_STEPS) * 100}%` }} />
          </div>
        </div>
      )}

      <h1 className="mb-5 text-2xl font-bold md:text-3xl">{step.id === "intro" ? "Alkukartoitus" : step.title}</h1>

      <div className="space-y-6">
        {step.id === "intro" && (
          <SoftCard className="space-y-4">
            <p className="text-lg">
              Kysymme muutamia asioita vammastasi, kivusta, oireista ja siitä, miten pärjäät arjessa. Vastausten
              perusteella fysioterapeuttisi voi suunnitella sinulle sopivan kuntoutusohjelman.
            </p>
            <ul className="space-y-3">
              <Fact icon={<Clock className="h-5 w-5" />}>Vastaaminen vie noin 5 minuuttia, 7 lyhyttä vaihetta.</Fact>
              <Fact icon={<Smartphone className="h-5 w-5" />}>
                Vastaukset tallentuvat tälle laitteelle, joten voit jatkaa myöhemmin.
              </Fact>
              <Fact icon={<ShieldCheck className="h-5 w-5" />}>
                Kartoitus ei ole diagnoosi. Jos vastauksissa on huolestuttavia merkkejä, ohjaamme sinut ammattilaiselle.
              </Fact>
            </ul>
          </SoftCard>
        )}

        {step.id === "basics" && (
          <>
            <Question title="Ikä" htmlFor="age">
              <Input
                id="age"
                type="number"
                inputMode="numeric"
                min={15}
                max={100}
                className="h-12 max-w-40 text-lg"
                value={a.age ?? ""}
                onChange={(e) => set({ age: e.target.value === "" ? undefined : Number(e.target.value) })}
              />
            </Question>
            <Question title="Sukupuoli">
              <SingleChoice
                label="Sukupuoli"
                options={["nainen", "mies", "muu", "ei halua kertoa"] as const}
                value={a.sex}
                onChange={(sex) => set({ sex })}
                columns={2}
              />
            </Question>
          </>
        )}

        {step.id === "area" && (
          <>
            <Question title="Mihin kehon alueeseen vamma liittyy?">
              <div className="grid gap-2 sm:grid-cols-2">
                {BODY_AREAS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    disabled={!b.available}
                    aria-pressed={a.bodyArea === b.id}
                    onClick={() => set({ bodyArea: b.id })}
                    className={cn(
                      "flex min-h-14 items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 text-left text-base font-medium transition-colors",
                      a.bodyArea === b.id
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-card hover:border-primary/50 hover:bg-secondary",
                      !b.available && "cursor-not-allowed opacity-60 hover:border-border hover:bg-card",
                    )}
                  >
                    {b.label}
                    {!b.available && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Tulossa</span>
                    )}
                    {a.bodyArea === b.id && <Check className="h-5 w-5 text-primary" />}
                  </button>
                ))}
              </div>
            </Question>
            <Question title="Kumpi puoli?">
              <SingleChoice
                label="Puoli"
                options={["vasen", "oikea"] as const}
                value={a.side}
                onChange={(side) => set({ side })}
                columns={2}
              />
            </Question>
          </>
        )}

        {step.id === "injury" && opts && (
          <>
            <Question title="Mikä vamma on kyseessä?">
              <SingleChoice label="Vamman tyyppi" options={opts.injuryTypes} value={a.injuryType} onChange={(injuryType) => set({ injuryType })} />
            </Question>
            <Question title="Miten vamma syntyi?" htmlFor="mechanism">
              <SingleChoice
                label="Miten vamma syntyi"
                options={opts.mechanisms}
                value={opts.mechanisms.includes(a.mechanism ?? "") ? a.mechanism : undefined}
                onChange={(mechanism) => set({ mechanism })}
                columns={2}
              />
              <Textarea
                id="mechanism"
                className="mt-2 text-base"
                placeholder="Voit kertoa tarkemmin, esim. ”Nilkka kääntyi juoksulenkillä.”"
                value={a.mechanism ?? ""}
                onChange={(e) => set({ mechanism: e.target.value })}
              />
            </Question>
            <Question title="Milloin vamma tapahtui?" htmlFor="injuryDate">
              <Input
                id="injuryDate"
                type="date"
                className="h-12 max-w-56 text-lg"
                max={toDateInput(new Date().toISOString())}
                value={toDateInput(a.injuryDate)}
                onChange={(e) => set({ injuryDate: fromDateInput(e.target.value) })}
              />
            </Question>
            <Question title="Aiemmat vammat samassa kohdassa (vapaaehtoinen)" htmlFor="prev">
              <Textarea
                id="prev"
                className="text-base"
                placeholder="Esim. ”Sama nilkka nyrjähti 5 vuotta sitten.”"
                value={a.previousInjuries ?? ""}
                onChange={(e) => set({ previousInjuries: e.target.value })}
              />
            </Question>
          </>
        )}

        {step.id === "pain" && opts && (
          <>
            <Question title="Kuinka kova kipu on levossa?">
              <PainScale label="Kipu levossa" value={a.painAtRest} onChange={(painAtRest) => set({ painAtRest })} />
            </Question>
            <Question title="Kuinka kova kipu on liikkuessa tai jalalle varatessa?">
              <PainScale label="Kipu liikkuessa" value={a.painLevel} onChange={(painLevel) => set({ painLevel })} />
            </Question>
            <Question title="Missä kipu tuntuu eniten?">
              <SingleChoice label="Kivun sijainti" options={opts.painLocations} value={a.painLocation} onChange={(painLocation) => set({ painLocation })} columns={2} />
            </Question>
          </>
        )}

        {step.id === "symptoms" && opts && (
          <>
            <Question title="Mitä oireita sinulla on?" hint="Valitse kaikki sopivat.">
              <MultiChoice label="Oireet" options={opts.symptoms} value={a.symptoms} onChange={(symptoms) => set({ symptoms })} />
            </Question>
            <Question title="Onko sinulla jokin näistä?" hint="Nämä kysymykset auttavat tunnistamaan tilanteet, joissa nilkka pitää tutkia ennen harjoittelua.">
              <MultiChoice label="Hälytysmerkit" options={opts.redFlags} value={a.redFlags} onChange={(redFlags) => set({ redFlags })} />
            </Question>
            <Question title="Muita oireita tai huomioita (vapaaehtoinen)" htmlFor="other">
              <Textarea
                id="other"
                className="text-base"
                placeholder="Esim. ”Turvotus pahenee iltaa kohti.”"
                value={a.otherSymptoms ?? ""}
                onChange={(e) => set({ otherSymptoms: e.target.value })}
              />
            </Question>
          </>
        )}

        {step.id === "function" && opts && (
          <>
            <Question title="Pystytkö varaamaan jalalle?">
              <SingleChoice label="Jalalle varaaminen" options={["normaalisti", "ontuen", "ei pysty"] as const} value={a.weightBearing} onChange={(weightBearing) => set({ weightBearing })} columns={3} />
            </Question>
            <Question title="Kuinka pitkään pystyt kävelemään kerrallaan?">
              <SingleChoice label="Kävely kerrallaan" options={["yli 30 min", "10–30 min", "alle 10 min"] as const} value={a.walkingTolerance} onChange={(walkingTolerance) => set({ walkingTolerance })} columns={3} />
            </Question>
            <Question title="Miten arvioit nilkan liikkuvuuden?">
              <SingleChoice label="Liikkuvuus" options={["hyvä", "kohtalainen", "heikko"] as const} value={a.perceivedMobility} onChange={(perceivedMobility) => set({ perceivedMobility })} columns={3} />
            </Question>
            <Question title="Mitkä toiminnot tuntuvat nyt vaikeilta?" hint="Valitse kaikki sopivat.">
              <MultiChoice label="Vaikeat toiminnot" options={opts.difficultActivities} value={a.difficultActivities} onChange={(difficultActivities) => set({ difficultActivities })} />
            </Question>
          </>
        )}

        {step.id === "goals" && (
          <Question title="Mitä haluaisit pystyä taas tekemään?" htmlFor="goals" hint="Esim. ”Kävellä työmatkat kivutta” tai ”Palata juoksemaan kesään mennessä.”">
            <Textarea id="goals" className="min-h-28 text-base" value={a.goals ?? ""} onChange={(e) => set({ goals: e.target.value })} />
          </Question>
        )}

        {step.id === "review" && (
          <>
            <p className="text-muted-foreground">Tarkista vastauksesi. Voit vielä muokata mitä tahansa kohtaa ennen tallennusta.</p>
            <IntakeSummary answers={a} onEdit={goToStep} />
          </>
        )}

        {error && (
          <p role="alert" className="rounded-xl bg-destructive-soft px-4 py-3 font-medium">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={() => goTo(stepIndex - 1)}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-border bg-card px-5 font-semibold hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5" /> Edellinen
            </button>
          ) : (
            <Link to="/asiakas" className="inline-flex min-h-12 items-center rounded-2xl px-3 font-medium text-muted-foreground hover:text-foreground">
              Tee myöhemmin
            </Link>
          )}
          {step.id === "review" ? (
            <button
              type="button"
              onClick={save}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-6 text-lg font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Check className="h-5 w-5" /> Tallenna alkukartoitus
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-6 text-lg font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {step.id === "intro" ? "Aloita" : "Seuraava"} <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>
        {stepIndex > 0 && (
          <p className="text-center text-sm">
            <Link to="/asiakas" className="text-muted-foreground underline-offset-2 hover:underline">
              Keskeytä ja jatka myöhemmin
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function Question({ title, hint, htmlFor, children }: { title: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <section>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="block text-lg font-semibold">
          {title}
        </label>
      ) : (
        <h2 className="text-lg font-semibold">{title}</h2>
      )}
      {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Fact({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">{icon}</span>
      <span>{children}</span>
    </li>
  );
}
