import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";
import { findRowInSheet } from "@/lib/db";
import { consumeRateLimit, getRateLimitKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ID_MAP: Record<string, { sheet: string; col: string; label: string }> = {
  KPHL: { sheet: "Kuitansi", col: "ID KPHL", label: "Kuitansi Pembayaran Harga Lelang" },
  "K-RL": { sheet: "Kutipan RL", col: "ID K-RL", label: "Kutipan Risalah Lelang" },
  VPPH: { sheet: "Validasi PPh", col: "ID VPPh", label: "Validasi PPh (1 Bidang)" },
};

const ID_REGEX = /^\d+\/(KPHL|K-RL|VPPH)\/\d{4}$/;

const STATUS_TEXT: Record<string, string> = {
  Total: "Selesai",
  "Valid Total": "Selesai",
  Ditolak: "Tidak Valid",
  "Dalam Proses": "Proses",
  Proses: "Proses",
  "Siap Diambil": "Siap Diambil",
  "Tidak Valid": "Tidak Valid",
  Selesai: "Selesai",
};

const NAVY = rgb(0.043, 0.239, 0.451);
const DARK = rgb(0.09, 0.1, 0.11);
const GRAY = rgb(0.35, 0.36, 0.38);

function toWinAnsi(text: string): string {
  return text.replace(/[^\x00-\xFF]/g, "?");
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function GET(request: NextRequest) {
  const limit = consumeRateLimit(getRateLimitKey("bukti-pdf", request), {
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: "Terlalu banyak permintaan. Coba lagi nanti." },
      { status: 429 },
    );
  }

  const id = (request.nextUrl.searchParams.get("id") ?? "").trim();

  if (!ID_REGEX.test(id)) {
    return NextResponse.json(
      { success: false, error: "Parameter 'id' tidak valid" },
      { status: 400 },
    );
  }

  const prefix = id.split("/")[1] as keyof typeof ID_MAP;
  const info = ID_MAP[prefix];

  const row = await findRowInSheet(info.sheet, info.col, id);
  if (!row) {
    return NextResponse.json(
      { success: false, error: "Permohonan tidak ditemukan" },
      { status: 404 },
    );
  }

  const namaPemohon = row.get("Nama Pemohon") || "-";
  const kodeLot = row.get("Kode Lot Lelang") || "-";
  const tglPermintaan = row.get("Tgl Permintaan") || "-";
  const rawStatus =
    row.get("Status Proses") || row.get("Status Permohonan") || "-";
  const status = STATUS_TEXT[rawStatus] ?? rawStatus;
  const catatan = row.get("Keterangan Ditolak") || "";

  try {
    const pdfDoc = await PDFDocument.create();
    const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const margin = 48;
    const contentWidth = width - margin * 2;
    let y = height - margin;

    page.drawRectangle({
      x: 0,
      y: height - 96,
      width,
      height: 96,
      color: NAVY,
    });
    page.drawText(toWinAnsi("KPKNL BOGOR"), {
      x: margin,
      y: height - 56,
      size: 20,
      font: helvBold,
      color: rgb(1, 1, 1),
    });
    page.drawText(toWinAnsi("Layanan Dokumen Pasca Lelang - Doclang Boba"), {
      x: margin,
      y: height - 74,
      size: 11,
      font: helv,
      color: rgb(0.88, 0.92, 0.96),
    });

    y = height - 140;
    page.drawText("TANDA TERIMA PERMOHONAN", {
      x: margin,
      y,
      size: 16,
      font: helvBold,
      color: NAVY,
    });
    y -= 34;

    page.drawText("Nomor Tiket / Pengajuan", {
      x: margin,
      y,
      size: 10,
      font: helv,
      color: GRAY,
    });
    y -= 22;
    page.drawText(toWinAnsi(id), {
      x: margin,
      y,
      size: 22,
      font: helvBold,
      color: DARK,
    });
    y -= 30;

    page.drawRectangle({
      x: margin,
      y,
      width: contentWidth,
      height: 1,
      color: rgb(0.85, 0.88, 0.9),
    });
    y -= 28;

    const fields: Array<[string, string]> = [
      ["Nama Pemohon", namaPemohon],
      ["Jenis Layanan", info.label],
      ["Kode Lot Lelang", kodeLot],
      ["Tanggal Permintaan", tglPermintaan],
      ["Status", status],
    ];
    if (catatan && status === "Tidak Valid") {
      fields.push(["Catatan", catatan]);
    }

    for (const [label, value] of fields) {
      page.drawText(toWinAnsi(label), {
        x: margin,
        y,
        size: 10,
        font: helvBold,
        color: NAVY,
      });
      y -= 16;
      const lines = wrapText(toWinAnsi(value || "-"), helv, 11, contentWidth);
      for (const line of lines) {
        page.drawText(line, {
          x: margin,
          y,
          size: 11,
          font: helv,
          color: DARK,
        });
        y -= 15;
      }
      y -= 12;
    }

    y -= 16;
    page.drawRectangle({
      x: margin,
      y,
      width: contentWidth,
      height: 1,
      color: rgb(0.85, 0.88, 0.9),
    });
    y -= 22;

    const note =
      "Simpan dokumen ini sebagai bukti pengajuan. Anda dapat melacak status permohonan di situs Doclang Boba (doclang-boba-next.vercel.app) dengan memasukkan nomor tiket pada menu 'Lacak'.";
    const noteLines = wrapText(toWinAnsi(note), helv, 10, contentWidth - 20);
    page.drawText("Catatan", {
      x: margin,
      y,
      size: 10,
      font: helvBold,
      color: NAVY,
    });
    y -= 16;
    for (const line of noteLines) {
      page.drawText(line, {
        x: margin,
        y,
        size: 10,
        font: helv,
        color: GRAY,
      });
      y -= 14;
    }

    const tglCetak = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    page.drawText(toWinAnsi(`Diterbitkan: ${tglCetak}`), {
      x: margin,
      y: margin,
      size: 9,
      font: helv,
      color: GRAY,
    });

    const bytes = await pdfDoc.save();
    const filename = `tanda-terima-${id.replace(/\//g, "-")}.pdf`;
    const pdfBuffer = Buffer.from(bytes);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat PDF" },
      { status: 500 },
    );
  }
}
