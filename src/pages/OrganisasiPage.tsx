import { useMemo, useState } from "react";
import { Building2, ChevronDown, ChevronRight, Minus, Plus, RotateCcw, ArrowRight, Users2, Workflow, Network, MessagesSquare, Info, ArrowDown } from "lucide-react";
import { Kode, SumberResmi, TabelResmi } from "@/components/portal/Resmi";
import { DIAGRAM, DiagramViewer, type Hotspot } from "@/components/portal/DiagramViewer";
import { INTERAKSI_PROSES, KETENTUAN_INTERAKSI, PETA_PROSES_KETERANGAN, PROSES_RESMI, TATA_KELOLA, UNIT_RESMI, type ProsesResmi } from "@/content/resmi/organisasi";
import { CATATAN_BAHASA, INDIKATOR_KOMUNIKASI, KLASIFIKASI_KOMUNIKASI, KOM_ANTI_PENYUAPAN, KOM_EKSTERNAL, KOM_INTERNAL, PERSETUJUAN_KOMUNIKASI, type KomRow } from "@/content/resmi/komunikasi";
import { AppShell } from "@/components/layout/AppShell";
import { ContentState, PendingContent, SectionHeading } from "@/components/portal/ContentState";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useData } from "@/hooks/useData";
import { usePortal } from "@/hooks/usePortal";
import { useRouter, Link } from "@/lib/router";
import { KELOMPOK_PROSES, KELOMPOK_TIM } from "@/content/portal";
import { PORTAL_TABLES } from "@/config/schema";
import type { Proses, StrukturNode } from "@/types/portal";
import type { Unit } from "@/types/domain";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "", label: "Struktur Organisasi BPSDMP", icon: Network },
  { key: "tim", label: "Tata Kelola SMI", icon: Users2 },
  { key: "proses", label: "Proses Bisnis & Interaksi Proses", icon: Workflow },
  { key: "komunikasi", label: "Matriks Komunikasi", icon: MessagesSquare },
];

/* ---------------- Struktur organisasi ---------------- */

function TreeNode({ node, childrenOf, depth, onSelect, expanded, toggle }: {
  node: StrukturNode; childrenOf: Map<string | null, StrukturNode[]>; depth: number;
  onSelect: (n: StrukturNode) => void; expanded: Set<string>; toggle: (id: string) => void;
}) {
  const kids = childrenOf.get(node.id) ?? [];
  const open = expanded.has(node.id);
  return (
    <li className="relative">
      <div className="flex items-center gap-1.5">
        {kids.length ? (
          <button onClick={() => toggle(node.id)} className="grid size-6 place-items-center rounded-md text-navy-400 hover:bg-canvas" aria-label={open ? "Ciutkan" : "Bentangkan"}>
            {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        ) : <span className="size-6" />}
        <button onClick={() => onSelect(node)} className={cn(
          "rounded-xl border px-3.5 py-2 text-left transition hover:border-accent/40 hover:shadow-card",
          depth === 0 ? "border-navy bg-navy text-white" : "border-line bg-white text-navy",
        )}>
          <span className="block text-[13.5px] font-semibold">{node.nama}</span>
          {node.jenis && <span className={cn("block text-[11.5px]", depth === 0 ? "text-white/60" : "text-navy-400")}>{node.jenis}</span>}
        </button>
      </div>
      {kids.length > 0 && open && (
        <ul className="ml-3 mt-2 space-y-2 border-l border-line pl-6">
          {kids.sort((a, b) => a.urutan - b.urutan).map((k) => (
            <TreeNode key={k.id} node={k} childrenOf={childrenOf} depth={depth + 1} onSelect={onSelect} expanded={expanded} toggle={toggle} />
          ))}
        </ul>
      )}
    </li>
  );
}

function OrgChart({ nodes }: { nodes: StrukturNode[] }) {
  const [zoom, setZoom] = useState(1);
  const [sel, setSel] = useState<StrukturNode | null>(null);
  const childrenOf = useMemo(() => {
    const m = new Map<string | null, StrukturNode[]>();
    nodes.forEach((n) => { const k = n.parentId && nodes.some((x) => x.id === n.parentId) ? n.parentId : null; m.set(k, [...(m.get(k) ?? []), n]); });
    return m;
  }, [nodes]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(nodes.filter((n) => !n.parentId).map((n) => n.id)));
  const toggle = (id: string) => setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const roots = childrenOf.get(null) ?? [];

  return (
    <div className="rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setExpanded(new Set(nodes.map((n) => n.id)))}>Bentangkan semua</Button>
          <Button size="sm" variant="ghost" onClick={() => setExpanded(new Set(roots.map((n) => n.id)))}>Ciutkan</Button>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(1)))} aria-label="Perkecil"><Minus /></Button>
          <span className="w-12 text-center text-[12.5px] tabular-nums text-navy-500">{Math.round(zoom * 100)}%</span>
          <Button size="icon" variant="ghost" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(1)))} aria-label="Perbesar"><Plus /></Button>
          <Button size="icon" variant="ghost" onClick={() => setZoom(1)} aria-label="Ukuran semula"><RotateCcw /></Button>
        </div>
      </div>
      <div className="overflow-auto p-6">
        <ul className="space-y-2" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
          {roots.map((r) => <TreeNode key={r.id} node={r} childrenOf={childrenOf} depth={0} onSelect={setSel} expanded={expanded} toggle={toggle} />)}
        </ul>
      </div>
      <Dialog open={!!sel} onClose={() => setSel(null)} title={sel?.nama ?? ""} description={sel?.jenis}>
        <div className="text-[13.5px] leading-7 text-navy">
          <div className="mb-1 text-xs font-medium text-navy-400">Tugas dan fungsi</div>
          {sel?.tugasFungsi ? <p className="whitespace-pre-line">{sel.tugasFungsi}</p> : <p className="text-navy-400">Uraian tugas dan fungsi belum dimuat.</p>}
          {sel?.unitId && <div className="mt-4"><Link to={`/unit/${sel.unitId}`} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent">Profil dan capaian unit <ArrowRight className="size-3.5" /></Link></div>}
        </div>
      </Dialog>
    </div>
  );
}

/** Sepuluh unit kerja dalam urutan PM.SMI.L1.2026; ditautkan ke profil unit bila cocok dengan tabel unit_kerja. */
function UnitsResmi({ units }: { units: Unit[] }) {
  const groups = (["Sekretariat", "Pusat", "Balai", "Akademi"] as const).map((t) => ({ t, list: UNIT_RESMI.filter((u) => u.jenis === t) }));
  const idOf = (re: RegExp) => units.find((u) => re.test(u.nama))?.id;
  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <div className="mx-auto w-fit rounded-2xl bg-navy px-6 py-3 text-center text-white">
        <div className="text-[14px] font-semibold">Badan Pengembangan Sumber Daya Manusia Perdagangan</div>
        <div className="text-[12px] text-white/60">Kepala BPSDMP · {UNIT_RESMI.length} unit kerja dalam lingkup SMI</div>
      </div>
      <div className="mx-auto h-6 w-px bg-line" />
      <div className="grid gap-4 border-t border-line pt-6 md:grid-cols-2 xl:grid-cols-4">
        {groups.map((g) => (
          <div key={g.t}>
            <div className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-navy-400">{g.t}</div>
            <ul className="space-y-2">
              {g.list.map((u) => {
                const id = idOf(u.cocok);
                const body = (
                  <>
                    <span className="block text-[13px] font-medium leading-5 text-navy">{u.nama}</span>
                    <span className="mt-1 block text-[11.5px] text-navy-400">{u.pimpinan} · {u.lokasi}</span>
                  </>
                );
                return (
                  <li key={u.no}>
                    {id ? <Link to={`/unit/${id}`} className="group block rounded-xl border border-line px-3.5 py-2.5 transition hover:border-accent/40 hover:shadow-card">{body}</Link>
                      : <div className="rounded-xl border border-line px-3.5 py-2.5">{body}</div>}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="flex max-w-3xl gap-2 text-[12px] leading-5 text-navy-400"><Info className="mt-0.5 size-3.5 shrink-0" />Ringkasan unit mengikuti PM.SMI.L1.2026; kedudukan dan garis hubungan mengikuti bagan resmi PM.SMI.L4.2026 di atas. Klik unit untuk membuka profil dan capaiannya.</p>
        <SumberResmi kode={["PM.SMI.L1.2026", "PM.SMI.L4.2026"]} />
      </div>
    </div>
  );
}

/* ---------------- Tata kelola SMI (L5) ---------------- */

/** Area klik pada gambar resmi PM.SMI.L5.2026 (persen terhadap ukuran gambar). */
const HS_TATA_KELOLA: Hotspot[] = [
  { id: "fkap", label: "Fungsi Kepatuhan Anti Penyuapan", x: 2.9, y: 7.8, w: 26.6, h: 16.8 },
  { id: "mp", label: "Manajemen Puncak – Kepala BPSDMP", x: 34.8, y: 7.4, w: 31.2, h: 18.6 },
  { id: "ai", label: "Auditor Internal", x: 72.9, y: 7.8, w: 23.7, h: 15.6 },
  { id: "tim", label: "Tim SMI BPSDMP", x: 34.1, y: 27.7, w: 31.6, h: 14.3 },
  { id: "sekr", label: "Sekretariat Tim SMI", x: 71, y: 27.7, w: 25.6, h: 14.9 },
  { id: "pu", label: "Unit kerja dalam penerapan SMI", x: 3.4, y: 46.9, w: 93.6, h: 29.7 },
  { id: "pp", label: "Pemilik proses · seluruh personel", x: 20.6, y: 78.7, w: 57.6, h: 9.6 },
];

function TataKelola() {
  const [sel, setSel] = useState<(typeof TATA_KELOLA.unsur)[number] | null>(null);
  const u = (id: string) => TATA_KELOLA.unsur.find((x) => x.id === id)!;
  return (
    <div className="space-y-8">
      <p className="max-w-[95ch] text-[14px] leading-7 text-navy-500">{TATA_KELOLA.prinsip}</p>
      <DiagramViewer diagram={DIAGRAM.tataKelola} hotspots={HS_TATA_KELOLA} onHotspot={(id) => setSel(u(id))} />
      <div>
        <div className="mb-2 text-[12.5px] font-semibold text-navy-500">Unsur tata kelola (klik pada bagan atau pilih di bawah)</div>
        <div className="flex flex-wrap gap-2">
          {TATA_KELOLA.unsur.map((x) => (
            <button key={x.id} onClick={() => setSel(x)} className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-navy transition hover:border-accent hover:text-accent">{x.nama}</button>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] leading-5 text-navy-400">Bagan ini adalah bagan tata kelola SMI, bukan struktur organisasi formal BPSDMP. Garis penuh = koordinasi/pelaksanaan SMI; garis putus-putus = akses langsung/pelaporan independen.</p>
      </div>

      <section>
        <SectionHeading eyebrow="Alur kerja" title="Alur tata kelola SMI" />
        <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {TATA_KELOLA.alur.map(([j, isi], i) => (
            <li key={j} className="rounded-2xl border border-line bg-white p-5">
              <span className="text-[24px] font-semibold leading-none text-accent/30 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <div className="mt-2 text-[14px] font-semibold text-navy">{j}</div>
              <p className="mt-1.5 text-[12.5px] leading-6 text-navy-500">{isi}</p>
            </li>
          ))}
        </ol>
      </section>
      <p className="rounded-xl border border-line bg-white p-4 text-[13px] leading-6 text-navy-500"><b className="font-medium text-navy">Peninjauan.</b> {TATA_KELOLA.peninjauan}</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-navy-400">{TATA_KELOLA.catatanPersonel}</p>
        <SumberResmi kode="PM.SMI.L5.2026" />
      </div>
      <Dialog open={!!sel} onClose={() => setSel(null)} title={sel?.nama ?? ""} size="lg">
        {sel && (
          <dl className="space-y-4 text-[13.5px] leading-6">
            {[["Komposisi", sel.komposisi], ["Tanggung jawab dan kewenangan", sel.tanggungJawab], ["Hubungan pelaporan dan koordinasi", sel.pelaporan]].map(([l, v]) => (
              <div key={l}><dt className="text-xs font-medium text-navy-400">{l}</dt><dd className="mt-0.5 text-navy">{v}</dd></div>
            ))}
          </dl>
        )}
      </Dialog>
    </div>
  );
}

/* ---------------- Peta proses (L6) ---------------- */

const HS_PROSES: Hotspot[] = [
  { id: "input", label: "Input", x: 1.6, y: 10, w: 11.6, h: 69 },
  { id: "manajemen", label: "A. Proses manajemen dan pengendalian", x: 16.1, y: 10, w: 66.2, h: 18.3 },
  { id: "utama", label: "B. Proses utama pelayanan, pendidikan, dan pembelajaran", x: 16.1, y: 29.1, w: 66.2, h: 19.4 },
  { id: "khusus", label: "C. Proses khusus", x: 16.1, y: 49.4, w: 66.2, h: 12.3 },
  { id: "pendukung", label: "D. Proses pendukung", x: 16.1, y: 62.6, w: 66.2, h: 18.3 },
  { id: "output", label: "Output", x: 85.6, y: 10, w: 12.7, h: 69.8 },
  { id: "umpan", label: "Umpan balik, evaluasi, dan peningkatan", x: 7.2, y: 82.6, w: 86, h: 4.3 },
  { id: "fkap", label: "FKAP: fungsi pengendalian lintas proses", x: 21.8, y: 87.9, w: 53.8, h: 5.3 },
];

/** Isi kotak Input dan Output sesuai gambar resmi PM.SMI.L6-2026. */
const INPUT_PROSES = ["Mandat, regulasi, dan arah strategis", "Kebutuhan dan harapan pemangku kepentingan", "Kebutuhan kompetensi, pendidikan, layanan dan pasar kerja; risiko dan peluang", "Sumber daya, data, dan informasi"];
const OUTPUT_PROSES = ["Program, layanan, dan pembelajaran terkendali", "Kompetensi, kelulusan, dan dokumen hasil", "Kepuasan peserta, pengguna layanan, dan penerima manfaat", "Kepatuhan, integritas, dan pencegahan penyuapan; manfaat, dampak, dan peningkatan berkelanjutan"];

function ProsesDiagram() {
  const { content } = usePortal();
  const [grp, setGrp] = useState<string | null>(null);
  const dbProses = content.proses.status === "ok" ? content.proses.rows : [];
  const sopOf = (kode: string) => dbProses.find((p) => p.kode.toUpperCase() === kode.toUpperCase())?.sopTerkait ?? [];
  const kelompok = (id: string): ProsesResmi[] =>
    id === "manajemen" ? PROSES_RESMI.filter((p) => p.kelompok === "manajemen")
      : id === "utama" ? PROSES_RESMI.filter((p) => p.kelompok === "utama" && !p.kode.startsWith("U8"))
        : id === "khusus" ? PROSES_RESMI.filter((p) => p.kode.startsWith("U8"))
          : id === "pendukung" ? PROSES_RESMI.filter((p) => p.kelompok === "pendukung") : [];
  const judul = HS_PROSES.find((h) => h.id === grp)?.label ?? "";
  const daftar = grp ? kelompok(grp) : [];
  return (
    <>
      <DiagramViewer diagram={DIAGRAM.petaProses} hotspots={HS_PROSES} onHotspot={setGrp} height={620} />
      <div className="mt-3 flex flex-wrap gap-2">
        {HS_PROSES.map((h) => <button key={h.id} onClick={() => setGrp(h.id)} className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-navy transition hover:border-accent hover:text-accent">{h.label}</button>)}
      </div>
      <Dialog open={!!grp} onClose={() => setGrp(null)} title={judul} description="Sumber: PM.SMI.L6-2026" size="xl">
        {grp === "input" || grp === "output" ? (
          <ol className="space-y-2 text-[14px] leading-6 text-navy">{(grp === "input" ? INPUT_PROSES : OUTPUT_PROSES).map((t, i) => <li key={i} className="flex gap-3 rounded-xl bg-canvas px-4 py-3"><b className="text-accent">{i + 1}.</b>{t}</li>)}</ol>
        ) : grp === "umpan" ? (
          <div className="space-y-3 text-[14px] leading-6 text-navy">
            <p>Hasil pemantauan, evaluasi, audit, dan Tinjauan Manajemen menjadi umpan balik bagi input dan seluruh proses untuk peningkatan berkelanjutan.</p>
            <TabelResmi dense head={["Dari", "Keluaran", "Kepada"]} rows={INTERAKSI_PROSES.filter((r) => /M4|M5|Pengguna/.test(r[0])).map((r) => [<span className="font-medium">{r[0]}</span>, r[1], r[2]])} />
          </div>
        ) : grp === "fkap" ? (
          <p className="text-[14px] leading-7 text-navy">{KETENTUAN_INTERAKSI[3]}</p>
        ) : (
          <div className="space-y-3">
            {daftar.map((p) => {
              const sop = sopOf(p.kode);
              return (
                <div key={p.kode} className="rounded-xl border border-line p-4">
                  <div className="flex items-start gap-3">
                    <span className="rounded-md bg-navy px-2 py-0.5 font-display text-[12px] font-bold text-gold">{p.kode}</span>
                    <div className="min-w-0">
                      <div className="text-[14.5px] font-semibold text-navy">{p.nama}</div>
                      <p className="mt-1 text-[13.5px] leading-6 text-navy-600"><b className="font-semibold text-navy">Tujuan:</b> {p.tujuan}</p>
                      <p className="mt-1 text-[13.5px] leading-6 text-navy-600"><b className="font-semibold text-navy">Penanggung jawab:</b> {p.pemilik}</p>
                      <p className="mt-1 text-[13px] leading-6 text-navy-500"><b className="font-semibold text-navy">SOP terkait:</b> {sop.length ? sop.join(", ") : <>belum dimuat; lihat <Link to="/dokumen/sop" className="font-semibold text-accent">Daftar SOP</Link></>}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Dialog>
    </>
  );
}

function ProsesResmiMap() {
  const [sel, setSel] = useState<ProsesResmi | null>(null);
  const keluar = sel ? INTERAKSI_PROSES.filter((r) => r[0].startsWith(sel.kode + " ") || r[0].startsWith(sel.kode + "-")) : [];
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {KELOMPOK_PROSES.map((k) => (
          <div key={k.key} className={cn("grid gap-4 rounded-2xl border p-5 lg:grid-cols-[220px_1fr]", k.key === "utama" ? "border-accent/25 bg-accent-soft/40" : "border-line bg-white")}>
            <div><div className="text-[15px] font-semibold text-navy">{k.nama}</div><p className="mt-1 text-[12.5px] leading-5 text-navy-400">{k.isi}</p></div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {PROSES_RESMI.filter((p) => p.kelompok === k.key).map((p) => (
                <button key={p.kode} onClick={() => setSel(p)} className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-left transition hover:border-accent/40 hover:shadow-card">
                  <span className="block text-[11px] font-semibold text-navy-400">{p.kode}</span>
                  <span className="block text-[13px] font-medium leading-5 text-navy">{p.nama}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex max-w-3xl gap-2 text-[12px] leading-5 text-navy-400"><Info className="mt-0.5 size-3.5 shrink-0" />{PETA_PROSES_KETERANGAN} FKAP adalah fungsi pengendalian lintas proses, bukan proses pendukung.</p>
          <SumberResmi kode="PM.SMI.L6-2026" />
        </div>
      </div>

      <section>
        <SectionHeading eyebrow="Interaksi" title="Aliran keluaran antarproses" />
        <TabelResmi dense head={["Dari", "Keluaran", "Kepada", "Kendali/rekaman"]} widths={["min-w-[170px]", "min-w-[240px]", "min-w-[150px]", "min-w-[240px]"]}
          rows={INTERAKSI_PROSES.map((r) => [<span className="font-medium">{r[0]}</span>, r[1], r[2], r[3]])} />
      </section>

      <section>
        <SectionHeading eyebrow="Ketentuan" title="Ketentuan interaksi proses" />
        <ol className="space-y-2">
          {KETENTUAN_INTERAKSI.map((k, i) => <li key={i} className="grid grid-cols-[28px_1fr] text-[13.5px] leading-6 text-navy"><span className="font-semibold text-accent">{i + 1}.</span>{k}</li>)}
        </ol>
      </section>

      <Dialog open={!!sel} onClose={() => setSel(null)} title={sel ? `${sel.kode} · ${sel.nama}` : ""} description={sel ? KELOMPOK_PROSES.find((k) => k.key === sel.kelompok)?.nama : ""} size="lg">
        {sel && (
          <div className="space-y-4 text-[13.5px] leading-6 text-navy">
            <div><div className="text-xs font-medium text-navy-400">Tujuan proses</div><p className="mt-0.5">{sel.tujuan}</p></div>
            <div><div className="text-xs font-medium text-navy-400">Pemilik proses</div><p className="mt-0.5">{sel.pemilik}</p></div>
            {keluar.length > 0 && (
              <div>
                <div className="mb-1.5 text-xs font-medium text-navy-400">Keluaran ke proses lain</div>
                <ul className="space-y-2">{keluar.map((r, i) => <li key={i} className="rounded-xl bg-canvas p-3"><b className="font-medium">{r[2]}</b><span className="mt-0.5 block text-navy-500">{r[1]}</span></li>)}</ul>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ---------------- Komunikasi (L12) ---------------- */

function Komunikasi() {
  const [grup, setGrup] = useState<"int" | "ext" | "ap">("int");
  const rows: KomRow[] = grup === "int" ? KOM_INTERNAL : grup === "ext" ? KOM_EKSTERNAL : KOM_ANTI_PENYUAPAN;
  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {([["int", `Strategis & internal (${KOM_INTERNAL.length})`], ["ext", `Layanan & eksternal (${KOM_EKSTERNAL.length})`], ["ap", `Anti penyuapan & kepatuhan (${KOM_ANTI_PENYUAPAN.length})`]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setGrup(k)} className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-medium", grup === k ? "border-navy bg-navy text-white" : "border-line bg-white text-navy-500 hover:border-navy-300")}>{l}</button>
            ))}
          </div>
          <SumberResmi kode="PM.SMI.L12.2026" />
        </div>
        <TabelResmi head={["ID", "Materi/tujuan", "Pengirim/PIC", "Penerima", "Media", "Waktu"]} widths={["", "min-w-[240px]", "min-w-[170px]", "min-w-[170px]", "min-w-[160px]", "min-w-[150px]"]}
          rows={rows.map((r) => [<Kode>{r[0]}</Kode>, <span className="font-medium">{r[1]}</span>, r[2], r[3], r[4], r[5]])} />
      </section>

      <section>
        <SectionHeading eyebrow="Klasifikasi" title="Klasifikasi dan pengendalian komunikasi" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {KLASIFIKASI_KOMUNIKASI.map(([k, kat, isi]) => (
            <div key={k} className="rounded-2xl border border-line bg-white p-5"><div className="flex items-center gap-2"><Kode>{k}</Kode><span className="text-[14px] font-semibold text-navy">{kat}</span></div><p className="mt-2 text-[13px] leading-6 text-navy-500">{isi}</p></div>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] leading-5 text-navy-400">{CATATAN_BAHASA}</p>
      </section>

      <section>
        <SectionHeading eyebrow="Per unit kerja" title="Tanggung jawab komunikasi 10 unit kerja" />
        <TabelResmi head={["Unit", "Fokus komunikasi", "Penerima utama", "Media kunci"]} widths={["min-w-[160px]", "min-w-[280px]", "min-w-[200px]", "min-w-[180px]"]}
          rows={UNIT_RESMI.map((u) => [<span className="font-medium">{u.singkatan}</span>, u.komunikasi.fokus, u.komunikasi.penerima, u.komunikasi.media])} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <div className="min-w-0">
          <SectionHeading eyebrow="Pengendalian" title="Persetujuan, eskalasi, dan rekaman" />
          <TabelResmi dense head={["Tahap", "Ketentuan minimum", "Penanggung jawab"]} rows={PERSETUJUAN_KOMUNIKASI.map((r) => [<span className="font-medium">{r[0]}</span>, r[1], r[2]])} />
        </div>
        <div className="min-w-0">
          <SectionHeading eyebrow="Efektivitas" title="Indikator efektivitas komunikasi" />
          <TabelResmi dense head={["ID", "Indikator", "Target"]} rows={INDIKATOR_KOMUNIKASI.map((r) => [<Kode>{r[0]}</Kode>, <span><span className="font-medium">{r[1]}</span><span className="block text-[12px] text-navy-400">{r[2]}</span></span>, r[3]])} />
        </div>
      </section>
    </div>
  );
}

/* ---------------- Proses bisnis ---------------- */

function ProsesMap({ rows }: { rows: Proses[] }) {
  const [sel, setSel] = useState<Proses | null>(null);
  const { data } = useData();
  return (
    <>
      <div className="space-y-4">
        {KELOMPOK_PROSES.map((k) => {
          const list = rows.filter((p) => p.kelompok === k.key).sort((a, b) => a.urutan - b.urutan);
          return (
            <div key={k.key} className={cn("grid gap-4 rounded-2xl border p-5 lg:grid-cols-[220px_1fr]", k.key === "utama" ? "border-accent/25 bg-accent-soft/40" : "border-line bg-white")}>
              <div><div className="text-[15px] font-semibold text-navy">{k.nama}</div><p className="mt-1 text-[12.5px] leading-5 text-navy-400">{k.isi}</p></div>
              <div className="flex flex-wrap gap-2">
                {list.length ? list.map((p) => (
                  <button key={p.id} onClick={() => setSel(p)} className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-left transition hover:border-accent/40 hover:shadow-card">
                    {p.kode && <span className="block text-[11px] font-semibold text-navy-400">{p.kode}</span>}
                    <span className="block text-[13px] font-medium text-navy">{p.nama}</span>
                  </button>
                )) : <span className="text-[12.5px] text-navy-300">Belum ada proses pada kelompok ini.</span>}
              </div>
            </div>
          );
        })}
      </div>
      <Dialog open={!!sel} onClose={() => setSel(null)} title={sel?.nama ?? ""} description={sel ? KELOMPOK_PROSES.find((k) => k.key === sel.kelompok)?.nama : ""} size="lg">
        {sel && (
          <div className="space-y-5 text-[13.5px] text-navy">
            {sel.deskripsi && <p className="leading-7">{sel.deskripsi}</p>}
            {[["Unit terkait", sel.unitTerkait], ["SOP terkait", sel.sopTerkait], ["Risiko terkait", sel.risikoTerkait], ["Dokumen pendukung", sel.dokumenTerkait]].map(([l, v]) => (
              <div key={l as string}>
                <div className="mb-1.5 text-xs font-medium text-navy-400">{l as string}</div>
                {(v as string[]).length ? <div className="flex flex-wrap gap-1.5">{(v as string[]).map((x) => <span key={x} className="rounded-full bg-canvas px-2.5 py-1 text-[12.5px] ring-1 ring-line">{x}</span>)}</div> : <span className="text-navy-300">Belum tercatat</span>}
              </div>
            ))}
            <div>
              <div className="mb-1.5 text-xs font-medium text-navy-400">Sasaran mutu terkait</div>
              {sel.sasaranTerkait.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {sel.sasaranTerkait.map((n) => {
                    const s = data?.sasaran.find((x) => x.nomor === n);
                    return s ? <Link key={n} to={`/sasaran/${s.id}`} className="rounded-full bg-accent-soft px-2.5 py-1 text-[12.5px] font-medium text-accent">Sasaran {n}</Link> : <span key={n} className="rounded-full bg-canvas px-2.5 py-1 text-[12.5px]">Sasaran {n}</span>;
                  })}
                </div>
              ) : <span className="text-navy-300">Belum tercatat</span>}
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}

export function OrganisasiPage() {
  const { segments, navigate } = useRouter();
  const tab = segments[1] ?? "";
  const { content } = usePortal();
  const { data } = useData();
  const current = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <AppShell crumbs={[{ label: "Organisasi & Proses", to: "/organisasi" }, { label: current.label }]}>
      <SectionHeading eyebrow="Organisasi & Proses Bisnis" title={current.label} description={
        tab === "tim" ? "Bagan tata kelola SMI dan susunan Tim SMI: peran, tanggung jawab, koordinasi, dan pelaporan. Berbeda dengan struktur organisasi formal BPSDMP."
          : tab === "proses" ? "Peta proses internal SMI: input, proses manajemen, utama, khusus, pendukung, output, serta umpan balik. Klik kelompok proses pada bagan untuk melihat rinciannya."
          : tab === "komunikasi" ? "Apa yang dikomunikasikan, kapan, kepada siapa, oleh siapa, dan melalui media apa."
          : "Sepuluh unit kerja BPSDMP dalam lingkup Sistem Manajemen Integrasi."
      } />
      <div className="mb-6 flex w-fit max-w-full flex-wrap gap-1 rounded-xl border border-line bg-white p-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => navigate(t.key ? `/organisasi/${t.key}` : "/organisasi")} className={cn("inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition", tab === t.key ? "bg-navy text-white" : "text-navy-500 hover:bg-canvas")}>
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
        <button onClick={() => navigate("/unit")} className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium text-navy-500 hover:bg-canvas"><Building2 className="size-4" /> Profil Unit Kerja</button>
      </div>

      {tab === "" && (
        <div className="space-y-4">
          <DiagramViewer diagram={DIAGRAM.strukturOrganisasi} />
          <p className="flex gap-2 text-[12.5px] leading-5 text-navy-400"><Info className="mt-0.5 size-3.5 shrink-0" />Gambar asli PM.SMI.L4.2026. Kotak biru: unit organisasi BPSDMP (Permendag 6/2025); kotak oranye: UPT bidang pengembangan SDM perdagangan (Permendag 28/2025); kotak hijau: perguruan tinggi di bawah BPSDMP (Permendag 44/2025).</p>
          <SectionHeading eyebrow="Informasi ringkas" title="Sepuluh unit kerja dalam lingkup SMI" className="mb-4 mt-8" />
          {content.struktur.status === "ok" && content.struktur.rows.length ? <OrgChart nodes={content.struktur.rows} /> : <UnitsResmi units={data?.units ?? []} />}
        </div>
      )}

      {tab === "tim" && (
        <div className="space-y-10">
          <TataKelola />
          <section>
            <SectionHeading eyebrow="Penetapan personel" title="Susunan Tim SMI BPSDMP" />
            <ContentState state={content.timSmi} pending={{ title: "Menunggu keputusan penetapan Tim SMI", description: "Nama personel ditampilkan persis sesuai keputusan dan/atau surat penugasan yang berlaku setelah dimuat. Portal tidak menampilkan nama tanpa sumber resmi.", source: "Keputusan Kepala BPSDMP tentang Tim SMI", table: PORTAL_TABLES.timSmi, compact: true }}>
              {(rows) => (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {KELOMPOK_TIM.map((k) => {
                    const list = rows.filter((r) => r.kelompok.toLowerCase().startsWith(k.split(" ")[0].toLowerCase())).sort((a, b) => a.urutan - b.urutan);
                    if (!list.length) return null;
                    return (
                      <div key={k} className="rounded-2xl border border-line bg-white p-5">
                        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-teal">{k}</div>
                        <ul className="mt-3 space-y-3">
                          {list.map((m) => (
                            <li key={m.id}><div className="text-[13.5px] font-medium text-navy">{m.nama}</div><div className="text-[12px] text-navy-400">{[m.jabatanTim, m.jabatanDinas, m.unit].filter(Boolean).join(" · ")}</div></li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </ContentState>
          </section>
        </div>
      )}

      {tab === "proses" && (
        <div className="space-y-8">
          <div className="flex gap-3 rounded-2xl border border-gold/30 bg-gold-soft px-4 py-3 text-[13.5px] leading-6 text-navy"><Info className="mt-1 size-4 shrink-0 text-gold-strong" />{PETA_PROSES_KETERANGAN}</div>
          <ProsesDiagram />
          {content.proses.status === "ok" && content.proses.rows.length ? <ProsesMap rows={content.proses.rows} /> : <ProsesResmiMap />}
        </div>
      )}

      {tab === "komunikasi" && <Komunikasi />}
    </AppShell>
  );
}
