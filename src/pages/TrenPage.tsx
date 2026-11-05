import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { FilterBar } from "@/components/layout/FilterBar";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { MonthlyTrend } from "@/components/charts/MonthlyTrend";
import { AXIS_TICK, GRID_STROKE, TooltipCard } from "@/components/charts/ChartTooltip";
import { ErrorState, PageSkeleton } from "@/components/common/states";
import { CAPAIAN_META } from "@/components/common/status";
import { useData } from "@/hooks/useData";
import { useRouter } from "@/lib/router";
import { buildDashboard, seriesForSasaran } from "@/domain/indicators";
import { BULAN, BULAN_PENDEK, fmtNum, fmtPct, fmtValue } from "@/lib/format";

export function TrenPage() {
  const { data, model, loading, error, reload, filters, setFilters } = useData();
  const { navigate } = useRouter();

  const yearly = useMemo(() => {
    if (!data) return [];
    const ys = Array.from(new Set(data.realisasi.map((r) => r.tahun).filter(Boolean))).sort();
    return ys.map((tahun) => {
      const bulan = tahun === filters.tahun ? filters.bulan : 12;
      const m = buildDashboard(data, { ...filters, tahun, bulan });
      return { tahun, label: String(tahun), pct: m.kpi.pctTercapai, memenuhi: m.kpi.memenuhi, belum: m.kpi.belum, posisi: bulan };
    });
  }, [data, filters]);

  const matrix = useMemo(() => {
    if (!data || !model) return [];
    return model.sasaran.filter((s) => s.status !== "na").map((s) => ({ s, points: seriesForSasaran(data, s.sasaran, filters) }));
  }, [data, model, filters]);

  return (
    <AppShell crumbs={[{ label: "Monitoring Capaian", to: "/monitoring" }, { label: "Tren Kinerja" }]}>
      <PageHeader eyebrow="Monitoring Capaian" title="Tren Kinerja" description="Perkembangan ketercapaian bulanan dan tahunan. Ukuran yang dipakai adalah persentase laporan yang memenuhi target, sehingga indikator indeks dan persentase tidak dirata-ratakan bersama." />
      <FilterBar className="mb-5" />
      {loading && !model ? <PageSkeleton /> : error ? <ErrorState message={error} onRetry={reload} /> : model && data && (
        <>
          <div className="mb-6 grid gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader title={`Ketercapaian bulanan ${filters.tahun}`} description="Batang: jumlah laporan memenuhi dan belum memenuhi target. Garis: persentase ketercapaian." />
              <CardBody><MonthlyTrend detailed data={model.monthly} height={300} onSelect={(b) => setFilters({ bulan: b })} /></CardBody>
            </Card>
            <Card>
              <CardHeader title="Perbandingan tahunan" description="Persentase sasaran terukur yang memenuhi target pada posisi akhir tahun" />
              <CardBody>
                {yearly.length ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer>
                      <BarChart data={yearly} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                        <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                          cursor={{ fill: "#F1F5F9" }}
                          content={({ active, payload }: any) => active && payload?.length ? (
                            <TooltipCard
                              title={`Tahun ${payload[0].payload.tahun}`}
                              rows={[
                                { label: "Ketercapaian", value: fmtPct(payload[0].payload.pct, 0) },
                                { label: "Memenuhi", value: payload[0].payload.memenuhi },
                                { label: "Belum memenuhi", value: payload[0].payload.belum },
                              ]}
                              footer={`Posisi s.d. ${BULAN[payload[0].payload.posisi - 1]}. Klik untuk membuka tahun ini.`}
                            />
                          ) : null}
                        />
                        <Bar dataKey="pct" radius={[8, 8, 0, 0]} maxBarSize={56} cursor="pointer" onClick={(d: any) => setFilters({ tahun: d.tahun })}>
                          {yearly.map((y) => <Cell key={y.tahun} fill={y.tahun === filters.tahun ? "#2563EB" : "#BFD3FB"} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <p className="py-10 text-center text-[13px] text-navy-400">Belum ada data tahunan.</p>}
              </CardBody>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader title="Matriks perkembangan per sasaran" description="Nilai gabungan setiap bulan dalam satuan aslinya. Warna menunjukkan status terhadap target. Klik baris untuk membuka detail." />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[900px] text-[12.5px]">
                <thead>
                  <tr className="border-y border-line bg-canvas/70 text-xs font-medium text-navy-400">
                    <th className="sticky left-0 z-10 bg-canvas px-5 py-2.5 text-left">Sasaran</th>
                    <th className="px-2 py-2.5 text-left">Target</th>
                    {BULAN_PENDEK.map((b) => <th key={b} className="px-1 py-2.5 text-center">{b}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map(({ s, points }) => (
                    <tr key={s.sasaran.id} className="cursor-pointer border-b border-line/70 last:border-0 hover:bg-accent-soft/30" onClick={() => navigate(`/sasaran/${s.sasaran.id}`)}>
                      <td className="sticky left-0 z-10 max-w-[260px] bg-white px-5 py-2 font-medium text-navy">
                        <span className="mr-1.5 text-navy-400">{s.sasaran.nomor}.</span>
                        <span className="line-clamp-1 inline" title={s.sasaran.nama}>{s.sasaran.nama}</span>
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-navy-500">{fmtNum(s.sasaran.target, 2)}{s.sasaran.satuan.includes("%") ? "%" : ""}</td>
                      {points.map((p) => {
                        const meta = CAPAIAN_META[p.status];
                        const has = p.value !== null;
                        return (
                          <td key={p.bulan} className="px-0.5 py-1.5 text-center">
                            <span
                              title={has ? `${BULAN[p.bulan - 1]}: ${fmtValue(p.value, s.sasaran.satuan)} · ${meta.label}` : `${BULAN[p.bulan - 1]}: belum ada data`}
                              className="inline-block min-w-[44px] rounded-md px-1 py-1 tabular-nums"
                              style={has ? { background: meta.soft, color: "#142D4E" } : { color: "#CBD5E1" }}
                            >
                              {has ? fmtNum(p.value, s.sasaran.jenis === "indeks" ? 2 : 1) : "·"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </AppShell>
  );
}
