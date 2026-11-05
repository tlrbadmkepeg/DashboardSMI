import type { ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { CapaianBadge, LaporanBadge } from "./status";
import { BuktiList } from "./BuktiList";
import type { Dataset, Realisasi } from "@/types/domain";
import { BULAN, fmtDate, fmtDateTime, fmtNum, fmtValue } from "@/lib/format";
import { nilaiRealisasi, rasioCapaian, statusDariNilai } from "@/domain/indicators";
import { RIWAYAT_VERIFIKASI_TABLE } from "@/config/schema";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-navy-400">{label}</dt>
      <dd className="mt-1 whitespace-pre-line text-[13.5px] leading-6 text-navy">{children || <span className="text-navy-300">—</span>}</dd>
    </div>
  );
}

/** Rincian satu laporan realisasi: nilai, status, kendala, tindak lanjut, verifikasi, dan bukti. */
export function ReportDetailDialog({ report, data, onClose, footer }: { report: Realisasi | null; data: Dataset; onClose: () => void; footer?: ReactNode }) {
  if (!report) return null;
  const s = data.sasaran.find((x) => x.id === report.sasaranId);
  const u = data.units.find((x) => x.id === report.unitId);
  const n = s ? nilaiRealisasi(report, s) : { value: null, derived: false };
  const status = s ? statusDariNilai(n.value, s) : "nodata";
  const ratio = s ? rasioCapaian(n.value, s) : null;
  const bukti = data.bukti.filter((b) => b.realisasiId === report.id);
  const today = new Date().toISOString().slice(0, 10);
  const late = report.tindakLanjut && report.batasWaktu && report.batasWaktu < today && report.statusTindakLanjut !== "selesai";

  return (
    <Dialog
      open
      size="lg"
      onClose={onClose}
      title={s ? `Sasaran ${s.nomor} · ${u?.singkatan ?? ""}` : "Rincian laporan"}
      description={`${s?.nama ?? ""} · ${BULAN[report.bulan - 1]} ${report.tahun}`}
      footer={footer}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-canvas p-3">
            <div className="text-xs text-navy-400">Target</div>
            <div className="mt-1 font-semibold text-navy">{s ? s.targetLabel || fmtValue(s.target, s.satuan) : "—"}</div>
          </div>
          <div className="rounded-xl bg-canvas p-3">
            <div className="text-xs text-navy-400">Realisasi</div>
            <div className="mt-1 font-semibold text-navy">{s ? fmtValue(n.value, s.satuan) : "—"}</div>
            {n.derived && <div className="mt-0.5 text-[11px] text-warn">dihitung sistem, kolom realisasi kosong</div>}
          </div>
          <div className="rounded-xl bg-canvas p-3">
            <div className="text-xs text-navy-400">Rasio thd target</div>
            <div className="mt-1 font-semibold tabular-nums text-navy">{ratio === null ? "—" : `${fmtNum(ratio, 1)}%`}</div>
          </div>
          <div className="space-y-1.5 rounded-xl bg-canvas p-3">
            <CapaianBadge status={status} />
            <LaporanBadge status={report.status} raw={report.statusRaw} />
          </div>
        </div>

        {s && s.jenis !== "indeks" && (report.pembilang !== null || report.penyebut !== null) && (
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-line p-4">
            <Field label="Pembilang">{fmtNum(report.pembilang, 2)}</Field>
            <Field label="Penyebut">{fmtNum(report.penyebut, 2)}</Field>
          </div>
        )}
        {s?.jenis === "indeks" && (
          <div className="rounded-xl border border-line p-4">
            <Field label="Nilai indeks">{fmtNum(report.nilaiIndeks ?? report.realisasiDb, 2)}</Field>
          </div>
        )}

        <dl className="grid gap-5 sm:grid-cols-2">
          <Field label="Kendala">{report.kendala}</Field>
          <Field label="Analisis penyebab">{report.analisis}</Field>
          <Field label="Tindak lanjut">{report.tindakLanjut}</Field>
          <Field label="Batas waktu tindak lanjut">
            {report.batasWaktu ? (
              <span className={late ? "font-medium text-bad" : undefined}>
                {fmtDate(report.batasWaktu)}{late ? " · melewati batas waktu" : ""}
              </span>
            ) : null}
          </Field>
          <Field label="Status penyelesaian tindak lanjut">
            {report.statusTindakLanjut === null
              ? "Belum tercatat (kolom status penyelesaian belum tersedia di basis data)"
              : report.statusTindakLanjut === "selesai" ? "Selesai" : "Belum selesai"}
          </Field>
          <Field label="Catatan verifikator">{report.catatanVerifikator}</Field>
          <Field label="Diajukan">{fmtDateTime(report.diajukanPada)}</Field>
          <Field label="Diverifikasi">{fmtDateTime(report.diverifikasiPada)}</Field>
        </dl>

        <div>
          <h4 className="mb-2 text-[13px] font-semibold text-navy">Bukti dukung</h4>
          <BuktiList items={bukti} />
        </div>

        {!RIWAYAT_VERIFIKASI_TABLE && (
          <p className="rounded-xl bg-canvas px-4 py-3 text-xs leading-5 text-navy-400">
            Riwayat verifikasi lengkap belum ditampilkan karena basis data belum memiliki tabel riwayat. Yang tampil adalah keputusan dan catatan terakhir.
          </p>
        )}
      </div>
    </Dialog>
  );
}
