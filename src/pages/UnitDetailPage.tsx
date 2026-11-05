import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/common/KpiCard";
import { CapaianBadge, LaporanBadge } from "@/components/common/status";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/common/states";
import { ReportDetailDialog } from "@/components/common/ReportDetailDialog";
import { MonthlyTrend } from "@/components/charts/MonthlyTrend";
import { Sparkline } from "@/components/charts/Sparkline";
import { useData } from "@/hooks/useData";
import { useRouter } from "@/lib/router";
import { buildDashboard, seriesForSasaran } from "@/domain/indicators";
import { BULAN, BULAN_PENDEK, fmtNum, fmtPct, fmtValue, periodeLabel } from "@/lib/format";
import type { Realisasi } from "@/types/domain";
import { Target, CheckCircle2, AlertTriangle, Hourglass } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { usePortal } from "@/hooks/usePortal";
import { unitResmiDari } from "@/content/resmi/organisasi";
import { SumberResmi } from "@/components/portal/Resmi";

export function UnitDetailPage() {
  const { data, loading, error, reload, filters, unitLocked } = useData();
  const { segments, navigate } = useRouter();
  const unitId = segments[1];
  const [open, setOpen] = useState<Realisasi | null>(null);
  const { profile } = useAuth();
  const { content } = usePortal();

  const unitModel = useMemo(() => (data ? buildDashboard(data, { ...filters, unitId }) : null), [data, filters, unitId]);
  const unit = data?.units.find((u) => u.id === unitId);
  const crumbs = [{ label: "Organisasi & Proses", to: "/organisasi" }, { label: "Profil Unit Kerja", to: "/unit" }, { label: unit?.singkatan ?? "Detail unit" }];

  if (loading && !data) return <AppShell crumbs={crumbs}><PageSkeleton /></AppShell>;
  if (error) return <AppShell crumbs={crumbs}><ErrorState message={error} onRetry={reload} /></AppShell>;
  if (!unit || !unitModel || !data) {
    return <AppShell crumbs={crumbs}><Card><EmptyState title="Unit tidak ditemukan" action={<Button variant="outline" onClick={() => navigate("/unit")}>Kembali</Button>} /></Card></AppShell>;
  }
  if (unitLocked && filters.unitId !== unitId) {
    return <AppShell crumbs={crumbs}><Card><EmptyState title="Di luar kewenangan" description="Peran Anda hanya menampilkan data unit kerja sendiri." /></Card></AppShell>;
  }

  const us = unitModel.units[0];
  const rows = unitModel.sasaran.filter((s) => s.units.length > 0);

  return (
    <AppShell crumbs={crumbs}>
      <div className="mb-6 flex items-start gap-4 animate-fade-up">
        <button onClick={() => navigate("/unit")} className="mt-1 rounded-lg p-1.5 text-navy-400 hover:bg-white hover:text-navy" aria-label="Kembali"><ArrowLeft className="size-5" /></button>
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-accent">{unit.singkatan}</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-navy sm:text-[26px] [text-wrap:balance]">{unit.nama}</h1>
          <p className="mt-1 text-sm text-navy-400">Posisi s.d. {periodeLabel(filters.tahun, filters.bulan)}</p>
        </div>
      </div>

      {(() => {
        const node = content.struktur.status === "ok" ? content.struktur.rows.find((n) => n.unitId === unitId) : null;
        const r = unitResmiDari(unit.nama);
        if (node?.tugasFungsi || !r) {
          return (
            <Card className="mb-6 p-5 sm:p-6">
              <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-teal">Profil unit</div>
              {node?.tugasFungsi
                ? <p className="mt-2 whitespace-pre-line text-[14px] leading-7 text-navy">{node.tugasFungsi}</p>
                : <p className="mt-2 text-[13.5px] leading-6 text-navy-400">Uraian tugas dan fungsi unit ditampilkan setelah struktur organisasi resmi dimuat.</p>}
            </Card>
          );
        }
        const blok = (l: string, v: string) => (
          <div key={l} className="rounded-xl bg-canvas/70 p-4"><div className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-navy-400">{l}</div><p className="mt-1.5 text-[13px] leading-6 text-navy">{v}</p></div>
        );
        return (
          <Card className="mb-6 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-teal">Profil unit dalam SMI</div>
                <div className="mt-1 text-[13px] text-navy-500">{r.pimpinan} · {r.lokasi} · Wilayah layanan: {r.wilayah}</div>
              </div>
              <SumberResmi kode={["PM.SMI.L1.2026", "PM.SMI.L6-2026", "PM.SMI.L7.2026"]} />
            </div>
            <p className="mt-4 text-[14px] leading-7 text-navy">{r.mandat}</p>
            <p className="mt-2 text-[13.5px] leading-6 text-navy-500">{r.peranSmi}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {blok("Proses yang dimiliki", r.proses.dimiliki)}
              {blok("Keluaran utama", r.proses.keluaran)}
              {blok("Fokus pengendalian SMI", r.konteks.fokus)}
              {blok("Pemangku kepentingan utama", r.pemangku.utama)}
              {blok("Fokus komunikasi", r.komunikasi.fokus)}
              {profile ? blok("Paparan risiko penyuapan (internal)", r.paparanSuap.paparan) : blok("Pemantauan pemangku kepentingan", r.pemangku.pemantauan)}
            </div>
          </Card>
        );
      })()}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard label="Sasaran berlaku" value={us?.applicable ?? 0} icon={<Target />} tone="navy" hint={`dari ${data.sasaran.length} sasaran SMI`} />
        <KpiCard label="Tercapai" value={us?.memenuhi ?? 0} icon={<CheckCircle2 />} tone="ok" hint={`Ketercapaian ${fmtPct(us?.pct, 0)}`} />
        <KpiCard label="Belum tercapai" value={us?.belum ?? 0} icon={<AlertTriangle />} tone="bad" hint={`${us?.nodata ?? 0} belum ada data`} />
        {profile ? <KpiCard label="Belum diverifikasi" value={us?.pending ?? 0} icon={<Hourglass />} tone="warn" hint="Laporan berstatus diajukan" /> : <KpiCard label="Belum ada data" value={us?.nodata ?? 0} icon={<Hourglass />} tone="warn" hint="Sasaran tanpa laporan terverifikasi" />}
      </div>

      <Card className="mb-6">
        <CardHeader title="Tren ketercapaian unit" description="Persentase laporan unit ini yang memenuhi target setiap bulan" />
        <CardBody><MonthlyTrend data={unitModel.monthly} height={220} /></CardBody>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Sasaran yang menjadi kontribusi unit" description={profile ? "Klik baris untuk melihat laporan terakhir" : "Klik baris untuk membuka detail sasaran"} />
        {rows.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-y border-line bg-canvas/70 text-left text-xs font-medium uppercase tracking-[0.04em] text-navy-400">
                  <th className="px-6 py-3">Sasaran</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3 text-right">Realisasi</th>
                  <th className="px-4 py-3">Tren</th>
                  <th className="px-4 py-3">Ketercapaian</th>
                  <th className="px-6 py-3">Laporan terakhir</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const cell = s.cells[0];
                  const lastAny = data.realisasi
                    .filter((r) => r.unitId === unitId && r.sasaranId === s.sasaran.id && r.tahun === filters.tahun && r.bulan <= filters.bulan)
                    .sort((a, b) => b.bulan - a.bulan)[0];
                  const spark = seriesForSasaran(data, s.sasaran, filters, unitId).slice(0, filters.bulan).map((p) => p.value);
                  return (
                    <tr key={s.sasaran.id} onClick={() => (profile && lastAny ? setOpen(lastAny) : navigate(`/sasaran/${s.sasaran.id}`))} className="cursor-pointer border-b border-line/70 last:border-0 hover:bg-accent-soft/40">
                      <td className="px-6 py-3.5"><div className="font-medium text-navy"><span className="mr-2 text-navy-400">{s.sasaran.nomor}.</span>{s.sasaran.nama}</div></td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-navy-500">{s.sasaran.targetLabel || fmtValue(s.sasaran.target, s.sasaran.satuan)}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold tabular-nums text-navy">{fmtValue(cell?.value ?? null, s.sasaran.satuan)}{cell?.ratio != null && <div className="text-xs font-normal text-navy-400">{fmtNum(cell.ratio, 0)}%</div>}</td>
                      <td className="px-4 py-3.5"><Sparkline points={spark} target={s.sasaran.target} /></td>
                      <td className="px-4 py-3.5"><CapaianBadge status={cell?.status ?? "nodata"} /></td>
                      <td className="px-6 py-3.5">
                        {lastAny ? (
                          <div className="flex items-center gap-2"><LaporanBadge status={lastAny.status} raw={lastAny.statusRaw} /><span className="text-xs text-navy-400">{BULAN_PENDEK[lastAny.bulan - 1]}</span></div>
                        ) : <span className="text-xs text-navy-300">Belum ada</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Belum ada sasaran yang dipetakan" description={`Tabel kontribusi_unit belum memuat sasaran untuk ${unit.singkatan}.`} />
        )}
      </Card>
      <ReportDetailDialog report={open} data={data} onClose={() => setOpen(null)} />
    </AppShell>
  );
}
