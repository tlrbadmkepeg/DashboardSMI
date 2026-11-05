import { useState } from "react";
import { Compass, Users2, Target, Scale, ThermometerSun, Info } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ContentState, SectionHeading } from "@/components/portal/ContentState";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortal } from "@/hooks/usePortal";
import { useRouter } from "@/lib/router";
import { KONTEN_KEYS, PORTAL_TABLES } from "@/config/schema";
import type { Isu, Konten, LoadState, Pihak } from "@/types/portal";
import { cn } from "@/lib/utils";
import { Kode, RuangLingkupView, SumberResmi, TabelResmi, dbRows } from "@/components/portal/Resmi";
import {
  ALUR_KONTEKS, CATATAN_REGULASI, IKLIM, ISU_EKSTERNAL, ISU_INTERNAL, KETERANGAN_PRIORITAS, KODE_KEPATUHAN, PEMANGKU, REGULASI, SWOT,
  type IsuRow, type PemangkuResmi, type RegulasiRow,
} from "@/content/resmi/konteks";
import { UNIT_RESMI } from "@/content/resmi/organisasi";

const TABS = [
  { key: "isu", label: "Isu Internal & Eksternal", icon: Compass },
  { key: "pihak", label: "Pihak Berkepentingan", icon: Users2 },
  { key: "kepatuhan", label: "Persyaratan & Kepatuhan", icon: Scale },
  { key: "lingkup", label: "Ruang Lingkup SMI", icon: Target },
];

const PRIORITAS: Record<string, { label: string; tone: "bad" | "warn" | "accent" | "muted" }> = {
  A: { label: "A · Kelola erat", tone: "bad" },
  B: { label: "B · Jaga kepuasan", tone: "warn" },
  C: { label: "C · Jaga terinformasi", tone: "accent" },
  D: { label: "D · Pantau", tone: "muted" },
};

/* ---------------- Isu (dokumen resmi) ---------------- */

function IsuResmi() {
  const [jenis, setJenis] = useState<"internal" | "eksternal">("internal");
  const [sel, setSel] = useState<IsuRow | null>(null);
  const rows = jenis === "internal" ? ISU_INTERNAL : ISU_EKSTERNAL;
  const cols: Column<IsuRow>[] = [
    { key: "kode", header: "Kode", sortValue: (r) => r[0], cell: (r) => <Kode>{r[0]}</Kode> },
    { key: "aspek", header: "Sumber/aspek", sortValue: (r) => r[1], className: "min-w-[170px]", cell: (r) => <span className="font-medium">{r[1]}</span> },
    { key: "isu", header: "Isu", className: "min-w-[280px]", cell: (r) => <span className="line-clamp-3 text-navy-500">{r[2]}</span> },
    { key: "swot", header: "SWOT", sortValue: (r) => r[3], cell: (r) => <Badge tone="navy">{r[3]}</Badge> },
    { key: "rel", header: "Relevansi", cell: (r) => <span className="whitespace-nowrap text-[12.5px] text-navy-500">{r[4]}</span> },
    { key: "pemilik", header: "Pemilik", className: "min-w-[160px]", cell: (r) => <span className="text-[12.5px] text-navy-500">{r[7]}</span> },
  ];
  return (
    <div className="space-y-10">
      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="grid grid-cols-2 gap-3 sm:w-fit">
            {(["internal", "eksternal"] as const).map((j) => (
              <button key={j} onClick={() => setJenis(j)} className={cn("rounded-2xl border px-5 py-4 text-left transition", jenis === j ? "border-accent bg-accent-soft" : "border-line bg-white hover:border-navy-300")}>
                <div className="text-[26px] font-semibold tabular-nums text-navy">{(j === "internal" ? ISU_INTERNAL : ISU_EKSTERNAL).length}</div>
                <div className="text-[13px] capitalize text-navy-500">Isu {j}</div>
              </button>
            ))}
          </div>
          <SumberResmi kode="PM.SMI.L7.2026" />
        </div>
        <Card className="overflow-hidden">
          <DataTable rows={rows} columns={cols} rowKey={(r) => r[0]} onRowClick={setSel} pageSize={8} searchText={(r) => r.join(" ")} />
        </Card>
        <p className="mt-3 text-[12.5px] text-navy-400">Pilih baris untuk melihat risiko/peluang, tindakan, pemilik, dan bukti pemantauan. Relevansi: Mutu = SNI ISO 9001; AP = SNI ISO 37001; OP = SNI ISO 21001.</p>
      </div>

      <section>
        <SectionHeading eyebrow="Analisis SWOT" title="Posisi strategis BPSDMP" />
        <div className="grid gap-3 md:grid-cols-2">
          {SWOT.map(([j, isi], i) => (
            <div key={j} className={cn("rounded-2xl border p-5", i < 2 ? "border-line bg-white" : "border-teal/20 bg-teal-soft/40")}>
              <div className="text-[14.5px] font-semibold text-navy">{j}</div>
              <p className="mt-2 text-[13.5px] leading-6 text-navy-500">{isi}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Perubahan iklim" title="Relevansi perubahan iklim terhadap SMI" description="Pertimbangan perubahan iklim sesuai amendemen SNI ISO 9001:2015/Amd.1:2024." />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {IKLIM.map(([j, isi]) => (
            <div key={j} className="rounded-2xl border border-line bg-white p-5">
              <ThermometerSun className="size-5 text-warn" />
              <div className="mt-3 text-[14px] font-semibold text-navy">{j}</div>
              <p className="mt-1.5 text-[12.5px] leading-6 text-navy-500">{isi}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Per unit kerja" title="Fokus konteks setiap unit" />
        <TabelResmi head={["Unit", "Layanan utama", "Fokus pengendalian SMI", "Status"]} widths={["min-w-[200px]", "min-w-[220px]", "min-w-[260px]", "min-w-[120px]"]}
          rows={UNIT_RESMI.map((u) => [<span className="font-medium">{u.singkatan}</span>, u.konteks.layanan, u.konteks.fokus, <Kode>{u.konteks.status}</Kode>])} />
        <p className="mt-3 text-[12.5px] leading-5 text-navy-400">Kolom status mengikuti dokumen; kode V dipakai pada unit yang isunya dinyatakan masih perlu divalidasi.</p>
      </section>

      <section>
        <SectionHeading eyebrow="Siklus" title="Dari konteks ke peningkatan" />
        <ol className="flex flex-wrap gap-2">
          {ALUR_KONTEKS.map((a, i) => (
            <li key={a} className="flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-[13px] text-navy">
              <span className="grid size-5 place-items-center rounded-full bg-navy text-[11px] font-semibold text-white">{i + 1}</span>{a}
            </li>
          ))}
        </ol>
      </section>

      <Dialog open={!!sel} onClose={() => setSel(null)} title={sel ? `${sel[0]} · ${sel[1]}` : ""} size="lg">
        {sel && (
          <dl className="space-y-4 text-[13.5px] leading-6">
            {[["Isu", sel[2]], ["Klasifikasi SWOT", sel[3]], ["Relevansi standar", sel[4]], ["Risiko/peluang", sel[5]], ["Tindakan/pengendalian", sel[6]], ["Pemilik", sel[7]], ["Bukti pemantauan", sel[8]]].map(([l, v]) => (
              <div key={l}><dt className="text-xs font-medium text-navy-400">{l}</dt><dd className="mt-0.5 text-navy">{v}</dd></div>
            ))}
          </dl>
        )}
      </Dialog>
    </div>
  );
}

/* ---------------- Pemangku (dokumen resmi) ---------------- */

function PemangkuResmiView() {
  const [sel, setSel] = useState<PemangkuResmi | null>(null);
  const [prio, setPrio] = useState("semua");
  const list = PEMANGKU.filter((p) => prio === "semua" || p.prioritas === prio);
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {["semua", "A", "B", "C"].map((k) => (
            <button key={k} onClick={() => setPrio(k)} className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-medium", prio === k ? "border-navy bg-navy text-white" : "border-line bg-white text-navy-500 hover:border-navy-300")}>
              {k === "semua" ? `Semua (${PEMANGKU.length})` : `${PRIORITAS[k].label} (${PEMANGKU.filter((p) => p.prioritas === k).length})`}
            </button>
          ))}
        </div>
        <SumberResmi kode="PM.SMI.L8.2026" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => (
          <button key={p.no} onClick={() => setSel(p)} className="flex flex-col rounded-2xl border border-line bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lift">
            <div className="flex items-start justify-between gap-3">
              <div className="text-[15px] font-semibold leading-6 text-navy">{p.nama}</div>
              <Badge tone={PRIORITAS[p.prioritas]?.tone ?? "muted"}>{p.prioritas}</Badge>
            </div>
            <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-navy-500">{p.peran}</p>
            <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-[12px] text-navy-400">
              <span>Pengaruh: <b className="font-medium text-navy">{p.pengaruh}</b></span>
              <span>Kepentingan: <b className="font-medium text-navy">{p.kepentingan}</b></span>
              <span>{p.relevansi}</span>
            </div>
          </button>
        ))}
      </div>
      <p className="mt-4 flex gap-2 text-[12.5px] leading-5 text-navy-400"><Info className="mt-0.5 size-3.5 shrink-0" />{KETERANGAN_PRIORITAS}</p>
      <Dialog open={!!sel} onClose={() => setSel(null)} title={sel?.nama ?? ""} description={sel ? `Prioritas ${sel.prioritas} · Pengaruh ${sel.pengaruh} · Kepentingan ${sel.kepentingan}` : ""} size="lg">
        {sel && (
          <dl className="space-y-4 text-[13.5px] leading-6">
            {[["Peran/hubungan", sel.peran], ["Kebutuhan dan harapan", sel.kebutuhan], ["Persyaratan relevan", sel.persyaratan], ["Risiko/peluang", sel.risikoPeluang], ["Penanggung jawab", sel.pj], ["Media komunikasi", sel.media], ["Frekuensi", sel.frekuensi], ["Strategi keterlibatan", sel.strategi], ["Indikator pemantauan", sel.indikator]].map(([l, v]) => (
              <div key={l}><dt className="text-xs font-medium text-navy-400">{l}</dt><dd className="mt-0.5 text-navy">{v}</dd></div>
            ))}
          </dl>
        )}
      </Dialog>
    </>
  );
}

/* ---------------- Persyaratan & kepatuhan (L9) ---------------- */

function Kepatuhan() {
  const [sel, setSel] = useState<RegulasiRow | null>(null);
  const cols: Column<RegulasiRow>[] = [
    { key: "no", header: "No", sortValue: (r) => r[0], cell: (r) => <span className="tabular-nums text-navy-400">{r[0]}</span> },
    { key: "per", header: "Peraturan/persyaratan", className: "min-w-[300px]", cell: (r) => <span className="font-medium">{r[1]}</span> },
    { key: "unit", header: "Unit/proses terkait", className: "min-w-[200px]", cell: (r) => <span className="line-clamp-2 text-navy-500">{r[4]}</span> },
    { key: "status", header: "Status", cell: () => <Badge tone="muted">BD</Badge> },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-3xl text-[13.5px] leading-6 text-navy-500">Register awal {REGULASI.length} peraturan dan persyaratan yang berlaku bagi SMI. Status kepatuhan seluruh baris masih <b className="font-medium text-navy">BD (Belum Dinilai)</b>.</p>
        <SumberResmi kode="PM.SMI.L9.2026" />
      </div>
      <Card className="overflow-hidden">
        <DataTable rows={REGULASI} columns={cols} rowKey={(r) => String(r[0])} onRowClick={setSel} searchText={(r) => r.join(" ")} />
      </Card>
      <div>
        <div className="mb-3 text-[14px] font-semibold text-navy">Kode status kepatuhan</div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {KODE_KEPATUHAN.map(([k, isi]) => (
            <div key={k} className="rounded-xl border border-line bg-white p-4"><Kode>{k}</Kode><p className="mt-2 text-[12.5px] leading-5 text-navy-500">{isi}</p></div>
          ))}
        </div>
      </div>
      <p className="flex gap-2 text-[12.5px] leading-5 text-navy-400"><Info className="mt-0.5 size-3.5 shrink-0" />{CATATAN_REGULASI}</p>
      <Dialog open={!!sel} onClose={() => setSel(null)} title={sel ? `Peraturan ${sel[0]}` : ""} description={sel?.[1]} size="lg">
        {sel && (
          <dl className="space-y-4 text-[13.5px] leading-6">
            {[["Status dan sumber verifikasi", sel[2]], ["Kewajiban utama", sel[3]], ["Unit/proses terkait", sel[4]], ["Bukti kepatuhan", sel[5]], ["Frekuensi/PIC", sel[6]], ["Status penilaian", "BD — Belum Dinilai"]].map(([l, v]) => (
              <div key={l}><dt className="text-xs font-medium text-navy-400">{l}</dt><dd className="mt-0.5 text-navy">{v}</dd></div>
            ))}
          </dl>
        )}
      </Dialog>
    </div>
  );
}

/* ---------------- Halaman ---------------- */

export function KonteksPage() {
  const { query, navigate } = useRouter();
  const tab = query.get("tab") ?? "isu";
  const { content } = usePortal();
  const [jenis, setJenis] = useState<"internal" | "eksternal">("internal");
  const [selPihak, setSelPihak] = useState<Pihak | null>(null);
  const current = TABS.find((t) => t.key === tab) ?? TABS[0];

  const isuCols: Column<Isu>[] = [
    { key: "isu", header: "Isu", sortValue: (r) => r.isu, className: "min-w-[220px]", cell: (r) => <span className="font-medium">{r.isu}</span> },
    { key: "kategori", header: "Kategori", sortValue: (r) => r.kategori, cell: (r) => r.kategori || "—" },
    { key: "dampak", header: "Dampak", className: "min-w-[180px]", cell: (r) => <span className="text-navy-500">{r.dampak || "—"}</span> },
    { key: "unit", header: "Unit terkait", cell: (r) => <span className="text-navy-500">{r.unitTerkait || "—"}</span> },
    { key: "rp", header: "Risiko/peluang", cell: (r) => (r.risikoPeluang ? <Badge tone={/peluang/i.test(r.risikoPeluang) ? "ok" : "warn"}>{r.risikoPeluang}</Badge> : "—") },
    { key: "respons", header: "Respons organisasi", className: "min-w-[200px]", cell: (r) => <span className="text-navy-500">{r.respons || "—"}</span> },
    { key: "status", header: "Peninjauan", sortValue: (r) => r.statusTinjau, cell: (r) => (r.statusTinjau ? <Badge tone="accent">{r.statusTinjau}</Badge> : "—") },
  ];

  const lingkup: LoadState<Konten> = content.konten.status === "ok"
    ? { status: "ok", rows: content.konten.rows.filter((k) => k.kunci === KONTEN_KEYS.ruangLingkup) }
    : content.konten;

  const isuDb = dbRows(content.isu);
  const pihakDb = dbRows(content.pihak);
  const loading = (s: LoadState<unknown>) => s.status === "loading";

  return (
    <AppShell crumbs={[{ label: "Konteks Organisasi", to: "/konteks" }, { label: current.label }]}>
      <SectionHeading eyebrow="Konteks Organisasi" title={current.label} description="Pemahaman atas isu internal dan eksternal, kebutuhan pemangku kepentingan, dan persyaratan peraturan menjadi dasar penetapan ruang lingkup, risiko, dan sasaran SMI." />
      <div className="mb-6 flex w-fit max-w-full flex-wrap gap-1 rounded-xl border border-line bg-white p-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => navigate(t.key === "isu" ? "/konteks" : `/konteks?tab=${t.key}`)} className={cn("inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium", tab === t.key ? "bg-navy text-white" : "text-navy-500 hover:bg-canvas")}>
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "isu" && (loading(content.isu) ? <Skeleton className="h-64 rounded-2xl" /> : isuDb ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:w-fit">
            {(["internal", "eksternal"] as const).map((j) => (
              <button key={j} onClick={() => setJenis(j)} className={cn("rounded-2xl border px-5 py-4 text-left transition", jenis === j ? "border-accent bg-accent-soft" : "border-line bg-white hover:border-navy-300")}>
                <div className="text-[26px] font-semibold tabular-nums text-navy">{isuDb.filter((r) => r.jenis === j).length}</div>
                <div className="text-[13px] capitalize text-navy-500">Isu {j}</div>
              </button>
            ))}
          </div>
          <Card className="overflow-hidden">
            <DataTable rows={isuDb.filter((r) => r.jenis === jenis)} columns={isuCols} rowKey={(r) => r.id} searchText={(r) => `${r.isu} ${r.kategori} ${r.unitTerkait} ${r.respons}`} />
          </Card>
        </>
      ) : <IsuResmi />)}

      {tab === "pihak" && (loading(content.pihak) ? <Skeleton className="h-64 rounded-2xl" /> : pihakDb ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pihakDb.map((p) => (
            <button key={p.id} onClick={() => setSelPihak(p)} className="rounded-2xl border border-line bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="text-[15px] font-semibold text-navy">{p.pihak}</div>
              <div className="mt-3 text-xs font-medium text-navy-400">Kebutuhan</div>
              <p className="line-clamp-2 text-[13px] leading-5 text-navy-500">{p.kebutuhan || "—"}</p>
              <div className="mt-2 text-xs font-medium text-navy-400">Harapan</div>
              <p className="line-clamp-2 text-[13px] leading-5 text-navy-500">{p.harapan || "—"}</p>
            </button>
          ))}
        </div>
      ) : <PemangkuResmiView />)}

      {tab === "kepatuhan" && <Kepatuhan />}

      {tab === "lingkup" && (
        lingkup.status === "ok" && lingkup.rows[0]?.isi ? (
          <ContentState state={lingkup} pending={{ title: "Ruang lingkup SMI belum dimuat", table: PORTAL_TABLES.konten }}>
            {(rows) => <article className="whitespace-pre-line rounded-2xl border border-line bg-white p-6 text-[14.5px] leading-7 text-navy sm:p-8">{rows[0].isi}</article>}
          </ContentState>
        ) : lingkup.status === "loading" ? <Skeleton className="h-64 rounded-2xl" /> : <RuangLingkupView />
      )}

      <Dialog open={!!selPihak} onClose={() => setSelPihak(null)} title={selPihak?.pihak ?? ""}>
        {selPihak && (
          <dl className="space-y-4 text-[13.5px] leading-6">
            {[["Kebutuhan", selPihak.kebutuhan], ["Harapan", selPihak.harapan], ["Persyaratan relevan", selPihak.persyaratan], ["Proses terkait", selPihak.proses]].map(([l, v]) => (
              <div key={l}><dt className="text-xs font-medium text-navy-400">{l}</dt><dd className="mt-0.5 text-navy">{v || "—"}</dd></div>
            ))}
          </dl>
        )}
      </Dialog>
    </AppShell>
  );
}
