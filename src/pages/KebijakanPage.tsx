import { FileText, Target, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { OfficialDocButton } from "@/components/portal/Kebijakan";
import { SectionHeading } from "@/components/portal/ContentState";
import { PolicyFlow } from "@/components/portal/Diagrams";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortal } from "@/hooks/usePortal";
import { useRouter } from "@/lib/router";
import { KONTEN_KEYS } from "@/config/schema";
import { KEBIJAKAN } from "@/content/resmi/dokumen";
import { fmtDate } from "@/lib/format";

/** Penampil PDF bawaan peramban untuk dokumen yang telah dipublikasikan. */
export function PdfViewer({ url, title }: { url: string; title: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 text-[13px]">
        <span className="flex min-w-0 items-center gap-2 font-medium text-navy"><FileText className="size-4 shrink-0 text-accent" /><span className="truncate">{title}</span></span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-accent hover:underline">Buka di tab baru</a>
      </div>
      <object data={url} type="application/pdf" className="h-[70vh] w-full">
        <p className="p-6 text-[13px] text-navy-500">Peramban tidak dapat menampilkan PDF di halaman ini. <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent underline">Buka dokumen</a>.</p>
      </object>
    </div>
  );
}

export function KebijakanPage() {
  const { content, konten } = usePortal();
  const { navigate } = useRouter();
  const k = konten(KONTEN_KEYS.kebijakan);
  const loading = content.konten.status === "loading";
  const dariDb = k && !k.resmi;

  return (
    <AppShell>
      <article className="relative overflow-hidden rounded-[28px] border border-navy/15 bg-[linear-gradient(160deg,#FFFFFF_0%,#F7FAFF_60%,#EEF4FF_100%)] shadow-[0_24px_60px_-30px_rgba(20,45,78,0.35)]">
        <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-navy via-accent to-gold" />
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[340px] rounded-full border-[36px] border-gold/[0.07]" />

        {/* Kepala panel */}
        <header className="relative border-b border-navy/10 px-6 pb-7 pt-9 sm:px-10 lg:px-14">
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.14em] text-teal"><span className="h-[3px] w-6 rounded-full bg-gold" />Kebijakan Resmi BPSDMP</div>
          <h1 className="mt-3 font-display text-[28px] font-extrabold uppercase leading-[1.15] tracking-[0.01em] text-navy [text-wrap:balance] sm:text-[36px]">
            Kebijakan Sistem Manajemen <span className="text-accent">Integrasi</span> BPSDMP
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-navy-600">
            <span><b className="font-semibold text-navy">Nomor</b> {k?.kodeDokumen || KEBIJAKAN.kode}</span>
            <span className="hidden h-4 w-px bg-navy/15 sm:block" />
            <span><b className="font-semibold text-navy">Terbitan/Revisi</b> {k?.revisi || KEBIJAKAN.revisi}</span>
            <span className="hidden h-4 w-px bg-navy/15 sm:block" />
            <span><b className="font-semibold text-navy">Tanggal</b> {fmtDate(k?.tanggalBerlaku || KEBIJAKAN.tanggal)}</span>
            <span className="hidden h-4 w-px bg-navy/15 sm:block" />
            <span><b className="font-semibold text-navy">Status</b> {KEBIJAKAN.status}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <OfficialDocButton url={k?.fileUrl ?? null} variant="default" />
            <Button size="lg" variant="outline" onClick={() => navigate("/sasaran")}><Target /> 18 Sasaran Mutu <ArrowRight /></Button>
          </div>
        </header>

        {/* Isi kebijakan */}
        <div className="relative px-6 py-9 sm:px-10 lg:px-14 lg:py-11">
          {loading ? <Skeleton className="h-64 rounded-2xl" /> : dariDb && k?.isi ? (
            <div className="whitespace-pre-line text-[16.5px] leading-[1.9] text-navy">{k.isi}</div>
          ) : (
            <div className="text-navy">
              <p className="text-[17px] leading-[1.9]">{KEBIJAKAN.pembuka}</p>
              <ol className="mt-6 grid gap-x-10 gap-y-1 lg:grid-cols-2">
                {KEBIJAKAN.komitmen.map((t, i) => (
                  <li key={i} className="grid grid-cols-[42px_1fr] rounded-2xl px-2 py-3 transition hover:bg-white hover:shadow-card">
                    <span className="mt-0.5 grid size-8 place-items-center rounded-lg bg-navy font-display text-[14px] font-bold text-gold">{String.fromCharCode(97 + i)}</span>
                    <span className="text-[16px] leading-[1.8]">{t}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-[17px] leading-[1.9]">{KEBIJAKAN.penutup}</p>
              <div className="mt-10 flex justify-end">
                <div className="rounded-2xl border border-navy/10 bg-white/80 px-6 py-5 text-[15px] leading-7">
                  <div className="text-navy-600">{KEBIJAKAN.tempatTanggal}</div>
                  <div className="text-navy-600">{KEBIJAKAN.penetap},</div>
                  <div className="mt-5 font-display text-[16px] font-bold text-navy">{KEBIJAKAN.namaPenetap}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </article>

      <section className="mt-12">
        <SectionHeading eyebrow="Keterkaitan" title="Dari kebijakan ke sasaran mutu" action={<Button variant="outline" onClick={() => navigate("/sasaran")}>Lihat 18 sasaran mutu <ArrowRight /></Button>} />
        <PolicyFlow />
      </section>
    </AppShell>
  );
}
