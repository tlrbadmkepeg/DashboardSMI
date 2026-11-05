import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, ComposedChart, Line } from "recharts";
import { AXIS_TICK, GRID_STROKE, TooltipCard } from "./ChartTooltip";
import type { MonthPoint } from "@/domain/indicators";
import { BULAN, fmtPct } from "@/lib/format";

/**
 * Tren tingkat ketercapaian bulanan: persentase pasangan sasaran–unit yang memenuhi target
 * di antara laporan yang dinilai pada bulan tersebut. Ukuran ini bebas satuan sehingga
 * indeks dan persentase tidak tercampur.
 */
export function MonthlyTrend({ data, onSelect, height = 260, detailed }: { data: MonthPoint[]; onSelect?: (bulan: number) => void; height?: number; detailed?: boolean }) {
  const hasAny = data.some((d) => d.pct !== null);
  const tooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const p: MonthPoint = payload[0].payload;
    return (
      <TooltipCard
        title={BULAN[p.bulan - 1]}
        rows={[
          { label: "Ketercapaian", value: fmtPct(p.pct), color: "#2563EB" },
          { label: "Memenuhi target", value: p.memenuhi, color: "#22A06B" },
          { label: "Belum memenuhi", value: p.belum, color: "#E5484D" },
          { label: "Laporan dinilai", value: p.laporan },
        ]}
        footer={onSelect ? "Klik untuk membuka posisi bulan ini" : undefined}
      />
    );
  };
  const click = (e: any) => {
    const b = e?.activePayload?.[0]?.payload?.bulan;
    if (b && onSelect) onSelect(b);
  };

  if (detailed) {
    return (
      <div style={{ height }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }} onClick={click}>
            <CartesianGrid stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis yAxisId="n" tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis yAxisId="p" orientation="right" domain={[0, 100]} tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={tooltip} cursor={{ fill: "#F1F5F9" }} />
            <Bar yAxisId="n" dataKey="memenuhi" stackId="a" fill="#22A06B" radius={[0, 0, 0, 0]} maxBarSize={28} />
            <Bar yAxisId="n" dataKey="belum" stackId="a" fill="#F3A5A7" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Line yAxisId="p" type="monotone" dataKey="pct" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3, fill: "#fff", strokeWidth: 2 }} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div style={{ height }} className="relative">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} onClick={click} style={{ cursor: onSelect ? "pointer" : undefined }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <ReferenceLine y={100} stroke="#E5EAF1" />
          <Tooltip content={tooltip} cursor={{ stroke: "#CBD5E1", strokeDasharray: "3 3" }} />
          <Area
            type="monotone"
            dataKey="pct"
            stroke="#2563EB"
            strokeWidth={2.5}
            fill="url(#trendFill)"
            connectNulls
            dot={{ r: 3, fill: "#fff", stroke: "#2563EB", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {!hasAny && (
        <div className="absolute inset-0 grid place-items-center">
          <p className="rounded-xl bg-white/90 px-4 py-2 text-[13px] text-navy-400">Belum ada data capaian untuk periode ini</p>
        </div>
      )}
    </div>
  );
}
