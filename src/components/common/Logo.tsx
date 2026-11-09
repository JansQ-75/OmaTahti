import { cn } from "@/lib/utils";

/** OmaTahti mark: a rising path toward a small star – progress at your own pace. */
export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden>
        <rect width="40" height="40" rx="12" className="fill-primary" />
        <path
          d="M8 29c5 0 6-8 11-8s5 4 9 4"
          className="stroke-primary-foreground"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M30 9l1.6 3.4 3.4 1.6-3.4 1.6L30 19l-1.6-3.4L25 14l3.4-1.6z"
          className="fill-accent"
        />
      </svg>
      {showText && (
        <span className="font-display text-xl font-bold tracking-tight text-foreground">OmaTahti</span>
      )}
    </span>
  );
}
