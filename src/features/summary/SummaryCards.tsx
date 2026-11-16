import { Activity, HeartPulse } from "lucide-react";
import { SoftCard, SourceBadge } from "@/components/common/Section";
import { ProgressStats } from "@/features/progress/ProgressCharts";
import type { Client } from "@/types";
import { clientWeeklySummary, physioSituationSummary } from "./summaryLogic";

function SummaryHeading({ title }: { title: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <SourceBadge source="ai-summary" />
    </div>
  );
}

export function ClientWeeklySummaryCard({ client }: { client: Client }) {
  const summary = clientWeeklySummary(client);
  return (
    <SoftCard>
      <SummaryHeading title="Viikkokatsaus" />
      <div className="mt-4">
        <ProgressStats client={client} />
      </div>
      <p className="mt-4 text-sm leading-relaxed sm:text-base">{summary.encouragement}</p>
    </SoftCard>
  );
}

export function PhysioSituationSummaryCard({ client }: { client: Client }) {
  const summary = physioSituationSummary(client);
  return (
    <SoftCard>
      <SummaryHeading title="Tilannekooste" />
      {!summary.hasData ? (
        <p className="mt-3 text-sm text-muted-foreground">Harjoittelu-, kipu- tai liikkuvuuskirjauksia ei vielä ole.</p>
      ) : (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Fact label="Harjoittelu tällä viikolla" icon={<Activity className="h-4 w-4" />}>
            {summary.sessionsThisWeek} suoritusta{summary.weeklyTarget !== null ? ` · tavoite ${summary.weeklyTarget} / viikko` : ""}
          </Fact>
          <Fact label="Kipu" icon={<HeartPulse className="h-4 w-4" />}>
            {summary.latestPain === null ? "Ei kirjauksia" : `Viimeisin ${summary.latestPain}/10`}
            {summary.painChange !== null && ` · muutos ${summary.painChange > 0 ? "+" : ""}${summary.painChange} pistettä`}
          </Fact>
          <Fact label="Keskeytykset viimeisen 14 pv aikana">
            {summary.interruptedLast14Days} kpl
            {summary.interruptionReasons.length > 0 && ` · ${summary.interruptionReasons.join("; ")}`}
          </Fact>
          <Fact label="Nilkan koukistus · kamera-arvio">
            {summary.latestMobility === null
              ? "Ei mittauksia"
              : `${summary.latestMobility}° viimeksi${summary.mobilityChange !== null ? ` · muutos ${summary.mobilityChange > 0 ? "+" : ""}${summary.mobilityChange}°` : ""}`}
          </Fact>
          {summary.latestBalanceSeconds !== null && (
            <Fact label="Yhden jalan seisonta · kamera-arvio">
              {summary.latestBalanceSeconds} s viimeksi · {summary.latestBalanceTouches} maakosketusta
              {summary.firstBalanceSeconds !== null && summary.firstBalanceSeconds !== summary.latestBalanceSeconds
                ? ` · alussa ${summary.firstBalanceSeconds} s`
                : ""}
            </Fact>
          )}
        </dl>
      )}
    </SoftCard>
  );
}

function Fact({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-muted/60 p-3">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">{icon}{label}</dt>
      <dd className="mt-1 text-sm font-semibold leading-relaxed">{children}</dd>
    </div>
  );
}
