/**
 * Ekspor Excel (.xlsx, SheetJS) dan PDF (jsPDF + autoTable).
 * Pustaka dimuat saat dibutuhkan agar halaman utama tetap ringan.
 * Data yang diekspor hanyalah data yang sudah dapat dilihat pengguna (sudah disaring RLS).
 */
export interface Sheet {
  name: string;
  columns: string[];
  rows: (string | number | null)[][];
}

export async function exportExcel(fileName: string, sheets: Sheet[]) {
  const XLSX: any = await import("xlsx");
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([s.columns, ...s.rows.map((r) => r.map((v) => (v === null ? "" : v)))]);
    ws["!cols"] = s.columns.map((c, i) => ({
      wch: Math.min(60, Math.max(c.length, ...s.rows.map((r) => String(r[i] ?? "").length)) + 2),
    }));
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
  }
  XLSX.writeFile(wb, fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`);
}

export async function exportPdf(p: {
  fileName: string;
  title: string;
  subtitle: string;
  sections: { heading: string; columns: string[]; rows: (string | number | null)[][]; note?: string }[];
}) {
  const { jsPDF }: any = await import("jspdf");
  const autoTableMod: any = await import("jspdf-autotable");
  const autoTable = autoTableMod.default ?? autoTableMod.autoTable;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const navy: [number, number, number] = [20, 45, 78];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...navy);
  doc.text(p.title, 40, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(90, 104, 128);
  doc.text(p.subtitle, 40, 66);
  doc.setDrawColor(229, 234, 241);
  doc.line(40, 78, W - 40, 78);

  let y = 96;
  for (const s of p.sections) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...navy);
    if (y > 520) { doc.addPage(); y = 48; }
    doc.text(s.heading, 40, y);
    autoTable(doc, {
      startY: y + 8,
      head: [s.columns],
      body: s.rows.map((r) => r.map((v) => (v === null ? "—" : String(v)))),
      styles: { font: "helvetica", fontSize: 8.5, cellPadding: 5, textColor: [20, 45, 78], lineColor: [229, 234, 241], lineWidth: 0.5 },
      headStyles: { fillColor: [239, 244, 255], textColor: navy, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 40, right: 40 },
    });
    y = (doc as any).lastAutoTable.finalY + 26;
    if (s.note) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(s.note, 40, y - 12, { maxWidth: W - 80 });
      y += 6;
    }
  }
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Dashboard SMI BPSDMP · Halaman ${i} dari ${pages}`, 40, doc.internal.pageSize.getHeight() - 24);
  }
  doc.save(p.fileName.endsWith(".pdf") ? p.fileName : `${p.fileName}.pdf`);
}
