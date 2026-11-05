import type { ReactNode } from "react";

/** Kartu tooltip seragam untuk semua grafik Recharts. */
export function TooltipCard({ title, rows, footer }: { title: ReactNode; rows: { label: ReactNode; value: ReactNode; color?: string }[]; footer?: ReactNode }) {
  return (
    <div className="min-w-[180px] max-w-[280px] rounded-xl border border-line bg-white px-3.5 py-3 text-[12.5px] shadow-lift">
      <div className="mb-1.5 font-semibold leading-snug text-navy">{title}</div>
      <div className="space-y-1">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-navy-400">
              {r.color && <span className="size-2 rounded-full" style={{ background: r.color }} />}
              {r.label}
            </span>
            <span className="font-medium tabular-nums text-navy">{r.value}</span>
          </div>
        ))}
      </div>
      {footer && <div className="mt-2 border-t border-line pt-2 text-[11.5px] text-navy-400">{footer}</div>}
    </div>
  );
}

export const AXIS_TICK = { fill: "#6B7A93", fontSize: 11.5 };
export const GRID_STROKE = "#EDF1F6";
