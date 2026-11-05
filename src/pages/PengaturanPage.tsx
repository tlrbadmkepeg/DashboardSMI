import { useState } from "react";
import { CheckCircle2, CircleAlert, Database, Loader2, ScanSearch, UserRound, Calculator, Wrench, XCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/auth/AuthProvider";
import { useData } from "@/hooks/useData";
import { ROLE_LABEL } from "@/config/roles";
import { STAFF_NAV } from "@/components/layout/nav";
import { usePortal } from "@/hooks/usePortal";
import { PORTAL_TABLES as PT } from "@/config/schema";
import { FileStack } from "lucide-react";
import { RPC, STORAGE_BUCKET, TABLES } from "@/config/schema";
import { checkSchema, type TableCheck } from "@/services/schemaCheck";
import { cn } from "@/lib/utils";

const BACKEND_NEEDS = [
  {
    title: "Publikasi capaian untuk pengunjung",
    body: "Buat view publik_realisasi_smi yang hanya memuat laporan terverifikasi tanpa kendala, catatan, dan bukti, lalu beri izin SELECT kepada anon pada view tersebut dan pada tabel definisi (unit_kerja, sasaran_smi, kontribusi_unit). Tabel operasional lain tetap tertutup.",
  },
  {
    title: "Tabel konten portal",
    body: "Kebijakan, dokumen dan SOP, struktur organisasi, Tim SMI, proses bisnis, isu, pihak berkepentingan, risiko, kegiatan, dan audit memerlukan tabel baru dengan kolom status_publikasi. Pengunjung hanya membaca baris berstatus dipublikasikan.",
  },
  {
    title: "Status penyelesaian tindak lanjut",
    body: "Tambahkan kolom status_tindak_lanjut (misalnya 'belum' / 'selesai') beserta tanggal_selesai_tindak_lanjut pada realisasi_bulanan, diubah melalui fungsi RPC khusus. Tanpa kolom ini, aplikasi tidak menganggap tindak lanjut selesai.",
  },
  {
    title: "Riwayat verifikasi",
    body: "Buat tabel riwayat_verifikasi_smi (realisasi_id, keputusan, catatan, verifikator_id, waktu) yang diisi oleh fungsi verifikasi_realisasi_smi. Saat ini hanya keputusan terakhir yang dapat ditampilkan.",
  },
  {
    title: "Parameter fungsi RPC",
    body: `Aplikasi memanggil ${RPC.ajukan.name}(p_realisasi_id) dan ${RPC.verifikasi.name}(p_realisasi_id, p_keputusan, p_catatan). Bila nama parameter berbeda, sesuaikan di src/config/schema.ts.`,
  },
  {
    title: "Kebijakan Storage untuk unggah",
    body: `Unggahan memakai jalur {unit_id}/{tahun}/{bulan}/{realisasi_id}/{nama_berkas} pada bucket ${STORAGE_BUCKET}. Pastikan kebijakan INSERT dan SELECT pada storage.objects mengikuti pola ini, serta PIC boleh INSERT ke tabel bukti_dukung.`,
  },
  {
    title: "Kebijakan INSERT/UPDATE draft",
    body: "PIC perlu izin INSERT dan UPDATE pada realisasi_bulanan untuk unitnya sendiri, terbatas pada status draft atau perlu_perbaikan, tanpa izin mengubah kolom status. Realisasi sebaiknya dihitung oleh trigger.",
  },
];

export function PengaturanPage() {
  const { profile, mode } = useAuth();
  const { data } = useData();
  const [checks, setChecks] = useState<TableCheck[] | null>(null);
  const [running, setRunning] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const unit = data?.units.find((u) => u.id === profile?.unitId);

  const runCheck = async () => {
    setRunning(true);
    setCheckError(null);
    try { setChecks(await checkSchema()); } catch (e: any) { setCheckError(e?.message ?? "Pemeriksaan gagal."); } finally { setRunning(false); }
  };

  const menus = STAFF_NAV.filter((n) => profile && n.roles.includes(profile.peran));
  const { content } = usePortal();

  return (
    <AppShell crumbs={[{ label: "Pengelolaan" }, { label: "Administrasi Portal" }]}>
      <PageHeader eyebrow="Pengelolaan" title="Administrasi Portal" description="Profil akses, status konten portal, metode perhitungan indikator, dan pemeriksaan kesesuaian dengan basis data." />
      <div className="grid gap-5 xl:grid-cols-3">
        <Card>
          <CardHeader icon={<UserRound />} title="Profil akses" description="Dibaca dari tabel profil_pengguna" />
          <CardBody>
            <dl className="space-y-3 text-[13.5px]">
              <div className="flex justify-between gap-4"><dt className="text-navy-400">Nama</dt><dd className="text-right font-medium text-navy">{profile?.nama}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-navy-400">Email</dt><dd className="truncate text-right text-navy">{profile?.email || "—"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-navy-400">Peran</dt><dd><Badge tone="accent">{profile ? ROLE_LABEL[profile.peran] : "—"}</Badge></dd></div>
              <div className="flex justify-between gap-4"><dt className="text-navy-400">Unit kerja</dt><dd className="text-right text-navy">{unit?.nama ?? "Seluruh unit (sesuai RLS)"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-navy-400">Status akun</dt><dd><Badge tone="ok" dot>Aktif</Badge></dd></div>
            </dl>
            <div className="mt-5 border-t border-line pt-4">
              <div className="mb-2 text-xs font-medium text-navy-400">Menu pengelolaan untuk peran ini</div>
              <div className="flex flex-wrap gap-1.5">{menus.map((m) => <span key={m.path} className="rounded-full bg-canvas px-2.5 py-1 text-[12px] text-navy-500">{m.label}</span>)}</div>
              <p className="mt-3 text-xs leading-5 text-navy-400">Pembatasan menu hanya tampilan. Batas akses data ditegakkan oleh Row Level Security di Supabase.</p>
            </div>
          </CardBody>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader icon={<FileStack />} title="Status konten portal" description="Isi halaman informasi dibaca dari tabel konten. Tabel belum dibuat atau kosong berarti halaman menampilkan status menunggu dokumen resmi." />
          <CardBody>
            <div className="grid gap-2 sm:grid-cols-2">
              {([
                ["Konten halaman (kebijakan, ruang lingkup, FKAP)", content.konten, PT.konten],
                ["Daftar dokumen dan SOP", content.dokumen, PT.dokumen],
                ["Struktur organisasi", content.struktur, PT.struktur],
                ["Tim SMI", content.timSmi, PT.timSmi],
                ["Peta proses bisnis", content.proses, PT.proses],
                ["Isu internal dan eksternal", content.isu, PT.isu],
                ["Pihak berkepentingan", content.pihak, PT.pihak],
                ["Register risiko dan peluang", content.risiko, PT.risiko],
                ["Kegiatan SMI", content.kegiatan, PT.kegiatan],
                ["Ringkasan audit (publik)", content.auditRingkasan, PT.auditRingkasan],
                ["Register temuan audit", content.temuan, PT.temuan],
              ] as const).map(([label, st, table]) => (
                <div key={table} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5">
                  <div className="min-w-0"><div className="truncate text-[13px] font-medium text-navy">{label}</div><div className="font-mono text-[11px] text-navy-400">{table}</div></div>
                  {st.status === "loading" ? <Badge tone="muted">Memuat</Badge>
                    : st.status === "ok" ? <Badge tone={st.rows.length ? "ok" : "warn"}>{st.rows.length ? `${st.rows.length} baris` : "Kosong"}</Badge>
                    : <Badge tone={st.kind === "tidak-berwenang" ? "navy" : st.kind === "galat" ? "bad" : "warn"}>{st.kind === "belum-tersedia" ? "Belum dibuat" : st.kind === "tidak-berwenang" ? "Terbatas" : "Galat"}</Badge>}
                </div>
              ))}
            </div>
            <p className="mt-4 text-[12.5px] leading-5 text-navy-400">Struktur tabel dan kebijakan RLS yang diusulkan ada di berkas supabase/usulan_migrasi_portal.sql. Formulir penyuntingan konten di portal belum diaktifkan karena kebijakan tulis untuk administrator belum tersedia di backend; konten dimuat melalui Supabase setelah usulan disetujui.</p>
          </CardBody>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader icon={<Calculator />} title="Metode perhitungan" description="Dipakai seragam di seluruh halaman dan ekspor" />
          <CardBody>
            <ol className="space-y-3 text-[13.5px] leading-6 text-navy">
              <li><b>Status unit.</b> Setiap pasangan sasaran–unit dinilai dari laporan terakhirnya pada tahun terpilih s.d. bulan terpilih. Secara bawaan hanya laporan terverifikasi yang dihitung.</li>
              <li><b>Status terhadap target.</b> Memenuhi bila realisasi mencapai target (≥ untuk arah naik, ≤ untuk arah turun). Selain itu dihitung belum memenuhi target. Kategori "mendekati target" tidak dipakai karena belum ada ambang yang disetujui.</li>
              <li><b>Gabungan antarunit.</b> Untuk indikator persentase dengan pembilang dan penyebut: total pembilang ÷ total penyebut × 100%. Untuk indikator lain, termasuk indeks: rata-rata nilai unit pada sasaran yang sama.</li>
              <li><b>Agregasi lintas sasaran.</b> Indeks kepuasan (0–4) tidak pernah dirata-ratakan dengan persentase. Ringkasan memakai jumlah sasaran yang memenuhi target dan rasio realisasi terhadap target (%).</li>
              <li><b>Nilai realisasi.</b> Diambil dari kolom realisasi di basis data. Bila kolom kosong, aplikasi menghitung perkiraan dan memberi tanda "dihitung sistem".</li>
              <li><b>Persentase capaian target.</b> Sasaran memenuhi ÷ sasaran yang memiliki data × 100%. Sasaran tanpa data dilaporkan terpisah.</li>
            </ol>
          </CardBody>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader
            icon={<ScanSearch />}
            title="Pemeriksaan skema basis data"
            description="Membaca satu baris dari setiap tabel (sesuai hak akses Anda) lalu mencocokkan nama kolom dengan pemetaan aplikasi. Tidak ada data yang diubah."
            action={
              <Button variant="outline" size="sm" onClick={runCheck} disabled={running || mode !== "supabase"}>
                {running ? <Loader2 className="animate-spin" /> : <Database />} Jalankan pemeriksaan
              </Button>
            }
          />
          <CardBody>
            {mode !== "supabase" && <p className="text-[13px] text-navy-400">Tersedia pada website mandiri yang terhubung ke Supabase.</p>}
            {checkError && <p className="text-[13px] text-bad">{checkError}</p>}
            {checks && (
              <div className="grid gap-3 lg:grid-cols-2">
                {checks.map((c) => {
                  const missing = c.fields.filter((f) => !f.matched);
                  return (
                    <div key={c.table} className="rounded-xl border border-line p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-[13px] font-medium text-navy">{c.table}</span>
                        {!c.ok ? <Badge tone="bad"><XCircle className="size-3" /> Tidak terbaca</Badge>
                          : c.rows === "kosong" ? <Badge tone="warn">Tidak ada baris terlihat</Badge>
                          : missing.length ? <Badge tone="warn"><CircleAlert className="size-3" /> {missing.length} kolom tidak cocok</Badge>
                          : <Badge tone="ok"><CheckCircle2 className="size-3" /> Sesuai</Badge>}
                      </div>
                      <p className="mt-1.5 text-xs text-navy-400">{c.message}</p>
                      {c.rows === "ada" && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {c.fields.map((f) => (
                            <span key={f.field} title={f.candidates.join(" / ")} className={cn("rounded-md px-1.5 py-0.5 font-mono text-[11px]", f.matched ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn")}>
                              {f.field}{f.matched ? ` → ${f.matched}` : " ✕"}
                            </span>
                          ))}
                        </div>
                      )}
                      {c.extraColumns.length > 0 && <p className="mt-2 text-[11.5px] text-navy-400">Kolom lain: <span className="font-mono">{c.extraColumns.join(", ")}</span></p>}
                    </div>
                  );
                })}
              </div>
            )}
            {!checks && mode === "supabase" && (
              <p className="text-[13px] text-navy-400">Jalankan setelah login pertama untuk memastikan nama kolom pada tabel {Object.values(TABLES).join(", ")} sesuai. Penyesuaian dilakukan di berkas src/config/schema.ts.</p>
            )}
          </CardBody>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader icon={<Wrench />} title="Kebutuhan backend yang perlu dikonfirmasi" description="Fitur berikut bergantung pada struktur atau kebijakan Supabase yang belum dapat dipastikan dari aplikasi" />
          <CardBody>
            <div className="grid gap-3 md:grid-cols-2">
              {BACKEND_NEEDS.map((n) => (
                <div key={n.title} className="min-w-0 rounded-xl bg-canvas p-4">
                  <div className="text-[13.5px] font-semibold text-navy">{n.title}</div>
                  <p className="mt-1 text-[13px] leading-5 text-navy-500 [overflow-wrap:anywhere]">{n.body}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
