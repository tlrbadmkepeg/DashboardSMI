import type { ReactNode } from "react";
import { FileClock, Lock, AlertTriangle, Database } from "lucide-react";
import type { LoadState } from "@/types/portal";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/auth/AuthProvider";
import { cn } from "@/lib/utils";

/**
 * Keadaan "menunggu dokumen resmi". Dipakai di semua bagian yang isinya harus berasal
 * dari dokumen resmi BPSDMP. Menjelaskan apa yang akan tampil dan dari mana sumbernya.
 */
export function PendingContent({
  title, description, source, table, kind = "belum-tersedia", compact, className, children,
}: {
  title: string;
  description?: ReactNode;
  source?: string;
  table?: string;
  kind?: "belum-tersedia" | "tidak-berwenang" | "galat";
  compact?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const { profile } = useAuth();
  const Icon = kind === "tidak-berwenang" ? Lock : kind === "galat" ? AlertTriangle : FileClock;
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-dashed text-left",
      kind === "galat" ? "border-bad/30 bg-bad-soft/40" : "border-navy-300/60 bg-white",
      compact ? "p-5" : "p-6 sm:p-8",
      className,
    )}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", kind === "tidak-berwenang" ? "bg-navy/5 text-navy" : kind === "galat" ? "bg-bad-soft text-bad" : "bg-teal-soft text-teal")}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-navy">{title}</p>
          {description && <div className="mt-1.5 max-w-2xl text-[13.5px] leading-6 text-navy-500">{description}</div>}
          {(source || (table && profile)) && (
            <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
              {source && <span className="rounded-full bg-canvas px-2.5 py-1 text-navy-500 ring-1 ring-line">Sumber: {source}</span>}
              {table && profile && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-1 font-mono text-navy-500 ring-1 ring-line">
                  <Database className="size-3" /> {table}
                </span>
              )}
            </div>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </div>
  );
}

/** Merender LoadState: kerangka saat memuat, keadaan menunggu bila kosong, isi bila tersedia. */
export function ContentState<T>({
  state, pending, children, skeleton,
}: {
  state: LoadState<T>;
  pending: { title: string; description?: ReactNode; source?: string; table?: string; compact?: boolean };
  children: (rows: T[]) => ReactNode;
  skeleton?: ReactNode;
}) {
  if (state.status === "loading") return <>{skeleton ?? <Skeleton className="h-40 rounded-2xl" />}</>;
  if (state.status === "unavailable") {
    return (
      <PendingContent
        {...pending}
        kind={state.kind}
        title={state.kind === "tidak-berwenang" ? "Informasi terbatas" : state.kind === "galat" ? "Data belum dapat dimuat" : pending.title}
        description={state.kind === "belum-tersedia" ? pending.description : state.reason}
      />
    );
  }
  if (state.rows.length === 0) return <PendingContent {...pending} />;
  return <>{children(state.rows)}</>;
}

export function SectionHeading({
  eyebrow, title, description, action, className, center, dark,
}: { eyebrow?: string; title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string; center?: boolean; dark?: boolean }) {
  return (
    <div className={cn("mb-7 flex flex-wrap items-end justify-between gap-4", center && "flex-col items-center text-center", className)}>
      <div className={cn("min-w-0 max-w-3xl", center && "mx-auto")}>
        {eyebrow && (
          <div className={cn("mb-2.5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em]", dark ? "text-gold-light" : "text-teal", center && "justify-center")}>
            <span className="h-[3px] w-6 rounded-full bg-gold" />{eyebrow}
          </div>
        )}
        <h2 className={cn("font-display text-[26px] font-bold leading-[1.15] tracking-tight [text-wrap:balance] sm:text-[32px]", dark ? "text-white" : "text-navy")}>{title}</h2>
        {description && <p className={cn("mt-2.5 text-[15px] leading-7", dark ? "text-white/70" : "text-navy-500")}>{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Pita lebar penuh untuk menyusun Beranda per bagian. */
export function Band({ children, tone = "white", className, id }: { children: ReactNode; tone?: "white" | "canvas" | "navy" | "tint"; className?: string; id?: string }) {
  return (
    <section id={id} className={cn(
      tone === "white" ? "bg-white" : tone === "navy" ? "bg-grid-navy relative bg-navy text-white" : tone === "tint" ? "bg-[linear-gradient(180deg,#EEF4FF_0%,#F8FAFC_100%)]" : "bg-canvas",
      "border-b border-line/60", className,
    )}>
      <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 lg:py-16">{children}</div>
    </section>
  );
}

/** Label sumber untuk kartu dan grafik yang memakai nilai dokumen PM.SMI.L3-01 (belum diverifikasi sistem). */
export function SimulasiBadge({ className }: { className?: string }) {
  return <span title="Nilai dari dokumen Pencapaian Sasaran PM.SMI.L3-01.2026; belum melalui verifikasi sistem" className={cn("inline-flex items-center rounded-md bg-teal-soft px-1.5 py-0.5 text-[10.5px] font-bold tracking-[0.06em] text-teal ring-1 ring-teal/20", className)}>SUMBER: PM.SMI.L3-01</span>;
}
