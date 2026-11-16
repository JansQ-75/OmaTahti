import { SoftCard, SourceBadge } from "@/components/common/Section";
import { ProgressStats } from "@/features/progress/ProgressCharts";
import type { Client } from "@/types";
import { clientWeeklySummary, physioSummarySentences } from "./summaryLogic";

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
  return (
    <SoftCard>
      <SummaryHeading title="Tilannekooste" />
      <div className="mt-3 space-y-2 text-sm leading-relaxed">
        {physioSummarySentences(client).map((line) => <p key={line}>{line}</p>)}
      </div>
    </SoftCard>
  );
}
