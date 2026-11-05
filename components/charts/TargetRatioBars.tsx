import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, GRID_STROKE, TooltipCard } from "./ChartTooltip";
import type { SasaranSummary } from "@/domain/indicators";
import { CAPAIAN_META } from "@/components/common/status";
import { fmtNum, fmtValue } from "@/lib/format";

/**
 * Target vs realisasi dalam satu skala: rasio capaian terhadap target (%).
 * Garis 100% = tepat target. Nilai mentah beserta satuannya tampil pada tooltip.
 */
export function TargetRatioBars({ items, onSelect }: { items: SasaranSummary[]; onSelect?: (id: string) => void }) {
  const rows = items
    .filter((s) => s.ratio !== null)
    .map((s) => ({
      id: s.sasaran.id,
      label: `S${s.sasaran.nomor}`,
      ratio: Math.min(150, Math.round((s.ratio as number) * 10) / 10),
      rawRatio: s.ratio,
      status: s.status,
      s,
    }));

  if (!rows.length) return null;
  const height = Math.max(220, rows.length * 30 + 40);

  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 44, left: -4, bottom: 4 }} barCategoryGap={7}>
          <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
          <XAxis type="number" domain={[0, 150]} ticks={[0, 50, 100, 150]} tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="label" tick={{ ...AXIS_TICK, fontWeight: 500 }} axisLine={false} tickLine={false} width={44} />
          <ReferenceLine x={100} stroke="#142D4E" strokeDasharray="4 3" strokeOpacity={0.45} label={{ value: "Target", position: "top", fill: "#4A5B78", fontSize: 11 }} />
          <Tooltip
            cursor={{ fill: "#F1F5F9" }}
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const r = payload[0].payload;
              const s: SasaranSummary = r.s;
              return (
                <TooltipCard
                  title={`Sasaran ${s.sasaran.nomor}: ${s.sasaran.nama}`}
                  rows={[
                    { label: "Target", value: s.sasaran.targetLabel || fmtValue(s.sasaran.target, s.sasaran.satuan) },
                    { label: "Realisasi", value: fmtValue(s.value, s.sasaran.satuan) },
                    { label: "Rasio terhadap target", value: `${fmtNum(r.rawRatio, 1)}%`, color: CAPAIAN_META[s.status].color },
                  ]}
                  footer={onSelect ? "Klik untuk membuka detail sasaran" : undefined}
                />
              );
            }}
          />
          <Bar dataKey="ratio" radius={[0, 6, 6, 0]} maxBarSize={18} onClick={(d: any) => onSelect?.(d.id)} cursor={onSelect ? "pointer" : undefined}>
            {rows.map((r) => <Cell key={r.id} fill={CAPAIAN_META[r.status].color} />)}
            <LabelList dataKey="rawRatio" position="right" formatter={(v: number) => `${fmtNum(v, 0)}%`} style={{ fill: "#4A5B78", fontSize: 11, fontWeight: 500 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
