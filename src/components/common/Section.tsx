import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SoftCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]", className)}>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Clearly marks a view whose features arrive in a later phase. */
export function ComingSoon({ title, phase, children }: { title: string; phase: number; children?: ReactNode }) {
  return (
    <SoftCard className="border-dashed bg-muted/50 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tulossa · vaihe {phase}</p>
      <h2 className="mt-2 text-lg font-semibold">{title}</h2>
      {children && <div className="mt-2 text-sm text-muted-foreground">{children}</div>}
    </SoftCard>
  );
}

export function SourceBadge({ source }: { source: "client-reported" | "camera" | "simulated" | "rule-based" | "ai-summary" }) {
  const map = {
    "client-reported": ["Asiakkaan ilmoittama", "bg-secondary text-secondary-foreground"],
    camera: ["Kamera-arvio", "bg-primary-soft text-primary"],
    simulated: ["Simuloitu", "bg-warning-soft text-accent-foreground"],
    "rule-based": ["Sääntöpohjainen havainto", "bg-muted text-muted-foreground"],
    "ai-summary": ["Tekoälyyhteenveto (demo)", "bg-accent-soft text-accent-foreground"],
  } as const;
  const [label, cls] = map[source];
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", cls)}>{label}</span>;
}
