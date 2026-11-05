import { useMemo, useState, type ReactNode } from "react";
import {
  ClipboardCheck, Lock, CalendarClock, ListTodo, ArrowLeft, ArrowRight, FileStack, CheckCircle2, Info,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeading } from "@/components/portal/ContentState";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AXIS_TICK, GRID_STROKE, TooltipCard } from "@/components/charts/ChartTooltip";
import { usePortal } from "@/hooks/usePortal";
import { useAuth } from "@/auth/AuthProvider";
import { useRouter, Link } from "@/lib/router";
import { PESAN_AUDIT_KOSONG, STATUS_TL_AUDIT } from "@/content/portal";
import { PORTAL_TABLES } from "@/config/schema";
import { fmtDate, fmtDateTime } from "@/lib/format";
import type { RingkasanAudit, Temuan } from "@/types/portal";
import { cn } from "@/lib/utils";

const today = () => new Date().toISOString().slice(0, 10);
const isLate = (t: Temuan) => /terlambat/i.test(t.status) || (!/^selesai/i.test(t.status) && !!t.targetSelesai && t.targetSelesai < today());
const statusEfektif = (t: Temuan) => (isLate(t) ? "Terlambat" : STATUS_TL_AUDIT.find((s) => s.toLowerCase() === t.status.toLowerCase()) ?? (t.status || "Belum dimulai"));

const STATUS_COLOR: Record<string, string> = {
  "Belum dimulai": "#94A3B8", "Dalam proses": "#2563EB", "Menunggu verifikasi": "#D9A441", "Selesai": "#16A34A", Terlambat: "#E5484D",
};
const KAT_COLOR: Record<string, string> = { OFI: "#2563EB", Minor: "#D9A441", Mayor: "#E5484D" };
const statusTone = (s: string) => (s === "Selesai" ? "ok" : s === "Terlambat" ? "bad" : s === "Menunggu verifikasi" ? "warn" : s === "Dalam proses" ? "accent" : "muted") as "ok" | "bad" | "warn" | "accent" | "muted";
const katTone = (k: string) => (/mayor/i.test(k) ? "bad" : /minor/i.test(k) ? "warn" : "accent") as "bad" | "warn" | "accent";

const DOKUMEN_DIBUTUHKAN = [
  "Program Audit Internal (periode, standar, unit, jadwal, tim auditor)",
  "Laporan Audit Internal yang disetujui",
  "Register temuan: nomor, klausul, kategori, uraian, PIC, target",
  "Bukti tindakan korektif dan hasil verifikasi efektivitas",
];

function Tile({ label, value, color, hint }: { label: string; value: number | null | undefined; color: string; hint?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white p-4 shadow-card">
      <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: color }} />
      <div className="font-display text-[28px] font-bold leading-none tabular-nums" style={{ color: value == null ? "#8E9AAE" : color }}>{value ?? "—"}</div>
      <div className="mt-2 text-[13px] font-semibold text-navy-600">{label}</div>
      {hint && <div className="mt-0.5 text-[11.5px] text-navy-400">{hint}</div>}
    </div>
  );
}

function KosongAudit({ children }: { children?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-navy-300/60 bg-white p-6 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal text-white"><ClipboardCheck className="size-6" /></span>
        <div className="min-w-0">
          <p className="font-display text-[17px] font-bold text-navy">{PESAN_AUDIT_KOSONG}</p>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-6 text-navy-500">Struktur modul sudah siap. Angka akan terisi otomatis setelah hasil audit internal disetujui untuk publikasi. Portal tidak menampilkan temuan yang belum tercatat resmi.</p>
          <div className="mt-4 text-[12px] font-bold uppercase tracking-[0.08em] text-navy-400">Dokumen yang dibutuhkan</div>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {DOKUMEN_DIBUTUHKAN.map((d) => <li key={d} className="flex gap-2 text-[13px] leading-5 text-navy-600"><FileStack className="mt-0.5 size-3.5 shrink-0 text-teal" />{d}</li>)}
          </ul>
          {children}
        </div>
      </div>
    </div>
  );
}

function useAudit() {
  const { content } = usePortal();
  const ring = content.auditRingkasan;
  const rows = ring.status === "ok" ? ring.rows : [];
  const temuan = content.temuan.status === "ok" ? content.temuan.rows : null;
  return { ring, rows, latest: rows[0] ?? null, temuan, temuanState: content.temuan };
}

/** Grafik batang horizontal sederhana untuk ringkasan berkategori. */
function MiniBars({ data, empty }: { data: { label: string; value: number; color: string }[]; empty: string }) {
  const any = data.some((d) => d.value > 0);
  return (
    <div className="relative h-[220px]">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
          <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" width={140} tick={{ ...AXIS_TICK, fill: "#2E4767", fontWeight: 600 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "#F1F5F9" }} content={({ active, payload }: any) => active && payload?.length ? <TooltipCard title={payload[0].payload.label} rows={[{ label: "Jumlah", value: payload[0].value }]} /> : null} />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={22}>{data.map((d) => <Cell key={d.label} fill={d.color} />)}</Bar>
        </BarChart>
      </ResponsiveContainer>
      {!any && <div className="absolute inset-0 grid place-items-center"><p className="rounded-xl border border-dashed border-line bg-white/95 px-4 py-2 text-[13px] font-medium text-navy-400">{empty}</p></div>}
    </div>
  );
}

function RegisterTemuan({ rows }: { rows: Temuan[] }) {
  const { navigate } = useRouter();
  const [status, setStatus] = useState("semua");
  const cols: Column<Temuan>[] = [
    { key: "nomor", header: "No. temuan", sortValue: (t) => t.nomor, cell: (t) => <span className="font-mono text-[12.5px]">{t.nomor || "—"}</span> },
    { key: "unit", header: "Unit", sortValue: (t) => t.unit, cell: (t) => <span className="font-medium">{t.unit || "—"}</span> },
    { key: "std", header: "Standar · klausul", cell: (t) => <span className="text-navy-500">{[t.standar, t.klausul].filter(Boolean).join(" · ") || "—"}</span> },
    { key: "uraian", header: "Uraian temuan", className: "min-w-[240px]", cell: (t) => <span className="line-clamp-2">{t.uraian}</span> },
    { key: "kat", header: "Kategori", sortValue: (t) => t.kategori, cell: (t) => (t.kategori ? <Badge tone={katTone(t.kategori)}>{t.kategori}</Badge> : "—") },
    { key: "pic", header: "PIC", cell: (t) => <span className="text-navy-500">{t.pic || "—"}</span> },
    { key: "target", header: "Batas waktu", sortValue: (t) => t.targetSelesai ?? "", cell: (t) => <span className={cn("whitespace-nowrap", isLate(t) && "font-semibold text-bad")}>{fmtDate(t.targetSelesai)}</span> },
    { key: "status", header: "Status", sortValue: (t) => statusEfektif(t), cell: (t) => <Badge tone={statusTone(statusEfektif(t))} dot>{statusEfektif(t)}</Badge> },
  ];
  return (
    <>
      <div className="mb-4 flex w-fit max-w-full flex-wrap gap-1 rounded-xl border border-line bg-white p-1">
        {["semua", ...STATUS_TL_AUDIT].map((s) => {
          const n = s === "semua" ? rows.length : rows.filter((t) => statusEfektif(t) === s).length;
          return <button key={s} onClick={() => setStatus(s)} className={cn("rounded-lg px-3 py-1.5 text-[12.5px] font-semibold", status === s ? "bg-navy text-white" : "text-navy-500 hover:bg-canvas")}>{s === "semua" ? "Semua" : s} <span className="tabular-nums opacity-70">{n}</span></button>;
        })}
      </div>
      <Card className="overflow-hidden">
        <DataTable
          rows={rows.filter((t) => status === "semua" || statusEfektif(t) === status)}
          columns={cols}
          rowKey={(t) => t.id}
          searchText={(t) => `${t.nomor} ${t.unit} ${t.standar} ${t.klausul} ${t.uraian} ${t.pic}`}
          onRowClick={(t) => navigate(`/audit/temuan/${t.id}`)}
          initialSort={{ key: "target", dir: "asc" }}
          empty={<div className="px-6 py-12 text-center"><p className="font-display text-[15px] font-bold text-navy">Register temuan masih kosong</p><p className="mt-1 text-[13px] text-navy-400">{PESAN_AUDIT_KOSONG}</p></div>}
        />
      </Card>
    </>
  );
}

function TerlindungiTemuan() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6 sm:flex-row sm:items-center">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy text-gold"><Lock className="size-5" /></span>
      <div>
        <p className="font-display text-[15.5px] font-bold text-navy">Register temuan dilindungi</p>
        <p className="mt-1 text-[13.5px] leading-6 text-navy-500">Uraian temuan, bukti objektif, dan catatan auditor hanya dapat diakses petugas yang berwenang. Pengunjung melihat ringkasan yang telah disetujui untuk publikasi.</p>
      </div>
    </div>
  );
}

/* ---------------- Tab: Audit Internal ---------------- */

function AuditInternal() {
  const { ring, rows, latest, temuan, temuanState } = useAudit();
  const { profile } = useAuth();
  const a: RingkasanAudit | null = latest;
  const kat = [
    { label: "OFI", value: a?.ofi ?? 0, color: KAT_COLOR.OFI },
    { label: "Minor", value: a?.minor ?? 0, color: KAT_COLOR.Minor },
    { label: "Mayor", value: a?.mayor ?? 0, color: KAT_COLOR.Mayor },
  ];
  if (ring.status === "loading") return <Skeleton className="h-64 rounded-2xl" />;
  return (
    <div className="space-y-8">
      {!a && <KosongAudit />}
      {a && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-5 shadow-card">
          <span className="grid size-10 place-items-center rounded-xl bg-teal text-white"><ClipboardCheck className="size-5" /></span>
          <div className="font-display text-[17px] font-bold text-navy">{a.periode || "Periode audit"}</div>
          {a.standar && <Badge tone="navy">{a.standar}</Badge>}
          {a.statusPelaksanaan && <Badge tone="accent">{a.statusPelaksanaan}</Badge>}
          <span className="ml-auto text-[12px] text-navy-400">Diperbarui {fmtDateTime(a.diperbarui)}</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Unit diaudit" value={a?.unitDiaudit} color="#142D4E" />
        <Tile label="OFI" value={a?.ofi} color={KAT_COLOR.OFI} hint="Peluang peningkatan" />
        <Tile label="Minor" value={a?.minor} color={KAT_COLOR.Minor} hint="Ketidaksesuaian minor" />
        <Tile label="Mayor" value={a?.mayor} color={KAT_COLOR.Mayor} hint="Ketidaksesuaian mayor" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Temuan menurut kategori" description="Periode audit terakhir yang dipublikasikan" />
          <CardBody><MiniBars data={kat} empty="Belum ada temuan yang dipublikasikan" /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Linimasa periode audit" icon={<CalendarClock />} />
          <CardBody>
            {rows.length ? (
              <ol className="relative space-y-4 border-l-2 border-line pl-6">
                {rows.map((r, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[33px] top-1 size-4 rounded-full border-[3px] border-white bg-teal ring-2 ring-teal/25" />
                    <div className="text-[14px] font-semibold text-navy">{r.periode}</div>
                    <div className="text-[12.5px] text-navy-500">{r.statusPelaksanaan || "—"} · OFI {r.ofi ?? "—"} · Minor {r.minor ?? "—"} · Mayor {r.mayor ?? "—"}</div>
                  </li>
                ))}
              </ol>
            ) : <p className="py-10 text-center text-[13px] font-medium text-navy-400">Linimasa tampil setelah program audit internal dipublikasikan.</p>}
          </CardBody>
        </Card>
      </div>
      <section>
        <SectionHeading eyebrow="Register temuan" title="Temuan audit internal" description="Nomor temuan, klausul, kategori, uraian, PIC, batas waktu, dan status. Klik baris untuk membuka halaman detail tindak lanjut." />
        {profile ? (temuan ? <RegisterTemuan rows={temuan} /> : <p className="text-[13px] text-navy-400">{temuanState.status === "unavailable" ? temuanState.reason : "Memuat…"}</p>) : <TerlindungiTemuan />}
      </section>
    </div>
  );
}

/* ---------------- Tab: Tindak Lanjut Temuan ---------------- */

function TindakLanjutTemuan() {
  const { ring, latest, temuan } = useAudit();
  const { profile } = useAuth();
  // Petugas: dihitung dari register; pengunjung: dari ringkasan publik.
  const counts = useMemo(() => {
    if (profile && temuan && temuan.length) {
      return Object.fromEntries(STATUS_TL_AUDIT.map((s) => [s, temuan.filter((t) => statusEfektif(t) === s).length])) as Record<string, number>;
    }
    if (!latest) return null;
    return {
      "Belum dimulai": latest.belumDimulai, "Dalam proses": latest.dalamProses, "Menunggu verifikasi": latest.menungguVerifikasi,
      Selesai: latest.selesai, Terlambat: latest.terlambat,
    } as Record<string, number | null>;
  }, [profile, temuan, latest]);
  const total = counts ? Object.values(counts).reduce<number>((a, v) => a + (v ?? 0), 0) : 0;
  const upcoming = (temuan ?? []).filter((t) => statusEfektif(t) !== "Selesai" && t.targetSelesai).sort((a, b) => (a.targetSelesai ?? "").localeCompare(b.targetSelesai ?? "")).slice(0, 8);
  if (ring.status === "loading") return <Skeleton className="h-64 rounded-2xl" />;

  return (
    <div className="space-y-8">
      {!counts && <KosongAudit />}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {STATUS_TL_AUDIT.map((s) => <Tile key={s} label={s} value={counts ? counts[s] : null} color={STATUS_COLOR[s]} />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Progres tindak lanjut" description={total ? `${total} tindak lanjut tercatat` : "Proporsi tindak lanjut menurut status"} icon={<ListTodo />} />
          <CardBody>
            <div className="flex h-5 overflow-hidden rounded-full bg-slate-100">
              {total > 0 && STATUS_TL_AUDIT.map((s) => {
                const v = counts?.[s] ?? 0;
                return v ? <div key={s} title={`${s}: ${v}`} style={{ width: `${(v / total) * 100}%`, background: STATUS_COLOR[s] }} /> : null;
              })}
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {STATUS_TL_AUDIT.map((s) => (
                <li key={s} className="flex items-center justify-between gap-3 rounded-xl bg-canvas px-3 py-2 text-[13px]">
                  <span className="flex items-center gap-2 text-navy-600"><span className="size-2.5 rounded-full" style={{ background: STATUS_COLOR[s] }} />{s}</span>
                  <span className="font-semibold tabular-nums text-navy">{counts?.[s] ?? "—"}{total ? <span className="ml-1 text-[11.5px] font-normal text-navy-400">({Math.round(((counts?.[s] ?? 0) / total) * 100)}%)</span> : null}</span>
                </li>
              ))}
            </ul>
            {!total && <p className="mt-4 text-center text-[13px] font-medium text-navy-400">Belum ada tindak lanjut yang dapat ditampilkan.</p>}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Batas waktu penyelesaian" description="Tindak lanjut terdekat yang belum selesai" icon={<CalendarClock />} />
          <CardBody>
            {!profile ? (
              <p className="py-8 text-center text-[13px] leading-6 text-navy-400">Rincian batas waktu per temuan hanya untuk petugas berwenang.</p>
            ) : upcoming.length ? (
              <ol className="relative space-y-3 border-l-2 border-line pl-6">
                {upcoming.map((t) => (
                  <li key={t.id} className="relative">
                    <span className="absolute -left-[31px] top-1.5 size-3.5 rounded-full border-2 border-white" style={{ background: STATUS_COLOR[statusEfektif(t)] }} />
                    <Link to={`/audit/temuan/${t.id}`} className="block rounded-xl px-2 py-1 hover:bg-canvas">
                      <span className={cn("text-[12.5px] font-semibold", isLate(t) ? "text-bad" : "text-navy-500")}>{fmtDate(t.targetSelesai)} · {statusEfektif(t)}</span>
                      <span className="block truncate text-[13.5px] font-medium text-navy">{t.nomor} · {t.unit} · {t.uraian}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : <p className="py-8 text-center text-[13px] font-medium text-navy-400">Belum ada tindak lanjut dengan batas waktu.</p>}
          </CardBody>
        </Card>
      </div>
      <section>
        <SectionHeading eyebrow="Register" title="Register tindak lanjut temuan" />
        {profile ? <RegisterTemuan rows={temuan ?? []} /> : <TerlindungiTemuan />}
      </section>
    </div>
  );
}

/* ---------------- Detail temuan ---------------- */

function DetailTemuan({ id }: { id: string }) {
  const { profile } = useAuth();
  const { temuan, temuanState } = useAudit();
  const { navigate } = useRouter();
  if (!profile) return <TerlindungiTemuan />;
  if (temuanState.status === "loading") return <Skeleton className="h-64 rounded-2xl" />;
  const t = temuan?.find((x) => x.id === id);
  if (!t) return <KosongAudit><Button className="mt-4" variant="outline" onClick={() => navigate("/audit/tindak-lanjut")}><ArrowLeft /> Kembali ke register</Button></KosongAudit>;
  const st = statusEfektif(t);
  const langkah = [
    { l: "Temuan dicatat", v: fmtDate(t.tanggalAudit), done: true },
    { l: "Analisis akar penyebab", v: t.akarPenyebab ? "Tersedia" : "Belum", done: !!t.akarPenyebab },
    { l: "Koreksi & tindakan korektif", v: t.tindakanKorektif ? "Ditetapkan" : "Belum", done: !!t.tindakanKorektif },
    { l: "Target penyelesaian", v: fmtDate(t.targetSelesai), done: !!t.targetSelesai },
    { l: "Realisasi penyelesaian", v: fmtDate(t.realisasiSelesai), done: !!t.realisasiSelesai },
    { l: "Verifikasi efektivitas", v: t.verifikasiEfektivitas || "Belum", done: !!t.verifikasiEfektivitas },
  ];
  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/audit/tindak-lanjut")} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent"><ArrowLeft className="size-4" /> Register tindak lanjut</button>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-[26px] font-bold text-navy">Temuan {t.nomor}</h2>
        {t.kategori && <Badge tone={katTone(t.kategori)}>{t.kategori}</Badge>}
        <Badge tone={statusTone(st)} dot>{st}</Badge>
      </div>
      <Card><CardBody className="pt-5">
        <ol className="grid gap-3 md:grid-cols-6">
          {langkah.map((s, i) => (
            <li key={s.l} className={cn("rounded-xl border p-3", s.done ? "border-ok/30 bg-ok-soft/50" : "border-line bg-white")}>
              <div className="flex items-center gap-2 text-[11.5px] font-bold text-navy-400">{s.done ? <CheckCircle2 className="size-4 text-ok" /> : <span className="grid size-4 place-items-center rounded-full border border-navy-300 text-[9px]">{i + 1}</span>}Langkah {i + 1}</div>
              <div className="mt-1 text-[13px] font-semibold text-navy">{s.l}</div>
              <div className="text-[12px] text-navy-500">{s.v}</div>
            </li>
          ))}
        </ol>
      </CardBody></Card>
      <Card><CardBody className="pt-5">
        <dl className="grid gap-4 text-[13.5px] leading-6 sm:grid-cols-2">
          {[["Unit", t.unit], ["Standar · klausul", [t.standar, t.klausul].filter(Boolean).join(" · ")], ["Uraian temuan", t.uraian], ["Bukti objektif", t.buktiObjektif], ["Analisis akar penyebab", t.akarPenyebab], ["Koreksi", t.koreksi], ["Tindakan korektif", t.tindakanKorektif], ["PIC", t.pic], ["Catatan auditor", t.catatanAuditor]].map(([l, v]) => (
            <div key={l} className={cn(["Uraian temuan", "Bukti objektif", "Tindakan korektif", "Catatan auditor"].includes(l) && "sm:col-span-2")}>
              <dt className="text-xs font-semibold uppercase tracking-[0.05em] text-navy-400">{l}</dt>
              <dd className="mt-0.5 whitespace-pre-line text-navy">{v || "—"}</dd>
            </div>
          ))}
        </dl>
      </CardBody></Card>
    </div>
  );
}

export function AuditPage() {
  const { segments, navigate } = useRouter();
  const tab = segments[1] === "tindak-lanjut" ? "tl" : segments[1] === "temuan" ? "detail" : "audit";
  const label = tab === "audit" ? "Audit Internal" : tab === "tl" ? "Tindak Lanjut Temuan" : "Detail Temuan";
  return (
    <AppShell crumbs={[{ label: "Audit & Tindak Lanjut", to: "/audit" }, { label }]}>
      <SectionHeading eyebrow="Audit & Tindak Lanjut" title={label} description={tab === "tl" ? "Progres tindak lanjut temuan audit internal menurut status dan batas waktu penyelesaian." : "Ringkasan pelaksanaan audit internal SMI: OFI, ketidaksesuaian minor dan mayor, serta register temuan."} />
      {tab !== "detail" && (
        <div className="mb-6 flex w-fit max-w-full flex-wrap gap-1 rounded-xl border border-line bg-white p-1">
          <button onClick={() => navigate("/audit")} className={cn("inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold", tab === "audit" ? "bg-navy text-white" : "text-navy-500 hover:bg-canvas")}><ClipboardCheck className="size-4" /> Audit Internal</button>
          <button onClick={() => navigate("/audit/tindak-lanjut")} className={cn("inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold", tab === "tl" ? "bg-navy text-white" : "text-navy-500 hover:bg-canvas")}><ListTodo className="size-4" /> Tindak Lanjut Temuan</button>
        </div>
      )}
      {tab === "audit" ? <AuditInternal /> : tab === "tl" ? <TindakLanjutTemuan /> : <DetailTemuan id={segments[2] ?? ""} />}
      <p className="mt-8 flex gap-2 text-[12.5px] leading-5 text-navy-400"><Info className="mt-0.5 size-3.5 shrink-0" /> Sumber data: view publik_ringkasan_audit (ringkasan yang disetujui) dan tabel {PORTAL_TABLES.temuan} (khusus petugas). <Link to="/monitoring" className="inline-flex items-center gap-1 font-semibold text-accent">Monitoring capaian <ArrowRight className="size-3.5" /></Link></p>
    </AppShell>
  );
}
