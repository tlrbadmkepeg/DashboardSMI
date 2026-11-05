import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, Info } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { FilterBar } from "@/components/layout/FilterBar";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CapaianBadge, LaporanBadge } from "@/components/common/status";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/common/states";
import { ReportDetailDialog } from "@/components/common/ReportDetailDialog";
import { AXIS_TICK, GRID_STROKE, TooltipCard } from "@/components/charts/ChartTooltip";
import { useData } from "@/hooks/useData";
import { useRouter } from "@/lib/router";
import { BULAN, BULAN_PENDEK, fmtNum, fmtValue, fmtDate, periodeLabel } from "@/lib/format";
import { seriesForSasaran } from "@/domain/indicators";
import type { Realisasi } from "@/types/domain";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthProvider";
import { cekRevisi } from "@/domain/sasaranMeta";
import { AlertTriangle } from "lucide-react";

const AGG_LABEL = {
  "rasio-gabungan": "Gabungan pembilang ÷ gabungan penyebut seluruh unit",
  "rata-rata-unit": "Rata-rata nilai unit (indikator yang sama, satuan yang sama)",
  tunggal: "Satu unit pelapor",
  kosong: "Belum ada data",
};

export function SasaranDetailPage() {
  const { model, data, loading, error, reload, filters } = useData();
  const { segments, query, navigate } = useRouter();
  const id = segments[1];
  const highlightUnit = query.get("unit");
  const [chartUnit, setChartUnit] = useState<string>(highlightUnit ?? "all");
  const [open, setOpen] = useState<Realisasi | null>(null);
  const { profile } = useAuth();

  const summary = model?.sasaran.find((s) => s.sasaran.id === id);
  const series = useMemo(
    () => (data && summary ? seriesForSasaran(data, summary.sasaran, filters, chartUnit === "all" ? undefined : chartUnit) : []),
    [data, summary, filters, chartUnit],
  );

  const crumbs = [{ label: "Kebijakan & Sasaran", to: "/kebijakan" }, { label: "Sasaran Mutu", to: "/sasaran" }, { label: summary ? `Sasaran ${summary.sasaran.nomor}` : "Detail" }];
  if (loading && !model) return <AppShell crumbs={crumbs}><PageSkeleton /></AppShell>;
  if (error) return <AppShell crumbs={crumbs}><ErrorState message={error} onRetry={reload} /></AppShell>;
  if (!summary || !data) {
    return (
      <AppShell crumbs={crumbs}>
        <Card><EmptyState title="Sasaran tidak ditemukan" description="Sasaran ini tidak ada atau tidak dapat dilihat oleh akun Anda." action={<Button variant="outline" onClick={() => navigate("/sasaran")}>Kembali ke daftar</Button>} /></Card>
      </AppShell>
    );
  }

  const s = summary.sasaran;
  const chartData = series.map((p) => ({ ...p, label: BULAN_PENDEK[p.bulan - 1] }));
  const values = chartData.map((d) => d.value).filter((v): v is number => v !== null);
  const domainMax = Math.max(s.target ?? 0, ...values, s.jenis === "indeks" ? 4 : 0);
  const yMax = s.jenis === "indeks" ? 4 : s.satuan.includes("%") ? Math.max(100, Math.ceil(domainMax / 10) * 10) : Math.ceil(domainMax * 1.15);
  const yearReports = data.realisasi
    .filter((r) => r.sasaranId === s.id && r.tahun === filters.tahun && r.bulan <= filters.bulan)
    .filter((r) => filters.unitId === "all" || r.unitId === filters.unitId);
  const rev = cekRevisi(s);
  const kendala = yearReports.filter((r) => r.kendala || r.tindakLanjut).sort((a, b) => b.bulan - a.bulan);

  return (
    <AppShell crumbs={crumbs}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 animate-fade-up">
        <div className="flex min-w-0 items-start gap-4">
          <button onClick={() => navigate("/sasaran")} className="mt-1 rounded-lg p-1.5 text-navy-400 hover:bg-white hover:text-navy" aria-label="Kembali">
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-accent">Sasaran {s.nomor}</span>
              <CapaianBadge status={summary.status} />
              {s.standar && <span className="rounded-full bg-navy/5 px-2 py-0.5 text-[11.5px] text-navy-500">{s.standar}</span>}
            </div>
            <h1 className="mt-1.5 max-w-4xl text-[21px] font-semibold leading-snug tracking-tight text-navy [text-wrap:balance] sm:text-[24px]">{s.nama}</h1>
          </div>
        </div>
        <FilterBar />
      </div>

      {rev && !rev.sesuai && (
        <div className="mb-5 flex gap-3 rounded-2xl border border-warn/25 bg-warn-soft/60 p-4 text-[13px] leading-6 text-navy-500">
          <AlertTriangle className="mt-1 size-4 shrink-0 text-warn" />
          <span><b className="text-navy">Redaksi perlu dikonfirmasi.</b> {rev.catatan} Pembaruan terbaru: "{rev.harus}". Data di basis data tidak diubah oleh portal.</span>
        </div>
      )}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Definisi indikator" description="Sumber: tabel sasaran_smi" />
          <CardBody>
            <dl className="space-y-4 text-[13.5px]">
              <div className="flex justify-between gap-4"><dt className="text-navy-400">Target</dt><dd className="text-right font-semibold text-navy">{s.targetLabel || fmtValue(s.target, s.satuan)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-navy-400">Satuan</dt><dd className="text-right text-navy">{s.satuan || "—"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-navy-400">Periode pengukuran</dt><dd className="text-right text-navy">{s.periode || "Belum tercatat di sasaran_smi"}</dd></div>
              <div><dt className="text-navy-400">Rumus pengukuran</dt><dd className="mt-1.5 rounded-xl bg-canvas px-3 py-2.5 leading-6 text-navy">{s.rumus || "Belum tercatat di sasaran_smi. PM.SMI.L3.2026 tidak memuat rumus pengukuran."}</dd></div>
              {s.jenis === "indeks" && (
                <div className="flex gap-2 rounded-xl bg-accent-soft px-3 py-2.5 text-[12.5px] leading-5 text-navy-500">
                  <Info className="mt-0.5 size-4 shrink-0 text-accent" />
                  Indikator indeks. Nilai dibaca langsung sebagai indeks sesuai definisi di basis data, tidak dikonversi menjadi persentase.
                </div>
              )}
            </dl>
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader
            title="Perkembangan bulanan"
            description={`Nilai ${s.jenis === "indeks" ? "indeks" : "realisasi"} per bulan, tahun ${filters.tahun}. Garis putus-putus adalah target.`}
            action={
              <select
                id="chart-unit"
                value={chartUnit}
                onChange={(e) => setChartUnit(e.target.value)}
                className="h-8 rounded-lg border border-line bg-white px-2 text-[12.5px] text-navy focus:border-accent focus:outline-none"
                aria-label="Unit untuk grafik"
              >
                <option value="all">Gabungan unit</option>
                {summary.units.map((u) => <option key={u.id} value={u.id}>{u.singkatan}</option>)}
              </select>
            }
          />
          <CardBody>
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div><div className="text-xs text-navy-400">Realisasi s.d. {BULAN[filters.bulan - 1]}</div><div className="mt-1 text-xl font-semibold tabular-nums text-navy">{fmtValue(summary.value, s.satuan)}</div></div>
              <div><div className="text-xs text-navy-400">Rasio thd target</div><div className="mt-1 text-xl font-semibold tabular-nums text-navy">{summary.ratio === null ? "—" : `${fmtNum(summary.ratio, 1)}%`}</div></div>
              <div><div className="text-xs text-navy-400">Metode agregasi</div><div className="mt-1 text-[12.5px] leading-5 text-navy-500">{AGG_LABEL[summary.aggregation]}</div></div>
            </div>
            {values.length ? (
              <div className="h-[240px]">
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
                    <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                    <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, yMax]} tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => (s.satuan.includes("%") ? `${v}%` : fmtNum(v, 1))} />
                    {s.target !== null && <ReferenceLine y={s.target} stroke="#142D4E" strokeOpacity={0.5} strokeDasharray="5 4" label={{ value: `Target ${fmtNum(s.target, 2)}`, position: "insideTopRight", fill: "#4A5B78", fontSize: 11 }} />}
                    <Tooltip
                      content={({ active, payload }: any) =>
                        active && payload?.length ? (
                          <TooltipCard
                            title={BULAN[payload[0].payload.bulan - 1]}
                            rows={[
                              { label: "Realisasi", value: fmtValue(payload[0].payload.value, s.satuan), color: "#2563EB" },
                              { label: "Target", value: s.targetLabel || fmtValue(s.target, s.satuan) },
                              { label: "Laporan unit", value: payload[0].payload.laporan },
                            ]}
                          />
                        ) : null
                      }
                    />
                    <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} connectNulls dot={{ r: 3.5, fill: "#fff", strokeWidth: 2 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState className="py-8" title="Belum ada data capaian untuk periode ini" />
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mb-6 overflow-hidden">
        <CardHeader title="Capaian per unit kerja" description={profile ? "Hanya unit yang berkontribusi menurut tabel kontribusi_unit. Klik baris untuk melihat rincian laporan." : "Hanya unit yang berkontribusi menurut tabel kontribusi_unit. Nilai berasal dari laporan terverifikasi."} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-y border-line bg-canvas/70 text-left text-xs font-medium uppercase tracking-[0.04em] text-navy-400">
                <th className="px-6 py-3">Unit kerja</th>
                <th className="px-4 py-3">Periode</th>
                {s.jenis !== "indeks" && <><th className="px-4 py-3 text-right">Pembilang</th><th className="px-4 py-3 text-right">Penyebut</th></>}
                <th className="px-4 py-3 text-right">{s.jenis === "indeks" ? "Nilai indeks" : "Realisasi"}</th>
                <th className="px-4 py-3">Ketercapaian</th>
                <th className="px-4 py-3">Verifikasi</th>
                <th className="px-6 py-3">Batas TL</th>
              </tr>
            </thead>
            <tbody>
              {summary.cells.filter((c) => c.applicable).map((c) => (
                <tr
                  key={c.unit.id}
                  onClick={() => profile && c.report && setOpen(c.report)}
                  className={cn("border-b border-line/70 last:border-0", profile && c.report && "cursor-pointer hover:bg-accent-soft/40", highlightUnit === c.unit.id && "bg-accent-soft/50")}
                >
                  <td className="px-6 py-3.5 font-medium text-navy">{c.unit.nama}</td>
                  <td className="px-4 py-3.5 text-navy-500">{c.report ? `${BULAN_PENDEK[c.report.bulan - 1]} ${c.report.tahun}` : "—"}</td>
                  {s.jenis !== "indeks" && (
                    <>
                      <td className="px-4 py-3.5 text-right tabular-nums text-navy-500">{fmtNum(c.report?.pembilang, 2)}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-navy-500">{fmtNum(c.report?.penyebut, 2)}</td>
                    </>
                  )}
                  <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-navy">{fmtValue(c.value, s.satuan)}</td>
                  <td className="px-4 py-3.5"><CapaianBadge status={c.status} /></td>
                  <td className="px-4 py-3.5">{c.report ? <LaporanBadge status={c.report.status} raw={c.report.statusRaw} /> : <span className="text-xs text-navy-300">Belum ada laporan</span>}</td>
                  <td className="px-6 py-3.5 text-navy-500">{fmtDate(c.report?.batasWaktu)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {summary.cells.filter((c) => c.applicable).length === 0 && (
            <EmptyState title="Tidak ada unit yang berkontribusi" description="Sasaran ini belum dipetakan ke unit mana pun pada tabel kontribusi_unit, atau berada di luar cakupan filter." />
          )}
        </div>
      </Card>

      {profile ? <Card>
        <CardHeader title="Kendala, analisis penyebab, dan tindak lanjut" description={`Laporan tahun ${filters.tahun} s.d. ${BULAN[filters.bulan - 1]} beserta seluruh statusnya`} />
        <CardBody>
          {kendala.length ? (
            <ul className="space-y-3">
              {kendala.map((r) => {
                const u = data.units.find((x) => x.id === r.unitId);
                return (
                  <li key={r.id}>
                    <button onClick={() => setOpen(r)} className="w-full rounded-xl border border-line p-4 text-left transition hover:border-accent/30 hover:bg-accent-soft/20">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-navy">{u?.singkatan} · {BULAN[r.bulan - 1]} {r.tahun}</span>
                        <span className="flex items-center gap-2"><LaporanBadge status={r.status} raw={r.statusRaw} />{r.batasWaktu && <span className="text-xs text-navy-400">Batas {fmtDate(r.batasWaktu)}</span>}</span>
                      </div>
                      <div className="mt-2 grid gap-3 text-[13px] leading-5 sm:grid-cols-3">
                        <div><div className="text-xs text-navy-400">Kendala</div><div className="mt-0.5 text-navy">{r.kendala || "—"}</div></div>
                        <div><div className="text-xs text-navy-400">Analisis penyebab</div><div className="mt-0.5 text-navy">{r.analisis || "—"}</div></div>
                        <div><div className="text-xs text-navy-400">Tindak lanjut</div><div className="mt-0.5 text-navy">{r.tindakLanjut || "—"}</div></div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState className="py-8" title="Tidak ada kendala yang dilaporkan" description="Belum ada laporan yang mencantumkan kendala atau tindak lanjut pada periode ini." />
          )}
        </CardBody>
      </Card> : (
        <div className="rounded-2xl border border-dashed border-navy-300/60 bg-white p-5 text-[13px] leading-6 text-navy-500">
          Kendala, analisis penyebab, tindak lanjut, dan catatan verifikasi merupakan informasi internal. Ringkasan tindak lanjut yang telah disetujui ditampilkan pada halaman Audit & Tindak Lanjut.
        </div>
      )}

      <ReportDetailDialog report={open} data={data} onClose={() => setOpen(null)} />
    </AppShell>
  );
}
