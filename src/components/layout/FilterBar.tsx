import { CalendarDays, Building2, Lock } from "lucide-react";
import { useData } from "@/hooks/useData";
import { BULAN } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Filter tahun, bulan (posisi s.d.), unit kerja, dan basis data. Mengikuti kewenangan peran. */
export function FilterBar({ className, hideUnit }: { className?: string; hideUnit?: boolean }) {
  const { filters, setFilters, years, data, unitLocked, canToggleUnverified } = useData();
  const units = (data?.units ?? []).slice().sort((a, b) => a.urutan - b.urutan);
  const lockedUnit = unitLocked ? units.find((u) => u.id === filters.unitId) : null;
  const sel = "h-9 appearance-none rounded-xl border border-line bg-white pl-9 pr-8 text-[13px] font-medium text-navy hover:border-navy-300 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-400" />
        <select id="filter-tahun" aria-label="Tahun" className={sel} value={filters.tahun} onChange={(e) => setFilters({ tahun: Number(e.target.value) })}>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-navy-400">s.d.</span>
        <select id="filter-bulan" aria-label="Posisi sampai dengan bulan" className={cn(sel, "pl-10")} value={filters.bulan} onChange={(e) => setFilters({ bulan: Number(e.target.value) })}>
          {BULAN.map((b, i) => <option key={b} value={i + 1}>{b}</option>)}
        </select>
      </div>
      {!hideUnit && (
        lockedUnit ? (
          <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-line bg-canvas px-3 text-[13px] font-medium text-navy-500" title="Tampilan dikunci ke unit kerja Anda">
            <Lock className="size-3.5" /> {lockedUnit.singkatan}
          </span>
        ) : (
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-400" />
            <select id="filter-unit" aria-label="Unit kerja" className={cn(sel, "max-w-[230px]")} value={filters.unitId} onChange={(e) => setFilters({ unitId: e.target.value })}>
              <option value="all">Seluruh unit kerja</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.singkatan}</option>)}
            </select>
          </div>
        )
      )}
      {canToggleUnverified && (
        <label className="inline-flex h-9 cursor-pointer select-none items-center gap-2 rounded-xl border border-line bg-white px-3 text-[13px] text-navy-500 hover:border-navy-300">
          <input
            id="filter-unverified"
            type="checkbox"
            className="size-3.5 accent-[#2563EB]"
            checked={filters.includeUnverified}
            onChange={(e) => setFilters({ includeUnverified: e.target.checked })}
          />
          Sertakan belum terverifikasi
        </label>
      )}
    </div>
  );
}
