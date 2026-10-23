import { NextRequest, NextResponse } from "next/server";
import {
  findRow,
  findRowInSheet,
  LAYANAN_MAP,
  STATUS_MAP,
} from "@/lib/db";
import { prisma } from "@/lib/db/prisma";
import { consumeRateLimit, getRateLimitKey } from "@/lib/rate-limit";

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
    const limit = await consumeRateLimit(getRateLimitKey("lacak", request), { limit: 20, windowMs: 60 * 1000 });
    if (!limit.allowed) {
      return NextResponse.json({ success: false, error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }
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
      const monRow = await prisma.monitoring.findFirst({
        where: { idPengajuan: trimmed, deletedAt: null },
      });
      if (monRow) {
        const jenis = monRow.jenisLayanan || "";
        const status = monRow.statusProses || "";
        return NextResponse.json({
          success: true,
          found: true,
          data: {
            id_pengajuan: monRow.idPengajuan || trimmed,
            nama_pemohon: "",
            kode_lot_lelang: monRow.kodeLotLelang || "",
            jenis_layanan: LAYANAN_MAP[jenis] ?? jenis,
            status_proses: STATUS_MAP[status] ?? status,
            catatan_tidak_valid: "",
            tanggal_masuk: monRow.tglPermintaan || "",
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
