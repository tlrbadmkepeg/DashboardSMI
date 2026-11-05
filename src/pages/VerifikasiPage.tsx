import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, Paperclip } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Textarea, FieldHint } from "@/components/ui/form";
import { DataTable, type Column } from "@/components/common/DataTable";
import { ErrorState, EmptyState, TableSkeleton } from "@/components/common/states";
import { CapaianBadge, LaporanBadge } from "@/components/common/status";
import { ReportDetailDialog } from "@/components/common/ReportDetailDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import { useData } from "@/hooks/useData";
import { useAuth } from "@/auth/AuthProvider";
import { BULAN_PENDEK, fmtDateTime, fmtValue } from "@/lib/format";
import { nilaiRealisasi, statusDariNilai } from "@/domain/indicators";
import type { Realisasi } from "@/types/domain";
import { cn } from "@/lib/utils";

export function VerifikasiPage() {
  const { data, loading, error, reload } = useData();
  const { source } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<"antrian" | "keputusan">("antrian");
  const [unitFilter, setUnitFilter] = useState("all");
  const [open, setOpen] = useState<Realisasi | null>(null);
  const [catatan, setCatatan] = useState("");
  const [decision, setDecision] = useState<"setuju" | "kembalikan" | null>(null);
  const [noteError, setNoteError] = useState(false);

  const sm = useMemo(() => new Map(data?.sasaran.map((s) => [s.id, s]) ?? []), [data]);
  const um = useMemo(() => new Map(data?.units.map((u) => [u.id, u]) ?? []), [data]);

  const queue = useMemo(() => (data?.realisasi ?? []).filter((r) => r.status === "diajukan" && (unitFilter === "all" || r.unitId === unitFilter)), [data, unitFilter]);
  const decided = useMemo(
    () => (data?.realisasi ?? []).filter((r) => (r.status === "terverifikasi" || r.status === "perlu_perbaikan") && r.diverifikasiPada && (unitFilter === "all" || r.unitId === unitFilter))
      .sort((a, b) => (b.diverifikasiPada ?? "").localeCompare(a.diverifikasiPada ?? "")),
    [data, unitFilter],
  );

  const columns: Column<Realisasi>[] = [
    { key: "unit", header: "Unit kerja", sortValue: (r) => um.get(r.unitId)?.singkatan ?? "", cell: (r) => <span className="font-medium">{um.get(r.unitId)?.singkatan}</span> },
    {
      key: "sasaran", header: "Sasaran mutu", sortValue: (r) => sm.get(r.sasaranId)?.nomor ?? 0, className: "min-w-[240px]",
      cell: (r) => { const s = sm.get(r.sasaranId); return <span className="line-clamp-2">{s?.nomor}. {s?.nama}</span>; },
    },
    { key: "periode", header: "Periode", sortValue: (r) => r.tahun * 100 + r.bulan, cell: (r) => <span className="whitespace-nowrap">{BULAN_PENDEK[r.bulan - 1]} {r.tahun}</span> },
    { key: "target", header: "Target", cell: (r) => { const s = sm.get(r.sasaranId); return <span className="whitespace-nowrap text-navy-500">{s ? s.targetLabel || fmtValue(s.target, s.satuan) : "—"}</span>; } },
    {
      key: "realisasi", header: "Realisasi",
      cell: (r) => {
        const s = sm.get(r.sasaranId);
        if (!s) return "—";
        const n = nilaiRealisasi(r, s);
        return <div className="space-y-1"><div className="font-semibold tabular-nums">{fmtValue(n.value, s.satuan)}</div><CapaianBadge status={statusDariNilai(n.value, s)} /></div>;
      },
    },
    { key: "bukti", header: "Bukti", cell: (r) => { const c = data?.bukti.filter((b) => b.realisasiId === r.id).length ?? 0; return <span className={cn("inline-flex items-center gap-1 tabular-nums", c ? "text-navy" : "text-bad")}><Paperclip className="size-3.5" />{c}</span>; } },
    tab === "antrian"
      ? { key: "diajukan", header: "Diajukan", sortValue: (r) => r.diajukanPada ?? "", cell: (r) => <span className="whitespace-nowrap text-[13px] text-navy-500">{fmtDateTime(r.diajukanPada)}</span> }
      : { key: "keputusan", header: "Keputusan", sortValue: (r) => r.diverifikasiPada ?? "", cell: (r) => <div className="space-y-1"><LaporanBadge status={r.status} raw={r.statusRaw} /><div className="text-xs text-navy-400">{fmtDateTime(r.diverifikasiPada)}</div></div> },
  ];

  const startDecision = (d: "setuju" | "kembalikan") => {
    if (d === "kembalikan" && !catatan.trim()) { setNoteError(true); return; }
    setNoteError(false);
    setDecision(d);
  };

  const confirm = async () => {
    if (!open || !decision) return;
    try {
      await source.verify(open.id, decision, catatan.trim());
      toast({ tone: "success", title: decision === "setuju" ? "Laporan disetujui" : "Laporan dikembalikan", message: decision === "setuju" ? "Status laporan menjadi terverifikasi." : "PIC unit dapat memperbaiki laporan sesuai catatan." });
      setDecision(null);
      setOpen(null);
      setCatatan("");
      await reload();
    } catch (e: any) {
      toast({ tone: "error", title: "Keputusan belum tersimpan", message: e?.message });
    }
  };

  const units = (data?.units ?? []).slice().sort((a, b) => a.urutan - b.urutan);

  return (
    <AppShell crumbs={[{ label: "Pengelolaan" }, { label: "Verifikasi" }]}>
      <PageHeader
        eyebrow="Alur kerja verifikator"
        title="Verifikasi Laporan"
        description="Periksa realisasi, bukti dukung, kendala, dan tindak lanjut sebelum memberi keputusan. Keputusan diproses oleh fungsi basis data verifikasi_realisasi_smi."
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border border-line bg-white p-1">
          {[["antrian", `Menunggu verifikasi`, queue.length], ["keputusan", "Keputusan terakhir", decided.length]].map(([k, l, c]) => (
            <button key={k as string} onClick={() => setTab(k as any)} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition", tab === k ? "bg-navy text-white" : "text-navy-500 hover:bg-canvas")}>
              {l}<span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", tab === k ? "bg-white/20" : "bg-canvas")}>{c as number}</span>
            </button>
          ))}
        </div>
        <select id="verif-unit" aria-label="Filter unit" value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)} className="h-9 rounded-xl border border-line bg-white px-3 text-[13px] font-medium text-navy focus:border-accent focus:outline-none">
          <option value="all">Seluruh unit kerja</option>
          {units.map((u) => <option key={u.id} value={u.id}>{u.singkatan}</option>)}
        </select>
      </div>

      <Card className="overflow-hidden">
        {loading && !data ? <TableSkeleton /> : error ? <div className="p-5"><ErrorState message={error} onRetry={reload} /></div> : (
          <DataTable
            rows={tab === "antrian" ? queue : decided}
            columns={columns}
            rowKey={(r) => r.id}
            searchText={(r) => `${um.get(r.unitId)?.nama} ${sm.get(r.sasaranId)?.nama}`}
            onRowClick={(r) => { setOpen(r); setCatatan(r.catatanVerifikator ?? ""); setNoteError(false); }}
            initialSort={tab === "antrian" ? { key: "diajukan", dir: "asc" } : { key: "keputusan", dir: "desc" }}
            empty={tab === "antrian"
              ? <EmptyState className="py-12" icon={<CheckCircle2 />} title="Tidak ada laporan yang menunggu" description="Semua laporan yang diajukan sudah diproses." />
              : <EmptyState className="py-12" title="Belum ada keputusan verifikasi" />}
          />
        )}
      </Card>
      {tab === "keputusan" && (
        <p className="mt-3 text-xs text-navy-400">Daftar ini menampilkan keputusan terakhir setiap laporan. Riwayat keputusan berulang belum tersedia karena basis data belum menyimpan tabel riwayat verifikasi.</p>
      )}

      {data && open && (
        <ReportDetailDialog
          report={open}
          data={data}
          onClose={() => setOpen(null)}
          footer={open.status === "diajukan" ? (
            <div className="w-full space-y-3">
              <div>
                <Label htmlFor="verif-catatan">Catatan verifikasi</Label>
                <Textarea id="verif-catatan" value={catatan} onChange={(e) => { setCatatan(e.target.value); setNoteError(false); }} placeholder="Wajib diisi bila laporan dikembalikan" className="min-h-[72px] bg-white" />
                {noteError && <FieldHint tone="error">Tuliskan alasan pengembalian agar PIC tahu apa yang perlu diperbaiki.</FieldHint>}
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="danger" onClick={() => startDecision("kembalikan")}><RotateCcw /> Kembalikan untuk perbaikan</Button>
                <Button variant="success" onClick={() => startDecision("setuju")}><CheckCircle2 /> Setujui</Button>
              </div>
            </div>
          ) : undefined}
        />
      )}

      <ConfirmDialog
        open={!!decision}
        onClose={() => setDecision(null)}
        title={decision === "setuju" ? "Setujui laporan ini?" : "Kembalikan laporan untuk perbaikan?"}
        description={decision === "setuju" ? "Laporan akan berstatus terverifikasi dan dihitung sebagai capaian resmi." : "Laporan kembali ke PIC unit dengan catatan Anda."}
        confirmLabel={decision === "setuju" ? "Setujui" : "Kembalikan"}
        tone={decision === "setuju" ? "success" : "danger"}
        onConfirm={confirm}
      >
        {open && (
          <div className="space-y-2 text-[13.5px]">
            <div className="text-navy"><b>{um.get(open.unitId)?.singkatan}</b> · Sasaran {sm.get(open.sasaranId)?.nomor} · {BULAN_PENDEK[open.bulan - 1]} {open.tahun}</div>
            {catatan.trim() && <div className="rounded-xl bg-canvas px-3 py-2 text-navy-500">{catatan}</div>}
          </div>
        )}
      </ConfirmDialog>
    </AppShell>
  );
}
