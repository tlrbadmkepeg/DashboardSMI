import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight, BarChart3, Building2, CheckCircle2, AlertTriangle, Target, ScrollText,
  Network, Workflow, ShieldAlert, ClipboardCheck, Search, ListTodo, FolderOpen, Users2, Cog, Layers,
  PackageCheck, Smile, CircleDashed, Activity,
} from "lucide-react";
import { PdcaCycle } from "@/components/portal/PdcaCycle";
import { HeatmapRisiko, LevelDonut, PerSasaranBars, useRingkasRisiko } from "@/components/portal/RisikoRingkas";
import { AppShell, MoreLink } from "@/components/layout/AppShell";
import { Band, SectionHeading, PendingContent, SimulasiBadge } from "@/components/portal/ContentState";
import { PillarDiagram } from "@/components/portal/Diagrams";
import { KebijakanPanel } from "@/components/portal/Kebijakan";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AchievementDonut, buildDonut } from "@/components/charts/AchievementDonut";
import { SasaranTargetBars, SasaranTrendLine, UnitComparison } from "@/components/charts/SasaranCharts";
import { useData } from "@/hooks/useData";
import { useAuth } from "@/auth/AuthProvider";
import { usePortal } from "@/hooks/usePortal";
import { useRouter, Link } from "@/lib/router";
import { PILAR, PORTAL, PESAN_AUDIT_KOSONG, STATUS_TL_AUDIT } from "@/content/portal";
import { PORTAL_TABLES } from "@/config/schema";
import { fmtDate, fmtPct, periodeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PELUANG } from "@/content/resmi/risiko";
import { BULAN } from "@/lib/format";
import { namaSingkat } from "@/content/resmi/pemetaan";
import { FotoKegiatan, useKegiatan } from "./KegiatanPage";
import { DIAGRAM, DiagramThumb } from "@/components/portal/DiagramViewer";

const QUICK = [
  { label: "Kebijakan", path: "/kebijakan", icon: ScrollText, desc: "Kebijakan SMI PM.SMI.L2", color: "#142D4E" },
  { label: "Sasaran Mutu", path: "/sasaran", icon: Target, desc: "18 sasaran, target, dan unit", color: "#2563EB" },
  { label: "Struktur Organisasi", path: "/organisasi", icon: Network, desc: "10 unit kerja dalam lingkup SMI", color: "#0F766E" },
  { label: "Proses Bisnis", path: "/organisasi/proses", icon: Workflow, desc: "Peta proses dan interaksi", color: "#A97A20" },
  { label: "SOP", path: "/dokumen/sop", icon: FolderOpen, desc: "14 folder SOP Sekretariat", color: "#2563EB" },
  { label: "Matriks Risiko", path: "/risiko", icon: ShieldAlert, desc: "Level, peta panas, pengendalian", color: "#DC2626" },
  { label: "Audit", path: "/audit", icon: ClipboardCheck, desc: "Temuan dan tindak lanjut", color: "#142D4E" },
  { label: "Monitoring", path: "/monitoring", icon: BarChart3, desc: "Analisis capaian per bulan", color: "#0F766E" },
];

/** Alur proses mengikuti gambar resmi PM.SMI.L6-2026 (input → proses → output → umpan balik). */
const ALUR_PROSES = [
  { judul: "Kebutuhan Pemangku Kepentingan", isi: "Kebutuhan dan harapan pengguna layanan, peraturan, serta isu internal dan eksternal.", icon: Users2, warna: "#142D4E", to: "/konteks?tab=pihak" },
  { judul: "Proses Manajemen", isi: "Perencanaan, kepemimpinan, pengendalian risiko, dan tinjauan manajemen.", icon: Cog, warna: "#2563EB", to: "/organisasi/proses" },
  { judul: "Proses Utama & Pendukung", isi: "Pelayanan, pendidikan, pembelajaran, proses khusus, serta dukungan SDM, sarana, dan anggaran.", icon: Layers, warna: "#0F766E", to: "/organisasi/proses" },
  { judul: "Hasil Layanan", isi: "Lulusan, sertifikat, layanan pengembangan kompetensi, dan informasi publik.", icon: PackageCheck, warna: "#A97A20", to: "/organisasi/proses" },
  { judul: "Kepuasan & Peningkatan", isi: "Umpan balik, survei kepuasan, evaluasi, dan perbaikan berkelanjutan.", icon: Smile, warna: "#DC2626", to: "/monitoring" },
];


const TL_COLOR: Record<string, string> = {
  "Belum dimulai": "#94A3B8", "Dalam proses": "#2563EB", "Menunggu verifikasi": "#D9A441", Selesai: "#16A34A", Terlambat: "#E5484D",
};

function Kpi({ label, value, icon, color, hint, progress, onClick }: {
  label: string; value: ReactNode; icon: ReactNode; color: string; hint?: string; progress?: number | null; onClick?: () => void;
}) {
  const Comp: any = onClick ? "button" : "div";
  const kosong = value === "Belum tersedia";
  return (
    <Comp onClick={onClick} className={cn("group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white p-5 text-left shadow-card transition", onClick && "hover:-translate-y-0.5 hover:shadow-lift")}>
      <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: color }} />
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13.5px] font-semibold leading-5 text-navy-600">{label}</span>
        <span className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-sm [&_svg]:size-[18px]" style={{ background: color }}>{icon}</span>
      </div>
      <span className={cn("mt-3 font-display font-bold leading-none tracking-tight tabular-nums", kosong ? "text-[17px] text-navy-400" : "text-[32px] text-navy")}>{value}</span>
      {progress !== undefined && (
        <span className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.max(0, Math.min(100, progress ?? 0))}%`, background: color }} /></span>
      )}
      {hint && <span className="mt-2 text-[12px] leading-4 text-navy-400">{hint}</span>}
    </Comp>
  );
}

export function BerandaPage() {
  const { navigate } = useRouter();
  const { model, data, loading, error, filters } = useData();
  const { profile } = useAuth();
  const { content } = usePortal();
  const kegiatan = useKegiatan();
  const rr = useRingkasRisiko();
  const periode = periodeLabel(filters.tahun, filters.bulan);
  const published = !!data && data.publikasiAktif;
  const sim = !!data?.simulasi;
  const k = model?.kpi;
  const relevant = useMemo(() => model?.sasaran.filter((s) => s.status !== "na") ?? [], [model]);
  const hasCapaian = !!k && k.memenuhi + k.belum > 0;
  const [selId, setSelId] = useState<string | null>(null);
  const [unitTren, setUnitTren] = useState("all");
  const selected = relevant.find((s) => s.sasaran.id === selId) ?? relevant.find((s) => s.value !== null) ?? relevant[0];
  const unitsTren = selected ? selected.cells.filter((c) => c.applicable).map((c) => c.unit) : [];
  const audit = content.auditRingkasan.status === "ok" ? content.auditRingkasan.rows[0] ?? null : null;
  const tlPerhatian = profile && k ? k.tindakLanjutLewat : audit?.terlambat ?? null;
  const BT = "Belum tersedia";
  const [periodeTren, setPeriodeTren] = useState<"jul-okt" | "tahun">("jul-okt");
  const trenDari = periodeTren === "jul-okt" ? 7 : 1;
  const trenSampai = periodeTren === "jul-okt" ? Math.max(7, filters.bulan) : 12;
  const auditTotal = audit ? (audit.ofi ?? 0) + (audit.minor ?? 0) + (audit.mayor ?? 0) : null;
  const tlTotal = audit ? ["belumDimulai", "dalamProses", "menungguVerifikasi", "selesai", "terlambat"].reduce((a, key) => a + ((audit as any)[key] ?? 0), 0) : 0;
  const tlTerbuka = audit ? (audit.belumDimulai ?? 0) + (audit.dalamProses ?? 0) + (audit.menungguVerifikasi ?? 0) + (audit.terlambat ?? 0) : null;

  return (
    <AppShell bare>
      {/* A. HERO */}
      <section className="relative overflow-hidden border-b border-line/60 bg-[linear-gradient(125deg,#0B1C33_0%,#142D4E_45%,#1D3F86_100%)] text-white">
        <div aria-hidden className="bg-grid-navy pointer-events-none absolute inset-0" />
        <div aria-hidden className="pointer-events-none absolute -right-32 top-6 size-[440px] rounded-full bg-accent/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-24 bottom-[-180px] size-[360px] rounded-full bg-teal/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-[1320px] items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-14">
          <div className="min-w-0 animate-fade-up">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-bold uppercase tracking-[0.12em] text-gold-light">
              {PORTAL.tagline.map((t, i) => <span key={t} className="flex items-center gap-3">{i > 0 && <span className="size-1 rounded-full bg-gold/60" />}{t}</span>)}
            </div>
            <h1 className="mt-4 font-display text-[32px] font-extrabold leading-[1.1] tracking-tight [text-wrap:balance] sm:text-[44px]">
              Portal Sistem Manajemen Terintegrasi <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">BPSDMP</span>
            </h1>
            <p className="mt-4 max-w-xl text-[17px] font-medium leading-8 text-white/90">{PORTAL.heroSub}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {PILAR.map((p) => (
                <button key={p.key} onClick={() => navigate(`/tentang?bagian=${p.key}`)} title={p.ringkas} className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur transition hover:bg-white/20">
                  {p.standar} <span className="text-white/60">· {p.nama}</span>
                </button>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" variant="gold" onClick={() => document.getElementById("kebijakan")?.scrollIntoView({ behavior: "smooth" })}><ScrollText /> Kebijakan SMI</Button>
              <Button size="lg" variant="glass" onClick={() => document.getElementById("capaian")?.scrollIntoView({ behavior: "smooth" })}><BarChart3 /> Progres Capaian</Button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[420px] min-w-0 rounded-3xl bg-white p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)] ring-1 ring-white/20 sm:p-5"><PillarDiagram /></div>
        </div>
      </section>

      {/* B. SIKLUS PDCA */}
      <Band tone="tint" className="[&>div]:py-10 lg:[&>div]:py-12">
        <SectionHeading eyebrow="Siklus PDCA" title="Bagaimana SMI BPSDMP bekerja" description="Arahkan kursor atau ketuk tiap tahap; setiap butir membuka halaman yang memuat informasinya." />
        <PdcaCycle />
      </Band>

      {/* C. KEBIJAKAN — satu panel */}
      <KebijakanPanel />

      {/* D–E. RINGKASAN CAPAIAN + GRAFIK */}
      <section id="capaian" className="relative scroll-mt-32 border-b border-line/60 bg-white">
        <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-teal" />
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:py-14">
          <SectionHeading
            eyebrow="Ringkasan capaian SMI"
            title={<span className="inline-flex flex-wrap items-center gap-3">Progres 18 sasaran mutu {sim && <SimulasiBadge />}</span>}
            description={sim ? `Posisi s.d. ${periode}. Angka bersumber dari dokumen pencapaian PM.SMI.L3-01.2026 dan belum melalui verifikasi sistem.` : `Hanya laporan terverifikasi yang dihitung sebagai capaian resmi. Posisi s.d. ${periode}.`}
            action={<Button variant="navy" onClick={() => navigate("/monitoring")}>Lihat Analisis Capaian Lengkap <ArrowRight /></Button>}
          />

          {loading && !model ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[150px] rounded-2xl" />)}</div>
          ) : error ? (
            <PendingContent kind="galat" title="Data sasaran belum dapat dimuat" description={error} />
          ) : !published && data ? (
            <PendingContent title={data.pesanPublikasi ?? "Publikasi capaian belum diaktifkan"} description="Ringkasan capaian tampil setelah view publikasi capaian terverifikasi diaktifkan administrator. Data operasional tidak dibuka untuk pengunjung." table="publik_realisasi_smi" />
          ) : model && k ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
                <Kpi label="Sasaran mutu" value={data?.sasaran.length ?? BT} icon={<Target />} color="#142D4E" hint="PM.SMI.L3.2026" onClick={() => navigate("/sasaran")} />
                <Kpi label="Unit kerja" value={data?.units.length ?? BT} icon={<Building2 />} color="#0F766E" hint={k.unitMelapor ? `${k.unitMelapor} unit memiliki data capaian` : "Dalam lingkup SMI"} onClick={() => navigate("/unit")} />
                <Kpi label="Memenuhi target" value={hasCapaian ? k.memenuhi : BT} icon={<CheckCircle2 />} color="#16A34A" progress={hasCapaian ? (k.memenuhi / relevant.length) * 100 : 0} hint={hasCapaian ? `${fmtPct(k.pctTercapai, 0)} dari sasaran terukur` : "Menunggu data capaian"} onClick={() => navigate("/sasaran?status=memenuhi")} />
                <Kpi label="Belum memenuhi target" value={hasCapaian ? k.belum : BT} icon={<AlertTriangle />} color="#E59E1F" progress={hasCapaian ? (k.belum / relevant.length) * 100 : 0} hint="Realisasi di bawah target" onClick={() => navigate("/sasaran?status=belum")} />
                <Kpi label="Belum dilaporkan" value={k.nodata} icon={<CircleDashed />} color="#94A3B8" progress={relevant.length ? (k.nodata / relevant.length) * 100 : 0} hint={k.tidakdiukur ? `${k.tidakdiukur} sasaran N/A (tidak ada pengukuran)` : "Belum ada angka s.d. periode ini"} onClick={() => navigate("/sasaran?status=nodata")} />
                <Kpi label="Status tindak lanjut" value={tlPerhatian ?? (tlTerbuka ?? BT)} icon={<ListTodo />} color="#E5484D" hint={profile ? "Tindak lanjut melewati batas waktu" : audit ? "Tindak lanjut temuan audit terbuka" : "Tersedia setelah ringkasan audit dipublikasikan"} onClick={() => navigate(profile ? "/monitoring/tindak-lanjut" : "/audit/tindak-lanjut")} />
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-12 [&>*]:min-w-0">
                <Card className="lg:col-span-5">
                  <CardHeader title={<span className="inline-flex flex-wrap items-center gap-2">Status pencapaian sasaran {sim && <SimulasiBadge />}</span>} description={`${relevant.length} sasaran · posisi ${periode}`} />
                  <CardBody>
                    <AchievementDonut
                      slices={buildDonut(k.memenuhi, 0, k.belum, k.nodata)}
                      centerValue={hasCapaian ? fmtPct(k.pctTercapai, 0) : String(k.nodata)}
                      centerLabel={hasCapaian ? "sasaran terukur memenuhi" : "sasaran belum dilaporkan"}
                      onSelect={(key) => navigate(`/sasaran?status=${key}`)}
                    />
                    <p className="mt-3 text-[12.5px] leading-5 text-navy-500">Persentase dihitung dari sasaran yang telah memiliki angka capaian. Sel N/A tidak dihitung sebagai 0.</p>
                  </CardBody>
                </Card>
                <Card className="lg:col-span-7">
                  <CardHeader
                    title={<span className="inline-flex flex-wrap items-center gap-2">Tren capaian {periodeTren === "jul-okt" ? `Juli–${BULAN[Math.max(6, filters.bulan - 1)]}` : "Januari–Desember"} {filters.tahun} {sim && <SimulasiBadge />}</span>}
                    description="Per sasaran, dalam satuan aslinya. Garis emas menandai target."
                    action={
                      <div role="group" aria-label="Periode tren" className="flex rounded-lg border border-line p-0.5 text-[12.5px] font-semibold">
                        {([["jul-okt", "Jul–Okt"], ["tahun", "Setahun"]] as const).map(([v, l]) => (
                          <button key={v} onClick={() => setPeriodeTren(v)} aria-pressed={periodeTren === v} className={cn("rounded-md px-2.5 py-1", periodeTren === v ? "bg-navy text-white" : "text-navy-500 hover:bg-canvas")}>{l}</button>
                        ))}
                      </div>
                    }
                  />
                  <div className="flex flex-wrap gap-2 px-5 pt-3 sm:px-6">
                    <select aria-label="Sasaran untuk tren" value={selected?.sasaran.id ?? ""} onChange={(e) => { setSelId(e.target.value); setUnitTren("all"); }} className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-[13.5px] font-medium text-navy focus:border-accent focus:outline-none sm:max-w-[360px]">
                      {relevant.map((s) => <option key={s.sasaran.id} value={s.sasaran.id}>Sasaran {s.sasaran.nomor} · {namaSingkat(s.sasaran)}</option>)}
                    </select>
                    <select aria-label="Unit kerja untuk tren" value={unitTren} onChange={(e) => setUnitTren(e.target.value)} className="h-10 rounded-xl border border-line bg-white px-3 text-[13.5px] font-medium text-navy focus:border-accent focus:outline-none">
                      <option value="all">Gabungan unit ditugaskan</option>
                      {unitsTren.map((u) => <option key={u.id} value={u.id}>{u.singkatan}</option>)}
                    </select>
                  </div>
                  <CardBody>{selected && data ? <SasaranTrendLine data={data} summary={selected} filters={{ ...filters, unitId: unitTren }} height={270} dari={trenDari} sampai={trenSampai} /> : null}</CardBody>
                </Card>
                <Card className="lg:col-span-7">
                  <CardHeader title={<span className="inline-flex flex-wrap items-center gap-2">Target vs realisasi {sim && <SimulasiBadge />}</span>} description="Sasaran berbentuk persentase, diurutkan dari yang paling memerlukan perhatian. Indeks kepuasan (skala 0–4) tidak dicampur pada sumbu ini." />
                  <CardBody><SasaranTargetBars items={relevant} onSelect={(id) => navigate(`/sasaran/${id}`)} /></CardBody>
                </Card>
                <Card className="lg:col-span-5">
                  <CardHeader title={<span className="inline-flex flex-wrap items-center gap-2">Perbandingan unit kerja {sim && <SimulasiBadge />}</span>} description="Proporsi sasaran yang ditugaskan kepada tiap unit menurut status (penyebut = sasaran yang ditugaskan)." />
                  <CardBody><UnitComparison items={model.units} onSelect={(id) => navigate(`/unit/${id}`)} /></CardBody>
                </Card>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas px-5 py-4">
                <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-navy-600">
                  <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-full bg-[#16A34A]" />Memenuhi target</span>
                  <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-full bg-[#E59E1F]" />Belum memenuhi target</span>
                  <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-full bg-[#CBD5E1]" />Belum dilaporkan</span>
                </span>
                <MoreLink to="/monitoring">Lihat Analisis Capaian Lengkap</MoreLink>
              </div>
            </>
          ) : <Skeleton className="h-80 rounded-2xl" />}
        </div>
      </section>

      {/* F. PROSES */}
      <Band tone="tint">
        <SectionHeading eyebrow="Proses bisnis" title="Alur proses SMI BPSDMP" description="Ringkasan dari Peta Proses dan Interaksi Proses PM.SMI.L6-2026." action={<Button variant="navy" onClick={() => navigate("/organisasi/proses")}>Lihat Peta Proses Lengkap <ArrowRight /></Button>} />
        <ol className="grid gap-3 md:grid-cols-5">
          {ALUR_PROSES.map((a, i) => (
            <li key={a.judul} className="relative">
              <Link to={a.to} title={a.isi} className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl text-white" style={{ background: a.warna }}><a.icon className="size-5" /></span>
                  <span className="font-display text-[26px] font-extrabold text-navy/10">{i + 1}</span>
                </div>
                <span className="mt-4 font-display text-[15.5px] font-bold leading-snug text-navy">{a.judul}</span>
                <span className="mt-1.5 flex-1 text-[13px] leading-5 text-navy-500">{a.isi}</span>
              </Link>
              {i < ALUR_PROSES.length - 1 && <ArrowRight aria-hidden className="absolute -right-3 top-1/2 z-10 hidden size-5 -translate-y-1/2 rounded-full bg-white p-0.5 text-gold shadow md:block" />}
            </li>
          ))}
        </ol>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <DiagramThumb diagram={DIAGRAM.strukturOrganisasi} to="/organisasi" deskripsi="Kedudukan sepuluh unit kerja BPSDMP dalam lingkup SMI." />
          <DiagramThumb diagram={DIAGRAM.tataKelola} to="/organisasi/tim" deskripsi="Manajemen Puncak, Tim SMI, FKAP, Auditor Internal, unit kerja, dan pemilik proses." />
          <DiagramThumb diagram={DIAGRAM.petaProses} to="/organisasi/proses" deskripsi="Input, proses manajemen, utama, khusus, pendukung, output, dan umpan balik." />
        </div>
      </Band>

      {/* G. RISIKO */}
      <Band>
        <SectionHeading eyebrow="Risiko dan peluang" title="Ringkasan Matriks Risiko SMI 2026" description={`${rr.total} risiko pada ${rr.sasaran} sasaran/tujuan dan ${PELUANG.length} peluang. Ringkasan publik; rincian register hanya untuk petugas berwenang.`} action={<Button variant="outline" onClick={() => navigate("/risiko")}>Lihat Dashboard Risiko <ArrowRight /></Button>} />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {([
            ["Total risiko", rr.total, "#142D4E", ShieldAlert, "Matriks Risiko SMI 2026"],
            ["Perlu perhatian", rr.perhatian, "#DC2626", AlertTriangle, "Level Tinggi dan Sangat Tinggi"],
            ["Pengendalian ditetapkan", `${rr.berpengendalian}/${rr.total}`, "#0F766E", CheckCircle2, "Seluruh respons: pencegahan"],
            ["Penilaian residual", rr.residual ? `${rr.residual}/${rr.total}` : BT, "#A97A20", Activity, rr.residual ? "Risiko dengan skor residual" : "Kolom residual belum diisi"],
          ] as const).map(([l, v, c, Icon, h]) => (
            <div key={l} className="relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-card">
              <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: c }} />
              <div className="flex items-start justify-between gap-2"><span className="text-[13.5px] font-semibold text-navy-600">{l}</span><Icon className="size-5" style={{ color: c }} /></div>
              <div className={cn("mt-3 font-display font-bold leading-none tabular-nums text-navy", v === BT ? "text-[17px] text-navy-400" : "text-[30px]")}>{v}</div>
              <div className="mt-2 text-[12px] text-navy-400">{h}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3 [&>*]:min-w-0">
          <Card><CardHeader title="Distribusi level risiko" description="Penilaian inheren" /><CardBody><LevelDonut height={190} /></CardBody></Card>
          <Card><CardHeader title="Peta panas K × D" description="Jumlah risiko per sel, skala 1–5" /><CardBody><HeatmapRisiko onCell={() => navigate("/risiko")} /></CardBody></Card>
          <Card><CardHeader title="Risiko per sasaran/tujuan" description="Warna menunjukkan level" /><CardBody><PerSasaranBars onSelect={() => navigate("/risiko")} /></CardBody></Card>
        </div>
      </Band>

      {/* H. AUDIT */}
      <Band tone="canvas">
        <SectionHeading eyebrow="Audit internal dan tindak lanjut" title="Kondisi audit SMI" description={audit ? `${audit.periode}${audit.statusPelaksanaan ? ` · ${audit.statusPelaksanaan}` : ""}` : PESAN_AUDIT_KOSONG} action={<Button variant="outline" onClick={() => navigate("/audit")}>Lihat Monitoring Audit Lengkap <ArrowRight /></Button>} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          {([
            ["OFI", audit?.ofi, "#2563EB"], ["Minor", audit?.minor, "#D9A441"], ["Mayor", audit?.mayor, "#E5484D"],
            ["Temuan terbuka", tlTerbuka, "#142D4E"], ["Selesai", audit?.selesai, "#16A34A"], ["Terlambat", audit?.terlambat, "#DC2626"],
            ["% penyelesaian", audit && tlTotal ? fmtPct(((audit.selesai ?? 0) / tlTotal) * 100, 0) : null, "#0F766E"],
          ] as const).map(([l, v, c]) => (
            <div key={l} className="relative overflow-hidden rounded-xl border border-line bg-white p-4 text-center shadow-card">
              <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: c }} />
              <div className={cn("font-display font-bold tabular-nums", v == null ? "text-[13.5px] leading-[34px] text-navy-400" : "text-[28px]")} style={v == null ? undefined : { color: c }}>{v ?? BT}</div>
              <div className="text-[12.5px] font-semibold text-navy-600">{l}</div>
            </div>
          ))}
        </div>
        <Card className="mt-4">
          <CardHeader title="Status tindak lanjut temuan" description={auditTotal != null ? `${auditTotal} temuan pada periode terakhir` : "Proporsi tindak lanjut menurut status"} />
          <CardBody>
            {(() => {
              const vals: Record<string, number | null> = {
                "Belum dimulai": audit?.belumDimulai ?? null, "Dalam proses": audit?.dalamProses ?? null,
                "Menunggu verifikasi": audit?.menungguVerifikasi ?? null, Selesai: audit?.selesai ?? null, Terlambat: audit?.terlambat ?? null,
              };
              return (
                <>
                  <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">
                    {tlTotal > 0 && STATUS_TL_AUDIT.map((st) => (vals[st] ? <div key={st} title={`${st}: ${vals[st]}`} style={{ width: `${(vals[st]! / tlTotal) * 100}%`, background: TL_COLOR[st] }} /> : null))}
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-navy-600">
                    {STATUS_TL_AUDIT.map((st) => <li key={st} className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: TL_COLOR[st] }} />{st}: <b className="tabular-nums text-navy">{vals[st] ?? "—"}</b></li>)}
                  </ul>
                  {!tlTotal && <p className="mt-3 text-[13px] text-navy-500">Data audit belum tersedia. Angka tampil setelah ringkasan audit internal disetujui untuk publikasi; portal tidak menampilkan temuan yang belum tercatat resmi.</p>}
                </>
              );
            })()}
          </CardBody>
        </Card>
      </Band>

      {/* I. AKSES CEPAT */}
      <Band>
        <SectionHeading eyebrow="Akses cepat" title="Informasi SMI dalam satu klik" action={<Button variant="outline" onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}><Search /> Cari dokumen</Button>} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {QUICK.map((q) => (
            <Link key={q.path + q.label} to={q.path} className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
              <span aria-hidden className="absolute inset-y-0 left-0 w-1 transition-all group-hover:w-1.5" style={{ background: q.color }} />
              <span className="grid size-11 place-items-center rounded-xl text-white shadow-sm" style={{ background: q.color }}><q.icon className="size-5" /></span>
              <span className="mt-4 font-display text-[16px] font-bold text-navy">{q.label}</span>
              <span className="mt-1 text-[13px] leading-5 text-navy-500">{q.desc}</span>
              <ArrowRight className="mt-3 size-4 text-navy-300 transition group-hover:translate-x-1 group-hover:text-accent" />
            </Link>
          ))}
        </div>
      </Band>

      {/* J. KEGIATAN */}
      <Band tone="tint">
        <SectionHeading eyebrow="Kegiatan & informasi" title="Penerapan SMI di BPSDMP" description="Kerja sama, sosialisasi, pelatihan, audit, dan tinjauan manajemen." action={<MoreLink to="/kegiatan">Semua kegiatan</MoreLink>} />
        {kegiatan.loading ? <Skeleton className="h-60 rounded-2xl" /> : kegiatan.rows.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {kegiatan.rows.slice(0, 3).map((g) => (
              <Link key={g.id} to="/kegiatan" className="group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="aspect-[16/9] max-w-full"><FotoKegiatan g={g} /></div>
                <div className="p-5">
                  <div className="text-[12px] font-bold uppercase tracking-[0.06em] text-teal">{g.kategori} · {fmtDate(g.tanggal)}</div>
                  <div className="mt-1.5 line-clamp-2 font-display text-[16px] font-bold leading-snug text-navy">{g.judul}</div>
                  <p className="mt-2 line-clamp-3 text-[14px] leading-6 text-navy-500">{g.ringkasan}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent">Selengkapnya <ArrowRight className="size-3.5" /></span>
                </div>
              </Link>
            ))}
          </div>
        ) : <PendingContent title="Belum ada kegiatan yang dipublikasikan" description="Kartu kegiatan beserta foto dan dokumentasinya tampil setelah administrator mempublikasikan kegiatan SMI." table={PORTAL_TABLES.kegiatan} />}
      </Band>
    </AppShell>
  );
}
