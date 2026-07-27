import { NextRequest, NextResponse } from "next/server";
import {
  findRow,
  findRowInSheet,
  getRows,
} from "@/lib/db";

const ID_MAP: Record<string, { sheet: string; col: string }> = {
  Kuitansi: { sheet: "Kuitansi", col: "ID KPHL" },
  "Kutipan RL": { sheet: "Kutipan RL", col: "ID K-RL" },
  "Validasi PPh": { sheet: "Validasi PPh", col: "ID VPPh" },
};

function detectLayanan(id: string): string | null {
  if (id.includes("/KPHL/")) return "Kuitansi";
  if (id.includes("/K-RL/")) return "Kutipan RL";
  if (id.includes("/VPPH/")) return "Validasi PPh";
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Parameter 'id' diperlukan" },
        { status: 400 },
      );
    }

    const trimmed = id.trim();
    const layanan = detectLayanan(trimmed);
    let row = null;

    if (layanan) {
      const info = ID_MAP[layanan];
      row = await findRowInSheet(info.sheet, info.col, trimmed);
    }

    if (!row) {
      row = await findRow(trimmed);
    }

    if (!row) {
      const monitoringRows = await getRows("Monitoring");
      const monRow = monitoringRows.find(
        (r) => r.get("ID Pengajuan") === trimmed,
      );
      if (monRow) {
        return NextResponse.json({
          success: true,
          found: true,
          data: {
            id_pengajuan: monRow.get("ID Pengajuan") || trimmed,
            nama_pemohon: "",
            kode_lot_lelang: monRow.get("Kode Lot Lelang") || "",
            jenis_layanan: monRow.get("Jenis Layanan") || "",
            status_proses: monRow.get("Status Proses") || "",
            catatan_tidak_valid: "",
            tanggal_masuk: monRow.get("Tgl Permintaan") || "",
          },
        });
      }
      return NextResponse.json({ success: true, found: false, data: null });
    }

    const idKphl = row.get("ID KPHL") || "";
    const idKRl = row.get("ID K-RL") || "";
    const idVPPh = row.get("ID VPPh") || "";
    const idPengajuan = idKphl || idKRl || idVPPh;

    return NextResponse.json({
      success: true,
      found: true,
      data: {
        id_pengajuan: idPengajuan,
        nama_pemohon: row.get("Nama Pemohon") || "",
        kode_lot_lelang: row.get("Kode Lot Lelang") || "",
        jenis_layanan: layanan || "",
        status_proses: row.get("Status Proses") || row.get("Status Permohonan") || "",
        catatan_tidak_valid: row.get("Keterangan Ditolak") || "",
        tanggal_masuk: row.get("Tgl Permintaan") || "",
      },
    });
  } catch (error) {
    console.error("Lacak error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mencari data" },
      { status: 500 },
    );
  }
}
