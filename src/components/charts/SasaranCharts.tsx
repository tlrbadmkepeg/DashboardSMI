import { useMemo } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { AXIS_TICK, GRID_STROKE, TooltipCard } from "./ChartTooltip";
import { CAPAIAN_META } from "@/components/common/status";
import { seriesForSasaran, type SasaranSummary, type UnitSummary } from "@/domain/indicators";
import type { Dataset, Filters, Realisasi } from "@/types/domain";
import { BULAN, BULAN_PENDEK, fmtNum, fmtPct, fmtValue } from "@/lib/format";

const GOLD = "#D9A441";
const BLUE = "#2563EB";

function Kosong({ teks }: { teks: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <p className="rounded-xl border border-dashed border-line bg-white/95 px-4 py-2.5 text-center text-[13px] font-medium text-navy-400">{teks}</p>
    </div>
  );
}

/**
 * Line chart perkembangan bulanan satu sasaran dalam satuan aslinya (persentase atau indeks),
 * dengan garis target. Tidak pernah mencampur indikator bersatuan berbeda.
 */
export function SasaranTrendLine({ data, summary, filters, height = 280, dari = 1, sampai = 12 }: { data: Dataset; summary: SasaranSummary; filters: Filters; height?: number; dari?: number; sampai?: number }) {
  const s = summary.sasaran;
  const pts = useMemo(() => seriesForSasaran(data, s, filters).filter((p) => p.bulan >= dari && p.bulan <= sampai).map((p) => ({ ...p, label: BULAN_PENDEK[p.bulan - 1] })), [data, s, filters, dari, sampai]);
  const hasAny = pts.some((p) => p.value !== null);
  const indeks = s.jenis === "indeks";
  const max = indeks ? 4 : 100;
  return (
    <div style={{ height }} className="relative">
      <ResponsiveContainer>
        <LineChart data={pts} margin={{ top: 14, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis domain={[0, max]} tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => (indeks ? fmtNum(v, 1) : `${v}%`)} />
          {s.target !== null && (
            <ReferenceLine y={s.target} stroke={GOLD} strokeWidth={2} strokeDasharray="6 4"
              label={{ value: `Target ${s.targetLabel || fmtValue(s.target, s.satuan)}`, position: "insideTopRight", fill: "#A97A20", fontSize: 11.5, fontWeight: 600 }} />
          )}
          <Tooltip
            cursor={{ stroke: "#CBD5E1", strokeDasharray: "3 3" }}
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload;
              return (
                <TooltipCard
                  title={`${BULAN[p.bulan - 1]} ${filters.tahun}`}
                  rows={[
                    { label: "Realisasi", value: p.value === null ? "Belum dilaporkan" : fmtValue(p.value, s.satuan), color: BLUE },
                    { label: "Target", value: s.targetLabel || fmtValue(s.target, s.satuan), color: GOLD },
                    { label: "Status", value: p.value === null ? "Belum dilaporkan" : CAPAIAN_META[p.status as keyof typeof CAPAIAN_META].label },
                    { label: "Laporan dihitung", value: p.laporan },
                  ]}
                />
              );
            }}
          />
          <Line
            type="monotone" dataKey="value" stroke={BLUE} strokeWidth={3} connectNulls
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.value === null || cx == null || cy == null) return <g key={payload.bulan} />;
              const c = CAPAIAN_META[payload.status as keyof typeof CAPAIAN_META]?.color ?? BLUE;
              return <circle key={payload.bulan} cx={cx} cy={cy} r={5} fill="#fff" stroke={c} strokeWidth={2.5} />;
            }}
            activeDot={{ r: 7, fill: BLUE, stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      {!hasAny && <Kosong teks="Belum dilaporkan untuk sasaran ini pada tahun terpilih" />}
    </div>
  );
}

/** Horizontal bar: realisasi tiap unit yang ditugaskan pada sasaran terpilih dibanding target. */
export function TargetVsRealisasi({ summary, onSelectUnit }: { summary: SasaranSummary; onSelectUnit?: (unitId: string) => void }) {
  const s = summary.sasaran;
  const rows = summary.cells.filter((c) => c.applicable).map((c) => ({
    id: c.unit.id, label: c.unit.singkatan, value: c.value ?? 0, raw: c.value, status: c.status, ratio: c.ratio, bulan: c.report?.bulan ?? null,
  }));
  const indeks = s.jenis === "indeks";
  const max = indeks ? 4 : Math.max(100, ...rows.map((r) => r.value));
  const hasAny = rows.some((r) => r.raw !== null);
  const height = Math.max(160, rows.length * 42 + 50);
  if (!rows.length) return <p className="py-10 text-center text-[13px] text-navy-400">Belum ada unit yang dipetakan pada sasaran ini di tabel kontribusi_unit.</p>;
  return (
    <div style={{ height }} className="relative">
      <ResponsiveContainer>
        <BarChart data={rows} layout="vertical" margin={{ top: 18, right: 64, left: 0, bottom: 4 }} barCategoryGap={10}>
          <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
          <XAxis type="number" domain={[0, max]} tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => (indeks ? fmtNum(v, 1) : `${v}%`)} />
          <YAxis type="category" dataKey="label" width={128} tick={{ ...AXIS_TICK, fill: "#2E4767", fontWeight: 600 }} axisLine={false} tickLine={false} />
          {s.target !== null && <ReferenceLine x={s.target} stroke={GOLD} strokeWidth={2} strokeDasharray="6 4" label={{ value: "Target", position: "top", fill: "#A97A20", fontSize: 11.5, fontWeight: 600 }} />}
          <Tooltip
            cursor={{ fill: "#F1F5F9" }}
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const r = payload[0].payload;
              return (
                <TooltipCard
                  title={r.label}
                  rows={[
                    { label: "Realisasi", value: r.raw === null ? "Belum dilaporkan" : fmtValue(r.raw, s.satuan), color: BLUE },
                    { label: "Target", value: s.targetLabel || fmtValue(s.target, s.satuan), color: GOLD },
                    { label: "Capaian terhadap target", value: r.ratio === null ? "—" : fmtPct(r.ratio, 1) },
                    { label: "Periode laporan", value: r.bulan ? BULAN[r.bulan - 1] : "—" },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={22} cursor={onSelectUnit ? "pointer" : undefined} onClick={(d: any) => onSelectUnit?.(d.id)}>
            {rows.map((r) => <Cell key={r.id} fill={r.raw === null ? "#E2E8F0" : CAPAIAN_META[r.status].color} />)}
            <LabelList dataKey="raw" position="right" formatter={(v: number | null) => (v === null ? "Belum dilaporkan" : indeks ? fmtNum(v, 2) : fmtPct(v, 1))} style={{ fill: "#2E4767", fontSize: 11.5, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {!hasAny && <Kosong teks="Belum ada realisasi terverifikasi untuk dibandingkan" />}
    </div>
  );
}

/**
 * Perbandingan antarunit berdasarkan PROPORSI sasaran yang ditugaskan, bukan jumlah mentah,
 * karena jumlah penugasan tiap unit berbeda.
 */
export function UnitComparison({ items, onSelect }: { items: UnitSummary[]; onSelect?: (id: string) => void }) {
  const rows = items.filter((u) => u.applicable > 0).map((u) => ({
    id: u.unit.id,
    label: u.unit.singkatan,
    memenuhi: (u.memenuhi / u.applicable) * 100,
    belum: (u.belum / u.applicable) * 100,
    nodata: (u.nodata / u.applicable) * 100,
    u,
  })).sort((a, b) => b.memenuhi - a.memenuhi || a.label.localeCompare(b.label));
  const height = Math.max(220, rows.length * 36 + 40);
  const click = (d: any) => onSelect?.(d.id);
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }} barCategoryGap={9}>
          <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="label" tick={{ ...AXIS_TICK, fill: "#2E4767", fontWeight: 600 }} axisLine={false} tickLine={false} width={128} />
          <Tooltip
            cursor={{ fill: "#F1F5F9" }}
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const u: UnitSummary = payload[0].payload.u;
              return (
                <TooltipCard
                  title={u.unit.nama}
                  rows={[
                    { label: "Sasaran ditugaskan", value: u.applicable },
                    { label: "Memenuhi target", value: `${u.memenuhi} (${fmtPct((u.memenuhi / u.applicable) * 100, 0)})`, color: CAPAIAN_META.memenuhi.color },
                    { label: "Belum memenuhi", value: u.belum, color: CAPAIAN_META.dibawah.color },
                    { label: "Belum dilaporkan", value: u.nodata, color: CAPAIAN_META.nodata.color },
                  ]}
                  footer={onSelect ? "Klik untuk membuka profil unit" : undefined}
                />
              );
            }}
          />
          <Bar dataKey="memenuhi" stackId="a" fill={CAPAIAN_META.memenuhi.color} maxBarSize={20} onClick={click} cursor="pointer" />
          <Bar dataKey="belum" stackId="a" fill={CAPAIAN_META.dibawah.color} maxBarSize={20} onClick={click} cursor="pointer" />
          <Bar dataKey="nodata" stackId="a" fill={CAPAIAN_META.nodata.color} radius={[0, 6, 6, 0]} maxBarSize={20} onClick={click} cursor="pointer" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Tren tindak lanjut capaian: dibuka, selesai, dan melewati batas waktu per bulan laporan. */
export function TindakLanjutTrend({ reports, tahun, sampai, hasStatus }: { reports: Realisasi[]; tahun: number; sampai: number; hasStatus: boolean }) {
  const today = new Date().toISOString().slice(0, 10);
  const rows = BULAN_PENDEK.slice(0, sampai).map((label, i) => {
    const r = reports.filter((x) => x.tahun === tahun && x.bulan === i + 1 && x.tindakLanjut.trim());
    return {
      label,
      dibuka: r.length,
      selesai: r.filter((x) => x.statusTindakLanjut === "selesai").length,
      lewat: r.filter((x) => x.statusTindakLanjut !== "selesai" && x.batasWaktu && x.batasWaktu < today).length,
    };
  });
  const any = rows.some((r) => r.dibuka > 0);
  return (
    <div className="relative h-[250px]">
      <ResponsiveContainer>
        <BarChart data={rows} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} barGap={2}>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "#F1F5F9" }} content={({ active, payload }: any) => active && payload?.length ? (
            <TooltipCard title={payload[0].payload.label} rows={[
              { label: "Tindak lanjut dibuka", value: payload[0].payload.dibuka, color: BLUE },
              { label: "Selesai", value: hasStatus ? payload[0].payload.selesai : "Belum tercatat", color: "#16A34A" },
              { label: "Lewat batas waktu", value: payload[0].payload.lewat, color: "#E5484D" },
            ]} />
          ) : null} />
          <Bar dataKey="dibuka" fill={BLUE} radius={[6, 6, 0, 0]} maxBarSize={16} />
          <Bar dataKey="selesai" fill="#16A34A" radius={[6, 6, 0, 0]} maxBarSize={16} />
          <Bar dataKey="lewat" fill="#E5484D" radius={[6, 6, 0, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
      {!any && <Kosong teks="Belum ada tindak lanjut yang tercatat" />}
    </div>
  );
}

/**
 * Target vs realisasi untuk beberapa sasaran berbentuk persentase (satu sumbu 0–100%).
 * Sasaran berbentuk indeks tidak dicampur pada sumbu yang sama.
 */
export function SasaranTargetBars({ items, onSelect, max = 7 }: { items: SasaranSummary[]; onSelect?: (id: string) => void; max?: number }) {
  const pct = items.filter((s) => s.sasaran.jenis !== "indeks" && s.status !== "na");
  const pilih = [
    ...pct.filter((s) => s.status === "dibawah" || s.status === "mendekati").sort((a, b) => (a.ratio ?? 0) - (b.ratio ?? 0)),
    ...pct.filter((s) => s.status === "memenuhi").sort((a, b) => (a.ratio ?? 0) - (b.ratio ?? 0)),
    ...pct.filter((s) => s.status === "nodata").sort((a, b) => a.sasaran.nomor - b.sasaran.nomor),
  ].slice(0, max);
  const rows = pilih.map((s) => ({ id: s.sasaran.id, label: `S${s.sasaran.nomor}`, realisasi: s.value, target: s.sasaran.target ?? 0, status: s.status, s }));
  const any = rows.some((r) => r.realisasi !== null);
  return (
    <div style={{ height: Math.max(240, rows.length * 44 + 40) }} className="relative">
      <ResponsiveContainer>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 70, left: 0, bottom: 4 }} barGap={3} barCategoryGap={10}>
          <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="label" width={44} tick={{ ...AXIS_TICK, fill: "#142D4E", fontWeight: 700 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "#F1F5F9" }}
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const r = payload[0].payload;
              return (
                <TooltipCard
                  title={`Sasaran ${r.s.sasaran.nomor}`}
                  rows={[
                    { label: "Realisasi", value: r.realisasi === null ? "Belum dilaporkan" : fmtPct(r.realisasi, 2), color: BLUE },
                    { label: "Target", value: r.s.sasaran.targetLabel, color: GOLD },
                    { label: "Capaian terhadap target", value: r.s.ratio === null ? "—" : fmtPct(r.s.ratio, 1) },
                  ]}
                  footer={onSelect ? "Klik untuk membuka detail sasaran" : undefined}
                />
              );
            }}
          />
          <Bar dataKey="target" name="Target" fill={GOLD} fillOpacity={0.35} radius={[0, 6, 6, 0]} maxBarSize={12} onClick={(d: any) => onSelect?.(d.id)} cursor="pointer">
            <LabelList dataKey="target" position="right" formatter={(v: number) => `target ${fmtNum(v, 0)}%`} style={{ fill: "#A97A20", fontSize: 11, fontWeight: 600 }} />
          </Bar>
          <Bar dataKey="realisasi" name="Realisasi" radius={[0, 6, 6, 0]} maxBarSize={12} onClick={(d: any) => onSelect?.(d.id)} cursor="pointer">
            {rows.map((r) => <Cell key={r.id} fill={r.realisasi === null ? "#E2E8F0" : CAPAIAN_META[r.status].color} />)}
            <LabelList dataKey="realisasi" position="right" formatter={(v: number | null) => (v === null ? "belum dilaporkan" : fmtPct(v, 1))} style={{ fill: "#142D4E", fontSize: 11.5, fontWeight: 700 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {!any && <p className="absolute bottom-0 left-12 rounded-lg bg-white/95 px-2 py-1 text-[12px] font-medium text-navy-400">Realisasi belum dilaporkan · batang emas = target resmi</p>}
    </div>
  );
}
