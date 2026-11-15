import { useState } from "react";
import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import { Camera, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveClient } from "@/hooks/useAppData";
import { BaselineCamera } from "@/features/baseline/BaselineCamera";
import { BaselineSummary, baselineValue } from "@/features/baseline/BaselineSummary";
import { baselineSteps, intakeComplete, validBaselineResult } from "@/features/baseline/baselineLogic";
import { needsProfessional } from "@/features/intake/intakeLogic";
import { finalizeBaseline, saveBaselineResult } from "@/services/baseline";
import { getExercise } from "@/data/exercises";
import type { BaselineResult } from "@/types";

export function ClientBaselinePage() {
  const client = useActiveClient();
  const navigate = useNavigate();
  const [camera, setCamera] = useState(false);
  const [ack, setAck] = useState<BaselineResult | null>(null);
  const [error, setError] = useState("");
  if (!client) return null;
  if (!client.intake) return <Navigate to="/asiakas/alkukartoitus/kysely" replace />;
  if (intakeComplete(client)) return <Navigate to="/asiakas/edistyminen" hash="oma-alkukartoitus" replace />;
  const steps = baselineSteps(client.intake);
  const nextIndex = steps.findIndex(({ test, side }) => !client.baselineResults?.some(r => r.testId === test.id && r.side === side && r.bodyArea === client.intake?.bodyArea && validBaselineResult(r, test)));
  const next = steps[nextIndex];
  const finish = () => { if (finalizeBaseline(client.id)) void navigate({ to: "/asiakas" }); else setError("Kaikki lähtötasotestit eivät ole vielä valmiita."); };
  if (camera && next) return <BaselineCamera test={next.test} side={next.side} bodyArea={client.intake.bodyArea} onExit={() => { setCamera(false); void navigate({ to: "/asiakas" }); }} onComplete={result => {
    if (saveBaselineResult(client.id, result)) { setCamera(false); setAck(result); } else { setCamera(false); setError("Tulosta ei voitu tallentaa. Kokeile testiä uudelleen."); }
  }} />;
  const image = next ? getExercise(next.test.exercise)?.images?.start : undefined;
  return <div className="mx-auto max-w-2xl space-y-6">
    <header><p className="text-sm font-semibold text-primary">Alkukartoitus · Lähtötasotesti</p><h1 className="mt-1 text-3xl font-bold">{ack ? "Testi tehty" : next ? next.test.name : "Lähtötasotestit tehty"}</h1></header>
    {ack ? <section className="space-y-4 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
      <p role="status" className="text-xl font-semibold">{steps.find(s => s.test.id === ack.testId)?.test.name} · {ack.side} puoli tehty</p>
      <p className="text-2xl font-bold">{baselineValue(ack)}</p><p className="text-muted-foreground">Tulos tallennettu.</p>
      {next && <p className="text-lg">{next.test.id === ack.testId ? "Vaihda toiselle puolelle." : `Seuraavaksi ${next.test.name.toLocaleLowerCase("fi-FI")}.`}</p>}
      <Button size="lg" className="min-h-14 whitespace-normal" onClick={() => setAck(null)}><ArrowRight />{next ? "Jatka" : "Katso yhteenveto"}</Button>
    </section> : next ? <>
      <p className="text-lg font-semibold">Testi {nextIndex + 1} / {steps.length} · {next.side} {next.side === client.intake.side ? "kuntoutettava puoli" : "puoli"}</p>
      <div className="flex items-start gap-5">{image && <img src={image} alt={`${next.test.name}: alkuasento`} className="h-48 w-32 shrink-0 object-contain" />}<div className="min-w-0 space-y-3"><h2 className="text-xl font-semibold">Valmista kamera</h2><p>{next.test.setup}</p><p>Hyvä valaistus helpottaa tunnistusta.</p></div></div>
      <p className="text-lg">{next.test.instruction}</p><p className="text-muted-foreground">Testi kestää {next.test.durationSeconds} sekuntia. Videota ei tallenneta.</p>
      {needsProfessional(client.intake) ? <p role="alert" className="border-l-4 border-destructive bg-destructive-soft p-4">Vastauksissasi on merkkejä, joiden vuoksi tarvitset ammattilaisen arvion ennen liikkumistestejä. Ota yhteyttä lääkäriin tai fysioterapeuttiin.</p> : <Button size="lg" className="min-h-16 w-full text-lg" onClick={() => setCamera(true)}><Camera />{next.test.exercise === "single-leg-balance" ? "Olen valmis tasapainotestiin" : "Käytä kameraa"}</Button>}
    </> : steps.length ? <><BaselineSummary client={client} /><Button size="lg" className="min-h-14 w-full whitespace-normal" onClick={finish}><CheckCircle2 />Tallenna ja viimeistele alkukartoitus</Button></> : <p>Tälle kehon alueelle ei vielä ole lähtötasotestiä.</p>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    <div className="border-t border-border pt-4"><Button asChild variant="outline"><Link to="/asiakas">Jatka myöhemmin</Link></Button><p className="mt-3 text-sm text-muted-foreground">Jo tehdyt testit säilyvät. Harjoitusohjelma avautuu, kun koko alkukartoitus on valmis.</p></div>
  </div>;
}