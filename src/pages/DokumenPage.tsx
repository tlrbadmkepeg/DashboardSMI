import { useMemo, useState } from "react";
import { Download, Eye, FileText, FolderOpen, Lock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ContentState, SectionHeading } from "@/components/portal/ContentState";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PdfViewer } from "./KebijakanPage";
import { usePortal } from "@/hooks/usePortal";
import { useRouter } from "@/lib/router";
import { KATEGORI_DOKUMEN } from "@/content/portal";
import { PORTAL_TABLES } from "@/config/schema";
import { fmtDate } from "@/lib/format";
import type { Dokumen } from "@/types/portal";
import { cn } from "@/lib/utils";
import { DOKUMEN_RESMI, type MetaDokumen } from "@/content/resmi/dokumen";
import { Link } from "@/lib/router";
import { ArrowRight, FileCheck2 } from "lucide-react";
import { SopFolders } from "@/components/portal/SopFolders";

/** Halaman portal yang menampilkan isi setiap dokumen PM.SMI. */
const HALAMAN_DOKUMEN: Record<string, string> = {
  "PM.SMI.L1.2026": "/konteks?tab=lingkup", "PM.SMI.L2.2026": "/kebijakan", "PM.SMI.L3.2026": "/sasaran", "PM.SMI.L3-01.2026": "/monitoring", "Matriks Risiko SMI 2026": "/risiko",
  "PM.SMI.L4.2026": "/organisasi", "PM.SMI.L5.2026": "/organisasi/tim", "PM.SMI.L6-2026": "/organisasi/proses",
  "PM.SMI.L7.2026": "/konteks", "PM.SMI.L8.2026": "/konteks?tab=pihak", "PM.SMI.L9.2026": "/konteks?tab=kepatuhan",
  "PM.SMI.L10.2026": "/risiko/register", "PM.SMI.L11.2026": "/risiko/fkap", "PM.SMI.L12.2026": "/organisasi/komunikasi", "PM.SMI.L14.2026": "/risiko/fkap",
};

function DokumenResmiList({ kategori, q }: { kategori: string; q: string }) {
  const rows = DOKUMEN_RESMI.filter((d) => (kategori === "semua" || d.kategori === kategori) && (!q || `${d.kode} ${d.judul}`.toLowerCase().includes(q.toLowerCase())));
  const cols: Column<MetaDokumen>[] = [
    { key: "kode", header: "Nomor", sortValue: (d) => Number(d.kode.match(/L(\d+)/)?.[1] ?? 0), cell: (d) => <span className="whitespace-nowrap font-mono text-[12.5px] text-navy-500">{d.kode}</span> },
    { key: "nama", header: "Nama dokumen", sortValue: (d) => d.judul, className: "min-w-[260px]", cell: (d) => <span><span className="font-medium">{d.judul}</span>{d.catatan && <span className="mt-0.5 block text-[12px] text-navy-400">{d.catatan}</span>}</span> },
    { key: "kat", header: "Kategori", sortValue: (d) => d.kategori, cell: (d) => <span className="text-navy-500">{d.kategori}</span> },
    { key: "rev", header: "Terbitan/Revisi", cell: (d) => <span className="tabular-nums">{d.revisi}</span> },
    { key: "tgl", header: "Tanggal", sortValue: (d) => d.tanggal, cell: (d) => <span className="whitespace-nowrap text-navy-500">{fmtDate(d.tanggal)}</span> },
    { key: "status", header: "Status", cell: (d) => <Badge tone="ok">{d.status}</Badge> },
    { key: "isi", header: "", cell: (d) => <span className="flex items-center gap-1">{d.kode === "PM.SMI.L2.2026" && <a href="dokumen/kebijakan-smi-pm-smi-l2-2026.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-[12.5px] font-medium text-navy-500 hover:bg-canvas"><Download className="size-3.5" /> PDF</a>}{HALAMAN_DOKUMEN[d.kode] ? <Link to={HALAMAN_DOKUMEN[d.kode]} className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-[12.5px] font-medium text-accent hover:bg-accent-soft">Baca isi <ArrowRight className="size-3.5" /></Link> : null}</span> },
  ];
  return (
    <div className="space-y-3">
      <Card className="overflow-hidden">
        <DataTable rows={rows} columns={cols} rowKey={(d) => d.kode} initialSort={{ key: "kode", dir: "asc" }} pageSize={15} searchText={(d) => `${d.kode} ${d.judul} ${d.kategori}`} />
      </Card>
      <p className="flex gap-2 text-[12.5px] leading-5 text-navy-400"><FileCheck2 className="mt-0.5 size-3.5 shrink-0" />Isi dokumen ditranskripsi ke halaman portal terkait. Berkas bertanda tangan yang tersedia di portal: PM.SMI.L2.2026 (Kebijakan SMI). Acuan seluruh dokumen: SNI ISO 9001:2015; SNI ISO 37001:2025; SNI ISO 21001:2025. PM.SMI.L13 tidak termasuk dalam berkas yang diterima.</p>
    </div>
  );
}

const statusTone = (s: string) => (/berlaku|aktif|disahkan/i.test(s) ? "ok" : /revisi|draf|tinjau/i.test(s) ? "warn" : /tidak|kedaluwarsa|dicabut/i.test(s) ? "bad" : "muted") as "ok" | "warn" | "bad" | "muted";

function DocActions({ d, onView }: { d: Dokumen; onView: (d: Dokumen) => void }) {
  if (!d.fileUrl) return <span className="inline-flex items-center gap-1 text-[12px] text-navy-300"><Lock className="size-3.5" /> Tidak dipublikasikan</span>;
  return (
    <div className="flex items-center gap-1">
      <button onClick={(e) => { e.stopPropagation(); onView(d); }} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] font-medium text-accent hover:bg-accent-soft"><Eye className="size-3.5" /> Lihat</button>
      {d.bolehUnduh && <a href={d.fileUrl} download onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] font-medium text-navy-500 hover:bg-canvas"><Download className="size-3.5" /> Unduh</a>}
    </div>
  );
}

export function DokumenPage() {
  const { segments, navigate, query } = useRouter();
  const isSop = segments[1] === "sop";
  const { content } = usePortal();
  const [kategori, setKategori] = useState<string>("semua");
  const [unit, setUnit] = useState("semua");
  const [proses, setProses] = useState("semua");
  const [jenis, setJenis] = useState("semua");
  const [view, setView] = useState<Dokumen | null>(null);
  const q = query.get("q") ?? "";

  const all = content.dokumen.status === "ok" ? content.dokumen.rows : [];
  const sops = all.filter((d) => /sop|prosedur/i.test(d.kategori));
  const base = isSop ? sops : all;
  const uniq = (f: (d: Dokumen) => string) => Array.from(new Set(base.map(f).filter(Boolean))).sort();

  const rows = useMemo(() => base.filter((d) =>
    (isSop || kategori === "semua" || d.kategori === kategori) &&
    (unit === "semua" || d.unitPemilik === unit) &&
    (!isSop || proses === "semua" || d.proses === proses) &&
    (!isSop || jenis === "semua" || d.jenis === jenis) &&
    (!q || `${d.kode} ${d.nama}`.toLowerCase().includes(q.toLowerCase())),
  ), [base, kategori, unit, proses, jenis, isSop, q]);

  const pakaiResmi = !(content.dokumen.status === "ok" && content.dokumen.rows.length) && content.dokumen.status !== "loading";
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    (pakaiResmi ? DOKUMEN_RESMI.map((d) => d.kategori) : all.map((d) => d.kategori)).forEach((k) => m.set(k, (m.get(k) ?? 0) + 1));
    return m;
  }, [all, pakaiResmi]);

  const columns: Column<Dokumen>[] = [
    { key: "kode", header: "Kode", sortValue: (d) => d.kode, cell: (d) => <span className="whitespace-nowrap font-mono text-[12.5px] text-navy-500">{d.kode || "—"}</span> },
    { key: "nama", header: isSop ? "Nama SOP" : "Nama dokumen", sortValue: (d) => d.nama, className: "min-w-[240px]", cell: (d) => <span className="font-medium">{d.nama}</span> },
    isSop
      ? { key: "proses", header: "Proses bisnis", sortValue: (d) => d.proses, cell: (d) => <span className="text-navy-500">{d.proses || "—"}</span> }
      : { key: "kategori", header: "Kategori", sortValue: (d) => d.kategori, cell: (d) => <span className="text-navy-500">{d.kategori || "—"}</span> },
    { key: "unit", header: "Unit pemilik", sortValue: (d) => d.unitPemilik, cell: (d) => <span className="text-navy-500">{d.unitPemilik || "—"}</span> },
    { key: "revisi", header: "Revisi", sortValue: (d) => d.revisi, cell: (d) => <span className="tabular-nums">{d.revisi || "—"}</span> },
    { key: "tgl", header: "Berlaku", sortValue: (d) => d.tanggalBerlaku ?? "", cell: (d) => <span className="whitespace-nowrap text-navy-500">{fmtDate(d.tanggalBerlaku)}</span> },
    { key: "status", header: "Status", sortValue: (d) => d.status, cell: (d) => (d.status ? <Badge tone={statusTone(d.status)}>{d.status}</Badge> : <span className="text-navy-300">—</span>) },
    { key: "aksi", header: "", cell: (d) => <DocActions d={d} onView={setView} /> },
  ];

  const sel = "h-9 rounded-xl border border-line bg-white px-3 text-[13px] text-navy focus:border-accent focus:outline-none";

  return (
    <AppShell crumbs={[{ label: "Dokumen & SOP", to: "/dokumen" }, { label: isSop ? "Daftar SOP" : "Daftar Dokumen SMI" }]}>
      <SectionHeading
        eyebrow="SMI Document Center"
        title={isSop ? "Daftar SOP" : "Daftar Dokumen SMI"}
        description={isSop ? "Prosedur operasional standar BPSDMP dikelompokkan per kategori dalam folder Google Drive." : "Dokumen sistem yang telah disetujui untuk publikasi. Dokumen internal terbatas hanya dapat diakses petugas berwenang."}
      />
      <div className="mb-6 flex w-fit gap-1 rounded-xl border border-line bg-white p-1">
        <button onClick={() => navigate("/dokumen")} className={cn("inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium", !isSop ? "bg-navy text-white" : "text-navy-500 hover:bg-canvas")}><FolderOpen className="size-4" /> Daftar Dokumen SMI</button>
        <button onClick={() => navigate("/dokumen/sop")} className={cn("inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium", isSop ? "bg-navy text-white" : "text-navy-500 hover:bg-canvas")}><FileText className="size-4" /> Daftar SOP</button>
      </div>

      {!isSop && (
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-5">
          {KATEGORI_DOKUMEN.map((k, i) => {
            const c = counts.get(k) ?? 0;
            return (
              <button key={k} onClick={() => setKategori(kategori === k ? "semua" : k)} className={cn("flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition", kategori === k ? "border-accent bg-accent-soft" : "border-line bg-white hover:border-navy-300")}>
                <span className="mt-0.5 text-[11px] font-semibold tabular-nums text-navy-300">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1 text-[12.5px] font-medium leading-4 text-navy">{k}</span>
                <span className={cn("text-[11.5px] tabular-nums", c ? "text-accent" : "text-navy-300")}>{content.dokumen.status === "ok" || pakaiResmi ? c : "·"}</span>
              </button>
            );
          })}
        </div>
      )}

      {isSop && <SopFolders />}
      {isSop && !(content.dokumen.status === "ok" && sops.length) ? null : !isSop && pakaiResmi ? <DokumenResmiList kategori={kategori} q={q} /> : <ContentState
        state={content.dokumen.status === "ok" ? { status: "ok", rows: base } : content.dokumen}
        skeleton={<Skeleton className="h-72 rounded-2xl" />}
        pending={{
          title: isSop ? "Daftar SOP resmi belum dimuat" : "Daftar induk dokumen belum dimuat",
          description: isSop
            ? "SOP tampil sesuai Daftar Induk Dokumen BPSDMP lengkap dengan kode, revisi, unit pemilik, dan proses bisnisnya. Portal tidak menampilkan SOP yang belum ditetapkan."
            : "Dokumen tampil dengan kode, nama, kategori, unit pemilik, revisi, tanggal berlaku, status, serta tombol lihat dan unduh sesuai izin publikasi.",
          source: "Daftar Induk Dokumen SMI",
          table: PORTAL_TABLES.dokumen,
        }}
      >
        {() => (
          <Card className="overflow-hidden">
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(d) => d.id}
              searchText={(d) => `${d.kode} ${d.nama} ${d.kategori} ${d.unitPemilik} ${d.proses} ${d.jenis}`}
              onRowClick={(d) => d.fileUrl && setView(d)}
              initialSort={{ key: "kode", dir: "asc" }}
              toolbar={
                <div className="flex flex-wrap gap-2">
                  <select id="doc-unit" aria-label="Unit pemilik" value={unit} onChange={(e) => setUnit(e.target.value)} className={sel}><option value="semua">Semua unit</option>{uniq((d) => d.unitPemilik).map((x) => <option key={x}>{x}</option>)}</select>
                  {isSop && <select id="doc-proses" aria-label="Proses bisnis" value={proses} onChange={(e) => setProses(e.target.value)} className={sel}><option value="semua">Semua proses</option>{uniq((d) => d.proses).map((x) => <option key={x}>{x}</option>)}</select>}
                  {isSop && <select id="doc-jenis" aria-label="Jenis SOP" value={jenis} onChange={(e) => setJenis(e.target.value)} className={sel}><option value="semua">Semua jenis</option>{uniq((d) => d.jenis).map((x) => <option key={x}>{x}</option>)}</select>}
                </div>
              }
            />
          </Card>
        )}
      </ContentState>}

      <Dialog open={!!view} onClose={() => setView(null)} title={view?.nama ?? ""} description={[view?.kode, view?.revisi && `Revisi ${view.revisi}`].filter(Boolean).join(" · ")} size="xl">
        {view?.fileUrl && (/\.pdf($|\?)/i.test(view.fileUrl)
          ? <PdfViewer url={view.fileUrl} title={view.nama} />
          : <a href={view.fileUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline">Buka dokumen</a>)}
      </Dialog>
    </AppShell>
  );
}
