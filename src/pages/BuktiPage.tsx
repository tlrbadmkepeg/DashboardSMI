import { useMemo, useState } from "react";
import { FileText, Lock, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { FilterBar } from "@/components/layout/FilterBar";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/common/DataTable";
import { ErrorState, EmptyState, TableSkeleton } from "@/components/common/states";
import { LaporanBadge } from "@/components/common/status";
import { useToast } from "@/components/ui/toast";
import { useData } from "@/hooks/useData";
import { useAuth } from "@/auth/AuthProvider";
import { BULAN_PENDEK, fmtBytes, fmtDate } from "@/lib/format";
import type { Bukti, Realisasi } from "@/types/domain";

interface Row { b: Bukti; r: Realisasi | undefined }

export function BuktiPage() {
  const { data, loading, error, reload, filters } = useData();
  const { source } = useAuth();
  const toast = useToast();
  const [opening, setOpening] = useState<string | null>(null);

  const sm = useMemo(() => new Map(data?.sasaran.map((s) => [s.id, s]) ?? []), [data]);
  const um = useMemo(() => new Map(data?.units.map((u) => [u.id, u]) ?? []), [data]);
  const rows: Row[] = useMemo(() => {
    if (!data) return [];
    const rm = new Map(data.realisasi.map((r) => [r.id, r]));
    return data.bukti
      .map((b) => ({ b, r: rm.get(b.realisasiId) }))
      .filter(({ r }) => !r || (r.tahun === filters.tahun && r.bulan <= filters.bulan && (filters.unitId === "all" || r.unitId === filters.unitId)));
  }, [data, filters]);

  const open = async (b: Bukti) => {
    setOpening(b.id);
    const win = source.kind === "supabase" ? window.open("about:blank", "_blank") : null;
    try {
      const url = await source.signedUrl(b.path);
      if (win) win.location.href = url; else window.open(url, "_blank", "noopener");
    } catch (e: any) {
      win?.close();
      toast({ tone: "error", title: "Berkas tidak dapat dibuka", message: e?.message });
    } finally {
      setOpening(null);
    }
  };

  const columns: Column<Row>[] = [
    {
      key: "nama", header: "Berkas", sortValue: ({ b }) => b.namaFile, className: "min-w-[220px]",
      cell: ({ b }) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><FileText className="size-4" /></span>
          <div className="min-w-0"><div className="truncate font-medium" title={b.namaFile}>{b.namaFile}</div><div className="text-xs text-navy-400">{fmtBytes(b.ukuran)}</div></div>
        </div>
      ),
    },
    { key: "unit", header: "Unit", sortValue: ({ r }) => (r ? um.get(r.unitId)?.singkatan ?? "" : ""), cell: ({ r }) => (r ? um.get(r.unitId)?.singkatan : "—") },
    { key: "sasaran", header: "Sasaran", sortValue: ({ r }) => (r ? sm.get(r.sasaranId)?.nomor ?? 0 : 0), cell: ({ r }) => (r ? `Sasaran ${sm.get(r.sasaranId)?.nomor}` : "—") },
    { key: "periode", header: "Periode", sortValue: ({ r }) => (r ? r.tahun * 100 + r.bulan : 0), cell: ({ r }) => (r ? `${BULAN_PENDEK[r.bulan - 1]} ${r.tahun}` : "—") },
    { key: "status", header: "Status laporan", cell: ({ r }) => (r ? <LaporanBadge status={r.status} raw={r.statusRaw} /> : <span className="text-xs text-navy-300">Laporan tidak terlihat</span>) },
    { key: "tgl", header: "Diunggah", sortValue: ({ b }) => b.createdAt ?? "", cell: ({ b }) => <span className="whitespace-nowrap text-navy-500">{fmtDate(b.createdAt)}</span> },
    {
      key: "aksi", header: "",
      cell: ({ b }) => (
        <button onClick={(e) => { e.stopPropagation(); open(b); }} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-accent hover:bg-accent-soft">
          {opening === b.id ? <Loader2 className="size-3.5 animate-spin" /> : <Lock className="size-3.5" />} Buka <ExternalLink className="size-3" />
        </button>
      ),
    },
  ];

  return (
    <AppShell crumbs={[{ label: "Pengelolaan" }, { label: "Bukti Dukung" }]}>
      <PageHeader eyebrow="Pengelolaan" title="Bukti Dukung" description="Seluruh bukti dukung yang dapat Anda akses sesuai kewenangan. Berkas dibuka melalui tautan privat yang berlaku lima menit." />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-xl bg-ok-soft px-3 py-2 text-[12.5px] font-medium text-ok"><ShieldCheck className="size-4" /> Bucket privat · akses diperiksa oleh Supabase</div>
        <FilterBar />
      </div>
      <Card className="overflow-hidden">
        {loading && !data ? <TableSkeleton /> : error ? <div className="p-5"><ErrorState message={error} onRetry={reload} /></div> : (
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={({ b }) => b.id}
            searchText={({ b, r }) => `${b.namaFile} ${r ? um.get(r.unitId)?.nama : ""} ${r ? sm.get(r.sasaranId)?.nama : ""}`}
            initialSort={{ key: "tgl", dir: "desc" }}
            empty={<EmptyState className="py-12" title="Belum ada bukti dukung" description="Tidak ada berkas pada periode ini, atau akun Anda tidak berwenang melihatnya." />}
          />
        )}
      </Card>
    </AppShell>
  );
}
