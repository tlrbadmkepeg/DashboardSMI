import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { PILAR, ALUR_KEBIJAKAN, KONSEP, type PilarKey } from "@/content/portal";
import { useRouter } from "@/lib/router";
import { cn } from "@/lib/utils";

/**
 * Diagram integrasi tiga standar: tiga lingkaran yang beririsan dengan SMI di tengah.
 * Setiap lingkaran dapat diklik untuk membuka penjelasan pilar.
 */
export function PillarDiagram() {
  const { navigate } = useRouter();
  const [hover, setHover] = useState<PilarKey | null>(null);
  const pos: Record<PilarKey, { cx: number; cy: number; lx: number; ly: number }> = {
    mutu: { cx: 170, cy: 150, lx: 140, ly: 112 },
    integritas: { cx: 290, cy: 150, lx: 320, ly: 112 },
    pendidikan: { cx: 230, cy: 252, lx: 230, ly: 300 },
  };
  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      <svg viewBox="0 0 460 380" className="h-auto w-full" role="img" aria-label="Diagram integrasi tiga standar dalam SMI BPSDMP">
        <defs>
          {PILAR.map((p) => (
            <radialGradient key={p.key} id={`g-${p.key}`} cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor={p.warna} stopOpacity="0.20" />
              <stop offset="100%" stopColor={p.warna} stopOpacity="0.07" />
            </radialGradient>
          ))}
        </defs>
        <circle cx="230" cy="185" r="176" fill="none" stroke="#E5EAF1" strokeDasharray="3 6" />
        {PILAR.map((p) => {
          const c = pos[p.key];
          const dim = hover && hover !== p.key;
          return (
            <g
              key={p.key}
              onMouseEnter={() => setHover(p.key)}
              onMouseLeave={() => setHover(null)}
              onClick={() => navigate(`/tentang?bagian=${p.key}`)}
              style={{ cursor: "pointer", transition: "opacity .2s" }}
              opacity={dim ? 0.45 : 1}
              tabIndex={0}
              role="button"
              aria-label={`${p.nama}, ${p.standar}`}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/tentang?bagian=${p.key}`)}
            >
              <circle cx={c.cx} cy={c.cy} r="104" fill={`url(#g-${p.key})`} stroke={p.warna} strokeOpacity="0.55" strokeWidth={hover === p.key ? 2.5 : 1.5} />
              <text x={c.lx} y={c.ly} textAnchor="middle" fill={p.warna} fontSize="11.5" fontWeight="600" letterSpacing="0.06em">{p.standar.replace("SNI ", "")}</text>
              <text x={c.lx} y={c.ly + 17} textAnchor="middle" fill="#142D4E" fontSize="13.5" fontWeight="600">{p.nama}</text>
            </g>
          );
        })}
        <circle cx="230" cy="186" r="40" fill="#142D4E" />
        <text x="230" y="182" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700" letterSpacing="0.06em">SMI</text>
        <text x="230" y="199" textAnchor="middle" fill="#fff" fillOpacity="0.7" fontSize="10.5" fontWeight="500">BPSDMP</text>
      </svg>
      <p className="mt-1 text-center text-[12px] text-navy-400">Klik lingkaran untuk membaca tiap standar</p>
    </div>
  );
}

/** Alur Kebijakan SMI → 18 Sasaran Mutu → ... → Perbaikan Berkelanjutan. */
export function PolicyFlow() {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {ALUR_KEBIJAKAN.map((a, i) => (
        <li key={a.judul} className="relative">
          <div className={cn(
            "flex h-full flex-col rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-card",
            i === 0 ? "border-navy bg-navy text-white" : i === ALUR_KEBIJAKAN.length - 1 ? "border-teal/30 bg-teal-soft" : "border-line bg-white",
          )}>
            <span className={cn("text-[11px] font-semibold tabular-nums tracking-[0.08em]", i === 0 ? "text-white/60" : "text-navy-300")}>LANGKAH {i + 1}</span>
            <span className={cn("mt-1.5 text-[14.5px] font-semibold leading-snug", i === 0 ? "text-white" : "text-navy")}>{a.judul}</span>
            <span className={cn("mt-1 text-[12.5px] leading-5", i === 0 ? "text-white/70" : "text-navy-400")}>{a.ket}</span>
          </div>
          {i < ALUR_KEBIJAKAN.length - 1 && (
            <span className="absolute -right-[11px] top-1/2 z-10 hidden size-5 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-navy-400 lg:grid">
              <ChevronRight className="size-3" />
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Siklus PDCA sebagai roda empat kuadran. */
export function PdcaCycle() {
  const colors = ["#2563EB", "#0F766E", "#B45309", "#142D4E"];
  return (
    <div className="grid items-center gap-8 md:grid-cols-[260px_1fr]">
      <svg viewBox="0 0 240 240" className="mx-auto h-auto w-full max-w-[240px]" role="img" aria-label="Siklus PDCA">
        {KONSEP.pdca.map((p, i) => {
          const a0 = (i * 90 - 90) * (Math.PI / 180), a1 = ((i + 1) * 90 - 90 - 4) * (Math.PI / 180);
          const r1 = 112, r0 = 58, cx = 120, cy = 120;
          const pt = (r: number, a: number) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
          const d = `M${pt(r0, a0)} L${pt(r1, a0)} A${r1},${r1} 0 0 1 ${pt(r1, a1)} L${pt(r0, a1)} A${r0},${r0} 0 0 0 ${pt(r0, a0)} Z`;
          const am = (a0 + a1) / 2;
          const [tx, ty] = [cx + 85 * Math.cos(am), cy + 85 * Math.sin(am)];
          return (
            <g key={p.fase}>
              <path d={d} fill={colors[i]} fillOpacity="0.9" />
              <text x={tx} y={ty + 5} textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700">{p.fase}</text>
            </g>
          );
        })}
        <circle cx="120" cy="120" r="50" fill="#fff" />
        <text x="120" y="116" textAnchor="middle" fill="#142D4E" fontSize="12" fontWeight="600">Perbaikan</text>
        <text x="120" y="132" textAnchor="middle" fill="#142D4E" fontSize="12" fontWeight="600">berkelanjutan</text>
      </svg>
      <ol className="grid gap-3 sm:grid-cols-2">
        {KONSEP.pdca.map((p, i) => (
          <li key={p.fase} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-md px-2 py-0.5 text-[11.5px] font-bold text-white" style={{ background: colors[i] }}>{p.fase}</span>
              <span className="text-[14px] font-semibold text-navy">{p.nama}</span>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-navy-500">{p.isi}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
