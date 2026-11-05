import { useEffect, useMemo } from "react";
import { FileBarChart, Package } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { FilterBar } from "@/components/layout/FilterBar";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader } from "@/components/ui/card";
import { ExportButtons } from "@/components/common/ExportMenu";
import { ErrorState, PageSkeleton } from "@/components/common/states";
import { useData } from "@/hooks/useData";
import { useRouter } from "@/lib/router";
import { periodeLabel } from "@/lib/format";
import { isBelum } from "@/domain/indicators";
import {
  fileStamp, filterReports, laporanColumns, laporanRows, monthlyColumns, monthlyRows, sasaranColumns, sasaranRow, unitColumns, unitRows,
} from "@/domain/reports";
import { exportExcel, exportPdf, type Sheet } from "@/services/export";

type Cell = string | number | null;
interface Section { id: string; title: string; description: string; columns: string[]; rows: Cell[][]; pdfCols?: number[] }

function Preview({ s }: { s: Section }) {
  const cols = s.pdfCols ?? s.columns.map((_, i) => i);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-[12.5px]">
        <thead>
          <tr className="border-y border-line bg-canvas/70 text-left text-[11px] font-medium uppercase tracking-[0.04em] text-navy-400">
            {cols.map((i) => <th key={i} className="px-4 py-2.5 first:pl-6">{s.columns[i]}</th>)}
          </tr>
        </thead>
        <tbody>
          {s.rows.slice(0, 6).map((r, ri) => (
            <tr key={ri} className="border-b border-line/70 last:border-0">
              {cols.map((i) => <td key={i} className="max-w-[260px] truncate px-4 py-2.5 text-navy first:pl-6">{r[i] ?? "—"}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {s.rows.length === 0 && <p className="px-6 py-6 text-[13px] text-navy-400">Tidak ada data untuk periode ini.</p>}
      {s.rows.length > 6 && <p className="px-6 py-2.5 text-xs text-navy-400">Menampilkan 6 dari {s.rows.length} baris. Ekspor untuk data lengkap.</p>}
    </div>
  );
}

export function LaporanPage() {
  const { data, model, loading, error, reload, filters } = useData();
  const { query } = useRouter();
  const periode = periodeLabel(filters.tahun, filters.bulan);
  const tab = query.get("tab");

  const sections: Section[] = useMemo(() => {
    if (!data || !model) return [];
    const reps = filterReports(data, filters);
    const relevant = model.sasaran.filter((s) => s.status !== "na");
    return [
      { id: "bulanan", title: "Ringkasan capaian bulanan", description: `Ketercapaian setiap bulan tahun ${filters.tahun}`, columns: monthlyColumns, rows: monthlyRows(model, filters.bulan) },
      {
        id: "tahunan", title: "Ringkasan capaian tahunan", description: `Posisi s.d. ${periode}`,
        columns: ["Indikator", "Nilai"],
        rows: [
          ["Jumlah sasaran mutu", model.kpi.totalSasaran],
          ["Jumlah unit kerja", model.kpi.totalUnit],
          ["Sasaran memenuhi target", model.kpi.memenuhi],
          ["Sasaran belum memenuhi target", model.kpi.belum],
          ["Sasaran belum ada data", model.kpi.nodata],
          ["Persentase capaian target (%)", model.kpi.pctTercapai === null ? null : Math.round(model.kpi.pctTercapai * 10) / 10],
          ["Laporan terverifikasi", model.kpi.terverifikasi],
          ["Laporan menunggu verifikasi", model.kpi.menungguVerifikasi],
          ["Tindak lanjut belum selesai", model.kpi.tindakLanjutTerbuka],
          ["Tindak lanjut melewati batas waktu", model.kpi.tindakLanjutLewat],
        ],
      },
      { id: "unit", title: "Laporan per unit kerja", description: "Ketercapaian pada sasaran yang berlaku bagi setiap unit", columns: unitColumns, rows: unitRows(model) },
      { id: "sasaran", title: "Laporan per sasaran mutu", description: "Target, realisasi, dan status 18 sasaran", columns: sasaranColumns, rows: relevant.map(sasaranRow), pdfCols: [0, 1, 2, 7, 8, 9] },
      { id: "belum", title: "Sasaran belum memenuhi target", description: "Diurutkan dari rasio capaian terendah", columns: sasaranColumns, rows: relevant.filter((s) => isBelum(s.status)).sort((a, b) => (a.ratio ?? 0) - (b.ratio ?? 0)).map(sasaranRow), pdfCols: [0, 1, 2, 7, 8, 6] },
      { id: "pending", title: "Laporan belum diverifikasi", description: "Status draft, diajukan, atau perlu perbaikan", columns: laporanColumns, rows: laporanRows(reps.filter((r) => r.status !== "terverifikasi"), data), pdfCols: [0, 1, 2, 3, 4] },
      { id: "kendala", title: "Ringkasan kendala dan tindak lanjut", description: "Seluruh laporan yang mencantumkan kendala atau tindak lanjut", columns: laporanColumns, rows: laporanRows(reps.filter((r) => r.kendala || r.tindakLanjut), data), pdfCols: [0, 1, 5, 7, 8] },
    ];
  }, [data, model, filters, periode]);

  useEffect(() => {
    if (tab && sections.length) document.getElementById(`laporan-${tab}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [tab, sections.length]);

  const stamp = fileStamp(filters);
  const subtitle = `Posisi s.d. ${periode} · ${filters.includeUnverified ? "termasuk laporan belum terverifikasi" : "berdasarkan laporan terverifikasi"} · dicetak ${new Date().toLocaleDateString("id-ID")}`;
  const pdfSection = (s: Section) => {
    const cols = s.pdfCols ?? s.columns.map((_, i) => i);
    return { heading: s.title, columns: cols.map((i) => s.columns[i]), rows: s.rows.map((r) => cols.map((i) => r[i])) };
  };

  return (
    <AppShell crumbs={[{ label: "Pengelolaan" }, { label: "Laporan & Ekspor" }]}>
      <PageHeader
        eyebrow="Tinjauan manajemen"
        title="Laporan dan Ekspor"
        description="Laporan siap pakai untuk rapat pimpinan, tinjauan manajemen, dan audit SMI. Isi laporan mengikuti filter periode dan unit di bawah."
      />
      <FilterBar className="mb-5" />
      {loading && !model ? <PageSkeleton /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="space-y-5">
          <Card className="flex flex-wrap items-center justify-between gap-4 bg-navy p-5 text-white sm:p-6">
            <div className="flex items-start gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10"><Package className="size-5" /></span>
              <div>
                <h3 className="text-[15px] font-semibold">Paket bahan tinjauan manajemen</h3>
                <p className="mt-0.5 text-[13px] text-white/70">Ketujuh laporan dalam satu berkas Excel (satu lembar per laporan) atau satu dokumen PDF.</p>
              </div>
            </div>
            <div className="[&_button]:border-white/20 [&_button]:bg-white/10 [&_button]:text-white [&_button:hover]:bg-white/20">
              <ExportButtons
                onExcel={() => exportExcel(`paket-tinjauan-smi-${stamp}`, sections.map<Sheet>((s) => ({ name: s.title, columns: s.columns, rows: s.rows })))}
                onPdf={() => exportPdf({ fileName: `paket-tinjauan-smi-${stamp}`, title: "Laporan Monitoring SMI BPSDMP", subtitle, sections: sections.map(pdfSection) })}
              />
            </div>
          </Card>

          {sections.map((s) => (
            <Card key={s.id} id={`laporan-${s.id}`} className="scroll-mt-24 overflow-hidden">
              <CardHeader
                icon={<FileBarChart />}
                title={s.title}
                description={s.description}
                action={
                  <ExportButtons
                    disabled={!s.rows.length}
                    onExcel={() => exportExcel(`${s.id}-smi-${stamp}`, [{ name: s.title, columns: s.columns, rows: s.rows }])}
                    onPdf={() => exportPdf({ fileName: `${s.id}-smi-${stamp}`, title: s.title, subtitle, sections: [pdfSection(s)] })}
                  />
                }
              />
              <div className="mt-4"><Preview s={s} /></div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
