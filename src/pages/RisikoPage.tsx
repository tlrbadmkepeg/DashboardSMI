import { Fragment, useState } from "react";
import { ShieldAlert, Scale, Lock, Info, CalendarClock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { Kode, SumberResmi, TabelResmi, dbRows } from "@/components/portal/Resmi";
import { ALUR_DEKLARASI, JENIS_BK, MATRIKS_BK, METODE_RISIKO, MONEV_BK, PELUANG, PEMANTAUAN_RISIKO, PENGANTAR_FKAP_2026, PERAN_BK, RENCANA_FKAP_2026, RISIKO_PENYUAPAN, RISIKO_STRATEGIS, type RisikoResmi } from "@/content/resmi/risiko";
import { TATA_KELOLA, UNIT_RESMI } from "@/content/resmi/organisasi";
import { AppShell } from "@/components/layout/AppShell";
import { ContentState, PendingContent, SectionHeading } from "@/components/portal/ContentState";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePortal } from "@/hooks/usePortal";
import { useAuth } from "@/auth/AuthProvider";
import { useRouter } from "@/lib/router";
import { FKAP_UMUM, TOPIK_INTEGRITAS, PILAR } from "@/content/portal";
import { KONTEN_KEYS, PORTAL_TABLES } from "@/config/schema";
import type { Konten, LoadState, Risiko } from "@/types/portal";
import { cn } from "@/lib/utils";
import { MatriksRisikoTab } from "./RisikoMatriksTab";

const levelTone = (t: string) => (/sangat tinggi|ekstrem|tinggi/i.test(t) ? "bad" : /sedang|menengah/i.test(t) ? "warn" : /rendah/i.test(t) ? "ok" : "muted") as "bad" | "warn" | "ok" | "muted";
const cellColor = (k: number, d: number) => { const s = k * d; return s >= 15 ? "#E5484D" : s >= 8 ? "#F5A524" : s >= 4 ? "#FDE68A" : "#BBE5CF"; };

function RiskHeatmap({ rows }: { rows: Risiko[] }) {
  const scored = rows.filter((r) => r.kemungkinan && r.dampak);
  if (!scored.length) return <p className="py-6 text-[13px] text-navy-400">Nilai kemungkinan dan dampak belum tercatat, sehingga peta panas belum dapat digambar.</p>;
  const max = Math.max(5, ...scored.map((r) => Math.max(r.kemungkinan!, r.dampak!)));
  const levels = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <div className="overflow-x-auto">
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `28px repeat(${max}, 52px)` }}>
        {levels.slice().reverse().map((k) => (
          <Fragment key={`r${k}`}>
            <div className="grid place-items-center text-[11px] text-navy-400">{k}</div>
            {levels.map((d) => {
              const n = scored.filter((r) => r.kemungkinan === k && r.dampak === d).length;
              return <div key={`${k}-${d}`} title={`Kemungkinan ${k}, dampak ${d}: ${n} risiko`} className="grid h-11 place-items-center rounded-md text-[13px] font-semibold text-navy" style={{ background: cellColor(k, d), opacity: n ? 1 : 0.35 }}>{n || ""}</div>;
            })}
          </Fragment>
        ))}
        <div />
        {levels.map((d) => <div key={`d${d}`} className="text-center text-[11px] text-navy-400">{d}</div>)}
      </div>
      <div className="mt-2 text-[11.5px] text-navy-400">Sumbu tegak: kemungkinan · sumbu datar: dampak</div>
    </div>
  );
}

/** Register induk dari PM.SMI.L10.2026. Penilaian K/D/residu seluruhnya masih BD. */
function RegisterResmi() {
  const { profile } = useAuth();
  const [jenis, setJenis] = useState<"R" | "RP" | "OP">("R");
  const [sel, setSel] = useState<RisikoResmi | null>(null);
  const cols: Column<RisikoResmi>[] = [
    { key: "kode", header: "ID", sortValue: (r) => r.kode, cell: (r) => <Kode>{r.kode}</Kode> },
    { key: "area", header: "Area/proses", sortValue: (r) => r.area, className: "min-w-[190px]", cell: (r) => <span className="font-medium">{r.area}</span> },
    { key: "uraian", header: jenis === "RP" ? "Skenario" : "Risiko – penyebab – dampak", className: "min-w-[300px]", cell: (r) => <span className="line-clamp-3 text-navy-500">{r.uraian}</span> },
    { key: "rel", header: "Relevansi", cell: (r) => <span className="whitespace-nowrap text-[12.5px] text-navy-500">{r.relevansi}</span> },
    { key: "pemilik", header: "Pemilik", className: "min-w-[170px]", cell: (r) => <span className="text-[12.5px] text-navy-500">{r.pemilik}</span> },
    { key: "nilai", header: "Penilaian", cell: (r) => <Badge tone="muted">{r.penilaian}</Badge> },
  ];
  const counts: [typeof jenis, string, number][] = [["R", "Risiko strategis & lintas SMI", RISIKO_STRATEGIS.length], ["RP", "Risiko penyuapan", RISIKO_PENYUAPAN.length], ["OP", "Peluang peningkatan", PELUANG.length]];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid flex-1 grid-cols-3 gap-3 sm:max-w-xl">
          {counts.map(([k, l, n]) => (
            <button key={k} onClick={() => setJenis(k)} className={cn("rounded-2xl border px-4 py-4 text-left transition", jenis === k ? "border-accent bg-accent-soft" : "border-line bg-white hover:border-navy-300")}>
              <div className="text-[26px] font-semibold tabular-nums text-navy">{n}</div>
              <div className="text-[12.5px] leading-5 text-navy-500">{l}</div>
            </button>
          ))}
        </div>
        <SumberResmi kode="PM.SMI.L10.2026" />
      </div>
      <div className="flex gap-3 rounded-2xl border border-warn/25 bg-warn-soft/50 p-4 text-[13px] leading-6 text-navy">
        <Info className="mt-0.5 size-4 shrink-0 text-warn" />
        <span>Nilai kemungkinan (K), dampak (D), dan risiko residu pada register induk masih berstatus <b>BD (Belum Dinilai)</b>, sehingga peta panas risiko belum dapat digambar. Register rinci setiap unit dipelihara terpisah sebagai informasi terdokumentasi yang dinamis.</span>
      </div>
      {jenis === "OP" ? (
        <TabelResmi head={["ID", "Peluang", "Dasar/manfaat", "Rencana realisasi", "Pemilik", "Target"]} widths={["", "min-w-[180px]", "min-w-[200px]", "min-w-[220px]", "min-w-[160px]", "min-w-[90px]"]}
          rows={PELUANG.map((o) => [<Kode>{o[0]}</Kode>, <span className="font-medium">{o[1]}</span>, o[2], o[3], o[4], <span className="whitespace-nowrap">{o[6]} · BD</span>])} />
      ) : jenis === "RP" && !profile ? (
        <div className="space-y-4">
          <PendingContent compact kind="tidak-berwenang" title="Rincian risiko penyuapan terbatas" description="Pengunjung dapat melihat area risiko penyuapan yang dipetakan. Skenario, kerentanan, dan pengendalian rinci hanya dapat diakses petugas yang berwenang." />
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {RISIKO_PENYUAPAN.map((r) => <li key={r.kode} className="rounded-xl border border-line bg-white px-4 py-3"><Kode>{r.kode}</Kode><div className="mt-1.5 text-[13px] font-medium leading-5 text-navy">{r.area}</div></li>)}
          </ol>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <DataTable rows={jenis === "R" ? RISIKO_STRATEGIS : RISIKO_PENYUAPAN} columns={cols} rowKey={(r) => r.kode} onRowClick={setSel} searchText={(r) => `${r.kode} ${r.area} ${r.uraian} ${r.pemilik}`} pageSize={12} />
        </Card>
      )}

      {profile && (
        <section className="pt-4">
          <SectionHeading eyebrow="Internal" title="Paparan risiko penyuapan per unit kerja" description="Paparan prioritas yang wajib dinilai dalam register setiap unit." />
          <TabelResmi head={["Unit", "Paparan prioritas", "Penanggung jawab"]} widths={["min-w-[180px]", "min-w-[300px]", "min-w-[220px]"]}
            rows={UNIT_RESMI.map((u) => [<span className="font-medium">{u.singkatan}</span>, u.paparanSuap.paparan, u.paparanSuap.pj])} />
        </section>
      )}

      <section className="pt-4">
        <SectionHeading eyebrow="Pemantauan" title="Pemutakhiran register" />
        <TabelResmi head={["Kegiatan", "Pelaksana", "Frekuensi/pemicu", "Keluaran"]} widths={["min-w-[160px]", "min-w-[160px]", "min-w-[220px]", "min-w-[220px]"]}
          rows={PEMANTAUAN_RISIKO.map((r) => [<span className="font-medium">{r[0]}</span>, r[1], r[2], r[3]])} />
      </section>

      <Dialog open={!!sel} onClose={() => setSel(null)} title={sel ? `${sel.kode} · ${sel.area}` : ""} size="lg">
        {sel && (
          <dl className="space-y-4 text-[13.5px] leading-6">
            {([[sel.jenis === "RP" ? "Skenario" : "Risiko, penyebab, dan dampak", sel.uraian], ["Kerentanan dan dampak", sel.kerentanan], ["Pengendalian utama", sel.pengendalian], ["Pemilik", sel.pemilik], ["Relevansi", sel.relevansi], ["Penilaian/residu", "BD (Belum Dinilai)"], ["Status tindakan", sel.status]] as [string, string | undefined][]).filter(([, v]) => v).map(([l, v]) => (
              <div key={l}><dt className="text-xs font-medium text-navy-400">{l}</dt><dd className="mt-0.5 text-navy">{v}</dd></div>
            ))}
          </dl>
        )}
      </Dialog>
    </div>
  );
}

function Register() {
  const { content } = usePortal();
  const { profile } = useAuth();
  const [jenis, setJenis] = useState<"semua" | "mutu" | "penyuapan" | "peluang">("semua");
  const metode: LoadState<Konten> = content.konten.status === "ok" ? { status: "ok", rows: content.konten.rows.filter((k) => k.kunci === KONTEN_KEYS.metodeRisiko) } : content.konten;

  const cols: Column<Risiko>[] = [
    { key: "kode", header: "Kode", sortValue: (r) => r.kode, cell: (r) => <span className="font-mono text-[12.5px] text-navy-500">{r.kode || "—"}</span> },
    { key: "uraian", header: "Risiko / peluang", className: "min-w-[240px]", cell: (r) => <span className="font-medium">{r.uraian}</span> },
    { key: "kategori", header: "Kategori", sortValue: (r) => r.kategori, cell: (r) => r.kategori || "—" },
    { key: "tingkat", header: "Tingkat", sortValue: (r) => (r.kemungkinan ?? 0) * (r.dampak ?? 0), cell: (r) => (r.tingkat ? <Badge tone={levelTone(r.tingkat)} dot>{r.tingkat}</Badge> : "—") },
    { key: "pengendalian", header: "Pengendalian", className: "min-w-[200px]", cell: (r) => <span className="text-navy-500">{r.pengendalian || "—"}</span> },
    { key: "mitigasi", header: "Mitigasi", className: "min-w-[200px]", cell: (r) => <span className="text-navy-500">{r.mitigasi || "—"}</span> },
    { key: "status", header: "Pemantauan", sortValue: (r) => r.statusPantau, cell: (r) => (r.statusPantau ? <Badge tone="accent">{r.statusPantau}</Badge> : "—") },
  ];

  const dbRisiko = dbRows(content.risiko);
  return (
    <>
      {content.risiko.status === "loading" ? <Skeleton className="h-64 rounded-2xl" /> : !dbRisiko ? <RegisterResmi /> : <ContentState state={content.risiko} pending={{ title: "Register risiko dan peluang belum dipublikasikan", description: "Ringkasan risiko mutu, risiko penyuapan, dan peluang perbaikan tampil setelah register yang disetujui dimuat. Rincian risiko penyuapan tetap terbatas bagi petugas berwenang.", source: "Register Risiko dan Peluang · Register Risiko Penyuapan", table: PORTAL_TABLES.risiko }}>
        {(all) => {
          // Rincian risiko penyuapan hanya untuk petugas; pengunjung melihat jumlahnya saja.
          const visible = all.filter((r) => profile || r.jenis !== "penyuapan");
          const rows = visible.filter((r) => jenis === "semua" || r.jenis === jenis);
          return (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[["semua", "Semua", all.length], ["mutu", "Risiko mutu", all.filter((r) => r.jenis === "mutu").length], ["penyuapan", "Risiko penyuapan", all.filter((r) => r.jenis === "penyuapan").length], ["peluang", "Peluang", all.filter((r) => r.jenis === "peluang").length]].map(([k, l, n]) => (
                  <button key={k as string} onClick={() => setJenis(k as any)} className={cn("rounded-2xl border px-5 py-4 text-left transition", jenis === k ? "border-accent bg-accent-soft" : "border-line bg-white hover:border-navy-300")}>
                    <div className="text-[26px] font-semibold tabular-nums text-navy">{n as number}</div>
                    <div className="text-[13px] text-navy-500">{l as string}</div>
                  </button>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
                <Card><CardHeader title="Peta panas risiko" description="Jumlah risiko per kombinasi nilai" /><CardBody><RiskHeatmap rows={visible.filter((r) => r.jenis !== "peluang")} /></CardBody></Card>
                <Card className="overflow-hidden">
                  {!profile && jenis === "penyuapan" ? (
                    <div className="p-6"><PendingContent compact kind="tidak-berwenang" title="Rincian risiko penyuapan terbatas" description="Pengunjung dapat melihat jumlahnya. Rincian register risiko penyuapan hanya dapat diakses petugas yang berwenang." /></div>
                  ) : (
                    <DataTable rows={rows} columns={cols} rowKey={(r) => r.id} searchText={(r) => `${r.kode} ${r.uraian} ${r.kategori} ${r.unit}`} />
                  )}
                </Card>
              </div>
            </div>
          );
        }}
      </ContentState>}
      <section className="mt-10">
        <SectionHeading eyebrow="Metode" title="Metode penilaian terintegrasi" />
        {!(metode.status === "ok" && metode.rows.length) ? (
          <div className="space-y-3">
            <TabelResmi head={["Komponen", "Ketentuan umum", "Ketentuan khusus risiko penyuapan"]} widths={["min-w-[140px]", "min-w-[260px]", "min-w-[280px]"]}
              rows={METODE_RISIKO.map((m) => [<span className="font-medium">{m[0]}</span>, m[1], m[2]])} />
            <SumberResmi kode="PM.SMI.L10.2026" />
          </div>
        ) : <ContentState state={metode} pending={{ title: "Matriks risiko resmi belum dimuat", description: "Kriteria kemungkinan, dampak, dan tingkat risiko mengikuti matriks risiko resmi BPSDMP.", source: "Pedoman Manajemen Risiko BPSDMP", table: `${PORTAL_TABLES.konten} · ${KONTEN_KEYS.metodeRisiko}`, compact: true }}>
          {(rows) => <article className="whitespace-pre-line rounded-2xl border border-line bg-white p-6 text-[14px] leading-7 text-navy">{rows[0].isi}</article>}
        </ContentState>}
      </section>
    </>
  );
}

function BkMatriks() {
  const [sel, setSel] = useState<(typeof MATRIKS_BK)[number] | null>(null);
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {MATRIKS_BK.map((r) => (
          <button key={r[0]} onClick={() => setSel(r)} className="rounded-2xl border border-line bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lift">
            <Kode>{r[0]}</Kode>
            <div className="mt-2 text-[14px] font-semibold leading-6 text-navy">{r[1]}</div>
            <p className="mt-1 line-clamp-2 text-[12.5px] leading-5 text-navy-500">{r[3]}</p>
          </button>
        ))}
      </div>
      <Dialog open={!!sel} onClose={() => setSel(null)} title={sel ? `${sel[0]} · ${sel[1]}` : ""} size="lg">
        {sel && (
          <dl className="space-y-4 text-[13.5px] leading-6">
            {[["Sumber", sel[2]], ["Situasi", sel[3]], ["Keputusan berisiko", sel[4]], ["Pengendalian/penanganan dan bukti", sel[5]], ["Pemilik", sel[6]]].map(([l, v]) => (
              <div key={l}><dt className="text-xs font-medium text-navy-400">{l}</dt><dd className="mt-0.5 text-navy">{v}</dd></div>
            ))}
          </dl>
        )}
      </Dialog>
    </>
  );
}

function Fkap() {
  const { content, konten } = usePortal();
  const fkap = konten(KONTEN_KEYS.fkap);
  const pelaporan = konten(KONTEN_KEYS.pelaporan);
  const loading = content.konten.status === "loading";
  const integritas = PILAR.find((p) => p.key === "integritas")!;
  const fkapL5 = TATA_KELOLA.unsur.find((u) => u.id === "fkap")!;
  return (
    <div className="space-y-10">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl p-6 text-white" style={{ background: integritas.warna }}>
          <Scale className="size-7 text-white/80" />
          <h2 className="mt-4 text-[22px] font-semibold leading-snug">Fungsi Kepatuhan Anti Penyuapan</h2>
          <p className="mt-2 text-[14px] leading-7 text-white/80">Fungsi yang mengawasi penerapan sistem manajemen anti penyuapan secara independen dan memiliki akses langsung kepada pimpinan.</p>
          <div className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-[12px] text-white/75">Kerangka tugas mengacu pada {integritas.standar}</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {FKAP_UMUM.map((t) => (
            <div key={t.judul} className="rounded-2xl border border-line bg-white p-5">
              <div className="text-[14.5px] font-semibold text-navy">{t.judul}</div>
              <p className="mt-1.5 text-[13px] leading-6 text-navy-500">{t.isi}</p>
            </div>
          ))}
        </div>
      </div>
      <section>
        <SectionHeading eyebrow="Penetapan di BPSDMP" title="Tugas dan tanggung jawab FKAP" />
        {loading ? null : fkap?.isi ? <article className="whitespace-pre-line rounded-2xl border border-line bg-white p-6 text-[14px] leading-7 text-navy">{fkap.isi}</article> : (
          <div className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-3">
              {[["Komposisi", fkapL5.komposisi], ["Tanggung jawab", fkapL5.tanggungJawab], ["Pelaporan dan independensi", fkapL5.pelaporan]].map(([l, v]) => (
                <div key={l} className="rounded-2xl border border-line bg-white p-5"><div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-teal">{l}</div><p className="mt-2 text-[13.5px] leading-6 text-navy">{v}</p></div>
              ))}
            </div>
            <p className="text-[12.5px] text-navy-400">{TATA_KELOLA.catatanPersonel}</p>
            <SumberResmi kode="PM.SMI.L5.2026" />
          </div>
        )}
      </section>

      <section>
        <SectionHeading eyebrow="Rencana 2026" title="Rencana kegiatan Fungsi Anti Penyuapan" description={PENGANTAR_FKAP_2026} />
        <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {RENCANA_FKAP_2026.map(([no, keg, waktu, hasil]) => (
            <li key={no} className="flex flex-col rounded-2xl border border-line bg-white p-5">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-teal-soft px-2.5 py-1 text-[11.5px] font-semibold text-teal"><CalendarClock className="size-3.5" />{waktu}</span>
              <p className="mt-3 flex-1 text-[13.5px] font-medium leading-6 text-navy">{keg}</p>
              <p className="mt-3 border-t border-line pt-3 text-[12.5px] leading-5 text-navy-500"><span className="text-navy-400">Hasil: </span>{hasil}</p>
            </li>
          ))}
        </ol>
        <div className="mt-3 flex flex-wrap items-center gap-3"><SumberResmi kode="PM.SMI.L14.2026" /><span className="text-[12px] text-navy-400">Status pelaksanaan tampil setelah dilaporkan.</span></div>
      </section>

      <section>
        <SectionHeading eyebrow="Benturan kepentingan" title="Jenis, sumber, dan pengendalian" />
        <TabelResmi head={["Komponen", "Kategori", "Makna/ruang lingkup", "Pengendalian"]} widths={["", "min-w-[150px]", "min-w-[260px]", "min-w-[260px]"]}
          rows={JENIS_BK.map((r) => [<span className="text-navy-400">{r[0]}</span>, <span className="font-medium">{r[1]}</span>, r[2], r[3]])} />
      </section>

      <section>
        <SectionHeading eyebrow="Matriks strategis" title="Situasi benturan kepentingan lintas unit" />
        <BkMatriks />
        <SumberResmi kode="PM.SMI.L11.2026" className="mt-3" />
      </section>

      <section>
        <SectionHeading eyebrow="Alur" title="Deklarasi dan penanganan benturan kepentingan aktual" />
        <ol className="grid gap-3 md:grid-cols-5">
          {ALUR_DEKLARASI.map(([t, pel, tind, batas, out]) => (
            <li key={t} className="relative rounded-2xl border border-line bg-white p-5">
              <span className="grid size-8 place-items-center rounded-full bg-navy text-[13px] font-semibold text-white">{t}</span>
              <div className="mt-3 text-[12px] font-semibold text-teal">{pel}</div>
              <p className="mt-1 text-[13px] leading-6 text-navy">{tind}</p>
              <div className="mt-3 border-t border-line pt-3 text-[12px] leading-5 text-navy-500"><b className="font-medium text-navy">{batas}</b> · {out}</div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <div className="min-w-0">
          <SectionHeading eyebrow="Peran" title="Pembagian peran dan batas kewenangan" />
          <div className="space-y-2">
            {PERAN_BK.map(([u, p, b]) => (
              <div key={u} className="rounded-xl border border-line bg-white p-4"><div className="text-[13.5px] font-semibold text-navy">{u}</div><p className="mt-1 text-[13px] leading-6 text-navy-500">{p}</p><p className="mt-1 text-[12.5px] leading-5 text-navy-400">Batas: {b}</p></div>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <SectionHeading eyebrow="Monitoring" title="Indikator monitoring dan evaluasi" />
          <TabelResmi dense head={["Indikator", "Target", "Frekuensi"]} rows={MONEV_BK.map((m) => [m[0], <span className="font-medium">{m[1]}</span>, m[2]])} />
        </div>
      </section>
      <section>
        <SectionHeading eyebrow="Pengendalian" title="Ruang lingkup pengendalian integritas" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOPIK_INTEGRITAS.map((t) => (
            <div key={t.judul} className="rounded-2xl border border-line bg-white p-5">
              <ShieldAlert className="size-5 text-teal" />
              <div className="mt-3 text-[14.5px] font-semibold text-navy">{t.judul}</div>
              <p className="mt-1.5 text-[13px] leading-6 text-navy-500">{t.isi}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <SectionHeading eyebrow="Pelaporan" title="Mekanisme pelaporan dugaan penyuapan" />
        {pelaporan?.isi ? <article className="whitespace-pre-line rounded-2xl border border-line bg-white p-6 text-[14px] leading-7 text-navy">{pelaporan.isi}</article> : (
          <PendingContent compact title="Saluran pelaporan resmi belum dimuat" description="Kanal pelaporan, jaminan kerahasiaan, dan perlindungan pelapor ditampilkan sesuai ketentuan resmi. Portal tidak menampilkan kontak yang belum ditetapkan." table={`${PORTAL_TABLES.konten} · ${KONTEN_KEYS.pelaporan}`} />
        )}
        <p className="mt-3 flex gap-2 text-[12.5px] text-navy-400"><Lock className="mt-0.5 size-3.5 shrink-0" /> Identitas pelapor dan detail laporan tidak pernah ditampilkan di portal.</p>
      </section>
    </div>
  );
}

export function RisikoPage() {
  const { segments, navigate } = useRouter();
  const tab = segments[1] === "fkap" ? "fkap" : segments[1] === "register" ? "register" : "matriks";
  const TABS = [["matriks", "/risiko", "Matriks Risiko 2026"], ["register", "/risiko/register", "Register Risiko & Peluang"], ["fkap", "/risiko/fkap", "Fungsi Kepatuhan Anti Penyuapan"]] as const;
  const judul = TABS.find((t) => t[0] === tab)![2];
  return (
    <AppShell crumbs={[{ label: "Risiko & Peluang", to: "/risiko" }, { label: judul }]}>
      <SectionHeading eyebrow="Risiko & Peluang" title={tab === "fkap" ? "Integritas dan anti penyuapan" : tab === "matriks" ? "Dashboard Matriks Risiko 2026" : "Register risiko dan peluang"} description={tab === "register" ? "Risiko strategis dan lintas SMI, risiko penyuapan, dan peluang peningkatan beserta pengendalian dan status pemantauannya (PM.SMI.L10.2026)." : undefined} />
      <div className="mb-6 flex w-fit max-w-full flex-wrap gap-1 rounded-xl border border-line bg-white p-1">
        {TABS.map(([id, to, l]) => (
          <button key={id} onClick={() => navigate(to)} className={cn("rounded-lg px-3.5 py-2 text-[13px] font-medium", tab === id ? "bg-navy text-white" : "text-navy-500 hover:bg-canvas")}>{l}</button>
        ))}
      </div>
      {tab === "fkap" ? <Fkap /> : tab === "register" ? <Register /> : <MatriksRisikoTab />}
      {tab === "register" && <p className="mt-6 flex gap-2 text-[12px] text-navy-400"><Info className="mt-0.5 size-3.5 shrink-0" /> Register induk ditampilkan sesuai dokumen terkendali; rincian risiko penyuapan dan register unit hanya untuk petugas berwenang.</p>}
    </AppShell>
  );
}
