import { PageHeader, ComingSoon } from "@/components/common/Section";

export function ClientProgressPage() {
  return (
    <div>
      <PageHeader title="Edistyminen" subtitle="Harjoittelu, kipu ja liikkuvuus" />
      <ComingSoon title="Graafit ja yhteenvedot" phase={5} />
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
