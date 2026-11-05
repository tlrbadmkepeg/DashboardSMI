import { ArrowRight, Building2, Hourglass } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { FilterBar } from "@/components/layout/FilterBar";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Meter } from "@/components/common/KpiCard";
import { ErrorState, PageSkeleton, EmptyState } from "@/components/common/states";
import { ExportButtons } from "@/components/common/ExportMenu";
import { useData } from "@/hooks/useData";
import { useRouter } from "@/lib/router";
import { fmtPct, periodeLabel } from "@/lib/format";
import { exportExcel, exportPdf } from "@/services/export";
import { fileStamp, unitColumns, unitRows } from "@/domain/reports";
import { CAPAIAN_META } from "@/components/common/status";

export function UnitPage() {
  const { model, loading, error, reload, filters } = useData();
  const { navigate } = useRouter();
  const periode = periodeLabel(filters.tahun, filters.bulan);

  return (
    <AppShell crumbs={[{ label: "Organisasi & Proses", to: "/organisasi" }, { label: "Profil Unit Kerja" }]}>
      <PageHeader
        eyebrow="Organisasi & Proses"
        title="Profil dan Capaian 10 Unit Kerja"
        description={`Setiap unit hanya dinilai pada sasaran yang menjadi kontribusinya. Posisi s.d. ${periode}.`}
        actions={
          model && (
            <ExportButtons
              onExcel={() => exportExcel(`unit-kerja-smi-${fileStamp(filters)}`, [{ name: "Unit Kerja", columns: unitColumns, rows: unitRows(model) }])}
              onPdf={() => exportPdf({
                fileName: `unit-kerja-smi-${fileStamp(filters)}`,
                title: "Monitoring Unit Kerja SMI BPSDMP",
                subtitle: `Posisi s.d. ${periode}`,
                sections: [{ heading: "Ketercapaian per unit kerja", columns: unitColumns, rows: unitRows(model) }],
              })}
            />
          )
        }
      />
      <FilterBar className="mb-5" />
      {loading && !model ? <PageSkeleton /> : error ? <ErrorState message={error} onRetry={reload} /> : !model?.units.length ? (
        <Card><EmptyState title="Data unit kerja belum tersedia" description="Tabel unit_kerja kosong atau tidak dapat dibaca oleh akun ini." /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {model.units.map((u, i) => {
            const tone = u.pct === null ? "accent" : u.pct >= 80 ? "ok" : u.pct >= 60 ? "warn" : "bad";
            const total = Math.max(1, u.applicable);
            return (
              <Card key={u.unit.id} className="group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lift animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas text-navy-500"><Building2 className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-navy-400">{u.unit.singkatan}</div>
                    <h3 className="mt-0.5 text-[14.5px] font-semibold leading-5 text-navy [text-wrap:balance]">{u.unit.nama}</h3>
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-navy-400">Ketercapaian</div>
                    <div className="text-[28px] font-semibold leading-tight tracking-tight tabular-nums text-navy">{fmtPct(u.pct, 0)}</div>
                  </div>
                  {u.pending > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-warn-soft px-2.5 py-1 text-xs font-medium text-warn">
                      <Hourglass className="size-3.5" /> {u.pending} belum diverifikasi
                    </span>
                  )}
                </div>
                <Meter className="mt-2" value={u.pct} tone={tone} />

                <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                  <div style={{ width: `${(u.memenuhi / total) * 100}%`, background: CAPAIAN_META.memenuhi.color }} />
                  <div style={{ width: `${(u.belum / total) * 100}%`, background: CAPAIAN_META.dibawah.color }} />
                  <div style={{ width: `${(u.nodata / total) * 100}%`, background: CAPAIAN_META.nodata.color }} />
                </div>
                <dl className="mt-3 grid grid-cols-4 gap-2 text-center">
                  {[
                    ["Berlaku", u.applicable, "text-navy"],
                    ["Tercapai", u.memenuhi, "text-ok"],
                    ["Belum", u.belum, "text-bad"],
                    ["Tanpa data", u.nodata, "text-nodata"],
                  ].map(([l, v, c]) => (
                    <div key={l as string} className="rounded-lg bg-canvas py-2">
                      <dd className={`text-[15px] font-semibold tabular-nums ${c}`}>{v}</dd>
                      <dt className="text-[11px] text-navy-400">{l}</dt>
                    </div>
                  ))}
                </dl>

                <button
                  onClick={() => navigate(`/unit/${u.unit.id}`)}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-line py-2 text-[13px] font-medium text-navy transition group-hover:border-accent/40 group-hover:text-accent"
                >
                  Lihat detail unit <ArrowRight className="size-4" />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
