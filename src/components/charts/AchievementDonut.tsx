import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { TooltipCard } from "./ChartTooltip";
import { CAPAIAN_META } from "@/components/common/status";
import type { StatusCapaian } from "@/types/domain";

export interface DonutSlice { key: "memenuhi" | "belum" | "nodata"; label: string; value: number; color: string }

export function buildDonut(memenuhi: number, mendekati: number, dibawah: number, nodata: number): DonutSlice[] {
  return [
    { key: "memenuhi", label: "Memenuhi target", value: memenuhi, color: CAPAIAN_META.memenuhi.color },
    { key: "belum", label: "Belum memenuhi target", value: mendekati + dibawah, color: CAPAIAN_META.dibawah.color },
    { key: "nodata", label: "Belum dilaporkan", value: nodata, color: CAPAIAN_META.nodata.color },
  ];
}

export function AchievementDonut({ slices, onSelect, centerLabel, centerValue }: {
  slices: DonutSlice[];
  onSelect?: (key: DonutSlice["key"]) => void;
  centerLabel: string;
  centerValue: string;
}) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col">
      <div className="relative h-[190px] w-[190px] shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={slices.filter((s) => s.value > 0)}
              dataKey="value"
              nameKey="label"
              innerRadius={64}
              outerRadius={90}
              paddingAngle={2}
              cornerRadius={6}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              onClick={(d: any) => onSelect?.(d.key)}
              cursor={onSelect ? "pointer" : undefined}
              isAnimationActive
            >
              {slices.filter((s) => s.value > 0).map((s) => <Cell key={s.key} fill={s.color} />)}
            </Pie>
            <Tooltip
              content={({ active, payload }: any) =>
                active && payload?.length ? (
                  <TooltipCard
                    title={payload[0].payload.label}
                    rows={[
                      { label: "Jumlah sasaran", value: payload[0].value },
                      { label: "Porsi", value: total ? `${Math.round((payload[0].value / total) * 100)}%` : "—" },
                    ]}
                    footer={onSelect ? "Klik untuk melihat daftar sasaran" : undefined}
                  />
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[30px] font-semibold leading-none tracking-tight text-navy tabular-nums">{centerValue}</span>
          <span className="mt-1.5 max-w-[110px] text-center text-[11.5px] leading-tight text-navy-400">{centerLabel}</span>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-2">
        {slices.map((s) => (
          <li key={s.key}>
            <button
              onClick={() => onSelect?.(s.key)}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-canvas"
            >
              <span className="flex min-w-0 items-center gap-2.5 text-[13px] text-navy-500">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="truncate">{s.label}</span>
              </span>
              <span className="text-[15px] font-semibold tabular-nums text-navy">{s.value}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export type { StatusCapaian };
