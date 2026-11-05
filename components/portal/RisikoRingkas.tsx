import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { LEVEL_RISIKO, MATRIKS_RISIKO_2026, isRisikoSensitif, warnaLevel, type RisikoMatriks } from "@/content/resmi/matriksRisiko";
import { cn } from "@/lib/utils";

/** Nama ringkas sasaran/tujuan risiko (kolom pertama workbook) untuk label grafik. */
export const LABEL_SASARAN_RISIKO: Record<number, string> = {
  1: "Layanan bebas gratifikasi/penyuapan",
  2: "Dampak alumni pelatihan aparatur",
  3: "Kelulusan peserta aparatur ≥80",
  4: "Pemahaman SDM Metrologi, Mutu & Jasa",
  5: "Pemahaman peserta ekspor & jasa",
  6: "Kesiapan ekspor peserta ECP",
  7: "Lulusan bekerja di bidangnya",
  8: "Publikasi penelitian",
  9: "Kerja sama ditindaklanjuti",
  10: "Ketersediaan SDM kompeten",
  11: "Indeks Kepuasan Pelanggan (SKM)",
};

export const PERLU_PERHATIAN = (r: RisikoMatriks) => r.level === "Tinggi" || r.level === "Sangat Tinggi";

export function useRingkasRisiko(rows: RisikoMatriks[] = MATRIKS_RISIKO_2026) {
  return useMemo(() => {
    const level = LEVEL_RISIKO.map((l) => ({ ...l, n: rows.filter((r) => r.level === l.level).length }));
    const perSasaran = Array.from(new Set(rows.map((r) => r.no))).sort((a, b) => a - b).map((no) => {
      const rs = rows.filter((r) => r.no === no);
      return { no, label: LABEL_SASARAN_RISIKO[no] ?? `Sasaran ${no}`, n: rs.length, perhatian: rs.filter(PERLU_PERHATIAN).length, level: LEVEL_RISIKO.map((l) => rs.filter((r) => r.level === l.level).length) };
    });
    const grid = new Map<string, number>();
    rows.forEach((r) => r.k && r.d && grid.set(`${r.k}-${r.d}`, (grid.get(`${r.k}-${r.d}`) ?? 0) + 1));
    return {
      total: rows.length,
      sasaran: perSasaran.length,
      perhatian: rows.filter(PERLU_PERHATIAN).length,
      penyuapan: rows.filter(isRisikoSensitif).length,
      berpengendalian: rows.filter((r) => r.pengendalian.trim()).length,
      residual: rows.filter((r) => r.rs !== null || r.rl.trim()).length,
      respons: Array.from(rows.reduce((m, r) => m.set(r.respons || "—", (m.get(r.respons || "—") ?? 0) + 1), new Map<string, number>())),
      level, perSasaran, grid,
    };
  }, [rows]);
}

/** Donut distribusi level risiko inheren. */
export function LevelDonut({ rows, height = 220 }: { rows?: RisikoMatriks[]; height?: number }) {
  const r = useRingkasRisiko(rows);
  const data = r.level.filter((l) => l.n);
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,200px)_1fr]">
      <div className="relative" style={{ height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="n" nameKey="level" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none" isAnimationActive={false}>
              {data.map((l) => <Cell key={l.level} fill={l.warna} />)}
            </Pie>
            <Tooltip formatter={(v: any, n: any) => [`${v} risiko`, n]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div><div className="font-display text-[30px] font-extrabold leading-none text-navy tabular-nums">{r.total}</div><div className="mt-1 text-[11.5px] font-medium text-navy-400">risiko</div></div>
        </div>
      </div>
      <ul className="space-y-1.5">
        {r.level.slice().reverse().map((l) => (
          <li key={l.level} className="grid grid-cols-[12px_1fr_auto] items-center gap-2.5 text-[13.5px]" title={`${l.level} · ${l.rentang}`}>
            <span className="size-3 rounded-[4px]" style={{ background: l.warna }} />
            <span className="text-navy-600">{l.level} <span className="text-[11.5px] text-navy-300">{l.rentang}</span></span>
            <span className="font-display font-bold tabular-nums text-navy">{l.n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Peta panas Kemungkinan × Keparahan berisi JUMLAH risiko per sel (skala 1–5 sesuai workbook).
 * Warna sel kosong hanya menandai zona; skor per sel tidak dihitung karena workbook tidak memakai perkalian sederhana.
 */
export function HeatmapRisiko({ rows, onCell, selected }: { rows?: RisikoMatriks[]; onCell?: (k: number, d: number) => void; selected?: string | null }) {
  const r = useRingkasRisiko(rows);
  const all = rows ?? MATRIKS_RISIKO_2026;
  const warnaSel = (k: number, d: number) => {
    const ada = all.filter((x) => x.k === k && x.d === d);
    if (ada.length) return warnaLevel(ada[0].level);
    return null;
  };
  return (
    <div className="flex gap-2">
      <div className="flex w-5 items-center justify-center"><span className="-rotate-90 whitespace-nowrap text-[11.5px] font-semibold text-navy-400">Kemungkinan (K)</span></div>
      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-[22px_repeat(5,minmax(0,1fr))] gap-1.5">
          {[5, 4, 3, 2, 1].map((k) => (
            <div key={k} className="contents">
              <span className="grid place-items-center text-[12px] font-semibold text-navy-400">{k}</span>
              {[1, 2, 3, 4, 5].map((d) => {
                const n = r.grid.get(`${k}-${d}`) ?? 0;
                const c = warnaSel(k, d);
                const key = `${k}-${d}`;
                return (
                  <button
                    key={d}
                    disabled={!n || !onCell}
                    onClick={() => onCell?.(k, d)}
                    title={n ? `K${k} × D${d}: ${n} risiko` : `K${k} × D${d}: tidak ada risiko`}
                    className={cn("grid aspect-[1.35] place-items-center rounded-lg border text-[15px] font-bold tabular-nums transition", n ? "border-transparent text-white shadow-sm" : "border-dashed border-line bg-slate-50 text-transparent", n && onCell && "hover:scale-[1.04]", selected === key && "ring-2 ring-navy ring-offset-2")}
                    style={n && c ? { background: c } : undefined}
                  >{n || "·"}</button>
                );
              })}
            </div>
          ))}
          <span />
          {[1, 2, 3, 4, 5].map((d) => <span key={d} className="text-center text-[12px] font-semibold text-navy-400">{d}</span>)}
        </div>
        <div className="mt-1 text-center text-[11.5px] font-semibold text-navy-400">Keparahan / Dampak (D)</div>
      </div>
    </div>
  );
}

/** Batang bertumpuk jumlah risiko per sasaran/tujuan menurut level. */
export function PerSasaranBars({ rows, onSelect }: { rows?: RisikoMatriks[]; onSelect?: (no: number) => void }) {
  const r = useRingkasRisiko(rows);
  const max = Math.max(...r.perSasaran.map((s) => s.n), 1);
  return (
    <ul className="space-y-2">
      {r.perSasaran.map((s) => (
        <li key={s.no}>
          <button disabled={!onSelect} onClick={() => onSelect?.(s.no)} className={cn("grid w-full grid-cols-[minmax(0,190px)_1fr_28px] items-center gap-3 rounded-lg px-1 py-1 text-left", onSelect && "hover:bg-canvas")}>
            <span className="truncate text-[13px] text-navy-600" title={s.label}><span className="mr-1.5 font-semibold text-navy-400">{s.no}.</span>{s.label}</span>
            <span className="flex h-3.5 overflow-hidden rounded-full bg-slate-100" style={{ width: `${(s.n / max) * 100}%` }}>
              {s.level.map((n, i) => n ? <span key={i} title={`${LEVEL_RISIKO[i].level}: ${n}`} style={{ width: `${(n / s.n) * 100}%`, background: LEVEL_RISIKO[i].warna }} /> : null)}
            </span>
            <span className="text-right font-display text-[13.5px] font-bold tabular-nums text-navy">{s.n}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
