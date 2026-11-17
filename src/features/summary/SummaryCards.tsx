import { SoftCard, SourceBadge } from "@/components/common/Section";
import { ProgressStats } from "@/features/progress/ProgressCharts";
import type { Client } from "@/types";
import { clientWeeklySummary, physioLatestClientMessage, physioSummarySentences } from "./summaryLogic";

function SummaryHeading({ title }: { title: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
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
  const message = physioLatestClientMessage(client);
  return (
    <SoftCard>
      <SummaryHeading title="Pikakatsaus" />
      <div className="mt-4 space-y-5 text-sm leading-relaxed sm:text-base">
        {physioSummarySentences(client).map((line, i) => (
          <div key={line}>
            <h3 className="border-l-4 border-primary pl-2 text-xs font-bold uppercase tracking-wider text-primary">{i === 0 ? "Harjoitukset" : "Kiputilanne"}</h3>
            <p className="mt-1.5">{line}</p>
          </div>
        ))}
        {message && (
          <div>
            <h3 className="border-l-4 border-primary pl-2 text-xs font-bold uppercase tracking-wider text-primary">Yhteydenotto</h3>
            <p className="mt-1.5">Viimeisin viesti asiakkaalta ({message.date}):</p>
            <blockquote className="mt-1 text-sm italic text-muted-foreground">”{message.text}”</blockquote>
          </div>
        )}
      </div>
    </SoftCard>
  );
}
