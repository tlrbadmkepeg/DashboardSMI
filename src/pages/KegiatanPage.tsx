import { useMemo, useState } from "react";
import { CalendarClock, ExternalLink, ImageOff } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeading } from "@/components/portal/ContentState";
import { Skeleton } from "@/components/ui/skeleton";
import { SumberResmi } from "@/components/portal/Resmi";
import { KATEGORI_KEGIATAN } from "@/content/portal";
import { KEGIATAN_RESMI } from "@/content/resmi/kegiatan";
import { PENGANTAR_FKAP_2026, RENCANA_FKAP_2026 } from "@/content/resmi/risiko";
import { usePortal } from "@/hooks/usePortal";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Kegiatan } from "@/types/portal";

/** Kegiatan dari basis data digabung dengan kegiatan yang dicatat langsung (tanpa duplikasi judul). */
export function useKegiatan(): { rows: Kegiatan[]; loading: boolean } {
  const { content } = usePortal();
  return useMemo(() => {
    const db = content.kegiatan.status === "ok" ? content.kegiatan.rows : [];
    const seen = new Set(db.map((k) => k.judul.trim().toLowerCase()));
    const rows = [...db, ...KEGIATAN_RESMI.filter((k) => !seen.has(k.judul.trim().toLowerCase()))]
      .sort((a, b) => (b.tanggal ?? "").localeCompare(a.tanggal ?? ""));
    return { rows, loading: content.kegiatan.status === "loading" };
  }, [content.kegiatan]);
}

export function FotoKegiatan({ g, className }: { g: Kegiatan; className?: string }) {
  if (g.fotoUrl) return <img src={g.fotoUrl} alt={g.judul} className={cn("size-full object-cover", className)} loading="lazy" />;
  return (
    <div className={cn("grid size-full min-h-[160px] place-items-center bg-[linear-gradient(135deg,#EEF2F7,#E6F2F0)] p-4 text-center", className)}>
      <div className="text-navy-400"><ImageOff className="mx-auto size-7" /><div className="mt-2 text-[11.5px] font-medium">Foto dokumentasi belum diunggah</div></div>
    </div>
  );
}

export function KegiatanPage() {
  const { rows: all, loading } = useKegiatan();
  const [kat, setKat] = useState("semua");
  const rows = all.filter((g) => kat === "semua" || g.kategori === kat);
  return (
    <AppShell>
      <SectionHeading eyebrow="Kegiatan & Informasi" title="Kegiatan penerapan SMI" description="Kerja sama, sosialisasi, pelatihan auditor internal, rapat koordinasi, pendampingan, audit, tinjauan manajemen, evaluasi, dan perbaikan." />
      <div className="mb-6 flex flex-wrap gap-1.5">
        {["semua", ...KATEGORI_KEGIATAN].map((k) => (
          <button key={k} onClick={() => setKat(k)} className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition", kat === k ? "border-navy bg-navy text-white" : "border-line bg-white text-navy-500 hover:border-navy-300")}>{k === "semua" ? "Semua" : k}</button>
        ))}
      </div>
      {loading ? <Skeleton className="h-56 rounded-2xl" /> : !rows.length ? (
        <p className="rounded-2xl border border-dashed border-line bg-white py-10 text-center text-[13px] text-navy-400">Belum ada kegiatan pada kategori ini.</p>
      ) : (
        <ol className="relative space-y-6 border-l border-line pl-6 md:pl-8">
          {rows.map((g) => (
            <li key={g.id} className="relative">
              <span className="absolute -left-[31px] top-5 size-3.5 rounded-full border-2 border-white bg-accent ring-1 ring-accent/30 md:-left-[39px]" />
              <article className="grid overflow-hidden rounded-2xl border border-line bg-white md:grid-cols-[300px_1fr]">
                <div className="aspect-[16/10] max-w-full md:aspect-auto"><FotoKegiatan g={g} /></div>
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2 text-[12px]"><span className="font-semibold uppercase tracking-[0.06em] text-teal">{g.kategori}</span><span className="text-navy-400">· {fmtDate(g.tanggal)}</span></div>
                  <h3 className="mt-2 text-[17px] font-semibold leading-snug text-navy">{g.judul}</h3>
                  <p className="mt-2 text-[13.5px] leading-6 text-navy-500">{g.ringkasan}</p>
                  {g.dokumentasiUrl && <a href={g.dokumentasiUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent">Dokumentasi <ExternalLink className="size-3.5" /></a>}
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}

      <section className="mt-14">
        <SectionHeading eyebrow="Agenda" title="Rencana kegiatan Fungsi Anti Penyuapan 2026" description={PENGANTAR_FKAP_2026} />
        <ol className="space-y-2">
          {RENCANA_FKAP_2026.map(([no, keg, waktu, hasil]) => (
            <li key={no} className="grid gap-2 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[150px_1fr_260px] sm:items-center sm:gap-5">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-teal-soft px-2.5 py-1 text-[12px] font-semibold text-teal"><CalendarClock className="size-3.5" />{waktu}</span>
              <span className="text-[13.5px] font-medium leading-6 text-navy">{keg}</span>
              <span className="text-[12.5px] leading-5 text-navy-500">Hasil: {hasil}</span>
            </li>
          ))}
        </ol>
        <div className="mt-3 flex flex-wrap items-center gap-3"><SumberResmi kode="PM.SMI.L14.2026" /><span className="text-[12px] text-navy-400">Rencana, bukan laporan pelaksanaan.</span></div>
      </section>
    </AppShell>
  );
}
