import { cn } from "@/lib/utils";

/** 0–10 numeric pain scale with large touch targets. */
export function PainScale({ value, onChange, label }: { value?: number | undefined; onChange: (v: number) => void; label: string }) {
  return (
    <div>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-6 gap-1.5 sm:grid-cols-11">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} / 10`}
            onClick={() => onChange(n)}
            className={cn(
              "flex h-12 items-center justify-center rounded-xl border-2 text-lg font-semibold transition-colors",
              value === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary/50 hover:bg-secondary",
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
        <span>0 = ei kipua</span>
        <span>10 = pahin mahdollinen</span>
      </div>
    </div>
  );
}
