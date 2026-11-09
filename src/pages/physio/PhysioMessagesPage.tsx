import { PageHeader, ComingSoon } from "@/components/common/Section";

export function PhysioMessagesPage() {
  return (
    <div>
      <PageHeader title="Viestit" subtitle="Keskustelut asiakkaiden kanssa" />
      <ComingSoon title="Viestien lukeminen ja vastaaminen" phase={6} />
    </div>
  );
}
