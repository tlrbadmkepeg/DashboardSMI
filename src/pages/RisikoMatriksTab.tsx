import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, Info, Lock, ShieldAlert, Activity, Lightbulb } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/common/DataTable";
import { PendingContent, SectionHeading } from "@/components/portal/ContentState";
import { Kode, SumberResmi, TabelResmi } from "@/components/portal/Resmi";
import { HeatmapRisiko, LABEL_SASARAN_RISIKO, LevelDonut, PERLU_PERHATIAN, PerSasaranBars, useRingkasRisiko } from "@/components/portal/RisikoRingkas";
import { LEVEL_RISIKO, MATRIKS_RISIKO_2026, isRisikoSensitif, warnaLevel, type RisikoMatriks } from "@/content/resmi/matriksRisiko";
import { PELUANG } from "@/content/resmi/risiko";
import { useAuth } from "@/auth/AuthProvider";
import { cn } from "@/lib/utils";

const pecahPj = (pj: string) => pj.split(/[,;]\s*|\s+dan\s+/).map((x) => x.trim()).filter(Boolean);

function LevelPill({ level }: { level: string }) {
  return <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-semibold text-white" style={{ background: warnaLevel(level) }}>{level || "—"}</span>;
}

/** Tab "Matriks Risiko 2026": ringkasan publik + register dan detail untuk petugas. */
export function MatriksRisikoTab() {
  const { profile } = useAuth();
  const rr = useRingkasRisiko();
  const [sel, setSel] = useState<RisikoMatriks | null>(null);
  const [fNo, setFNo] = useState("semua");
  const [fLevel, setFLevel] = useState("semua");
  const [fCell, setFCell] = useState<string | null>(null);

  const perPj = useMemo(() => {
    const m = new Map<string, number>();
    MATRIKS_RISIKO_2026.forEach((r) => pecahPj(r.pj).forEach((p) => m.set(p, (m.get(p) ?? 0) + 1)));
    return Array.from(m).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, []);
  const maxPj = Math.max(...perPj.map((p) => p[1]), 1);

  const rows = MATRIKS_RISIKO_2026.filter((r) =>
    (fNo === "semua" || String(r.no) === fNo) && (fLevel === "semua" || r.level === fLevel) && (!fCell || `${r.k}-${r.d}` === fCell));
  const perhatian = MATRIKS_RISIKO_2026.filter(PERLU_PERHATIAN).sort((a, b) => (b.skor ?? 0) - (a.skor ?? 0));

  const cols: Column<RisikoMatriks>[] = [
    { key: "id", header: "ID", sortValue: (r) => r.id, cell: (r) => <Kode>{r.id}</Kode> },
    { key: "no", header: "Sasaran", sortValue: (r) => r.no, className: "min-w-[150px]", cell: (r) => <span className="text-[12.5px] text-navy-500">{r.no}. {LABEL_SASARAN_RISIKO[r.no]}</span> },
    { key: "proses", header: "Proses", sortValue: (r) => r.proses, className: "min-w-[180px]", cell: (r) => <span className="font-medium">{r.proses}</span> },
    { key: "risiko", header: "Risiko", className: "min-w-[280px]", cell: (r) => <span className="line-clamp-3 text-navy-500">{r.risiko}</span> },
    { key: "kd", header: "K × D", sortValue: (r) => r.skor ?? 0, cell: (r) => <span className="whitespace-nowrap tabular-nums">{r.k ?? "—"} × {r.d ?? "—"} = <b>{r.skor ?? "—"}</b></span> },
    { key: "level", header: "Level", sortValue: (r) => r.skor ?? 0, cell: (r) => <LevelPill level={r.level} /> },
    { key: "respons", header: "Respons", cell: (r) => <span className="text-[12.5px] text-navy-500">{r.respons || "—"}</span> },
  ];
  const sel_ = "h-9 rounded-xl border border-line bg-white px-3 text-[13px] text-navy focus:border-accent focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-3xl text-[14px] leading-6 text-navy-500">Matriks Risiko Sistem Manajemen Integrasi BPSDMP Tahun 2026: {rr.total} risiko pada {rr.sasaran} sasaran/tujuan, dinilai dengan skala kemungkinan (K) dan keparahan (D) 1–5.</p>
        <SumberResmi kode="Matriks Risiko SMI BPSDMP 2026" />
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {([
          ["Total risiko", rr.total, "#142D4E", ShieldAlert, `${rr.sasaran} sasaran/tujuan`],
          ["Perlu pengendalian lanjut", rr.perhatian, "#DC2626", AlertTriangle, "Level Tinggi & Sangat Tinggi"],
          ["Risiko penyuapan", rr.penyuapan, "#A97A20", Lock, "Rincian terbatas"],
          ["Pengendalian ditetapkan", `${rr.berpengendalian}/${rr.total}`, "#0F766E", CheckCircle2, rr.respons.map(([k, n]) => `${k}: ${n}`).join(" · ")],
          ["Penilaian residual", rr.residual ? `${rr.residual}/${rr.total}` : "Belum tersedia", "#2563EB", Activity, rr.residual ? "Sudah dinilai ulang" : "Kolom residual belum diisi"],
        ] as const).map(([l, v, c, Icon, h]) => (
          <div key={l} className="relative overflow-hidden rounded-2xl border border-line bg-white p-4 shadow-card">
            <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: c }} />
            <div className="flex items-start justify-between gap-2"><span className="text-[13px] font-semibold leading-5 text-navy-600">{l}</span><Icon className="size-[18px] shrink-0" style={{ color: c }} /></div>
            <div className={cn("mt-2.5 font-display font-bold leading-none tabular-nums text-navy", typeof v === "string" && v.startsWith("Belum") ? "text-[15px] text-navy-400" : "text-[28px]")}>{v}</div>
            <div className="mt-1.5 text-[11.5px] leading-4 text-navy-400">{h}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3 [&>*]:min-w-0">
        <Card><CardHeader title="Distribusi level risiko" description="Penilaian inheren (sebelum pengendalian tambahan)" /><CardBody><LevelDonut /></CardBody></Card>
        <Card>
          <CardHeader title="Peta panas K × D" description={fCell ? `Menyaring sel K${fCell.split("-")[0]} × D${fCell.split("-")[1]}` : "Klik sel untuk menyaring register"} action={fCell ? <button onClick={() => setFCell(null)} className="text-[12.5px] font-semibold text-accent hover:underline">Hapus</button> : undefined} />
          <CardBody><HeatmapRisiko selected={fCell} onCell={(k, d) => setFCell(fCell === `${k}-${d}` ? null : `${k}-${d}`)} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Pita level risiko" description="Kriteria skor sesuai matriks" />
          <CardBody>
            <ul className="space-y-2">
              {LEVEL_RISIKO.slice().reverse().map((l) => (
                <li key={l.level} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2" style={{ background: `${l.warna}14` }}>
                  <span className="flex items-center gap-2 text-[13.5px] font-semibold text-navy"><span className="size-3 rounded-[4px]" style={{ background: l.warna }} />{l.level}</span>
                  <span className="text-[12.5px] text-navy-500">{l.rentang}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] leading-5 text-navy-400">Skor tercantum di matriks dan bukan hasil perkalian K × D sederhana; portal menampilkan skor apa adanya.</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <Card><CardHeader title="Risiko per sasaran/tujuan" description="Klik untuk menyaring register" /><CardBody><PerSasaranBars onSelect={(no) => setFNo(String(no))} /></CardBody></Card>
        <Card>
          <CardHeader title="Risiko per penanggung jawab" description="Satu risiko dapat memiliki beberapa penanggung jawab" />
          <CardBody>
            <ul className="space-y-2">
              {perPj.map(([p, n]) => (
                <li key={p} className="grid grid-cols-[minmax(0,210px)_1fr_24px] items-center gap-3">
                  <span className="truncate text-[13px] text-navy-600" title={p}>{p}</span>
                  <span className="h-3 rounded-full bg-accent/80" style={{ width: `${(n / maxPj) * 100}%` }} />
                  <span className="text-right font-display text-[13px] font-bold tabular-nums text-navy">{n}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* Risiko memerlukan perhatian — ringkas publik */}
      <section>
        <SectionHeading eyebrow="Prioritas" title="Risiko yang memerlukan perhatian" description="Risiko berlevel Tinggi dan Sangat Tinggi. Risiko penyuapan ditampilkan sebagai jumlah agregat bagi pengunjung." />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {perhatian.filter((r) => profile || !isRisikoSensitif(r)).map((r) => (
            <button key={r.id} onClick={() => profile && setSel(r)} disabled={!profile} className={cn("flex items-start gap-3 rounded-2xl border border-line bg-white p-4 text-left shadow-card", profile && "transition hover:-translate-y-0.5 hover:shadow-lift")}>
              <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl font-display text-[15px] font-bold text-white" style={{ background: warnaLevel(r.level) }}>{r.skor}</span>
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold text-navy-400">{r.id} · Sasaran {r.no}</span>
                <span className="block font-display text-[14.5px] font-bold leading-snug text-navy">{r.proses}</span>
                <span className="mt-1 block"><LevelPill level={r.level} /></span>
              </span>
            </button>
          ))}
          {!profile && perhatian.some(isRisikoSensitif) && (
            <div className="flex items-start gap-3 rounded-2xl border border-dashed border-gold/50 bg-gold-soft/50 p-4">
              <Lock className="mt-0.5 size-5 shrink-0 text-gold-strong" />
              <span className="text-[13.5px] leading-6 text-navy"><b>{perhatian.filter(isRisikoSensitif).length} risiko penyuapan</b> berlevel Tinggi/Sangat Tinggi. Rinciannya hanya untuk petugas berwenang (FKAP).</span>
            </div>
          )}
        </div>
      </section>

      {/* Register */}
      <section>
        <SectionHeading eyebrow="Register" title="Register Matriks Risiko 2026" description="Klik baris untuk melihat penyebab, dampak, pengendalian, dan pemantauan." />
        {!profile ? (
          <PendingContent compact kind="tidak-berwenang" title="Register rinci hanya untuk petugas berwenang" description="Pengunjung melihat ringkasan di atas. Penyebab, dampak, pengendalian, rencana pemantauan, dan bukti dukung setiap risiko dapat dibuka setelah login sesuai peran." />
        ) : (
          <Card className="overflow-hidden">
            <DataTable
              rows={rows}
              columns={cols}
              rowKey={(r) => r.id}
              onRowClick={setSel}
              pageSize={10}
              initialSort={{ key: "level", dir: "desc" }}
              searchText={(r) => `${r.id} ${r.proses} ${r.risiko} ${r.pj} ${r.sasaran}`}
              toolbar={
                <div className="flex flex-wrap gap-2">
                  <select aria-label="Sasaran" value={fNo} onChange={(e) => setFNo(e.target.value)} className={sel_}><option value="semua">Semua sasaran</option>{rr.perSasaran.map((s) => <option key={s.no} value={s.no}>{s.no}. {s.label}</option>)}</select>
                  <select aria-label="Level" value={fLevel} onChange={(e) => setFLevel(e.target.value)} className={sel_}><option value="semua">Semua level</option>{LEVEL_RISIKO.map((l) => <option key={l.level}>{l.level}</option>)}</select>
                  {fCell && <button onClick={() => setFCell(null)} className="h-9 rounded-xl border border-accent bg-accent-soft px-3 text-[13px] font-semibold text-accent">Sel K{fCell.replace("-", " × D")} ✕</button>}
                </div>
              }
            />
          </Card>
        )}
      </section>

      {/* Peluang */}
      <section>
        <SectionHeading eyebrow="Peluang" title="Peluang peningkatan" description="Dicatat terpisah dari risiko, sesuai register PM.SMI.L10.2026. Matriks Risiko 2026 tidak memuat lembar peluang." />
        <TabelResmi head={["ID", "Peluang", "Dasar/manfaat", "Rencana realisasi", "Pemilik", "Target"]} widths={["", "min-w-[180px]", "min-w-[200px]", "min-w-[220px]", "min-w-[160px]", "min-w-[90px]"]}
          rows={PELUANG.map((o) => [<Kode>{o[0]}</Kode>, <span className="font-medium"><Lightbulb className="mr-1 inline size-3.5 text-gold" />{o[1]}</span>, o[2], o[3], o[4], <span className="whitespace-nowrap">{o[6]}</span>])} />
      </section>

      <p className="flex gap-2 text-[12px] leading-5 text-navy-400"><Info className="mt-0.5 size-3.5 shrink-0" />Data ditranskripsi dari Matriks_Risiko_SMI_BPSDMP_2026.xlsx tanpa perubahan nilai. Status tindak lanjut dan penilaian residual tampil setelah kolomnya diisi pada matriks atau tabel register di basis data.</p>

      <Dialog open={!!sel} onClose={() => setSel(null)} title={sel ? `${sel.id} · ${sel.proses}` : ""} description={sel ? `Sasaran/tujuan ${sel.no}` : undefined} size="lg">
        {sel && (
          <div className="space-y-4 text-[13.5px] leading-6">
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-canvas px-4 py-3">
              <span>K <b>{sel.k ?? "—"}</b></span><span>D <b>{sel.d ?? "—"}</b></span><span>Skor <b>{sel.skor ?? "—"}</b></span><LevelPill level={sel.level} />
              <span className="text-navy-400">Residual: {sel.rs != null ? `${sel.rk} × ${sel.rd} = ${sel.rs} (${sel.rl})` : "belum dinilai"}</span>
            </div>
            <dl className="space-y-3.5">
              {([["Sasaran/tujuan", sel.sasaran], ["Risiko", sel.risiko], ["Penyebab", sel.penyebab], ["Dampak", sel.dampak], ["Penanggung jawab", sel.pj], ["Respons", sel.respons], ["Pengendalian", sel.pengendalian], ["Waktu", sel.waktu], ["Pemantauan / tindak lanjut", sel.pemantauan], ["Klausul", sel.klausul]] as [string, string][]).filter(([, v]) => v).map(([l, v]) => (
                <div key={l}><dt className="text-xs font-medium text-navy-400">{l}</dt><dd className="mt-0.5 whitespace-pre-line text-navy">{v}</dd></div>
              ))}
              {sel.bukti && /^https?:\/\//.test(sel.bukti) && (
                <div><dt className="text-xs font-medium text-navy-400">Bukti dukung</dt><dd className="mt-1"><a href={sel.bukti} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline">Buka folder bukti <ExternalLink className="size-3.5" /></a> <span className="text-[12px] text-navy-400">(akses mengikuti izin Google Drive)</span></dd></div>
              )}
            </dl>
          </div>
        )}
      </Dialog>
    </div>
  );
}
