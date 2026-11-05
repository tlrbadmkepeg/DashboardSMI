import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", {
  variants: {
    tone: {
      ok: "bg-ok-soft text-ok ring-ok/15",
      warn: "bg-warn-soft text-warn ring-warn/20",
      bad: "bg-bad-soft text-bad ring-bad/15",
      muted: "bg-nodata-soft text-nodata ring-nodata/15",
      accent: "bg-accent-soft text-accent ring-accent/15",
      navy: "bg-navy/5 text-navy ring-navy/10",
    },
  },
  defaultVariants: { tone: "muted" },
});

export function Badge({ className, tone, dot, children, ...p }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge> & { dot?: boolean }) {
  return (
    <span className={cn(badge({ tone }), className)} {...p}>
      {dot && <span className="size-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}
