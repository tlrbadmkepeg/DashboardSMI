import { useEffect, useRef, useState } from "react";
import { ArrowRight, CornerDownLeft, Search, X } from "lucide-react";
import { useRouter } from "@/lib/router";
import { searchItems, useSearchIndex } from "./searchIndex";

const SARAN = ["Kebijakan", "Sasaran 3", "SOP", "Risiko penyuapan", "Audit internal", "Akmet"];

/** Pencarian cepat (Ctrl/⌘ K) atas halaman, sasaran, unit, dokumen, SOP, dan kegiatan. */
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const index = useSearchIndex();
  const { navigate } = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const results = searchItems(index, q, 12);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setSel(0);
    setTimeout(() => input.current?.focus(), 20);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onClose]);

  if (!open) return null;
  const go = (path: string) => { onClose(); navigate(path); };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="Pencarian">
      <div className="absolute inset-0 bg-navy/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-lift animate-fade-up">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-5 text-navy-300" />
          <input
            id="search-input"
            ref={input}
            value={q}
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
              if (e.key === "Enter") {
                if (results[sel]) go(results[sel].path);
                else if (q.trim()) go(`/cari?q=${encodeURIComponent(q.trim())}`);
              }
            }}
            placeholder="Cari kebijakan, sasaran, unit, dokumen, atau SOP…"
            className="h-14 flex-1 bg-transparent text-[15px] text-navy placeholder:text-navy-300 focus:outline-none"
          />
          <button onClick={onClose} className="rounded-lg p-1.5 text-navy-300 hover:bg-canvas hover:text-navy" aria-label="Tutup pencarian"><X className="size-4" /></button>
        </div>
        <div className="max-h-[56vh] overflow-y-auto p-2">
          {!q.trim() ? (
            <div className="p-3">
              <div className="mb-2 text-xs font-medium text-navy-400">Coba cari</div>
              <div className="flex flex-wrap gap-1.5">
                {SARAN.map((s) => <button key={s} onClick={() => setQ(s)} className="rounded-full border border-line px-3 py-1 text-[12.5px] text-navy-500 hover:border-accent/40 hover:text-accent">{s}</button>)}
              </div>
            </div>
          ) : results.length ? (
            <ul>
              {results.map((r, i) => (
                <li key={`${r.path}-${i}`}>
                  <button
                    onMouseEnter={() => setSel(i)}
                    onClick={() => go(r.path)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${i === sel ? "bg-accent-soft" : ""}`}
                  >
                    <span className="w-24 shrink-0 text-[11px] font-medium uppercase tracking-[0.05em] text-navy-300">{r.group}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium text-navy">{r.title}</span>
                      <span className="block truncate text-xs text-navy-400">{r.subtitle}</span>
                    </span>
                    {i === sel && <CornerDownLeft className="size-4 text-accent" />}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-[13px] text-navy-400">Tidak ditemukan hasil untuk "{q}".</p>
          )}
        </div>
        {q.trim() && (
          <button onClick={() => go(`/cari?q=${encodeURIComponent(q.trim())}`)} className="flex w-full items-center justify-between border-t border-line bg-canvas/60 px-4 py-3 text-[13px] font-medium text-accent hover:bg-canvas">
            Lihat semua hasil untuk "{q.trim()}" <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
