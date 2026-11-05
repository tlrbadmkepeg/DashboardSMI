import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function EmptyState({ title, description, action, icon, className }: { title: string; description?: ReactNode; action?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <div className="relative mb-4">
        <div className="absolute inset-0 -m-3 rounded-full bg-accent-soft/70" />
        <div className="relative grid size-12 place-items-center rounded-2xl border border-line bg-white text-accent shadow-card [&_svg]:size-5">
          {icon ?? <Inbox />}
        </div>
      </div>
      <p className="text-[15px] font-semibold text-navy">{title}</p>
      {description && <p className="mt-1.5 max-w-md text-[13px] leading-5 text-navy-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-bad/20 bg-bad-soft/60 px-6 py-10 text-center">
      <AlertTriangle className="mb-3 size-6 text-bad" />
      <p className="text-[15px] font-semibold text-navy">Data belum dapat dimuat</p>
      <p className="mt-1.5 max-w-lg text-[13px] leading-5 text-navy-500">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw /> Muat ulang
        </Button>
      )}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[112px] rounded-2xl" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-5">
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-11" />)}
    </div>
  );
}
