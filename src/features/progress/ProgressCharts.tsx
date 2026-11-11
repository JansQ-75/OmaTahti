import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SoftCard, SourceBadge } from "@/components/common/Section";
import { getExercise } from "@/data/exercises";
import { currentStreak } from "@/utils/progress";
import type { Client } from "@/types";
import {
  BALANCE_TARGET_S,
  balanceSeries,
  hasProgressData,
  mobilitySeries,
  painSeries,
  weekActivity,
  weekExerciseCounts,
} from "./progressLogic";

const axis = { fontSize: 12, fill: "var(--muted-foreground)" };
const grid = "var(--border)";
const tip = { contentStyle: { borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" } };

/** Shared progress view: the client page and the physio's client page render the same charts from the same data. */
export function ProgressCharts({ client }: { client: Client }) {
  if (!hasProgressData(client)) {
    return <SoftCard className="text-muted-foreground">Edistymistietoja ei vielä ole. Kaaviot täyttyvät, kun harjoituksia tehdään.</SoftCard>;
  }
  const pain = painSeries(client.painLog);
  const mob = mobilitySeries(client.assessments);
  const bal = balanceSeries(client.sessions);
  const week = weekActivity(client.sessions);
  const counts = weekExerciseCounts(client.sessions);
  const programIds = client.program?.exercises.map((e) => e.exerciseId) ?? Object.keys(counts);
  const latestMob = mob.at(-1);
  const latestPain = pain.at(-1);
  const firstPain = pain[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Figure label="Harjoitusputki" value={`${currentStreak(client.sessions)} pv`} />
        <Figure label="Kipu nyt (lähtötaso)" value={latestPain ? `${latestPain.kipu}/10` : "–"} sub={firstPain ? `alussa ${firstPain.kipu}/10` : undefined} />
        <Figure label="Nilkan koukistus" value={latestMob ? `${latestMob.kuntoutettava}°` : "–"} sub={latestMob?.terve !== undefined ? `terve puoli ${latestMob.terve}°` : undefined} />
      </div>

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
        title="Liikkuvuus ja puoliero: nilkan koukistus"
        badge={<SourceBadge source={mob.some((m) => m.source === "simulated") ? "simulated" : "camera"} />}
        note="Kamera-arvio asteina, ei kliininen mittaus. Vertailu samalla kuvausasetelmalla."
      >
        {mob.length ? (
          <>
            <ResponsiveContainer width="100%" height={210}>
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
            <ul className="mt-2 flex flex-wrap gap-2 text-sm">
              {mob.filter((m) => m.ero !== undefined).map((m) => (
                <li key={m.date} className="rounded-full bg-muted px-3 py-1">{m.date}: puoliero {m.ero}°</li>
              ))}
            </ul>
          </>
        ) : <Empty text="Liikkuvuutta seurataan, kun liikekartoitus on tehty." />}
      </ChartCard>

      <ChartCard
        title="Tasapaino: yhden jalan seisonta (kuntoutettava puoli)"
        badge={<SourceBadge source={bal.some((b) => b.source === "simulated") ? "simulated" : "camera"} />}
        note="Pisin vakaa pito ilman maakosketusta. Ajastin ei pysähdy kosketuksesta – sarja tehdään aina loppuun."
      >
        {bal.length ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bal} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={grid} vertical={false} />
                <XAxis dataKey="date" tick={axis} />
                <YAxis domain={[0, BALANCE_TARGET_S + 5]} ticks={[0, 10, 20, 30]} unit=" s" tick={axis} />
                <Tooltip {...tip} formatter={(v) => [`${v} s`, "Vakaa pito"]} />
                <ReferenceLine y={BALANCE_TARGET_S} stroke="var(--primary)" strokeDasharray="4 4" label={{ value: "Tavoite 30 s", fontSize: 12, fill: "var(--primary)", position: "insideBottomRight" }} />
                <Line type="monotone" dataKey="sekunnit" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <ul className="mt-2 flex flex-wrap gap-2 text-sm">
              {bal.map((b) => (
                <li key={b.date} className="rounded-full bg-muted px-3 py-1">
                  {b.date}: {b.kosketukset === 0 ? "ei maakosketuksia" : `${b.kosketukset} maakosketusta`}
                </li>
              ))}
            </ul>
          </>
        ) : <Empty text="Tasapainon arvio kertyy kameraseurannasta (tulossa vaiheessa 7)." />}
      </ChartCard>

      <ChartCard title="Tämän viikon harjoittelu" note="Vain loppuun asti tehdyt kerrat. Keskeytetyt eivät näy.">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={week} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={grid} vertical={false} />
            <XAxis dataKey="day" tick={axis} />
            <YAxis allowDecimals={false} tick={axis} />
            <Tooltip {...tip} formatter={(v, n) => [v, n === "kokonainen" ? "Koko harjoituskerta" : "Yksittäinen liike"]} />
            <Legend formatter={(v) => (v === "kokonainen" ? "Koko harjoituskerta" : "Yksittäinen liike")} />
            <Bar dataKey="kokonainen" stackId="a" fill="var(--primary)" />
            <Bar dataKey="yksittainen" stackId="a" fill="var(--primary)" fillOpacity={0.4} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <h4 className="mt-4 font-semibold">Tällä viikolla harjoitellut liikkeet</h4>
        <ul className="mt-2 divide-y divide-border">
          {programIds.map((id) => (
            <li key={id} className="flex justify-between py-2 text-sm">
              <span>{getExercise(id)?.name ?? id}</span>
              <span className="font-semibold">{counts[id] ?? 0} krt</span>
            </li>
          ))}
        </ul>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, badge, note, children }: { title: string; badge?: React.ReactNode; note?: string; children: React.ReactNode }) {
  return (
    <SoftCard>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {badge}
      </div>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
      <div className="mt-3">{children}</div>
    </SoftCard>
  );
}

function Figure({ label, value, sub }: { label: string; value: string; sub?: string | undefined }) {
  return (
    <div className="rounded-2xl bg-primary-soft p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Empty({ text = "Ei vielä merkintöjä." }: { text?: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}
