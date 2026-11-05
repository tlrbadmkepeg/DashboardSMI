import { useEffect } from "react";
import type React from "react";
import { CheckCircle2, Lightbulb, Workflow, ShieldAlert, RefreshCcw, Users2, Target, Layers } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ContentState, SectionHeading } from "@/components/portal/ContentState";
import { PdcaCycle, PillarDiagram } from "@/components/portal/Diagrams";
import { PILAR, KONSEP } from "@/content/portal";
import { KONTEN_KEYS, PORTAL_TABLES } from "@/config/schema";
import { usePortal } from "@/hooks/usePortal";
import { useRouter } from "@/lib/router";
import type { LoadState, Konten } from "@/types/portal";
import { KEBIJAKAN } from "@/content/resmi/dokumen";
import { RuangLingkupView, SumberResmi } from "@/components/portal/Resmi";

function KontenBlock({ kunci, title, table, fallback }: { kunci: string; title: string; table: string; fallback?: React.ReactNode }) {
  const { content } = usePortal();
  const ada = content.konten.status === "ok" && content.konten.rows.some((k) => k.kunci === kunci && k.isi);
  if (!ada && fallback && content.konten.status !== "loading") return <>{fallback}</>;
  const state: LoadState<Konten> = content.konten.status === "ok"
    ? { status: "ok", rows: content.konten.rows.filter((k) => k.kunci === kunci) }
    : content.konten;
  return (
    <ContentState state={state} pending={{ title: `Menunggu ${title.toLowerCase()} resmi`, description: `${title} ditampilkan sesuai Panduan SMI BPSDMP setelah dokumennya dimuat.`, source: "Panduan SMI BPSDMP", table, compact: true }}>
      {(rows) => <div className="whitespace-pre-line rounded-2xl border border-line bg-white p-6 text-[14.5px] leading-7 text-navy">{rows[0].isi}</div>}
    </ContentState>
  );
}

export function TentangPage() {
  const { query } = useRouter();
  const bagian = query.get("bagian");
  useEffect(() => {
    if (bagian) setTimeout(() => document.getElementById(`pilar-${bagian}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
  }, [bagian]);

  return (
    <AppShell>
      <div className="grid items-center gap-10 pb-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-teal">Tentang SMI</div>
          <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-tight text-navy [text-wrap:balance] sm:text-[38px]">Satu sistem untuk mutu, integritas, dan pendidikan</h1>
          <p className="mt-4 max-w-2xl text-[15.5px] leading-7 text-navy-500">{KONSEP.pengertian}</p>
        </div>
        <PillarDiagram />
      </div>

      <section className="mb-14">
        <SectionHeading eyebrow="Komitmen penerapan" title="Mengapa BPSDMP menerapkan SMI" />
        <KontenBlock kunci={KONTEN_KEYS.latarBelakang} title="Latar belakang penerapan" table={PORTAL_TABLES.konten} fallback={
          <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            <p className="max-w-[80ch] text-[15px] leading-8 text-navy">{KEBIJAKAN.pembuka.replace(/, dengan komitmen untuk:$/, ".")}</p>
            <SumberResmi kode={KEBIJAKAN.kode} className="mt-4" />
          </div>
        } />
      </section>

      <section className="mb-14">
        <SectionHeading eyebrow="Tujuan dan manfaat" title="Apa yang diperoleh dari integrasi" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {KONSEP.manfaat.map((m) => (
            <div key={m.judul} className="rounded-2xl border border-line bg-white p-5">
              <CheckCircle2 className="size-5 text-teal" />
              <div className="mt-3 text-[14.5px] font-semibold text-navy">{m.judul}</div>
              <p className="mt-1.5 text-[13px] leading-6 text-navy-500">{m.isi}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <SectionHeading eyebrow="Integrasi tiga standar" title="Pilar SMI BPSDMP" />
        <div className="grid gap-4 lg:grid-cols-3">
          {PILAR.map((p) => (
            <article id={`pilar-${p.key}`} key={p.key} className={`scroll-mt-40 rounded-2xl border bg-white p-6 transition ${bagian === p.key ? "border-accent shadow-lift ring-4 ring-accent/10" : "border-line"}`}>
              <span className="inline-flex rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: p.soft, color: p.warna }}>{p.standar}</span>
              <h3 className="mt-3 text-[19px] font-semibold text-navy">{p.nama}</h3>
              <p className="mt-1 text-[13px] font-medium" style={{ color: p.warna }}>{p.fokus}</p>
              <p className="mt-3 text-[13.5px] leading-6 text-navy-500">{p.ringkas}</p>
              <ul className="mt-4 space-y-2 border-t border-line pt-4">
                {p.poin.map((x) => <li key={x} className="flex gap-2 text-[13px] leading-5 text-navy"><span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: p.warna }} />{x}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <SectionHeading eyebrow="Ruang lingkup" title="Batas penerapan SMI" description="Pernyataan ruang lingkup menetapkan batas organisasi, proses, produk dan layanan, lokasi, serta penerapan tiap standar." />
        <KontenBlock kunci={KONTEN_KEYS.ruangLingkup} title="Ruang lingkup SMI" table={PORTAL_TABLES.konten} fallback={<RuangLingkupView ringkas />} />
      </section>

      <section className="mb-14">
        <SectionHeading eyebrow="Prinsip kerja" title="Cara SMI dijalankan" />
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { icon: Workflow, judul: "Pendekatan proses", isi: KONSEP.pendekatanProses },
            { icon: ShieldAlert, judul: "Pemikiran berbasis risiko", isi: KONSEP.berbasisRisiko },
            { icon: RefreshCcw, judul: "Perbaikan berkelanjutan", isi: KONSEP.perbaikan },
          ].map((x) => (
            <div key={x.judul} className="rounded-2xl border border-line bg-white p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent"><x.icon className="size-5" /></span>
              <h3 className="mt-4 text-[16px] font-semibold text-navy">{x.judul}</h3>
              <p className="mt-2 text-[13.5px] leading-6 text-navy-500">{x.isi}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <SectionHeading eyebrow="Siklus PDCA" title="Plan, Do, Check, Act" description="Seluruh unsur SMI berjalan dalam siklus yang berulang, sehingga setiap evaluasi menghasilkan perbaikan." />
        <PdcaCycle />
      </section>

      <section>
        <SectionHeading eyebrow="Peran" title="Peran pimpinan dan pegawai" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {KONSEP.peran.map((r, i) => {
            const Icon = [Target, Layers, Lightbulb, Users2][i];
            return (
              <div key={r.siapa} className="rounded-2xl border border-line bg-white p-5">
                <Icon className="size-5 text-navy-400" />
                <div className="mt-3 text-[15px] font-semibold text-navy">{r.siapa}</div>
                <p className="mt-1.5 text-[13px] leading-6 text-navy-500">{r.isi}</p>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
