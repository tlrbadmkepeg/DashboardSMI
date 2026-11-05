import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent, type WheelEvent as RWheelEvent } from "react";
import { Download, FileText, Maximize2, Minimize2, Minus, MousePointerClick, Plus, RotateCcw } from "lucide-react";
import { createPortal } from "react-dom";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";

/** Area klik pada gambar, dalam persen terhadap lebar/tinggi gambar asli. */
export interface Hotspot { id: string; label: string; x: number; y: number; w: number; h: number }

/** Gambar diagram resmi yang ditampilkan apa adanya. */
export interface DiagramResmi { src: string; judul: string; kode: string; namaBerkas: string; alt: string }

export const DIAGRAM = {
  strukturOrganisasi: {
    src: "diagram/struktur-organisasi-bpsdmp.png", judul: "Struktur Organisasi dan Unit Kerja dalam Lingkup SMI BPSDMP", kode: "PM.SMI.L4.2026",
    namaBerkas: "Struktur-Organisasi-BPSDMP-PM.SMI.L4.2026.png", alt: "Bagan struktur organisasi BPSDMP dan sepuluh unit kerja dalam lingkup SMI",
  },
  tataKelola: {
    src: "diagram/tata-kelola-smi.png", judul: "Struktur dan Bagan Tata Kelola SMI BPSDMP", kode: "PM.SMI.L5.2026",
    namaBerkas: "Bagan-Tata-Kelola-SMI-PM.SMI.L5.2026.png", alt: "Bagan tata kelola SMI BPSDMP: Manajemen Puncak, Tim SMI, Sekretariat Tim SMI, FKAP, Auditor Internal, unit kerja, pemilik proses",
  },
  petaProses: {
    src: "diagram/peta-proses-smi.png", judul: "Peta Proses dan Interaksi Proses SMI BPSDMP", kode: "PM.SMI.L6-2026",
    namaBerkas: "Peta-Proses-SMI-PM.SMI.L6-2026.png", alt: "Peta proses dan interaksi proses SMI BPSDMP: input, proses manajemen, utama, khusus, pendukung, output, umpan balik",
  },
} satisfies Record<string, DiagramResmi>;

const MIN = 0.4, MAX = 4;

/**
 * Penampil diagram resmi: zoom (tombol, Ctrl + gulir), geser (seret), layar penuh, unduh,
 * dan area klik opsional. Gambar tidak diubah; area klik hanya lapisan transparan di atasnya.
 */
export function DiagramViewer({
  diagram, hotspots, onHotspot, unduh = true, height = 560,
}: { diagram: DiagramResmi; hotspots?: Hotspot[]; onHotspot?: (id: string) => void; unduh?: boolean; height?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [full, setFull] = useState(false);
  const [showHs, setShowHs] = useState(!!hotspots?.length);
  const drag = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null);

  const fit = useCallback(() => {
    const el = box.current;
    if (!el || !nat) return;
    const s = Math.min(el.clientWidth / nat.w, el.clientHeight / nat.h);
    setScale(s);
    setPos({ x: (el.clientWidth - nat.w * s) / 2, y: (el.clientHeight - nat.h * s) / 2 });
  }, [nat]);

  useEffect(() => { fit(); }, [fit, full]);
  useEffect(() => {
    const r = () => fit();
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, [fit]);
  useEffect(() => {
    if (!full) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [full]);

  const zoomAt = (factor: number, cx?: number, cy?: number) => {
    const el = box.current;
    if (!el) return;
    const ox = cx ?? el.clientWidth / 2, oy = cy ?? el.clientHeight / 2;
    setScale((s) => {
      const ns = Math.max(MIN, Math.min(MAX, s * factor));
      setPos((p) => ({ x: ox - ((ox - p.x) * ns) / s, y: oy - ((oy - p.y) * ns) / s }));
      return ns;
    });
  };

  const onWheel = (e: RWheelEvent) => {
    if (!full && !e.ctrlKey) return;
    e.preventDefault();
    const r = box.current!.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
  };
  const onDown = (e: RPointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y, moved: false };
  };
  const onMove = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (d.moved) setPos({ x: d.px + dx, y: d.py + dy });
  };
  const onUp = () => { setTimeout(() => { drag.current = null; }, 0); };

  const btn = "grid size-9 place-items-center rounded-lg text-navy-600 transition hover:bg-canvas hover:text-navy disabled:opacity-40";
  const view = (
    <div className={cn(full ? "fixed inset-0 z-[80] flex flex-col bg-white" : "overflow-hidden rounded-2xl border border-line bg-white shadow-card")}>
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white px-3 py-2 sm:px-4">
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-[14px] font-bold text-navy">{diagram.judul}</div>
          <div className="text-[11.5px] text-navy-400">Gambar asli {diagram.kode} · seret untuk menggeser · Ctrl + gulir untuk zoom</div>
        </div>
        <div className="flex flex-wrap items-center gap-0.5">
          <button className={btn} onClick={() => zoomAt(1 / 1.25)} aria-label="Perkecil" disabled={scale <= MIN}><Minus className="size-4" /></button>
          <span className="w-12 text-center text-[12.5px] font-semibold tabular-nums text-navy-600">{Math.round(scale * 100)}%</span>
          <button className={btn} onClick={() => zoomAt(1.25)} aria-label="Perbesar" disabled={scale >= MAX}><Plus className="size-4" /></button>
          <button className={btn} onClick={fit} aria-label="Sesuaikan ukuran"><RotateCcw className="size-4" /></button>
          {hotspots?.length ? (
            <button onClick={() => setShowHs((v) => !v)} aria-pressed={showHs} className={cn("inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-semibold", showHs ? "bg-accent-soft text-accent" : "text-navy-500 hover:bg-canvas")}>
              <MousePointerClick className="size-4" /> <span className="hidden sm:inline">Area klik</span>
            </button>
          ) : null}
          <button className={btn} onClick={() => setFull((v) => !v)} aria-label={full ? "Keluar layar penuh" : "Layar penuh"}>{full ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}</button>
          {unduh && <a className={btn} href={diagram.src} download={diagram.namaBerkas} aria-label="Unduh gambar" title="Unduh gambar"><Download className="size-4" /></a>}
          <Link to={`/dokumen?q=${encodeURIComponent(diagram.kode)}`} className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy px-3 text-[12.5px] font-semibold text-white hover:bg-navy-700"><FileText className="size-4" /> <span className="hidden sm:inline">Dokumen resmi</span></Link>
        </div>
      </div>
      <div
        ref={box}
        className="relative min-h-0 flex-1 cursor-grab touch-none select-none overflow-hidden bg-[radial-gradient(circle_at_1px_1px,#E3E9F2_1px,transparent_0)] [background-size:18px_18px] active:cursor-grabbing"
        style={full ? undefined : { height }}
        onWheel={onWheel}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, width: nat?.w, height: nat?.h }}>
          <img
            src={diagram.src}
            alt={diagram.alt}
            draggable={false}
            onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            className="block max-w-none"
          />
          {showHs && hotspots?.map((h) => (
            <button
              key={h.id}
              title={h.label}
              aria-label={h.label}
              onClick={() => { if (!drag.current?.moved) onHotspot?.(h.id); }}
              className="group absolute rounded-lg border-2 border-accent/0 bg-accent/0 transition hover:border-accent hover:bg-accent/10 focus-visible:border-accent focus-visible:outline-none"
              style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}
            >
              <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-navy px-2 py-1 text-[11px] font-semibold text-white group-hover:block">{h.label}</span>
            </button>
          ))}
        </div>
        {!nat && <div className="absolute inset-0 grid place-items-center text-[13px] text-navy-400">Memuat diagram…</div>}
      </div>
    </div>
  );
  // Layar penuh dirender langsung di body agar tidak terpotong oleh elemen induk yang memakai transform.
  return full ? (
    <>
      <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-white text-[13px] text-navy-400" style={{ height }}>Diagram sedang dibuka dalam layar penuh</div>
      {createPortal(view, document.body)}
    </>
  ) : view;
}

/** Kartu pratinjau diagram untuk Beranda. */
export function DiagramThumb({ diagram, deskripsi, to }: { diagram: DiagramResmi; deskripsi: string; to: string }) {
  return (
    <Link to={to} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-line bg-white">
        <img src={diagram.src} alt={diagram.alt} loading="lazy" className="size-full object-contain p-2 transition duration-300 group-hover:scale-[1.03]" />
        <span className="absolute left-3 top-3 rounded-md bg-navy px-2 py-0.5 text-[11px] font-bold text-gold">{diagram.kode}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="font-display text-[16.5px] font-bold leading-snug text-navy">{diagram.judul.replace(/ BPSDMP$/, "")}</div>
        <p className="mt-1.5 flex-1 text-[14px] leading-6 text-navy-500">{deskripsi}</p>
        <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[13px] font-semibold text-white transition group-hover:bg-accent">Lihat Diagram Lengkap</span>
      </div>
    </Link>
  );
}
