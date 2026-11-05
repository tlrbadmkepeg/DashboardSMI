import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Info, Lock, Search } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { CapaianBadge, LaporanBadge, CAPAIAN_META } from "@/components/common/status";
import { ReportDetailDialog } from "@/components/common/ReportDetailDialog";
import { ExportButtons } from "@/components/common/ExportMenu";
import { SimulasiBadge } from "@/components/portal/ContentState";
import { useAuth } from "@/auth/AuthProvider";
import { useData } from "@/hooks/useData";
import { Link } from "@/lib/router";
import type { DashboardModel, UnitCell } from "@/domain/indicators";
import type { Realisasi } from "@/types/domain";
import { BULAN, fmtDate, fmtPct, fmtValue } from "@/lib/format";
import { exportExcel } from "@/services/export";
import { fileStamp } from "@/domain/reports";
import { namaSingkat } from "@/content/resmi/pemetaan";
import { cn } from "@/lib/utils";

const PAGE = 15;
type StatusFilter = "semua" | "memenuhi" | "belum" | "nodata" | "tidakdiukur";
const BLN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/**
 * Tabel rinci capaian unit × sasaran. Hanya pasangan yang tercatat di kontribusi_unit yang tampil.
 * Rumusan lengkap ditampilkan pada baris yang dibentangkan, bukan diulang di setiap baris.
 */
export function DetailTable({ model }: { model: DashboardModel }) {
  const { profile } = useAuth();
  const { data, filters } = useData();
  const [sasaranId, setSasaranId] = useState("semua");
  const [unitId, setUnitId] = useState("semua");
  const [mode, setMode] = useState<"ringkas" | "bulanan">("ringkas");
  const [status, setStatus] = useState<StatusFilter>("semua");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<string | null>(null);
  const [report, setReport] = useState<Realisasi | null>(null);

  const cells = useMemo(() => {
    const term = q.trim().toLowerCase();
    return model.sasaran
      .flatMap((s) => s.cells.filter((c) => c.applicable))
      .filter((c) => sasaranId === "semua" || c.sasaran.id === sasaranId)
      .filter((c) => unitId === "semua" || c.unit.id === unitId)
      .filter((c) => status === "semua" || (status === "belum" ? c.status === "dibawah" || c.status === "mendekati" : c.status === status))
      .filter((c) => !term || `${c.unit.nama} ${c.unit.singkatan} ${c.sasaran.nomor} ${c.sasaran.nama}`.toLowerCase().includes(term))
      .sort((a, b) => a.sasaran.nomor - b.sasaran.nomor || a.unit.urutan - b.unit.urutan);
  }, [model, sasaranId, unitId, status, q]);

  const pages = Math.max(1, Math.ceil(cells.length / PAGE));
  const cur = Math.min(page, pages);
  const rows = cells.slice((cur - 1) * PAGE, cur * PAGE);
  const key = (c: UnitCell) => `${c.sasaran.id}-${c.unit.id}`;
  const periodeOf = (c: UnitCell) => (c.report ? `${BULAN[c.report.bulan - 1]} ${c.report.tahun}` : "—");
  const ck = (c: UnitCell) => `${c.sasaran.id}|${c.unit.id}`;
  const bukti = (c: UnitCell) => data?.buktiTautan?.[ck(c)] ?? null;
  const fmtSel = (v: number | "NA" | null | undefined, c: UnitCell) => v === "NA" ? "N/A" : v == null ? "—" : fmtValue(v, c.sasaran.satuan);
  const units = useMemo(() => Array.from(new Map(model.sasaran.flatMap((s) => s.cells.filter((c) => c.applicable).map((c) => [c.unit.id, c.unit] as const))).values()).sort((a, b) => a.urutan - b.urutan), [model]);
  const sel = "h-10 rounded-xl border border-line bg-white px-3 text-[13.5px] text-navy focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10";

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title={<span className="inline-flex flex-wrap items-center gap-2">Tabel rinci capaian {data?.simulasi && <SimulasiBadge />}</span>}
        description="Satu baris = satu sasaran pada satu unit kerja yang ditugaskan (tabel kontribusi_unit). Bentangkan baris untuk membaca rumusan lengkap."
        action={profile && (
          <ExportButtons onExcel={() => exportExcel(`rincian-capaian-${fileStamp(filters)}`, [{
            name: "Rincian", columns: ["Unit", "No", "Sasaran", "Periode", "Target", "Realisasi", "Capaian terhadap target (%)", "Status"],
            rows: cells.map((c) => [c.unit.nama, c.sasaran.nomor, c.sasaran.nama, c.report ? `${c.report.bulan}/${c.report.tahun}` : null, c.sasaran.targetLabel, fmtValue(c.value, c.sasaran.satuan), c.ratio === null ? null : Math.round(c.ratio * 10) / 10, CAPAIAN_META[c.status].label]),
          }])} />
        )}
      />
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4 sm:px-6">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-400" />
          <input aria-label="Cari unit atau sasaran" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Cari unit atau sasaran…" className={cn(sel, "w-full pl-9")} />
        </div>
        <select id="dt-sasaran" aria-label="Sasaran mutu" value={sasaranId} onChange={(e) => { setSasaranId(e.target.value); setPage(1); }} className={cn(sel, "max-w-[260px]")}>
          <option value="semua">Semua sasaran</option>
          {model.sasaran.map((s) => <option key={s.sasaran.id} value={s.sasaran.id}>S{s.sasaran.nomor} · {namaSingkat(s.sasaran)}</option>)}
        </select>
        <select id="dt-unit" aria-label="Unit kerja" value={unitId} onChange={(e) => { setUnitId(e.target.value); setPage(1); }} className={cn(sel, "max-w-[220px]")}>
          <option value="semua">Semua unit</option>
          {units.map((u) => <option key={u.id} value={u.id}>{u.singkatan}</option>)}
        </select>
        <select id="dt-status" aria-label="Status capaian" value={status} onChange={(e) => { setStatus(e.target.value as StatusFilter); setPage(1); }} className={sel}>
          <option value="semua">Semua status</option>
          <option value="memenuhi">Memenuhi target</option>
          <option value="belum">Belum memenuhi target</option>
          <option value="nodata">Belum dilaporkan</option>
          <option value="tidakdiukur">N/A (tidak diukur)</option>
        </select>
        <div role="group" aria-label="Mode tabel" className="flex rounded-xl border border-line p-0.5 text-[12.5px] font-semibold">
          {([["ringkas", "Posisi terakhir"], ["bulanan", "Per bulan"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => setMode(v)} aria-pressed={mode === v} className={cn("rounded-lg px-3 py-1.5", mode === v ? "bg-navy text-white" : "text-navy-500 hover:bg-canvas")}>{l}</button>
          ))}
        </div>
        <span className="ml-auto text-[12.5px] text-navy-400">{cells.length} baris</span>
      </div>

      {mode === "bulanan" ? (
        <div className="mt-4 max-h-[640px] overflow-auto border-t border-line">
          <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-[13px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-navy text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-white">
                <th className="px-4 py-3 pl-6">No</th><th className="px-4 py-3">Sasaran</th><th className="px-4 py-3">Unit</th><th className="px-3 py-3 text-right">Target</th>
                {BLN.map((b) => <th key={b} className="px-2.5 py-3 text-right">{b}</th>)}
              </tr>
            </thead>
            <tbody>
              {cells.map((c, i) => {
                const row = data?.nilaiDokumen?.[ck(c)];
                return (
                  <tr key={key(c)} className={i % 2 ? "bg-slate-50/80" : "bg-white"}>
                    <td className="border-b border-line/70 py-2.5 pl-6 pr-3 font-display font-bold text-navy">S{c.sasaran.nomor}</td>
                    <td className="max-w-[260px] truncate border-b border-line/70 px-4 py-2.5 text-navy" title={c.sasaran.nama}>{namaSingkat(c.sasaran)}</td>
                    <td className="border-b border-line/70 px-4 py-2.5 font-semibold text-navy">{c.unit.singkatan}</td>
                    <td className="whitespace-nowrap border-b border-line/70 px-3 py-2.5 text-right text-navy-500">{c.sasaran.targetLabel}</td>
                    {BLN.map((_, m) => {
                      const v = row?.[m];
                      const after = m + 1 > (filters?.bulan ?? 12);
                      const ok = typeof v === "number" && c.sasaran.target !== null ? (c.sasaran.arah === "turun" ? v <= c.sasaran.target : v >= c.sasaran.target) : null;
                      return <td key={m} title={after ? "Belum tersedia" : v === "NA" ? "N/A — tidak ada pengukuran" : v == null ? "Belum dilaporkan" : undefined} className={cn("whitespace-nowrap border-b border-line/70 px-2.5 py-2.5 text-right tabular-nums", after ? "text-navy-200" : v === "NA" ? "text-navy-400" : v == null ? "text-navy-300" : ok === false ? "font-semibold text-[#B45309]" : "font-semibold text-[#15803D]")}>{after ? "·" : fmtSel(v, c)}</td>;
                    })}
                  </tr>
                );
              })}
              {!cells.length && <tr><td colSpan={16} className="px-6 py-12 text-center text-navy-400">Tidak ada baris yang sesuai filter.</td></tr>}
            </tbody>
          </table>
          {!data?.nilaiDokumen && <p className="px-6 py-4 text-[13px] text-navy-500">Nilai per bulan tersedia dari dokumen pencapaian; data basis data tampil pada mode posisi terakhir.</p>}
        </div>
      ) : (
      <div className="mt-4 max-h-[640px] overflow-auto border-t border-line">
        <table className="w-full min-w-[1080px] border-separate border-spacing-0 text-[13.5px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-navy text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-white">
              {["Nomor", "Sasaran", "Unit kerja", "Target", "Realisasi", "Periode", "Status", "Bukti dukung", "Detail"].map((h, i) => (
                <th key={h} className={cn("whitespace-nowrap px-4 py-3", i === 0 && "pl-6", (i === 3 || i === 4) && "text-right", i === 8 && "pr-6 text-center")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => {
              const k = key(c);
              const exp = open === k;
              return (
                <Fragment key={k}>
                  <tr className={cn("align-top transition-colors hover:bg-accent-soft/50", i % 2 === 1 ? "bg-slate-50/80" : "bg-white", exp && "bg-accent-soft/60")}>
                    <td className="border-b border-line/70 py-3 pl-6 pr-3"><span className="grid h-6 min-w-[30px] place-items-center rounded-md bg-navy px-1.5 font-display text-[11.5px] font-bold text-gold">S{c.sasaran.nomor}</span></td>
                    <td className="border-b border-line/70 px-4 py-3 leading-6 text-navy" title={c.sasaran.nama}>{namaSingkat(c.sasaran)}</td>
                    <td className="border-b border-line/70 px-4 py-3 font-semibold text-navy">{c.unit.singkatan}</td>
                    <td className="whitespace-nowrap border-b border-line/70 px-4 py-3 text-right text-navy-600">{c.sasaran.targetLabel || fmtValue(c.sasaran.target, c.sasaran.satuan)}</td>
                    <td className="whitespace-nowrap border-b border-line/70 px-4 py-3 text-right font-semibold tabular-nums text-navy">{c.status === "tidakdiukur" ? <span className="font-normal text-navy-400">N/A</span> : c.value === null ? <span className="font-normal text-navy-400">Belum dilaporkan</span> : fmtValue(c.value, c.sasaran.satuan)}{c.ratio !== null && <span className="block text-[11.5px] font-normal text-navy-400">{fmtPct(c.ratio, 1)} thd target</span>}</td>
                    <td className="whitespace-nowrap border-b border-line/70 px-4 py-3 text-navy-600">{periodeOf(c)}</td>
                    <td className="border-b border-line/70 px-4 py-3"><CapaianBadge status={c.status} /></td>
                    <td className="whitespace-nowrap border-b border-line/70 px-4 py-3 text-[12.5px]">{!bukti(c) ? <span className="text-navy-300">—</span> : profile ? <a href={bukti(c)!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-accent hover:underline">Buka <ExternalLink className="size-3" /></a> : <span className="inline-flex items-center gap-1 text-navy-400" title="Bukti dukung internal hanya untuk petugas"><Lock className="size-3" /> Petugas</span>}</td>
                    <td className="border-b border-line/70 py-3 pl-4 pr-6 text-center">
                      <button onClick={() => setOpen(exp ? null : k)} aria-expanded={exp} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-accent hover:bg-accent-soft">
                        {exp ? "Tutup" : "Rinci"} <ChevronDown className={cn("size-3.5 transition-transform", exp && "rotate-180")} />
                      </button>
                    </td>
                  </tr>
                  {exp && (
                    <tr className="bg-accent-soft/40">
                      <td colSpan={9} className="border-b border-line px-6 py-4">
                        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                          <div>
                            <div className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-navy-400">Rumusan sasaran {c.sasaran.nomor} (resmi)</div>
                            <p className="mt-1 max-w-3xl text-[14px] leading-7 text-navy">{c.sasaran.nama}</p>
                            <div className="mt-2 text-[12.5px] leading-5 text-navy-500">Rumus pengukuran: {c.sasaran.rumus || "belum tercatat di sasaran_smi"} · Periode: {c.sasaran.periode || "belum tercatat"}</div>
                          </div>
                          <div className="space-y-1.5 text-[13px] text-navy-600">
                            <div>Capaian terhadap target = realisasi ÷ target × 100%{c.ratio !== null && <> = <b className="text-navy">{fmtPct(c.ratio, 1)}</b></>}</div>
                            {profile && c.report && <div className="flex flex-wrap items-center gap-2">Verifikasi: <LaporanBadge status={c.report.status} raw={c.report.statusRaw} /></div>}
                            {profile && c.report?.tindakLanjut && <div>Tindak lanjut: {c.report.tindakLanjut} {c.report.batasWaktu && <span className="text-navy-400">(batas {fmtDate(c.report.batasWaktu)})</span>}</div>}
                            <div className="flex flex-wrap gap-3 pt-1">
                              <Link to={`/sasaran/${c.sasaran.id}`} className="font-semibold text-accent hover:underline">Buka detail sasaran</Link>
                              {profile && c.report && <button onClick={() => setReport(c.report)} className="font-semibold text-accent hover:underline">Lihat laporan</button>}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {!rows.length && (
              <tr><td colSpan={9} className="px-6 py-12 text-center text-[13.5px] text-navy-400">Tidak ada baris yang sesuai filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-[12.5px] text-navy-500 sm:px-6">
        <span className="flex items-center gap-1.5"><Info className="size-3.5" /> Capaian terhadap target dihitung dari realisasi ÷ target. Sel kosong = belum dilaporkan (bukan 0); N/A = tidak ada pengukuran pada bulan tersebut.</span>
        <div className="flex items-center gap-1">
          <button aria-label="Halaman sebelumnya" disabled={cur <= 1} onClick={() => setPage(cur - 1)} className="rounded-lg p-1.5 hover:bg-canvas disabled:opacity-40"><ChevronLeft className="size-4" /></button>
          <span className="tabular-nums">{cur} / {pages}</span>
          <button aria-label="Halaman berikutnya" disabled={cur >= pages} onClick={() => setPage(cur + 1)} className="rounded-lg p-1.5 hover:bg-canvas disabled:opacity-40"><ChevronRight className="size-4" /></button>
        </div>
      </div>
      {data && <ReportDetailDialog report={report} data={data} onClose={() => setReport(null)} />}
    </Card>
  );
}
