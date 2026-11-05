import { useState } from "react";
import {
  BookOpenText, FileText, Info, Quote, HeartHandshake, Scale, GraduationCap, Accessibility, ShieldCheck, Megaphone, TrendingUp,
  ArrowRight, type LucideIcon,
} from "lucide-react";
import { KOMITMEN_KEBIJAKAN, PILAR } from "@/content/portal";
import { KEBIJAKAN } from "@/content/resmi/dokumen";
import { KONTEN_KEYS } from "@/config/schema";
import { usePortal } from "@/hooks/usePortal";
import { useRouter } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const pilarOf = (k: string) => PILAR.find((p) => p.key === k)!;

/** Judul tampilan yang ditetapkan pemilik portal. Judul pada dokumen: "Kebijakan Sistem Manajemen Integrasi". */
export const JUDUL_KEBIJAKAN = "Kebijakan Sistem Manajemen Terintegrasi BPSDMP";

export const IKON_KOMITMEN: LucideIcon[] = [HeartHandshake, Scale, GraduationCap, Accessibility, ShieldCheck, Megaphone, TrendingUp];

const teksKomitmen = (i: number) => {
  const t = KEBIJAKAN.komitmen[i].replace(/;\s*(dan)?$|\.$/, "");
  return t.charAt(0).toUpperCase() + t.slice(1) + ".";
};

/** Tampilan dokumen resmi (transkripsi PM.SMI.L2.2026) dengan kop dan tabel identitas dokumen. */
export function DokumenKebijakanView() {
  return (
    <article className="mx-auto max-w-[760px] bg-white text-navy">
      <div className="border border-navy/70">
        <div className="border-b border-navy/70 px-5 py-3 text-center">
          <div className="text-[13px] font-semibold">Kementerian Perdagangan Republik Indonesia</div>
          <div className="text-[13px] font-semibold">Badan Pengembangan Sumber Daya Manusia Perdagangan</div>
        </div>
        <div className="border-b border-navy/70 px-5 py-3 text-center font-display text-[15px] font-bold uppercase tracking-wide">{KEBIJAKAN.judul}</div>
        <dl className="grid grid-cols-2 text-[12px]">
          {[["Terbitan/Revisi", KEBIJAKAN.revisi], ["Nomor", KEBIJAKAN.kode], ["Tanggal", fmtDate(KEBIJAKAN.tanggal)], ["Status", KEBIJAKAN.status]].map(([l, v], i) => (
            <div key={l} className={cn("flex gap-2 px-4 py-1.5", i < 2 && "border-b border-navy/30", i % 2 === 0 && "border-r border-navy/30")}><dt className="w-28 shrink-0 text-navy-500">{l}</dt><dd className="font-medium">: {v}</dd></div>
          ))}
        </dl>
      </div>
      <div className="px-1 py-7 text-[14.5px] leading-7 sm:px-4">
        <p className="text-justify">{KEBIJAKAN.pembuka}</p>
        <ol className="mt-4 space-y-2">
          {KEBIJAKAN.komitmen.map((k, i) => <li key={i} className="grid grid-cols-[24px_1fr] text-justify"><span>{String.fromCharCode(97 + i)}.</span><span>{k}</span></li>)}
        </ol>
        <p className="mt-4 text-justify">{KEBIJAKAN.penutup}</p>
        <div className="mt-8 flex justify-end">
          <div className="text-[14px] leading-6">
            <div>{KEBIJAKAN.tempatTanggal}</div>
            <div>{KEBIJAKAN.penetap},</div>
            <div className="mt-10 font-semibold">{KEBIJAKAN.namaPenetap}</div>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Berkas dokumen kebijakan resmi bertanda tangan (diunggah pemilik portal ke Project). */
export const BERKAS_KEBIJAKAN = { pdf: "dokumen/kebijakan-smi-pm-smi-l2-2026.pdf", gambar: "dokumen/kebijakan-smi-pm-smi-l2-2026.png" };

/**
 * Tombol dokumen resmi: membuka penampil berkas bertanda tangan (gambar halaman dokumen)
 * dengan tautan ke PDF asli. Bila url lain disediakan basis data, url tersebut yang dibuka.
 */
export function OfficialDocButton({ url, label = "Lihat Dokumen Resmi", variant = "outline" }: { url: string | null; label?: string; variant?: "outline" | "glass" | "default" }) {
  const [open, setOpen] = useState(false);
  const pdf = url || BERKAS_KEBIJAKAN.pdf;
  return (
    <>
      <Button size="lg" variant={variant} onClick={() => setOpen(true)}><FileText /> {label}</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Kebijakan Sistem Manajemen Integrasi" description="Dokumen resmi PM.SMI.L2.2026 · Terbitan/Revisi 1/0 · ditandatangani Kepala BPSDMP" size="xl">
        <div className="space-y-3">
          <div className="max-h-[70vh] overflow-auto rounded-xl bg-canvas p-3 sm:p-5">
            <img src={BERKAS_KEBIJAKAN.gambar} alt="Dokumen Kebijakan Sistem Manajemen Integrasi BPSDMP bertanda tangan" className="mx-auto w-full max-w-[760px] rounded-lg bg-white shadow-card" />
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={pdf} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy px-4 text-[13.5px] font-semibold text-white hover:bg-navy-700"><FileText className="size-4" /> Buka PDF</a>
            <a href={pdf} download="Kebijakan-SMI-BPSDMP-PM.SMI.L2.2026.pdf" className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13.5px] font-semibold text-navy hover:border-navy-300">Unduh PDF</a>
          </div>
        </div>
      </Dialog>
    </>
  );
}

/** Metadata dokumen kebijakan. */
export function KebijakanMeta({ dark }: { dark?: boolean }) {
  const { konten } = usePortal();
  const k = konten(KONTEN_KEYS.kebijakan);
  const rows: [string, string][] = [
    ["Nomor dokumen", k?.kodeDokumen || "Belum tercatat"],
    ["Terbitan/Revisi", k?.revisi || "Belum tercatat"],
    ["Tanggal", k?.tanggalBerlaku ? fmtDate(k.tanggalBerlaku) : "Belum tercatat"],
    ["Status", k?.resmi ? KEBIJAKAN.status : "Dokumen Terkendali"],
    ["Ditetapkan oleh", k?.resmi ? KEBIJAKAN.namaPenetap : k?.pejabatPenetap || "Belum tercatat"],
    ["Jabatan", k?.resmi ? "Kepala BPSDMP" : "—"],
  ];
  return (
    <dl className={cn("grid grid-cols-2 gap-x-5 gap-y-3.5 text-[13px]", dark ? "text-white" : "text-navy")}>
      {rows.map(([l, v]) => (
        <div key={l} className="min-w-0">
          <dt className={cn("text-[11.5px] font-medium uppercase tracking-[0.06em]", dark ? "text-white/50" : "text-navy-400")}>{l}</dt>
          <dd className={cn("mt-1 truncate font-semibold", v === "Belum tercatat" && (dark ? "text-white/45" : "text-navy-300"))} title={v}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Kartu tujuh komitmen: nomor, ikon, judul ringkas, dan kutipan teks resmi. */
export function KomitmenGrid({ teks = true, compact }: { teks?: boolean; compact?: boolean }) {
  return (
    <ol className="grid gap-3.5 md:grid-cols-2">
      {KOMITMEN_KEBIJAKAN.map((k, i) => {
        const Icon = IKON_KOMITMEN[i];
        const last = i === KOMITMEN_KEBIJAKAN.length - 1;
        return (
          <li key={k.judul} className={cn(
            "group relative flex gap-4 overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift",
            last && "md:col-span-2",
          )}>
            <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent via-teal to-gold opacity-80" />
            <div className="flex shrink-0 flex-col items-center gap-2">
              <span className="grid size-11 place-items-center rounded-xl bg-navy text-gold shadow-sm"><Icon className="size-5" /></span>
              <span className="font-display text-[13px] font-bold tabular-nums text-navy-300">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[15.5px] font-bold leading-6 text-navy">{k.judul}</p>
              {teks && <p className={cn("mt-1.5 text-[13.5px] leading-[1.7] text-navy-600", compact && "line-clamp-3")}>{teksKomitmen(i)}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {k.pilar.map((p) => {
                  const pl = pilarOf(p);
                  return <span key={p} className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: pl.soft, color: pl.warna }}>{pl.nama}</span>;
                })}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Bagian Kebijakan Mutu pada Beranda: fokus visual utama. */
export function KebijakanSection() {
  const { navigate } = useRouter();
  const { konten } = usePortal();
  const k = konten(KONTEN_KEYS.kebijakan);
  return (
    <section id="kebijakan" className="relative overflow-hidden border-b border-line/60 bg-navy">
      <div aria-hidden className="bg-grid-navy pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-accent/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -left-24 size-[420px] rounded-full bg-teal/25 blur-3xl" />
      <div className="relative mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.55fr)]">
          <div className="lg:sticky lg:top-40 lg:self-start">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-900">
              <Quote className="size-3.5" /> Kebijakan Mutu
            </div>
            <h2 className="font-display text-[28px] font-extrabold uppercase leading-[1.15] tracking-[0.01em] text-white [text-wrap:balance] sm:text-[36px]">
              Kebijakan Sistem Manajemen <span className="text-gold">Terintegrasi</span> BPSDMP
            </h2>
            <div className="mt-5 h-1 w-16 rounded-full bg-gold" />
            <p className="mt-5 text-[15.5px] leading-8 text-white/80">
              Kepala BPSDMP menetapkan tujuh komitmen sebagai kerangka penetapan sasaran mutu, sasaran anti penyuapan, dan sasaran organisasi pendidikan.
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <KebijakanMeta dark />
            </div>
            <div className="mt-6 flex flex-wrap items-start gap-3">
              <Button size="lg" variant="gold" onClick={() => navigate("/kebijakan")}><BookOpenText /> Baca Kebijakan Lengkap</Button>
              <OfficialDocButton url={k?.fileUrl ?? null} variant="glass" />
            </div>
          </div>
          <div className="min-w-0">
            <KomitmenGrid compact />
            <p className="mt-4 flex gap-2 text-[12.5px] leading-5 text-white/60">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Judul kartu adalah ringkasan; teks di bawahnya dikutip dari PM.SMI.L2.2026 (Rev. 1/0, 22 Juni 2026) yang berjudul “{KEBIJAKAN.judul}”.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Tujuh komitmen dalam rumusan ringkas yang ditetapkan pemilik portal (rumusan lengkap di halaman Kebijakan). */
export const KOMITMEN_RINGKAS = [
  "Mutu layanan dan kepuasan pengguna",
  "Kepatuhan terhadap persyaratan",
  "Pengembangan kompetensi dan pendidikan",
  "Aksesibilitas dan kesetaraan pembelajaran",
  "Pencegahan penyuapan dan benturan kepentingan",
  "Pelaporan dan perlindungan pelapor",
  "Perbaikan berkelanjutan",
];

/** Kutipan pembuka kebijakan resmi (PM.SMI.L2.2026) sampai frasa penetapan sasaran. */
export const PENGANTAR_KEBIJAKAN = (() => {
  const p = KEBIJAKAN.pembuka;
  const cut = p.indexOf("sasaran organisasi pendidikan");
  return cut > 0 ? `${p.slice(0, cut + "sasaran organisasi pendidikan".length)} …` : p;
})();

/**
 * Panel tunggal Kebijakan Mutu untuk Beranda: satu kotak utama, tujuh komitmen sebagai daftar
 * bernomor dua kolom (bukan kartu terpisah), dua tombol, dan satu baris metadata dokumen.
 */
export function KebijakanPanel() {
  const { navigate } = useRouter();
  const { konten } = usePortal();
  const k = konten(KONTEN_KEYS.kebijakan);
  const meta = [k?.kodeDokumen, k?.revisi && `Rev. ${k.revisi}`, k?.tanggalBerlaku && `Berlaku ${fmtDate(k.tanggalBerlaku)}`].filter(Boolean).join(" · ");
  return (
    <section id="kebijakan" className="border-b border-line/60 bg-canvas">
      <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:py-14">
        <article className="relative overflow-hidden rounded-[28px] border border-navy/15 bg-[linear-gradient(135deg,#FFFFFF_0%,#F6F9FF_55%,#EDF3FF_100%)] shadow-[0_24px_60px_-28px_rgba(20,45,78,0.35)]">
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-navy via-accent to-gold" />
          <ShieldCheck aria-hidden className="pointer-events-none absolute -right-10 -top-6 size-[260px] text-navy/[0.035]" strokeWidth={1.2} />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 size-[280px] rounded-full border-[28px] border-gold/[0.07]" />
          <div className="relative px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-navy text-gold shadow-lg ring-4 ring-gold/20"><ShieldCheck className="size-7" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.14em] text-teal">
                  <span className="h-[3px] w-6 rounded-full bg-gold" /> Kebijakan Resmi BPSDMP
                </div>
                <h2 className="mt-2 font-display text-[26px] font-extrabold uppercase leading-[1.18] tracking-[0.01em] text-navy [text-wrap:balance] sm:text-[30px]">
                  Kebijakan Sistem Manajemen <span className="text-accent">Integrasi</span> BPSDMP
                </h2>
                <p className="mt-3 max-w-4xl text-[15.5px] leading-[1.75] text-navy-600">{PENGANTAR_KEBIJAKAN}</p>
              </div>
            </div>

            <div className="mt-7 border-t border-navy/10 pt-6">
              <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.1em] text-navy-400">Tujuh komitmen</div>
              <ol className="grid gap-x-10 md:grid-cols-2">
                {KOMITMEN_RINGKAS.map((t, i) => {
                  const Icon = IKON_KOMITMEN[i];
                  return (
                    <li key={t} className="group flex items-center gap-3.5 border-b border-dashed border-navy/10 py-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy font-display text-[13.5px] font-bold text-gold">{i + 1}</span>
                      <Icon className="size-[18px] shrink-0 text-accent transition group-hover:text-teal" />
                      <span className="text-[16px] font-semibold leading-6 text-navy">{t}</span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-3">
                <Button size="lg" variant="navy" onClick={() => navigate("/kebijakan")}><BookOpenText /> Baca Selengkapnya <ArrowRight /></Button>
                <OfficialDocButton url={k?.fileUrl ?? null} />
              </div>
              {meta && <div className="text-[13px] font-medium text-navy-500"><span className="mr-1.5 rounded bg-gold-soft px-1.5 py-0.5 text-[11.5px] font-bold text-gold-strong">Dokumen</span>{meta}</div>}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
