import type { ReactNode } from "react";
import { FileCheck2, MapPin } from "lucide-react";
import type { LoadState } from "@/types/portal";
import { DOKUMEN_RESMI, RUANG_LINGKUP } from "@/content/resmi/dokumen";
import { UNIT_RESMI } from "@/content/resmi/organisasi";
import { cn } from "@/lib/utils";

/** Baris dari basis data bila tersedia dan tidak kosong; selain itu null (pakai isi dokumen resmi). */
export function dbRows<T>(state: LoadState<T>): T[] | null {
  return state.status === "ok" && state.rows.length ? state.rows : null;
}

/** Label sumber dokumen resmi: kode · revisi · tanggal. */
export function SumberResmi({ kode, className, dark }: { kode: string | string[]; className?: string; dark?: boolean }) {
  const list = Array.isArray(kode) ? kode : [kode];
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {list.map((k) => {
        const d = DOKUMEN_RESMI.find((x) => x.kode === k);
        return (
          <span key={k} title={d?.judul} className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] ring-1",
            dark ? "bg-white/10 text-white/80 ring-white/15" : "bg-canvas text-navy-500 ring-line",
          )}>
            <FileCheck2 className="size-3.5 shrink-0" />
            Sumber: {k}{d ? ` · Rev. ${d.revisi} · 22 Juni 2026` : ""}
          </span>
        );
      })}
    </div>
  );
}

/** Tabel sederhana untuk transkripsi matriks dokumen resmi. Bergulir mendatar di layar sempit. */
export function TabelResmi({ head, rows, widths, dense }: { head: string[]; rows: ReactNode[][]; widths?: string[]; dense?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full border-collapse text-left text-[13px] leading-6">
        <thead className="bg-canvas/80 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-navy-400">
          <tr>{head.map((h, i) => <th key={h} className={cn("border-b border-line px-4 py-2.5 align-bottom", widths?.[i])}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line/70 align-top last:border-0">
              {r.map((c, j) => <td key={j} className={cn("px-4 text-navy", dense ? "py-2" : "py-3", j > 0 && "text-navy-700", widths?.[j])}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Kode({ children }: { children: ReactNode }) {
  return <span className="whitespace-nowrap rounded-md bg-navy/5 px-1.5 py-0.5 font-mono text-[11.5px] font-semibold text-navy">{children}</span>;
}

/** Ruang lingkup SMI sesuai PM.SMI.L1.2026. */
export function RuangLingkupView({ ringkas }: { ringkas?: boolean }) {
  const r = RUANG_LINGKUP;
  return (
    <div className="space-y-8">
      <article className="relative overflow-hidden rounded-2xl bg-navy p-6 text-white sm:p-8">
        <div className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-white/55">Pernyataan ruang lingkup</div>
        <p className="mt-3 max-w-[78ch] text-[16px] leading-8 sm:text-[17px]">{r.pernyataan}</p>
        <p className="mt-4 max-w-[78ch] text-[12.5px] leading-6 text-white/60">{r.catatanPernyataan}</p>
        <SumberResmi kode={r.kode} dark className="mt-5" />
      </article>

      {!ringkas && (
        <div className="grid gap-4 lg:grid-cols-2">
          {r.tujuan.map((t, i) => <p key={i} className="rounded-2xl border border-line bg-white p-5 text-[13.5px] leading-7 text-navy-700">{t}</p>)}
        </div>
      )}

      <section>
        <h3 className="mb-3 text-[16px] font-semibold text-navy">Batas organisasi: sepuluh unit kerja</h3>
        <p className="mb-4 max-w-[90ch] text-[13.5px] leading-7 text-navy-500">{r.batasOrganisasi}</p>
        <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {UNIT_RESMI.map((u) => (
            <li key={u.no} className="rounded-xl border border-line bg-white px-3.5 py-3">
              <span className="text-[11px] font-semibold text-navy-300">{String(u.no).padStart(2, "0")}</span>
              <span className="block text-[13px] font-medium leading-5 text-navy">{u.nama}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="mb-3 text-[16px] font-semibold text-navy">Kelompok proses yang tercakup</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {r.kelompokProses.map(([j, isi]) => (
            <div key={j} className="rounded-2xl border border-line bg-white p-5">
              <div className="text-[14px] font-semibold text-navy">{j}</div>
              <p className="mt-1.5 text-[13px] leading-6 text-navy-500">{isi}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <div className="min-w-0">
          <h3 className="mb-3 text-[16px] font-semibold text-navy">Produk dan layanan</h3>
          <ul className="space-y-2">
            {r.produk.map((p, i) => <li key={i} className="flex gap-3 text-[13.5px] leading-6 text-navy-700"><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-teal" />{p}</li>)}
          </ul>
          <p className="mt-4 rounded-xl bg-canvas p-4 text-[13px] leading-6 text-navy-500">{r.penerimaManfaat}</p>
        </div>
        <div className="min-w-0">
          <h3 className="mb-3 text-[16px] font-semibold text-navy">Lokasi dan wilayah layanan</h3>
          <ul className="space-y-2">
            {r.lokasi.map(([u, l, w]) => (
              <li key={u} className="rounded-xl border border-line bg-white px-4 py-3">
                <div className="text-[13.5px] font-medium text-navy">{u}</div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 text-[12.5px] text-navy-400"><span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{l}</span><span>{w}</span></div>
              </li>
            ))}
          </ul>
          {!ringkas && <p className="mt-4 text-[13px] leading-6 text-navy-500">{r.media}</p>}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-[16px] font-semibold text-navy">Penerapan setiap standar</h3>
        <div className="grid gap-3 lg:grid-cols-3">
          {r.penerapanStandar.map(([s, isi]) => (
            <div key={s} className="rounded-2xl border border-line bg-white p-5">
              <span className="inline-flex rounded-full bg-accent-soft px-2.5 py-1 text-[11.5px] font-semibold text-accent">{s}</span>
              <p className="mt-3 text-[13px] leading-6 text-navy-700">{isi}</p>
            </div>
          ))}
        </div>
      </section>

      {!ringkas && (
        <section className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
          <div>
            <h3 className="mb-3 text-[16px] font-semibold text-navy">Proses oleh pihak eksternal dan antarmuka</h3>
            {r.penyediaEksternal.map((p, i) => <p key={i} className="mb-3 text-[13.5px] leading-7 text-navy-700">{p}</p>)}
          </div>
          <div>
            <h3 className="mb-3 text-[16px] font-semibold text-navy">Ketidakberlakuan persyaratan</h3>
            <ul className="space-y-2">
              {r.ketidakberlakuan.map((p, i) => <li key={i} className="flex gap-3 text-[13.5px] leading-6 text-navy-700"><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-navy-300" />{p}</li>)}
            </ul>
          </div>
        </section>
      )}

      {!ringkas && <p className="rounded-xl border border-line bg-white p-4 text-[13px] leading-6 text-navy-500"><b className="font-semibold text-navy">Peninjauan ruang lingkup.</b> {r.peninjauan}</p>}
    </div>
  );
}
