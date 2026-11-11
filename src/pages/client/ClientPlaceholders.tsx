import { PageHeader, ComingSoon } from "@/components/common/Section";
import { ProgressCharts } from "@/features/progress/ProgressCharts";
import { useActiveClient } from "@/hooks/useAppData";

export function ClientProgressPage() {
  const client = useActiveClient();
  return (
    <div>
      <PageHeader title="Edistyminen" subtitle="Harjoittelu, kipu, liikkuvuus ja tasapaino" />
      {client && <ProgressCharts client={client} />}
    </div>
  );
}

export function ClientMessagesPage() {
  return (
    <div>
      <PageHeader title="Viestit" subtitle="Yhteydenpito fysioterapeuttiin" />
      <ComingSoon title="Viestien lähettäminen ja lukeminen" phase={6} />
    </div>
  );
}
