import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Flame, Gauge, HelpCircle, TrendingDown, TrendingUp } from "lucide-react";
import { SoftCard, SourceBadge } from "@/components/common/Section";
import { getExercise } from "@/data/exercises";
import { currentStreak } from "@/utils/progress";
import type { Client } from "@/types";
import {
  BALANCE_LEVELS,
  BALANCE_TARGET_S,
  balanceLevel,
  balanceSeries,
  hasProgressData,
  mobilitySeries,
  painSeries,
  symmetrySummary,
  weekAchievement,
  weekDots,
  weekExerciseCounts,
  weekExerciseResults,
} from "./progressLogic";

const axis = { fontSize: 12, fill: "var(--muted-foreground)" };
const grid = "var(--border)";
const tip = { contentStyle: { borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" } };

function painFace(level: number) {
  if (level <= 2) return { emoji: "😊", text: "Lievä tai ei kipua" };
  if (level <= 5) return { emoji: "😐", text: "Kohtalainen kipu" };
  return { emoji: "🙁", text: "Voimakas kipu" };
}

/** Shared progress view: the client page and the physio's client page render the same charts from the same data. */
export function ProgressCharts({ client, compact = false, showMobilityChart = false }: { client: Client; compact?: boolean; showMobilityChart?: boolean }) {
  if (!hasProgressData(client)) {
    return <SoftCard className="text-muted-foreground">Edistymistietoja ei vielä ole. Kaaviot täyttyvät, kun harjoituksia tehdään.</SoftCard>;
  }
  const pain = painSeries(client.painLog);
  const mob = mobilitySeries(client.assessments);
  const bal = balanceSeries(client.sessions);
  const counts = weekExerciseCounts(client.sessions);
  const ach = weekAchievement(client.sessions);
  const results = weekExerciseResults(client.sessions);
  const programIds = client.program?.exercises.map((e) => e.exerciseId) ?? Object.keys(counts);
  const dots = weekDots(client.sessions, programIds).map((d, i) => ({ ...d, tavoite: ach[i] }));
  const latestMob = mob.at(-1);
  const firstMob = mob[0];
  const latestPain = pain.at(-1);
  const firstPain = pain[0];
  const streak = currentStreak(client.sessions);
  const lsi = symmetrySummary(mob);
  const balLevels = bal.map((b) => ({ ...b, level: balanceLevel(b.sekunnit, b.kosketukset) }));
  const balNow = balLevels.at(-1);
  const balFirst = balLevels[0];

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={<Flame className="h-5 w-5" />}
            iconClass="bg-warning-soft text-warning"
            label="Harjoitusputki"
            value={`${streak} pv`}
            footer={<span className={streak > 0 ? "font-medium text-warning" : "text-muted-foreground"}>{streak > 0 ? "Aktiivinen putki" : "Aloita putki tänään!"}</span>}
          />
          <StatCard
            icon={<span className="text-xl leading-none">{latestPain ? painFace(latestPain.kipu).emoji : "😊"}</span>}
            iconClass="bg-primary-soft"
            label="Kipu nyt"
            value={latestPain ? `${latestPain.kipu}/10` : "–"}
            footer={
              latestPain && firstPain ? (
                <>
                  <Trend delta={latestPain.kipu - firstPain.kipu} unit=" p" goodWhenDown />
                  <span className="text-muted-foreground">lähtötaso {firstPain.kipu}/10</span>
                </>
              ) : undefined
            }
          />
          <StatCard
            icon={<Gauge className="h-5 w-5" />}
            iconClass="bg-primary-soft text-primary"
            label="Liikkuvuus · nilkan koukistus"
            value={latestMob ? `${latestMob.kuntoutettava}°` : "–"}
            footer={
              latestMob && firstMob ? (
                <>
                  <Trend delta={latestMob.kuntoutettava - firstMob.kuntoutettava} unit="°" />
                  {latestMob.terve !== undefined && <span className="text-muted-foreground">terve puoli {latestMob.terve}° (ero {latestMob.terve - latestMob.kuntoutettava}°)</span>}
                </>
              ) : undefined
            }
          />
        </div>
      )}

      <ChartCard title="Kivun kehitys" badge={<SourceBadge source="client-reported" />} note="Kipu kirjataan harjoituksen jälkeen (0–10).">
        {pain.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pain} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={grid} vertical={false} />
              <XAxis dataKey="date" tick={axis} />
              <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={axis} />
              <Tooltip {...tip} formatter={(v) => [`${v}/10`, "Kipu"]} />
              <Line type="monotone" dataKey="kipu" stroke="var(--warning)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <Empty />}
      </ChartCard>

      <ChartCard
        title="Liikkuvuuden symmetriaindeksi"
        badge={<SourceBadge source={mob.some((m) => m.source === "simulated") ? "simulated" : "camera"} />}
        note="Kamera-arvio, ei kliininen mittaus. Vertailu samalla kuvausasetelmalla."
        help={
          <>
            <p>Indeksi vertaa kuntoutettavan puolen nilkan koukistusta terveeseen puoleen. Terve puoli on aina 100.</p>
            <p className="mt-1 font-medium">Indeksi = kuntoutettava ° / terve ° × 100</p>
            <p className="mt-1">Tavoite on 100. Yli 90 tarkoittaa hyvää toiminnallista symmetriaa.</p>
          </>
        }
      >
        {mob.length === 0 ? (
          <Empty text="Liikkuvuutta seurataan, kun liikekartoitus on tehty." />
        ) : (
          <>
            {lsi ? (
              <div className="mb-4">
                <p className="text-4xl font-bold">
                  {lsi.current}
                  <span className="text-lg font-medium text-muted-foreground"> / 100</span>
                </p>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${lsi.current}%` }} />
                </div>
                <p className="mt-3 text-sm">
                  Lähtötaso: {lsi.baseline} → Kehitys: <span className="font-semibold text-success">{lsi.change >= 0 ? "+" : ""}{lsi.change} pistettä</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Mitatut asteet: Kuntoutettava {lsi.kuntoutettava}° | Terve puoli {lsi.terve}° (puoliero {lsi.ero}°)
                </p>
              </div>
            ) : null}
            {showMobilityChart && (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={mob} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke={grid} vertical={false} />
                  <XAxis dataKey="date" tick={axis} />
                  <YAxis unit="°" tick={axis} />
                  <Tooltip {...tip} formatter={(v, n) => [`${v}°`, n === "kuntoutettava" ? "Kuntoutettava puoli" : "Terve puoli"]} />
                  <Legend formatter={(v) => (v === "kuntoutettava" ? "Kuntoutettava puoli" : "Terve puoli")} />
                  <Bar dataKey="kuntoutettava" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="terve" fill="var(--muted-foreground)" fillOpacity={0.35} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </ChartCard>

      <ChartCard
        title="Tasapainon hallinta (kuntoutettava puoli)"
        badge={<SourceBadge source={bal.some((b) => b.source === "simulated") ? "simulated" : "camera"} />}
        note="Yhden jalan seisonta. Ajastin ei pysähdy maakosketuksesta – sarja tehdään aina loppuun."
        help={
          <ul className="space-y-1">
            {BALANCE_LEVELS.map((l) => (
              <li key={l.level}>
                <span className="font-semibold">Taso {l.level}: {l.name}</span> – {l.criteria}
              </li>
            ))}
          </ul>
        }
      >
        {balNow && balFirst ? (
          <>
            <div className="grid grid-cols-5 gap-1.5" aria-label={`Taso ${balNow.level} / 5`}>
              {BALANCE_LEVELS.map((l) => (
                <div key={l.level} className={`h-3 rounded-full ${l.level <= balNow.level ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            <p className="mt-3 text-xl font-bold">
              Taso {balNow.level} / 5: {BALANCE_LEVELS[balNow.level - 1]!.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Pitoaika {balNow.sekunnit} / {BALANCE_TARGET_S} s | {balNow.kosketukset === 0 ? "Ei maakosketuksia" : `${balNow.kosketukset} maakosketusta`}
            </p>
            <p className="mt-2 text-sm">
              Alussa: Taso {balFirst.level} → Nyt: <span className="font-semibold text-primary">Taso {balNow.level}</span>
            </p>
          </>
        ) : <Empty text="Tasapainon arvio kertyy kameraseurannasta (tulossa vaiheessa 7)." />}
      </ChartCard>

      {!compact && (
  <ChartCard title="Tämän viikon harjoittelu" note="Yksi pallo = yksi tehty liike. Vihreä päivä = kaikki ohjelman eri liikkeet tehty. Keskeytetyt eivät näy.">
        <DotWeek rows={dots} />
        <h4 className="mt-4 font-semibold">Tällä viikolla harjoitellut liikkeet</h4>
        <ul className="mt-2 divide-y divide-border">
          {programIds.map((id) => (
            <li key={id} className="flex flex-wrap justify-between gap-x-3 py-2 text-sm">
              <span>{getExercise(id)?.name ?? id}</span>
              <span>
                <span className="font-semibold">{counts[id] ?? 0} krt</span>
                {results[id] && (
                  <span className="text-muted-foreground">
                    {" "}• Viimeksi: {results[id].latest} / {results[id].target} {results[id].unit === "seconds" ? "s" : "toistoa"}
                    {results[id].first !== results[id].latest && <> • Kehitys: {results[id].first} → {results[id].latest}</>}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </ChartCard>
      )}
    </div>
  );
}

function ChartCard({ title, badge, note, help, children }: { title: string; badge?: React.ReactNode; note?: string; help?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SoftCard>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {help && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Piilota selitys" : "Näytä selitys"}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-primary hover:bg-primary-soft"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        )}
        {badge}
      </div>
      {help && open && <div className="mt-2 rounded-xl bg-primary-soft p-3 text-sm">{help}</div>}
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
      <div className="mt-3">{children}</div>
    </SoftCard>
  );
}

function StatCard({ icon, iconClass, label, value, footer }: { icon: React.ReactNode; iconClass: string; label: string; value: string; footer?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${iconClass}`}>{icon}</span>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      {footer && <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">{footer}</div>}
    </div>
  );
}

function Trend({ delta, unit, goodWhenDown = false }: { delta: number; unit: string; goodWhenDown?: boolean }) {
  const good = goodWhenDown ? delta < 0 : delta > 0;
  const Icon = delta < 0 ? TrendingDown : TrendingUp;
  const cls = delta === 0 ? "bg-muted text-muted-foreground" : good ? "bg-success-soft text-success" : "bg-warning-soft text-warning";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${cls}`}>
      <Icon className="h-3.5 w-3.5" /> {delta > 0 ? "+" : delta < 0 ? "−" : "±"}{Math.abs(delta)}{unit}
    </span>
  );
}

function Empty({ text = "Ei vielä merkintöjä." }: { text?: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}

const FULL_DAYS: Record<string, string> = { Ma: "Maanantai", Ti: "Tiistai", Ke: "Keskiviikko", To: "Torstai", Pe: "Perjantai", La: "Lauantai", Su: "Sunnuntai" };

function DotWeek({ rows }: { rows: { day: string; dots: number; done: number; total: number; complete: boolean; tavoite?: number | undefined }[] }) {
  const max = Math.max(3, ...rows.map((r) => r.dots));
  return (
    <div>
      <div className="grid grid-cols-7 gap-1">
        {rows.map((r) => {
          const tip = `${FULL_DAYS[r.day] ?? r.day}: ${r.dots} liikettä tehty` + (r.complete ? " – kaikki ohjelman eri liikkeet suoritettu! 🎉" : r.total ? ` (${r.done} / ${r.total} eri liikettä)` : "") + (r.tavoite !== undefined ? ` · toistotavoite ${r.tavoite} %` : "");
          return (
            <div key={r.day} className="flex flex-col items-center" title={tip} aria-label={tip}>
              <div className="flex flex-col-reverse items-center gap-1" style={{ height: max * 22 }}>
                {Array.from({ length: r.dots }, (_, k) => (
                  <span key={k} className={`h-[18px] w-[18px] rounded-full ${r.complete ? "bg-success" : "bg-primary"}`} />
                ))}
              </div>
              <span className="mt-2 text-xs text-muted-foreground">{r.day}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-success" /> Koko ohjelma suoritettu</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary" /> Osittainen harjoittelu</span>
      </div>
    </div>
  );
}

function WeekTooltip({ active, payload }: { active?: boolean; payload?: { payload: { day: string; kokonainen: number; yksittainen: number; tavoite?: number } }[] }) {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-2 text-xs shadow-sm">
      <p className="font-semibold">{FULL_DAYS[d.day] ?? d.day}</p>
      <p>Koko harjoituskerta: {d.kokonainen}</p>
      <p>Yksittäinen liike: {d.yksittainen}</p>
      {d.tavoite !== undefined && <p className="font-medium text-primary">Toistotavoite saavutettu {d.tavoite} %</p>}
    </div>
  );
}
