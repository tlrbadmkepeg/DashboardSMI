import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCopy, Database, Download, FileText, Info, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeading, PendingContent } from "@/components/portal/ContentState";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/hooks/useData";
import { useAuth } from "@/auth/AuthProvider";
import { SASARAN_RESMI } from "@/content/resmi/dokumen";
import { PENCAPAIAN_2026, PERBEDAAN_DOKUMEN_SASARAN, SUMBER_PENCAPAIAN } from "@/content/resmi/pencapaian";
import { TABLES, COLUMNS } from "@/config/schema";
import { cn } from "@/lib/utils";

type Usulan = { id: string; jenis: "kontribusi" | "realisasi"; ringkas: string; payload: Record<string, unknown> };

const BLN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const q = (v: unknown) => v === null || v === undefined ? "null" : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
const norm = (t: string) => t.replace(/\s+/g, " ").trim().toLowerCase();

/**
 * Sinkronisasi dokumen PM.SMI.L3-01 ↔ basis data (khusus administrator).
 * Halaman ini hanya MEMBANDINGKAN dan MENYUSUN usulan. Tidak ada penulisan ke basis data dari peramban:
 * usulan yang disetujui diekspor sebagai SQL ke tabel antara `usulan_perubahan_data`, lalu diterapkan
 * oleh fungsi server yang mencatat jejak perubahan (lihat supabase/usulan_migrasi_risiko_sinkronisasi.sql).
 */
export function SinkronisasiPage() {
  const { data } = useData();
  const { profile } = useAuth();
  const [pilih, setPilih] = useState<Set<string>>(new Set());
  const [alasan, setAlasan] = useState("");

  const hasil = useMemo(() => {
    if (!data) return null;
    const unitById = new Map(data.units.map((u) => [u.id, u]));
    const dbKon = data.kontribusiDb ?? data.kontribusi;
    const docKon = data.kontribusiDokumen ?? [];
    const sasaranDiff = SASARAN_RESMI.map((r) => {
      const db = data.sasaran.find((s) => s.nomor === r.nomor);
      const beda: string[] = [];
      if (!db) beda.push("tidak ada di sasaran_smi");
      else {
        if (norm(db.nama) !== norm(r.nama)) beda.push("redaksi berbeda dari PM.SMI.L3");
        if (db.target !== r.target) beda.push(`target DB ${db.target ?? "kosong"} vs dokumen ${r.target}`);
        if (!db.periode) beda.push("periode pengukuran kosong");
      }
      const docNote = PERBEDAAN_DOKUMEN_SASARAN.filter((p) => p.nomor === r.nomor).map((p) => `${p.hal}: penetapan “${p.penetapan}” vs pencapaian “${p.pencapaian}”`);
      return { nomor: r.nomor, beda, docNote };
    }).filter((x) => x.beda.length || x.docNote.length);

    const penugasan = data.sasaran.map((s) => {
      const d = new Set(docKon.filter((k) => k.sasaranId === s.id).map((k) => k.unitId));
      const b = new Set(dbKon.filter((k) => k.sasaranId === s.id).map((k) => k.unitId));
      return {
        s, hanyaDok: [...d].filter((x) => !b.has(x)).map((x) => unitById.get(x)!).filter(Boolean),
        hanyaDb: [...b].filter((x) => !d.has(x)).map((x) => unitById.get(x)!).filter(Boolean),
      };
    }).filter((x) => x.hanyaDok.length || x.hanyaDb.length);

    const usulan: Usulan[] = [];
    penugasan.forEach((p) => p.hanyaDok.forEach((u) => usulan.push({
      id: `k-${p.s.id}-${u.id}`, jenis: "kontribusi", ringkas: `Tambah penugasan S${p.s.nomor} → ${u.singkatan}`,
      payload: { sasaran_id: p.s.id, unit_id: u.id },
    })));
    const adaDb = new Set(data.realisasi.filter((r) => r.status !== "dokumen").map((r) => `${r.sasaranId}|${r.unitId}|${r.tahun}|${r.bulan}`));
    data.realisasi.filter((r) => r.status === "dokumen").forEach((r) => {
      if (adaDb.has(`${r.sasaranId}|${r.unitId}|${r.tahun}|${r.bulan}`)) return;
      const s = data.sasaran.find((x) => x.id === r.sasaranId); const u = unitById.get(r.unitId);
      usulan.push({
        id: `r-${r.id}`, jenis: "realisasi", ringkas: `S${s?.nomor} · ${u?.singkatan} · ${BLN[r.bulan - 1]} ${r.tahun} = ${r.realisasiDb}`,
        payload: { sasaran_id: r.sasaranId, unit_id: r.unitId, tahun: r.tahun, bulan: r.bulan, nilai: r.realisasiDb, indeks: s?.jenis === "indeks", sumber: SUMBER_PENCAPAIAN.kode, bukti_tautan: data.buktiTautan?.[`${r.sasaranId}|${r.unitId}`] ?? null },
      });
    });
    return { sasaranDiff, penugasan, usulan, dbKon: dbKon.length, docBaris: PENCAPAIAN_2026.length, dbReal: adaDb.size };
  }, [data]);

  if (profile?.peran !== "admin") return <AppShell><PendingContent kind="tidak-berwenang" title="Khusus administrator" description="Sinkronisasi data dokumen ke basis data hanya dapat disiapkan oleh administrator." /></AppShell>;
  if (!hasil) return <AppShell><PendingContent title="Data belum dimuat" description="Muat ulang halaman setelah koneksi data tersedia." /></AppShell>;

  const terpilih = hasil.usulan.filter((u) => pilih.has(u.id));
  const sql = [
    "-- DRAF — tinjau sebelum dijalankan. Tidak dijalankan otomatis oleh portal.",
    `-- Disusun oleh: ${profile.nama || profile.email} · ${new Date().toISOString()}`,
    `-- Alasan: ${alasan.replace(/\n/g, " ") || "(isi alasan)"}`,
    "-- Usulan masuk ke tabel antara usulan_perubahan_data berstatus 'diajukan'. Setelah ditinjau, panggil",
    "-- public.terapkan_usulan_perubahan(id) — realisasi masuk berstatus 'diajukan' (BUKAN terverifikasi)",
    "-- dan setiap perubahan tercatat di riwayat_perubahan_data.",
    "begin;",
    ...terpilih.map((u) => `insert into public.usulan_perubahan_data (jenis, tabel_tujuan, payload, sumber, alasan, status) values (${q(u.jenis)}, ${q(u.jenis === "kontribusi" ? TABLES.kontribusi : TABLES.realisasi)}, ${q(JSON.stringify(u.payload))}::jsonb, ${q(SUMBER_PENCAPAIAN.kode)}, ${q(alasan)}, 'diajukan');`),
    "commit;",
  ].join("\n");
  const unduh = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([sql], { type: "text/sql" }));
    a.download = `usulan-sinkronisasi-${new Date().toISOString().slice(0, 10)}.sql`;
    a.click();
  };
  const toggle = (id: string) => setPilih((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const grup = (j: Usulan["jenis"]) => hasil.usulan.filter((u) => u.jenis === j);

  return (
    <AppShell crumbs={[{ label: "Kelola" }, { label: "Sinkronisasi Data" }]}>
      <SectionHeading eyebrow="Administrator" title="Sinkronisasi dokumen pencapaian ↔ basis data" description="Bandingkan sasaran, target, periode, dan penugasan unit; pilih perubahan; ekspor sebagai usulan untuk disetujui. Portal tidak menulis ke basis data dari peramban." />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {([
          ["Sasaran di basis data", data!.sasaran.length, Database], ["Baris kontribusi_unit (DB)", hasil.dbKon, Database],
          ["Realisasi DB (non-dokumen)", hasil.dbReal, Database], [`Baris dokumen ${SUMBER_PENCAPAIAN.kode}`, hasil.docBaris, FileText],
        ] as const).map(([l, v, I]) => (
          <div key={l} className="rounded-2xl border border-line bg-white p-4 shadow-card"><div className="flex items-center justify-between text-[13px] font-semibold text-navy-600">{l}<I className="size-4 text-navy-300" /></div><div className="mt-2 font-display text-[26px] font-bold tabular-nums text-navy">{v}</div></div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <Card>
          <CardHeader title="Perbedaan nama, target, dan periode" description="sasaran_smi dibandingkan dengan PM.SMI.L3 dan PM.SMI.L3-01" icon={<AlertTriangle />} />
          <CardBody>
            {hasil.sasaranDiff.length ? (
              <ul className="space-y-2 text-[13.5px] leading-6">
                {hasil.sasaranDiff.map((x) => (
                  <li key={x.nomor} className="rounded-xl bg-canvas px-3.5 py-2.5"><b className="text-navy">Sasaran {x.nomor}.</b> <span className="text-navy-600">{[...x.beda, ...x.docNote].join("; ")}</span></li>
                ))}
              </ul>
            ) : <p className="flex items-center gap-2 text-[13.5px] text-ok"><CheckCircle2 className="size-4" /> Tidak ada perbedaan.</p>}
            <p className="mt-3 text-[12px] leading-5 text-navy-400">Perubahan redaksi atau target sasaran tidak diusulkan otomatis; tetapkan dahulu melalui Tim SMI (mis. target S11 100% vs 75%).</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Perbedaan penugasan unit" description="Dokumen pencapaian vs kontribusi_unit" icon={<AlertTriangle />} />
          <CardBody>
            {hasil.penugasan.length ? (
              <ul className="space-y-2 text-[13.5px] leading-6">
                {hasil.penugasan.map((p) => (
                  <li key={p.s.id} className="rounded-xl bg-canvas px-3.5 py-2.5">
                    <b className="text-navy">Sasaran {p.s.nomor}.</b>{" "}
                    {p.hanyaDok.length > 0 && <span className="text-navy-600">Hanya di dokumen: {p.hanyaDok.map((u) => u.singkatan).join(", ")}. </span>}
                    {p.hanyaDb.length > 0 && <span className="text-navy-600">Hanya di basis data: {p.hanyaDb.map((u) => u.singkatan).join(", ")}.</span>}
                  </li>
                ))}
              </ul>
            ) : <p className="flex items-center gap-2 text-[13.5px] text-ok"><CheckCircle2 className="size-4" /> Penugasan sama.</p>}
            <p className="mt-3 text-[12px] leading-5 text-navy-400">Penugasan yang hanya ada di basis data tidak dihapus; tinjau manual.</p>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Usulan perubahan" description={`${hasil.usulan.length} usulan · ${terpilih.length} dipilih`} icon={<ShieldCheck />}
          action={<div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setPilih(new Set(hasil.usulan.map((u) => u.id)))}>Pilih semua</Button><Button size="sm" variant="ghost" onClick={() => setPilih(new Set())}>Kosongkan</Button></div>} />
        <CardBody>
          {(["kontribusi", "realisasi"] as const).map((j) => (
            <details key={j} className="mb-3 rounded-xl border border-line" open={j === "kontribusi"}>
              <summary className="cursor-pointer px-4 py-3 text-[14px] font-semibold text-navy">{j === "kontribusi" ? "Penugasan unit (kontribusi_unit)" : "Realisasi bulanan dari dokumen"} · {grup(j).length}</summary>
              <ul className="max-h-[320px] overflow-auto border-t border-line px-2 py-2">
                {grup(j).map((u) => (
                  <li key={u.id}><label className={cn("flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-[13px] hover:bg-canvas", pilih.has(u.id) && "bg-accent-soft/60")}><input type="checkbox" checked={pilih.has(u.id)} onChange={() => toggle(u.id)} className="size-4 accent-[#2563EB]" />{u.ringkas}</label></li>
                ))}
                {!grup(j).length && <li className="px-2 py-2 text-[13px] text-navy-400">Tidak ada usulan.</li>}
              </ul>
            </details>
          ))}
          <label className="mt-2 block text-[13px] font-semibold text-navy">Alasan / dasar perubahan (wajib, tercatat di jejak perubahan)
            <textarea value={alasan} onChange={(e) => setAlasan(e.target.value)} rows={2} className="mt-1.5 w-full rounded-xl border border-line px-3 py-2 text-[13.5px] font-normal focus:border-accent focus:outline-none" placeholder="Contoh: Sinkronisasi capaian s.d. Oktober 2026 sesuai PM.SMI.L3-01.2026, disetujui Ketua Tim SMI tgl …" />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button disabled={!terpilih.length || !alasan.trim()} onClick={unduh}><Download /> Unduh draf SQL usulan</Button>
            <Button variant="outline" disabled={!terpilih.length || !alasan.trim()} onClick={() => navigator.clipboard?.writeText(sql)}><ClipboardCopy /> Salin SQL</Button>
          </div>
          {terpilih.length > 0 && <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-navy p-4 text-[11.5px] leading-5 text-white/85">{sql}</pre>}
          <p className="mt-4 flex gap-2 text-[12.5px] leading-5 text-navy-500"><Info className="mt-0.5 size-3.5 shrink-0" />Tabel antara dan fungsi penerapan belum ada di basis data; keduanya disiapkan di <code>supabase/usulan_migrasi_risiko_sinkronisasi.sql</code> dan perlu disetujui sebelum dijalankan. Nama kolom realisasi tujuan mengikuti kandidat pertama di config/schema ({COLUMNS.realisasi.realisasi[0]}, {COLUMNS.realisasi.status[0]}); cocokkan dengan Pemeriksaan Skema.</p>
        </CardBody>
      </Card>
    </AppShell>
  );
}
