import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, GRID_STROKE, TooltipCard } from "./ChartTooltip";
import type { UnitSummary } from "@/domain/indicators";
import { CAPAIAN_META } from "@/components/common/status";
import { fmtPct } from "@/lib/format";

/** Jumlah sasaran memenuhi / belum / tanpa data per unit, hanya untuk sasaran yang berlaku bagi unit tersebut. */
export function UnitBars({ items, onSelect }: { items: UnitSummary[]; onSelect?: (id: string) => void }) {
  const rows = items.map((u) => ({
    id: u.unit.id,
    label: u.unit.singkatan,
    memenuhi: u.memenuhi,
    belum: u.belum,
    nodata: u.nodata,
    u,
  }));
  const height = Math.max(220, rows.length * 34 + 30);
  const click = (d: any) => onSelect?.(d.id);

  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 4 }} barCategoryGap={8}>
          <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" tick={{ ...AXIS_TICK, fontWeight: 500 }} axisLine={false} tickLine={false} width={104} />
          <Tooltip
            cursor={{ fill: "#F1F5F9" }}
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const u: UnitSummary = payload[0].payload.u;
              return (
                <TooltipCard
                  title={u.unit.nama}
                  rows={[
                    { label: "Sasaran berlaku", value: u.applicable },
                    { label: "Memenuhi target", value: u.memenuhi, color: CAPAIAN_META.memenuhi.color },
                    { label: "Belum memenuhi", value: u.belum, color: CAPAIAN_META.dibawah.color },
                    { label: "Belum ada data", value: u.nodata, color: CAPAIAN_META.nodata.color },
                    { label: "Ketercapaian", value: fmtPct(u.pct, 0) },
                  ]}
                  footer={onSelect ? "Klik untuk membuka detail unit" : undefined}
                />
              );
            }}
          />
          <Bar dataKey="memenuhi" stackId="a" fill={CAPAIAN_META.memenuhi.color} maxBarSize={18} onClick={click} cursor="pointer" />
          <Bar dataKey="belum" stackId="a" fill={CAPAIAN_META.dibawah.color} maxBarSize={18} onClick={click} cursor="pointer" />
          <Bar dataKey="nodata" stackId="a" fill={CAPAIAN_META.nodata.color} radius={[0, 6, 6, 0]} maxBarSize={18} onClick={click} cursor="pointer" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
