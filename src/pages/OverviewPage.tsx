import { useMemo, useState, type ReactNode } from "react";
import {
  Target, Building2, CheckCircle2, AlertTriangle, Hourglass, CircleDashed, ListTodo, ArrowRight, Sparkles, Lock, Info, CalendarClock,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { FilterBar } from "@/components/layout/FilterBar";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { KpiCard } from "@/components/common/KpiCard";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/common/states";
import { AchievementDonut, buildDonut } from "@/components/charts/AchievementDonut";
import { Heatmap } from "@/components/charts/Heatmap";
import { SasaranTrendLine, TargetVsRealisasi, TindakLanjutTrend, UnitComparison } from "@/components/charts/SasaranCharts";
import { CapaianBadge, LaporanBadge } from "@/components/common/status";
import { Button } from "@/components/ui/button";
import { useData } from "@/hooks/useData";
import { useAuth } from "@/auth/AuthProvider";
import { useRouter, Link } from "@/lib/router";
import { BULAN, fmtDateTime, fmtPct, fmtValue, periodeLabel } from "@/lib/format";
import { isBelum, narasiRingkas, type UnitCell } from "@/domain/indicators";
import { ROLE_LABEL } from "@/config/roles";
import { PendingContent, SimulasiBadge } from "@/components/portal/ContentState";
import { DetailTable } from "@/components/portal/DetailTable";
import { namaSingkat } from "@/content/resmi/pemetaan";
import { cn } from "@/lib/utils";

const STANDARDS = ["SNI ISO 9001:2015", "SNI ISO 37001:2025", "SNI ISO 21001:2025"];

function ChartTitle({ children, sim }: { children: ReactNode; sim?: boolean }) {
  return <span className="inline-flex flex-wrap items-center gap-2">{children}{sim && <SimulasiBadge />}</span>;
}

export function OverviewPage() {
  const { model, loading, error, reload, filters, data } = useData();
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const periode = periodeLabel(filters.tahun, filters.bulan);
  const [selId, setSelId] = useState<string | null>(null);
  const [cell, setCell] = useState<UnitCell | null>(null);

  const relevant = useMemo(() => model?.sasaran.filter((s) => s.status !== "na") ?? [], [model]);
  const selected = useMemo(() => {
    if (!relevant.length) return null;
    return relevant.find((s) => s.sasaran.id === selId) ?? relevant.find((s) => s.value !== null) ?? relevant[0];
  }, [relevant, selId]);
  const sim = !!data?.simulasi;

  const header = (
    <section className="relative mb-6 overflow-hidden rounded-3xl bg-[linear-gradient(125deg,#0B1C33_0%,#142D4E_50%,#1D3F86_100%)] text-white shadow-lift animate-fade-up">
      <div aria-hidden className="bg-grid-navy pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[360px] rounded-full bg-accent/30 blur-3xl" />
      <div className="relative px-5 py-7 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 max-w-2xl">
            <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-gold-light"><span className="h-[3px] w-6 rounded-full bg-gold" />Monitoring Capaian</div>
            <h1 className="mt-3 font-display text-[30px] font-extrabold leading-tight tracking-tight sm:text-[36px]">Dashboard Capaian Sasaran Mutu</h1>
            <p className="mt-2 text-[14.5px] leading-6 text-white/75">
              {profile ? <>Tampilan petugas · <b className="font-semibold text-white">{ROLE_LABEL[profile.peran]}</b>. </> : null}
              {sim ? "Capaian bersumber dari dokumen pencapaian PM.SMI.L3-01.2026 (s.d. Oktober 2026) dan belum melalui verifikasi sistem; pemetaan unit mengikuti dokumen tersebut." : "Capaian resmi dihitung hanya dari laporan yang telah diverifikasi, per unit yang ditugaskan dalam kontribusi_unit."}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {STANDARDS.map((s) => <span key={s} className="rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] font-medium text-white/85 ring-1 ring-white/15">{s}</span>)}
              {sim && <SimulasiBadge className="text-[11.5px]" />}
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/[0.07] px-5 py-4 backdrop-blur">
            <div className="text-[12px] text-white/60">Periode laporan</div>
            <div className="mt-0.5 font-display text-[19px] font-bold">Posisi s.d. {periode}</div>
            <div className="mt-1 text-[12px] text-white/55">Diperbarui {fmtDateTime(model?.lastUpdated)}</div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl bg-white p-3 shadow-card"><FilterBar /></div>
      </div>
    </section>
  );

  if (loading && !model) return <AppShell>{header}<PageSkeleton /></AppShell>;
  if (error) return <AppShell>{header}<ErrorState message={error} onRetry={reload} /></AppShell>;
  if (!model || !data) return <AppShell>{header}</AppShell>;
  if (!data.publikasiAktif) {
    return (
      <AppShell>{header}
        <PendingContent title={data.pesanPublikasi ?? "Publikasi capaian belum diaktifkan"} description="Capaian sasaran mutu untuk pengunjung dibaca dari view publikasi yang hanya memuat laporan terverifikasi. Administrator perlu mengaktifkan view tersebut (lihat supabase/usulan_migrasi_portal.sql). Data operasional tidak dibuka untuk pengunjung." table="publik_realisasi_smi" />
      </AppShell>
    );
  }

  const k = model.kpi;
  const donut = buildDonut(k.memenuhi, 0, k.belum, k.nodata);
  const attention = relevant.filter((s) => isBelum(s.status)).sort((a, b) => (a.ratio ?? 0) - (b.ratio ?? 0)).slice(0, 5);
  const noData = k.memenuhi + k.belum === 0;
  const basis = filters.includeUnverified ? "laporan terverifikasi dan belum terverifikasi" : "laporan terverifikasi";
  const scopeReports = data.realisasi.filter((r) => filters.unitId === "all" || r.unitId === filters.unitId);

  return (
    <AppShell>
      {header}

      {/* Ringkasan naratif */}
      <Card className="mb-6 overflow-hidden animate-fade-up">
        <div className="flex flex-col gap-4 border-l-4 border-gold p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy text-gold"><Sparkles className="size-5" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-navy-400">Ringkasan untuk pimpinan {sim && <SimulasiBadge />}</div>
            <p className="mt-1 text-[15.5px] leading-7 text-navy">{noData ? `Capaian belum dilaporkan untuk posisi s.d. ${periode}. Laporan realisasi unit kerja yang telah diverifikasi akan otomatis tampil di sini.` : narasiRingkas(model, periode)}</p>
            <p className="mt-1 text-[12.5px] text-navy-400">Dihitung dari {basis}. Status setiap unit memakai laporan terakhir s.d. {BULAN[filters.bulan - 1]} {filters.tahun}.</p>
          </div>
        </div>
      </Card>

      {/* 1. Executive KPI */}
      <div className={cn("mb-6 grid grid-cols-2 gap-3 sm:gap-4", profile ? "lg:grid-cols-4" : "lg:grid-cols-3 2xl:grid-cols-6")}>
        <KpiCard label="Sasaran mutu" value={k.totalSasaran} icon={<Target />} tone="navy" hint={filters.unitId === "all" ? "PM.SMI.L3.2026" : "Ditugaskan pada unit terpilih"} onClick={() => navigate("/sasaran")} />
        <KpiCard label="Unit kerja" value={k.totalUnit} icon={<Building2 />} tone="teal" hint="Dalam cakupan tampilan" onClick={() => navigate("/unit")} />
        <KpiCard label="Sasaran memenuhi target" value={noData ? "—" : k.memenuhi} icon={<CheckCircle2 />} tone="ok" hint={noData ? "Belum dilaporkan" : `dari ${k.memenuhi + k.belum} sasaran terukur`} onClick={() => navigate("/sasaran?status=memenuhi")} />
        <KpiCard label="Sasaran belum memenuhi target" value={noData ? "—" : k.belum} icon={<AlertTriangle />} tone="gold" hint={noData ? "Belum dilaporkan" : "Realisasi di bawah target"} onClick={() => navigate("/sasaran?status=belum")} />
        <KpiCard label="Belum dilaporkan" value={k.nodata} icon={<CircleDashed />} tone="accent" hint={k.tidakdiukur ? `${k.tidakdiukur} sasaran N/A (tidak diukur)` : "Belum ada angka s.d. periode ini"} onClick={() => navigate("/sasaran?status=nodata")} />
        <KpiCard label="Unit dengan laporan" value={`${k.unitMelapor}/${k.totalUnit}`} icon={<Building2 />} tone="teal" hint="Memiliki angka capaian s.d. periode ini" onClick={() => navigate("/unit")} />
        {profile && <KpiCard label="Laporan menunggu verifikasi" value={k.menungguVerifikasi} icon={<Hourglass />} tone="accent" hint={`${k.perluPerbaikan} perlu perbaikan, ${k.draft} draf`} onClick={() => navigate("/kelola/laporan?tab=pending")} />}
        {profile && <KpiCard label="Tindak lanjut belum selesai" value={k.tindakLanjutTerbuka} icon={<ListTodo />} tone="bad" hint={`${k.tindakLanjutLewat} lewat batas waktu`} onClick={() => navigate("/monitoring/tindak-lanjut")} />}
      </div>

      {/* 2 & 4. Tren sasaran terpilih + distribusi status */}
      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={<ChartTitle sim={sim}>Tren bulanan sasaran terpilih</ChartTitle>}
            description="Nilai dalam satuan asli sasaran. Garis emas = target. Titik hijau memenuhi, amber belum memenuhi."
          />
          <div className="px-5 pt-3 sm:px-6">
            <select id="pilih-sasaran" aria-label="Pilih sasaran" value={selected?.sasaran.id ?? ""} onChange={(e) => setSelId(e.target.value)} className="h-10 w-full max-w-xl rounded-xl border border-line bg-white px-3 text-[13.5px] font-medium text-navy focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10">
              {relevant.map((s) => <option key={s.sasaran.id} value={s.sasaran.id}>Sasaran {s.sasaran.nomor} · {namaSingkat(s.sasaran)}</option>)}
            </select>
          </div>
          <CardBody>{selected ? <SasaranTrendLine data={data} summary={selected} filters={filters} /> : <EmptyState title="Tidak ada sasaran untuk unit ini" />}</CardBody>
        </Card>
        <Card>
          <CardHeader title={<ChartTitle sim={sim}>Distribusi status sasaran</ChartTitle>} description={`${relevant.length} sasaran yang berlaku pada cakupan tampilan`} />
          <CardBody>
            <AchievementDonut slices={donut} centerValue={noData ? "—" : fmtPct(k.pctTercapai, 0)} centerLabel={noData ? "belum dilaporkan" : "sasaran terukur memenuhi"} onSelect={(key) => navigate(`/sasaran?status=${key}`)} />
            <div className="mt-4 rounded-xl bg-canvas p-3.5 text-[12.5px] leading-5 text-navy-600">
              <b className="text-navy">Dasar perhitungan.</b> Untuk tiap sasaran, nilai gabungan unit yang ditugaskan (laporan terverifikasi terakhir s.d. bulan terpilih) dibandingkan dengan target. Memenuhi bila mencapai target; belum memenuhi bila di bawah target; belum dilaporkan bila belum ada laporan.
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3 & 6. Target vs realisasi + perbandingan antarunit */}
      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title={<ChartTitle sim={sim}>Target vs realisasi{selected ? ` · Sasaran ${selected.sasaran.nomor}` : ""}</ChartTitle>}
            description={selected ? `${namaSingkat(selected.sasaran)} · hanya unit yang ditugaskan` : undefined}
          />
          <CardBody>{selected ? <TargetVsRealisasi summary={selected} onSelectUnit={(id) => navigate(`/unit/${id}`)} /> : null}</CardBody>
        </Card>
        <Card>
          <CardHeader title={<ChartTitle sim={sim}>Perbandingan antarunit</ChartTitle>} description="Proporsi sasaran yang ditugaskan kepada tiap unit menurut status, sehingga unit dengan jumlah penugasan berbeda tetap sebanding." />
          <CardBody><UnitComparison items={model.units} onSelect={(id) => navigate(`/unit/${id}`)} /></CardBody>
        </Card>
      </div>

      {/* 5. Heatmap */}
      <Card className="mb-6">
        <CardHeader title={<ChartTitle sim={sim}>Peta unit kerja × sasaran mutu</ChartTitle>} description="Baris: unit kerja. Kolom: sasaran. Klik sel untuk melihat rincian. Sel bergaris berarti unit tidak ditugaskan pada sasaran tersebut." />
        <CardBody><Heatmap units={model.visibleUnits} sasaran={model.sasaran} onSelectCell={setCell} /></CardBody>
      </Card>

      {/* 7. Tindak lanjut + perhatian */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={<ChartTitle sim={sim && !!profile}>Tren tindak lanjut capaian</ChartTitle>} description="Tindak lanjut yang dibuka, diselesaikan, dan melewati batas waktu per bulan laporan" icon={<CalendarClock />}
            action={profile ? <Button variant="ghost" size="sm" onClick={() => navigate("/monitoring/tindak-lanjut")}>Semua <ArrowRight /></Button> : undefined} />
          <CardBody>
            {profile ? <TindakLanjutTrend reports={scopeReports} tahun={filters.tahun} sampai={filters.bulan} hasStatus={data.hasStatusTindakLanjut} /> : (
              <EmptyState className="py-8" icon={<Lock />} title="Rincian tindak lanjut dipantau petugas" description="Kendala, tindak lanjut, dan batas waktu tiap laporan hanya terlihat oleh PIC dan verifikator. Progres tindak lanjut temuan audit yang telah disetujui untuk publikasi tersedia pada menu Audit." action={<Button variant="outline" size="sm" onClick={() => navigate("/audit/tindak-lanjut")}>Tindak Lanjut Temuan <ArrowRight /></Button>} />
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title={<ChartTitle sim={sim}>Sasaran yang perlu perhatian</ChartTitle>} description="Capaian terhadap target terendah" icon={<AlertTriangle />} />
          <CardBody className="pt-2">
            {attention.length ? (
              <ul className="divide-y divide-line">
                {attention.map((s) => (
                  <li key={s.sasaran.id}>
                    <Link to={`/sasaran/${s.sasaran.id}`} className="flex items-center gap-4 py-3 hover:opacity-80">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy font-display text-[13px] font-bold text-gold">S{s.sasaran.nomor}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-navy" title={s.sasaran.nama}>{namaSingkat(s.sasaran)}</span>
                        <span className="text-[12.5px] text-navy-500">Realisasi {fmtValue(s.value, s.sasaran.satuan)} · target {s.sasaran.targetLabel}</span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <CapaianBadge status={s.status} />
                        <span className="text-[12px] tabular-nums text-navy-400">{fmtPct(s.ratio, 1)} terhadap target</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState className="py-8" title={noData ? "Belum dilaporkan" : "Tidak ada sasaran di bawah target"} description={noData ? "Daftar akan terisi setelah ada laporan terverifikasi." : "Semua sasaran yang terukur memenuhi target."} icon={<CheckCircle2 />} />
            )}
          </CardBody>
        </Card>
      </div>

      <DetailTable model={model} />

      {/* Kendala, analisis penyebab, tindak lanjut */}
      <Card className="mt-6 overflow-hidden">
        <CardHeader title={<ChartTitle sim={sim && !!profile}>Kendala, analisis penyebab, dan tindak lanjut</ChartTitle>} description="Dari laporan realisasi unit kerja pada tahun terpilih" icon={<ListTodo />} />
        {profile ? (() => {
          const sMap = new Map(data.sasaran.map((x) => [x.id, x]));
          const uMap = new Map(data.units.map((x) => [x.id, x]));
          const list = scopeReports.filter((r) => r.tahun === filters.tahun && r.bulan <= filters.bulan && (r.kendala || r.analisis || r.tindakLanjut)).sort((a, b) => b.bulan - a.bulan).slice(0, 12);
          return list.length ? (
            <div className="mt-4 overflow-x-auto border-t border-line">
              <table className="w-full min-w-[900px] text-[13.5px]">
                <thead><tr className="bg-canvas text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-navy-400">{["Unit", "Sasaran", "Bulan", "Kendala", "Analisis penyebab", "Tindak lanjut", "Batas waktu"].map((h) => <th key={h} className="px-4 py-2.5 first:pl-6">{h}</th>)}</tr></thead>
                <tbody>
                  {list.map((r, i) => (
                    <tr key={r.id} className={cn("align-top", i % 2 && "bg-slate-50/70")}>
                      <td className="border-b border-line/70 py-3 pl-6 pr-4 font-semibold text-navy">{uMap.get(r.unitId)?.singkatan}</td>
                      <td className="border-b border-line/70 px-4 py-3 text-navy-600">S{sMap.get(r.sasaranId)?.nomor} · {sMap.get(r.sasaranId) ? namaSingkat(sMap.get(r.sasaranId)!) : ""}</td>
                      <td className="whitespace-nowrap border-b border-line/70 px-4 py-3 text-navy-600">{BULAN[r.bulan - 1]}</td>
                      <td className="border-b border-line/70 px-4 py-3 text-navy">{r.kendala || "—"}</td>
                      <td className="border-b border-line/70 px-4 py-3 text-navy">{r.analisis || "—"}</td>
                      <td className="border-b border-line/70 px-4 py-3 text-navy">{r.tindakLanjut || "—"}</td>
                      <td className="whitespace-nowrap border-b border-line/70 px-4 py-3 text-navy-600">{r.batasWaktu ? r.batasWaktu : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState className="py-10" title="Belum ada kendala yang dilaporkan" description="Kendala, analisis penyebab, dan tindak lanjut tampil setelah PIC unit mengisinya pada laporan realisasi." />;
        })() : (
          <EmptyState className="py-10" icon={<Lock />} title="Hanya untuk petugas" description="Kendala, analisis penyebab, dan tindak lanjut per laporan dipantau PIC dan verifikator setelah login." />
        )}
      </Card>

      <Dialog open={!!cell} onClose={() => setCell(null)} title={cell ? `${cell.unit.singkatan} · Sasaran ${cell.sasaran.nomor}` : ""} description={cell ? namaSingkat(cell.sasaran) : ""} size="lg">
        {cell && (
          <div className="space-y-4 text-[13.5px]">
            <p className="rounded-xl bg-canvas p-3.5 leading-6 text-navy">{cell.sasaran.nama}</p>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["Target", cell.sasaran.targetLabel], ["Realisasi", cell.value === null ? "Belum dilaporkan" : fmtValue(cell.value, cell.sasaran.satuan)], ["Capaian thd target", cell.ratio === null ? "—" : fmtPct(cell.ratio, 1)], ["Periode", cell.report ? `${BULAN[cell.report.bulan - 1]} ${cell.report.tahun}` : "—"]].map(([l, v]) => (
                <div key={l} className="rounded-xl border border-line p-3"><dt className="text-[11.5px] font-medium text-navy-400">{l}</dt><dd className="mt-1 font-semibold text-navy">{v}</dd></div>
              ))}
            </dl>
            <div className="flex flex-wrap items-center gap-2"><CapaianBadge status={cell.status} />{profile && cell.report && <LaporanBadge status={cell.report.status} raw={cell.report.statusRaw} />}{sim && <SimulasiBadge />}</div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" onClick={() => navigate(`/sasaran/${cell.sasaran.id}?unit=${cell.unit.id}`)}>Detail sasaran <ArrowRight /></Button>
              <Button size="sm" variant="outline" onClick={() => navigate(`/unit/${cell.unit.id}`)}>Profil unit</Button>
            </div>
          </div>
        )}
      </Dialog>

      <p className={cn("mt-6 flex gap-2 text-[12.5px] leading-5 text-navy-400")}><Info className="mt-0.5 size-3.5 shrink-0" /> Indikator bersatuan berbeda (persentase dan indeks skala 4) tidak pernah dirata-ratakan bersama. Tren dan target vs realisasi selalu ditampilkan per sasaran.</p>
    </AppShell>
  );
}
