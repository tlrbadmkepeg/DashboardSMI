import { useMemo, useState } from "react";
import { Paperclip, LayoutGrid, Table2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { FilterBar } from "@/components/layout/FilterBar";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/common/DataTable";
import { ErrorState, EmptyState, TableSkeleton } from "@/components/common/states";
import { CapaianBadge, LaporanBadge } from "@/components/common/status";
import { Sparkline } from "@/components/charts/Sparkline";
import { ExportButtons } from "@/components/common/ExportMenu";
import { Meter } from "@/components/common/KpiCard";
import { useData } from "@/hooks/useData";
import { useAuth } from "@/auth/AuthProvider";
import { useRouter } from "@/lib/router";
import { fmtNum, fmtValue, periodeLabel } from "@/lib/format";
import { isBelum, seriesForSasaran, type SasaranSummary } from "@/domain/indicators";
import { cekRevisi, temaSasaran } from "@/domain/sasaranMeta";
import { exportExcel, exportPdf } from "@/services/export";
import { fileStamp, sasaranColumns, sasaranRow } from "@/domain/reports";
import { cn } from "@/lib/utils";
import { cekPemetaan, namaSingkat } from "@/content/resmi/pemetaan";
import { SimulasiBadge } from "@/components/portal/ContentState";

const STATUS_TABS = [
  { key: "semua", label: "Semua" },
  { key: "memenuhi", label: "Memenuhi" },
  { key: "belum", label: "Belum memenuhi" },
  { key: "nodata", label: "Belum dilaporkan" },
] as const;

export function SasaranPage() {
  const { model, data, loading, error, reload, filters } = useData();
  const { profile } = useAuth();
  const { navigate, query } = useRouter();
  const tab = (query.get("status") ?? "semua") as (typeof STATUS_TABS)[number]["key"];
  const [view, setView] = useState<"tema" | "tabel">("tema");

  const rows = useMemo(() => {
    if (!model) return [];
    return model.sasaran.filter((s) => {
      if (tab === "memenuhi") return s.status === "memenuhi";
      if (tab === "belum") return isBelum(s.status);
      if (tab === "nodata") return s.status === "nodata";
      return true;
    });
  }, [model, tab]);

  const series = useMemo(() => {
    const m = new Map<string, (number | null)[]>();
    if (data && model) for (const s of model.sasaran) m.set(s.sasaran.id, seriesForSasaran(data, s.sasaran, filters).slice(0, filters.bulan).map((p) => p.value));
    return m;
  }, [data, model, filters]);

  const revisi = useMemo(
    () => (model?.sasaran ?? []).map((x) => cekRevisi(x.sasaran)).filter((x): x is NonNullable<ReturnType<typeof cekRevisi>> => !!x),
    [model],
  );
  const pemetaan = useMemo(() => (data ? cekPemetaan(data) : null), [data]);
  const groups = useMemo(() => {
    const m = new Map<string, { resmi: boolean; items: SasaranSummary[] }>();
    rows.forEach((r) => {
      const t = temaSasaran(r.sasaran);
      if (!m.has(t.tema)) m.set(t.tema, { resmi: t.resmi, items: [] });
      m.get(t.tema)!.items.push(r);
    });
    return Array.from(m.entries());
  }, [rows]);
  const temaResmi = groups.some(([, g]) => g.resmi);

  const columns: Column<SasaranSummary>[] = [
    { key: "nomor", header: "No", sortValue: (r) => r.sasaran.nomor, headerClassName: "w-12", cell: (r) => <span className="grid size-8 place-items-center rounded-lg bg-canvas text-[13px] font-semibold">{r.sasaran.nomor}</span> },
    {
      key: "nama", header: "Sasaran mutu", sortValue: (r) => r.sasaran.nama, className: "min-w-[280px]",
      cell: (r) => (
        <div>
          <div className="font-medium leading-5">{r.sasaran.nama}</div>
          <div className="mt-1 line-clamp-1 text-xs text-navy-400" title={r.sasaran.rumus}>{r.sasaran.rumus || "Rumus belum tercantum"}</div>
          <div className="mt-1 text-xs text-navy-400">{r.sasaran.periode || "Periode tidak tercantum"} · {r.units.map((u) => u.singkatan).join(", ") || "belum dipetakan"}</div>
        </div>
      ),
    },
    { key: "target", header: "Target", sortValue: (r) => r.sasaran.target, cell: (r) => <span className="whitespace-nowrap tabular-nums">{r.sasaran.targetLabel || fmtValue(r.sasaran.target, r.sasaran.satuan)}</span> },
    {
      key: "realisasi", header: "Realisasi", sortValue: (r) => r.ratio,
      cell: (r) => <div className="whitespace-nowrap"><div className="font-semibold tabular-nums">{r.value === null ? <span className="font-normal text-navy-400">Belum dilaporkan</span> : fmtValue(r.value, r.sasaran.satuan)}</div>{r.ratio !== null && <div className="text-xs tabular-nums text-navy-400">{fmtNum(r.ratio, 1)}% terhadap target</div>}</div>,
    },
    { key: "status", header: "Status", sortValue: (r) => r.status, cell: (r) => <CapaianBadge status={r.status} /> },
    { key: "tren", header: "Tren", cell: (r) => <Sparkline points={series.get(r.sasaran.id) ?? []} target={r.sasaran.target} /> },
    ...(profile ? [
      {
        key: "verif", header: "Verifikasi", sortValue: (r: SasaranSummary) => r.pendingCount,
        cell: (r: SasaranSummary) => <div className="space-y-1">{r.latestReport ? <LaporanBadge status={r.latestReport.status} raw={r.latestReport.statusRaw} /> : <span className="text-xs text-navy-300">Belum ada laporan</span>}{r.pendingCount > 0 && <div className="text-xs text-navy-400">{r.pendingCount} menunggu</div>}</div>,
      },
      {
        key: "bukti", header: "Bukti", sortValue: (r: SasaranSummary) => r.buktiCount,
        cell: (r: SasaranSummary) => <span className={cn("inline-flex items-center gap-1 text-[13px] tabular-nums", r.buktiCount ? "text-navy" : "text-navy-300")}><Paperclip className="size-3.5" /> {r.buktiCount}</span>,
      },
    ] as Column<SasaranSummary>[] : []),
  ];

  const periode = periodeLabel(filters.tahun, filters.bulan);
  const perluKonfirmasi = revisi.filter((r) => !r.sesuai);

  return (
    <AppShell crumbs={[{ label: "Kebijakan & Sasaran", to: "/kebijakan" }, { label: "Sasaran Mutu" }]}>
      <PageHeader
        title="18 Sasaran Mutu SMI"
        eyebrow={data?.simulasi ? <span className="inline-flex items-center gap-2">Kebijakan & Sasaran <SimulasiBadge /></span> : "Kebijakan & Sasaran"}
        description={`Rumusan dan target mengikuti PM.SMI.L3.2026 dan tabel sasaran_smi; unit kontributor mengikuti kontribusi_unit. Capaian memakai laporan terverifikasi, posisi s.d. ${periode}.`}
        actions={
          <ExportButtons
            disabled={!rows.length}
            onExcel={() => exportExcel(`sasaran-mutu-smi-${fileStamp(filters)}`, [{ name: "Sasaran Mutu", columns: sasaranColumns, rows: rows.map(sasaranRow) }])}
            onPdf={() => exportPdf({
              fileName: `sasaran-mutu-smi-${fileStamp(filters)}`, title: "Sasaran Mutu SMI BPSDMP", subtitle: `Posisi s.d. ${periode}`,
              sections: [{ heading: "Daftar sasaran mutu", columns: ["No", "Sasaran", "Target", "Realisasi", "Rasio (%)", "Status", "Unit"], rows: rows.map((s) => { const r = sasaranRow(s); return [r[0], r[1], r[2], r[7], r[8], r[9], r[6]]; }) }],
            })}
          />
        }
      />

      {revisi.length > 0 && (
        <div className={cn("mb-5 rounded-2xl border p-4 sm:p-5", perluKonfirmasi.length ? "border-warn/25 bg-warn-soft/60" : "border-ok/20 bg-ok-soft/60")}>
          <div className="flex items-center gap-2 text-[13.5px] font-semibold text-navy">
            {perluKonfirmasi.length ? <AlertTriangle className="size-4 text-warn" /> : <CheckCircle2 className="size-4 text-ok" />}
            {perluKonfirmasi.length ? `Data sasaran_smi memerlukan sinkronisasi: redaksi atau target ${perluKonfirmasi.length} sasaran berbeda dengan PM.SMI.L3.2026` : "Redaksi dan target 18 sasaran sesuai PM.SMI.L3.2026"}
          </div>
          {perluKonfirmasi.length > 0 && (
            <ul className="mt-3 space-y-3">
              {perluKonfirmasi.map((r) => (
                <li key={r.nomor} className="text-[13px] leading-6 text-navy-500">
                  <b className="text-navy">Sasaran {r.nomor}.</b> {r.catatan} Rumusan pada PM.SMI.L3.2026:
                  <span className="mt-1 block rounded-lg bg-white/80 px-3 py-2 text-navy">"{r.harus}"</span>
                  <span className="text-[12px]">Data tidak diubah oleh portal. Mohon perbarui tabel sasaran_smi setelah redaksi dikonfirmasi.</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {pemetaan && profile && (
        <div className={cn("mb-5 rounded-2xl border p-4 sm:p-5", pemetaan.selisih.length ? "border-warn/25 bg-warn-soft/60" : "border-ok/20 bg-ok-soft/60")}>
          <div className="flex items-center gap-2 text-[13.5px] font-semibold text-navy">
            {pemetaan.selisih.length ? <AlertTriangle className="size-4 text-warn" /> : <CheckCircle2 className="size-4 text-ok" />}
            {pemetaan.selisih.length ? (data?.simulasi ? `Pemetaan unit pada dokumen PM.SMI.L3-01 berbeda dari pemetaan sebelumnya pada ${pemetaan.selisih.length} sasaran — perlu konfirmasi` : `Pemetaan kontribusi_unit memerlukan sinkronisasi pada ${pemetaan.selisih.length} sasaran`) : "Pemetaan unit kerja pada kontribusi_unit sesuai ketetapan"}
          </div>
          {pemetaan.selisih.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-[13px] leading-6 text-navy-600">
              {pemetaan.selisih.map((x) => (
                <li key={x.nomor}><b className="text-navy">Sasaran {x.nomor}.</b> {x.kurang.length > 0 && <>{data?.simulasi ? "Ada di pemetaan sebelumnya, tidak ada di dokumen" : "Belum dipetakan"}: {x.kurang.join(", ")}. </>}{x.lebih.length > 0 && <>{data?.simulasi ? "Ada di dokumen, tidak ada di pemetaan sebelumnya" : "Tidak seharusnya dipetakan"}: {x.lebih.join(", ")}.</>}</li>
              ))}
              <li className="text-[12px] text-navy-500">Portal tidak mengubah tabel. Konfirmasi pemetaan lalu ajukan perubahan melalui menu Sinkronisasi Data (administrator).</li>
            </ul>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-white p-1">
            {STATUS_TABS.map((t) => (
              <button key={t.key} onClick={() => navigate(t.key === "semua" ? "/sasaran" : `/sasaran?status=${t.key}`)} className={cn("rounded-lg px-3 py-1.5 text-[13px] font-medium transition", tab === t.key ? "bg-navy text-white" : "text-navy-500 hover:bg-canvas")}>{t.label}</button>
            ))}
          </div>
          <div className="flex gap-1 rounded-xl border border-line bg-white p-1">
            <button onClick={() => setView("tema")} aria-pressed={view === "tema"} className={cn("inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium", view === "tema" ? "bg-accent-soft text-accent" : "text-navy-500 hover:bg-canvas")}><LayoutGrid className="size-4" /> Per tema</button>
            <button onClick={() => setView("tabel")} aria-pressed={view === "tabel"} className={cn("inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium", view === "tabel" ? "bg-accent-soft text-accent" : "text-navy-500 hover:bg-canvas")}><Table2 className="size-4" /> Tabel</button>
          </div>
        </div>
        <FilterBar />
      </div>

      {loading && !model ? <Card><TableSkeleton /></Card> : error ? <ErrorState message={error} onRetry={reload} /> : model && model.sasaran.length === 0 ? (
        <Card><EmptyState title="Sasaran mutu belum dapat dibaca" description="Tabel sasaran_smi kosong atau belum dipublikasikan untuk pengunjung." /></Card>
      ) : view === "tabel" ? (
        <Card className="overflow-hidden">
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(r) => r.sasaran.id}
            searchText={(r) => `${r.sasaran.nomor} ${r.sasaran.nama} ${r.sasaran.rumus} ${r.units.map((u) => u.singkatan).join(" ")}`}
            onRowClick={(r) => navigate(`/sasaran/${r.sasaran.id}`)}
            initialSort={{ key: "nomor", dir: "asc" }}
            empty={<EmptyState className="py-10" title="Tidak ada sasaran pada kategori ini" />}
          />
        </Card>
      ) : (
        <div className="space-y-8">
          {!temaResmi && <p className="text-[12.5px] text-navy-400">Pengelompokan mengikuti tiga jenis sasaran pada judul PM.SMI.L3.2026 (mutu, anti penyuapan, organisasi pendidikan). Penempatan tiap butir adalah penandaan portal untuk navigasi; nomor dan rumusan resmi tidak berubah.</p>}
          {groups.map(([tema, g]) => (
            <section key={tema}>
              <h2 className="mb-3 flex items-center gap-2 font-display text-[18px] font-bold text-navy"><span className="h-5 w-1 rounded-full bg-gold" />{tema}<span className="rounded-full bg-white px-2 text-[12px] font-medium text-navy-400 ring-1 ring-line">{g.items.length}</span></h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {g.items.sort((a, b) => a.sasaran.nomor - b.sasaran.nomor).map((r) => {
                  const rev = cekRevisi(r.sasaran);
                  return (
                    <button key={r.sasaran.id} onClick={() => navigate(`/sasaran/${r.sasaran.id}`)} className="group flex flex-col rounded-2xl border border-line bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lift">
                      <div className="flex items-start justify-between gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy font-display text-[14px] font-bold text-gold">{r.sasaran.nomor}</span>
                        <CapaianBadge status={r.status} />
                      </div>
                      <p className="mt-3 font-display text-[15px] font-bold leading-6 text-navy">{namaSingkat(r.sasaran)}</p>
                      <p className="mt-1 line-clamp-3 text-[13px] leading-6 text-navy-500" title={r.sasaran.nama}>{r.sasaran.nama}</p>
                      {rev && !rev.sesuai && <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-warn-soft px-2 py-0.5 text-[11px] font-medium text-warn"><AlertTriangle className="size-3" /> Redaksi perlu dikonfirmasi</span>}
                      <div className="mt-auto pt-4">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <div className="text-[11.5px] text-navy-400">Realisasi · target {r.sasaran.targetLabel || fmtValue(r.sasaran.target, r.sasaran.satuan)}</div>
                            <div className="text-[18px] font-semibold tabular-nums text-navy">{r.value === null ? <span className="text-[14px] font-medium text-navy-400">Belum dilaporkan</span> : fmtValue(r.value, r.sasaran.satuan)}</div>
                          </div>
                          <Sparkline points={series.get(r.sasaran.id) ?? []} target={r.sasaran.target} />
                        </div>
                        <Meter className="mt-2" value={r.ratio === null ? 0 : Math.min(100, r.ratio)} tone={r.status === "memenuhi" ? "ok" : r.status === "dibawah" || r.status === "mendekati" ? "warn" : "accent"} />
                        <div className="mt-3 flex flex-wrap gap-1">
                          {r.units.length ? r.units.map((u) => <span key={u.id} className="rounded-md bg-canvas px-1.5 py-0.5 text-[11px] font-medium text-navy-600 ring-1 ring-line">{u.singkatan}</span>) : <span className="text-[11.5px] text-navy-400">Belum dipetakan</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          {groups.length === 0 && <Card><EmptyState title="Tidak ada sasaran pada kategori ini" /></Card>}
        </div>
      )}
    </AppShell>
  );
}
