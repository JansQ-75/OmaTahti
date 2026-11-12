import { useEffect } from "react";
import { PageHeader, ComingSoon } from "@/components/common/Section";
import { markMessagesRead } from "@/services/messages";

export function PhysioMessagesPage() {
  useEffect(() => markMessagesRead("physio"), []);
  return (
    <div>
      <PageHeader title="Viestit" subtitle="Keskustelut asiakkaiden kanssa" />
      <ComingSoon title="Viestien lukeminen ja vastaaminen" phase={6} />
    </div>
  );
}
