import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Nilai untuk pengurutan. Tanpa ini kolom tidak dapat diurutkan. */
  sortValue?: (row: T) => string | number | null;
  className?: string;
  headerClassName?: string;
}

/** Tabel modern dengan pencarian, pengurutan, dan pagination (sisi klien). */
export function DataTable<T>({
  rows, columns, searchText, onRowClick, pageSize = 10, toolbar, empty, initialSort, rowKey,
}: {
  rows: T[];
  columns: Column<T>[];
  searchText?: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  toolbar?: ReactNode;
  empty?: ReactNode;
  initialSort?: { key: string; dir: "asc" | "desc" };
  rowKey: (row: T) => string;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(initialSort ?? null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let out = term && searchText ? rows.filter((r) => searchText(r).toLowerCase().includes(term)) : rows;
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        out = [...out].sort((a, b) => {
          const va = col.sortValue!(a), vb = col.sortValue!(b);
          if (va === vb) return 0;
          if (va === null) return 1;
          if (vb === null) return -1;
          const r = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "id");
          return sort.dir === "asc" ? r : -r;
        });
      }
    }
    return out;
  }, [rows, q, sort, columns, searchText]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div>
      {(searchText || toolbar) && (
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 sm:px-6">
          {searchText && (
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
              <input
                id="table-search"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Cari…"
                className="h-9 w-full rounded-xl border border-line bg-canvas/60 pl-9 pr-3 text-sm text-navy placeholder:text-navy-300 focus:border-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-accent/10"
              />
            </div>
          )}
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas/70">
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th key={c.key} className={cn("px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.04em] text-navy-400 first:pl-5 last:pr-5 sm:first:pl-6", c.headerClassName)}>
                    {c.sortValue ? (
                      <button
                        className="inline-flex items-center gap-1 hover:text-navy"
                        onClick={() => setSort(active ? { key: c.key, dir: sort!.dir === "asc" ? "desc" : "asc" } : { key: c.key, dir: "asc" })}
                      >
                        {c.header}
                        {active ? (sort!.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ArrowUpDown className="size-3 opacity-40" />}
                      </button>
                    ) : c.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <tr
                key={rowKey(r)}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={cn("border-b border-line/70 transition-colors last:border-0", onRowClick && "cursor-pointer hover:bg-accent-soft/40")}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3.5 align-top text-navy first:pl-5 last:pr-5 sm:first:pl-6", c.className)}>{c.cell(r)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {slice.length === 0 && (empty ?? <p className="px-6 py-10 text-center text-sm text-navy-400">Tidak ada data yang cocok.</p>)}
      </div>
      {filtered.length > pageSize && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 text-[13px] text-navy-400 sm:px-6">
          <span>
            {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, filtered.length)} dari {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button className="rounded-lg p-1.5 hover:bg-canvas disabled:opacity-40" disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Halaman sebelumnya">
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-2 tabular-nums text-navy">{current} / {pages}</span>
            <button className="rounded-lg p-1.5 hover:bg-canvas disabled:opacity-40" disabled={current === pages} onClick={() => setPage(current + 1)} aria-label="Halaman berikutnya">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
