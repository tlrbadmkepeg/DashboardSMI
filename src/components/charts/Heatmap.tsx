import { useState } from "react";
import type { SasaranSummary, UnitCell } from "@/domain/indicators";
import type { Unit } from "@/types/domain";
import { CAPAIAN_META } from "@/components/common/status";
import { fmtNum, fmtValue, BULAN_PENDEK } from "@/lib/format";
import { cn } from "@/lib/utils";
import { namaSingkat } from "@/content/resmi/pemetaan";

/**
 * Matriks unit × sasaran. Warna mengikuti status ketercapaian; sel bergaris berarti
 * unit tidak berkontribusi pada sasaran tersebut (sesuai tabel kontribusi_unit).
 */
export function Heatmap({ units, sasaran, onSelect, onSelectCell }: { units: Unit[]; sasaran: SasaranSummary[]; onSelect?: (sasaranId: string, unitId: string) => void; onSelectCell?: (c: UnitCell) => void }) {
  const [hover, setHover] = useState<UnitCell | null>(null);
  const cellOf = (s: SasaranSummary, u: Unit) => s.cells.find((c) => c.unit.id === u.id);

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <table className="border-separate border-spacing-[4px] text-[12px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[140px] bg-white pr-2 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-navy-400">Unit \ Sasaran</th>
              {sasaran.map((s) => (
                <th key={s.sasaran.id} className="w-10 min-w-[40px] text-center font-display font-bold text-navy-600" title={`Sasaran ${s.sasaran.nomor}: ${namaSingkat(s.sasaran)}`}>{s.sasaran.nomor}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr key={u.id}>
                <th className="sticky left-0 z-10 max-w-[170px] truncate bg-white pr-2 text-left text-[12.5px] font-semibold text-navy-600" title={u.nama}>{u.singkatan}</th>
                {sasaran.map((s) => {
                  const c = cellOf(s, u);
                  if (!c) return <td key={s.sasaran.id} />;
                  const meta = CAPAIAN_META[c.status];
                  const na = c.status === "na";
                  return (
                    <td key={s.sasaran.id} className="p-0">
                      <button
                        disabled={na}
                        onMouseEnter={() => setHover(c)}
                        onFocus={() => setHover(c)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => (onSelectCell ? onSelectCell(c) : onSelect?.(s.sasaran.id, u.id))}
                        aria-label={`${u.singkatan}, sasaran ${s.sasaran.nomor}: ${na ? "tidak berlaku" : meta.label}`}
                        title={na ? `${u.singkatan} tidak ditugaskan pada Sasaran ${s.sasaran.nomor}` : `${u.singkatan} · S${s.sasaran.nomor}: ${meta.label}`}
                        className={cn(
                          "grid h-9 w-10 place-items-center rounded-lg text-[10.5px] font-semibold transition-transform",
                          !na && "hover:scale-110 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                          na && "cursor-default",
                        )}
                        style={
                          na
                            ? { background: "repeating-linear-gradient(135deg,#F8FAFC 0 4px,#EEF2F6 4px 5px)" }
                            : { background: c.status === "nodata" ? "#E2E8F0" : meta.color, color: c.status === "nodata" ? "#64748B" : "#fff" }
                        }
                      >{!na && c.ratio !== null ? Math.round(c.ratio) : ""}</button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-navy-400">
          {([["memenuhi", "Hijau: memenuhi target"], ["dibawah", "Amber: belum memenuhi target"], ["nodata", "Abu-abu: belum ada laporan"]] as const).map(([k, l]) => (
            <span key={k} className="inline-flex items-center gap-1.5 font-medium">
              <span className="size-3.5 rounded" style={{ background: k === "nodata" ? "#E2E8F0" : CAPAIAN_META[k].color }} />
              {l}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3.5 rounded ring-1 ring-line" style={{ background: "repeating-linear-gradient(135deg,#F8FAFC 0 3px,#E2E8F0 3px 4px)" }} />
            Tidak berlaku (unit tidak ditugaskan)
          </span>
          <span className="text-navy-400">Angka dalam sel = capaian terhadap target (%)</span>
        </div>
        <div className="min-h-[20px] text-xs text-navy-500" aria-live="polite">
          {hover && hover.status !== "na" && (
            <span>
              <b className="font-semibold text-navy">{hover.unit.singkatan} · S{hover.sasaran.nomor}</b>
              {" · "}
              {hover.value !== null
                ? `${fmtValue(hover.value, hover.sasaran.satuan)} (${fmtNum(hover.ratio, 0)}% dari target, ${BULAN_PENDEK[(hover.report?.bulan ?? 1) - 1]})`
                : "belum ada laporan"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
