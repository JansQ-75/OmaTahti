import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const chipCls = (selected: boolean) =>
  cn(
    "flex min-h-12 items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-left text-base font-medium transition-colors",
    selected
      ? "border-primary bg-primary-soft text-foreground"
      : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary",
  );

/** Large single-choice buttons (radio behaviour). */
export function SingleChoice<T extends string>({
  options,
  value,
  onChange,
  label,
  columns = 1,
}: {
  options: readonly T[];
  value?: T | undefined;
  onChange: (v: T) => void;
  label: string;
  columns?: 1 | 2 | 3;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2", columns === 3 && "grid-cols-3")}
    >
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={chipCls(value === o)}
        >
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
              value === o ? "border-primary bg-primary text-primary-foreground" : "border-border",
            )}
          >
            {value === o && <Check className="h-3 w-3" />}
          </span>
          {o}
        </button>
      ))}
    </div>
  );
}

/**
 * Large multi-choice buttons. `undefined` = not answered yet, `[]` = "Ei mitään näistä",
 * so the wizard can tell an explicit "none" from a skipped question.
 */
export function MultiChoice({
  options,
  value,
  onChange,
  label,
  noneLabel = "Ei mitään näistä",
}: {
  options: readonly string[];
  value?: string[] | undefined;
  onChange: (v: string[]) => void;
  label: string;
  noneLabel?: string;
}) {
  const toggle = (o: string) => {
    const cur = value ?? [];
    onChange(cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]);
  };
  const noneSelected = value !== undefined && value.length === 0;
  return (
    <div role="group" aria-label={label} className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => {
        const sel = value?.includes(o) ?? false;
        return (
          <button key={o} type="button" aria-pressed={sel} onClick={() => toggle(o)} className={chipCls(sel)}>
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2",
                sel ? "border-primary bg-primary text-primary-foreground" : "border-border",
              )}
            >
              {sel && <Check className="h-3 w-3" />}
            </span>
            {o}
          </button>
        );
      })}
      <button type="button" aria-pressed={noneSelected} onClick={() => onChange([])} className={chipCls(noneSelected)}>
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2",
            noneSelected ? "border-primary bg-primary text-primary-foreground" : "border-border",
          )}
        >
          {noneSelected && <Check className="h-3 w-3" />}
        </span>
        {noneLabel}
      </button>
    </div>
  );
}
