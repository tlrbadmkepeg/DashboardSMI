import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { FilterBar } from "@/components/layout/FilterBar";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { ErrorState, EmptyState, TableSkeleton } from "@/components/common/states";
import { LaporanBadge } from "@/components/common/status";
import { ReportDetailDialog } from "@/components/common/ReportDetailDialog";
import { ExportButtons } from "@/components/common/ExportMenu";
import { useData } from "@/hooks/useData";
import { BULAN_PENDEK, fmtDate, periodeLabel } from "@/lib/format";
import { exportExcel, exportPdf } from "@/services/export";
import { fileStamp, laporanColumns, laporanRows } from "@/domain/reports";
import type { Realisasi } from "@/types/domain";
import { cn } from "@/lib/utils";

type Due = "lewat" | "segera" | "terjadwal" | "tanpa" | "selesai";

function dueState(r: Realisasi, today: string): { key: Due; days: number | null } {
  if (r.statusTindakLanjut === "selesai") return { key: "selesai", days: null };
  if (!r.batasWaktu) return { key: "tanpa", days: null };
  const days = Math.round((new Date(r.batasWaktu).getTime() - new Date(today).getTime()) / 86400000);
  if (days < 0) return { key: "lewat", days };
  if (days <= 7) return { key: "segera", days };
  return { key: "terjadwal", days };
}

function DueBadge({ r, today }: { r: Realisasi; today: string }) {
  const d = dueState(r, today);
  if (d.key === "selesai") return <Badge tone="ok">Selesai</Badge>;
  if (d.key === "tanpa") return <Badge tone="muted">Tanpa batas waktu</Badge>;
  if (d.key === "lewat") return <Badge tone="bad" dot>Lewat {Math.abs(d.days!)} hari</Badge>;
  if (d.key === "segera") return <Badge tone="warn" dot>{d.days === 0 ? "Jatuh tempo hari ini" : `${d.days} hari lagi`}</Badge>;
  return <Badge tone="accent">{d.days} hari lagi</Badge>;
}

const TABS: { key: "semua" | Due; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "lewat", label: "Lewat batas waktu" },
  { key: "segera", label: "≤ 7 hari" },
  { key: "terjadwal", label: "Terjadwal" },
  { key: "tanpa", label: "Tanpa batas waktu" },
];

export function TindakLanjutPage() {
  const { data, loading, error, reload, filters } = useData();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("semua");
  const [open, setOpen] = useState<Realisasi | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const all = useMemo(() => {
    if (!data) return [];
    return data.realisasi.filter(
      (r) => r.tahun === filters.tahun && r.bulan <= filters.bulan && (filters.unitId === "all" || r.unitId === filters.unitId)
        && (r.kendala.trim() || r.tindakLanjut.trim()),
    );
  }, [data, filters]);
  const rows = tab === "semua" ? all : all.filter((r) => dueState(r, today).key === tab);
  const counts = useMemo(() => {
    const c: Record<string, number> = { semua: all.length };
    for (const r of all) { const k = dueState(r, today).key; c[k] = (c[k] ?? 0) + 1; }
    return c;
  }, [all, today]);

  const sm = new Map(data?.sasaran.map((s) => [s.id, s]) ?? []);
  const um = new Map(data?.units.map((u) => [u.id, u]) ?? []);

  const columns: Column<Realisasi>[] = [
    {
      key: "sasaran", header: "Sasaran & unit", sortValue: (r) => sm.get(r.sasaranId)?.nomor ?? 0, className: "min-w-[200px]",
      cell: (r) => (
        <div>
          <div className="font-medium">Sasaran {sm.get(r.sasaranId)?.nomor}</div>
          <div className="text-xs text-navy-400">{um.get(r.unitId)?.singkatan} · {BULAN_PENDEK[r.bulan - 1]} {r.tahun}</div>
        </div>
      ),
    },
    { key: "kendala", header: "Permasalahan", className: "min-w-[200px] max-w-[260px]", cell: (r) => <p className="line-clamp-3 text-[13px] leading-5">{r.kendala || "—"}</p> },
    { key: "analisis", header: "Analisis penyebab", className: "min-w-[200px] max-w-[260px]", cell: (r) => <p className="line-clamp-3 text-[13px] leading-5 text-navy-500">{r.analisis || "—"}</p> },
    { key: "tl", header: "Tindak lanjut", className: "min-w-[200px] max-w-[260px]", cell: (r) => <p className="line-clamp-3 text-[13px] leading-5">{r.tindakLanjut || "—"}</p> },
    {
      key: "batas", header: "Batas waktu", sortValue: (r) => r.batasWaktu ?? "9999",
      cell: (r) => <div className="space-y-1 whitespace-nowrap"><div className="tabular-nums">{fmtDate(r.batasWaktu)}</div><DueBadge r={r} today={today} /></div>,
    },
    { key: "status", header: "Status laporan", sortValue: (r) => r.status, cell: (r) => <LaporanBadge status={r.status} raw={r.statusRaw} /> },
  ];

  const periode = periodeLabel(filters.tahun, filters.bulan);

  return (
    <AppShell crumbs={[{ label: "Pengelolaan" }, { label: "Kendala & Tindak Lanjut" }]}>
      <PageHeader
        eyebrow="Perbaikan berkelanjutan"
        title="Kendala & Tindak Lanjut"
        description={`Pemantauan permasalahan, analisis penyebab, dan tindak lanjut s.d. ${periode}. Indikator keterlambatan dihitung dari batas waktu terhadap tanggal hari ini.`}
        actions={data && (
          <ExportButtons
            disabled={!rows.length}
            onExcel={() => exportExcel(`tindak-lanjut-smi-${fileStamp(filters)}`, [{ name: "Tindak Lanjut", columns: laporanColumns, rows: laporanRows(rows, data) }])}
            onPdf={() => exportPdf({
              fileName: `tindak-lanjut-smi-${fileStamp(filters)}`,
              title: "Ringkasan Kendala dan Tindak Lanjut SMI BPSDMP",
              subtitle: `Posisi s.d. ${periode}`,
              sections: [{ heading: "Kendala dan tindak lanjut", columns: ["Unit", "Sasaran", "Periode", "Kendala", "Tindak lanjut", "Batas waktu", "Status"], rows: laporanRows(rows, data).map((r) => [r[0], r[1], r[2], r[5], r[7], r[8], r[4]]) }],
            })}
          />
        )}
      />

      {data && !data.hasStatusTindakLanjut && (
        <div className="mb-5 flex gap-3 rounded-2xl border border-accent/15 bg-accent-soft/60 px-4 py-3 text-[13px] leading-5 text-navy-500">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" />
          <span>
            Basis data belum memiliki kolom status penyelesaian tindak lanjut. Karena itu, tindak lanjut tidak dianggap selesai meskipun laporannya sudah terverifikasi.
            Status verifikasi laporan dan status penyelesaian tindak lanjut ditampilkan terpisah. Lihat menu Pengaturan untuk usulan kolom tambahan.
          </span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-white p-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition", tab === t.key ? "bg-navy text-white" : "text-navy-500 hover:bg-canvas")}>
              {t.label}
              <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", tab === t.key ? "bg-white/20" : "bg-canvas")}>{counts[t.key] ?? 0}</span>
            </button>
          ))}
        </div>
        <FilterBar />
      </div>

      <Card className="overflow-hidden">
        {loading && !data ? <TableSkeleton /> : error ? <div className="p-5"><ErrorState message={error} onRetry={reload} /></div> : (
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(r) => r.id}
            searchText={(r) => `${sm.get(r.sasaranId)?.nama} ${um.get(r.unitId)?.nama} ${r.kendala} ${r.analisis} ${r.tindakLanjut}`}
            onRowClick={setOpen}
            initialSort={{ key: "batas", dir: "asc" }}
            empty={<EmptyState className="py-10" title="Tidak ada kendala atau tindak lanjut" description="Belum ada laporan pada kategori dan periode ini." />}
          />
        )}
      </Card>
      {data && <ReportDetailDialog report={open} data={data} onClose={() => setOpen(null)} />}
    </AppShell>
  );
}
