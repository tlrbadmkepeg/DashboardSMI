import { useState } from "react";
import { ExternalLink, Folder, FolderOpen, Info, Search } from "lucide-react";
import { KELOMPOK_SOP } from "@/content/resmi/sop";
import { cn } from "@/lib/utils";

/** Dua tab folder SOP (Sekretariat SMI dan Sekretariat BPSDMP) yang membuka Google Drive di tab baru. */
export function SopFolders() {
  const [tab, setTab] = useState<"smi" | "bpsdmp">("smi");
  const [q, setQ] = useState("");
  const g = KELOMPOK_SOP.find((k) => k.id === tab)!;
  const rows = g.folder.filter((f) => !q || `${f.huruf} ${f.nama}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" className="flex gap-1 rounded-xl border border-line bg-white p-1">
          {KELOMPOK_SOP.map((k) => (
            <button key={k.id} role="tab" aria-selected={tab === k.id} onClick={() => setTab(k.id)} className={cn("inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition", tab === k.id ? "bg-navy text-white" : "text-navy-500 hover:bg-canvas")}>
              {k.judul} <span className={cn("rounded-md px-1.5 text-[11px] tabular-nums", tab === k.id ? "bg-white/15 text-gold" : "bg-canvas text-navy-400")}>{k.folder.length}</span>
            </button>
          ))}
        </div>
        <label className="relative ml-auto w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kategori SOP…" aria-label="Cari kategori SOP" className="h-10 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-[13.5px] text-navy focus:border-accent focus:outline-none" />
        </label>
      </div>
      <p className="mt-3 text-[13.5px] text-navy-500">{g.ringkas}. Setiap kategori tersimpan sebagai folder Google Drive.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((f) => (
          <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift">
            <div className="flex items-start gap-3.5">
              <span className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold-strong">
                <Folder className="size-6 transition group-hover:opacity-0" />
                <FolderOpen className="absolute size-6 opacity-0 transition group-hover:opacity-100" />
              </span>
              <div className="min-w-0">
                <div className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-teal">Kategori {f.huruf}</div>
                <div className="mt-0.5 font-display text-[16px] font-bold leading-snug text-navy">{f.nama}</div>
                {f.deskripsi && <p className="mt-1 text-[13px] leading-5 text-navy-500">{f.deskripsi}</p>}
              </div>
            </div>
            <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[13px] font-semibold text-white transition group-hover:bg-accent">Buka Folder <ExternalLink className="size-3.5" /></span>
          </a>
        ))}
        {!rows.length && <div className="col-span-full rounded-2xl border border-dashed border-line bg-white p-8 text-center text-[13.5px] text-navy-400">Tidak ada kategori yang cocok dengan “{q}”.</div>}
      </div>
      <p className="mt-4 flex gap-2 text-[12.5px] leading-5 text-navy-400"><Info className="mt-0.5 size-3.5 shrink-0" />Folder dibuka di Google Drive pada tab baru. Akses mengikuti izin berbagi yang ditetapkan pemilik folder; jika diminta masuk atau meminta akses, hubungi Sekretariat Tim SMI.</p>
    </div>
  );
}
