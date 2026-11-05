import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "accent" | "ok" | "warn" | "bad" | "navy" | "teal" | "gold";

const toneCls: Record<Tone, string> = {
  accent: "bg-accent text-white",
  ok: "bg-ok-chart text-white",
  warn: "bg-gold text-navy-900",
  bad: "bg-bad-chart text-white",
  navy: "bg-navy text-white",
  teal: "bg-teal text-white",
  gold: "bg-gold text-navy-900",
};
const barCls: Record<Tone, string> = {
  accent: "bg-accent", ok: "bg-ok-chart", warn: "bg-gold", bad: "bg-bad-chart", navy: "bg-navy", teal: "bg-teal", gold: "bg-gold",
};

export function KpiCard({
  label, value, hint, icon, tone = "accent", onClick, footer,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  tone?: Tone;
  onClick?: () => void;
  footer?: ReactNode;
}) {
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white p-4 text-left shadow-card transition-all duration-200 sm:p-5",
        onClick && "hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
      )}
    >
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", barCls[tone])} />
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-semibold leading-5 text-navy-500">{label}</span>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl shadow-sm [&_svg]:size-[18px]", toneCls[tone])}>{icon}</span>
      </div>
      <div className="mt-3 font-display text-[32px] font-bold leading-none tracking-tight text-navy tabular-nums">{value}</div>
      {hint && <div className="mt-2 text-[12px] leading-4 text-navy-400">{hint}</div>}
      {footer && <div className="mt-3">{footer}</div>}
    </Comp>
  );
}

/** Bar progres tipis untuk kartu dan tabel. */
export function Meter({ value, tone = "accent", className }: { value: number | null; tone?: "accent" | "ok" | "warn" | "bad"; className?: string }) {
  const color = { accent: "bg-accent", ok: "bg-ok-chart", warn: "bg-warn-chart", bad: "bg-bad-chart" }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div className={cn("h-full rounded-full transition-[width] duration-700", color)} style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }} />
    </div>
  );
}
