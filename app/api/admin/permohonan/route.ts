import { NextRequest, NextResponse } from "next/server";
import { getRows, updateRow } from "@/lib/google/sheets";

function getSheetFromId(id: string): { sheetName: string; idColumn: string } | null {
  if (id.includes("/KPHL/")) return { sheetName: "Kuitansi", idColumn: "ID KPHL" };
  if (id.includes("/K-RL/")) return { sheetName: "Kutipan RL", idColumn: "ID K-RL" };
  if (id.includes("/VPPH/")) return { sheetName: "Validasi PPh", idColumn: "ID VPPh" };
  return null;
}

function cleanWaNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("8")) return "62" + digits;
  return digits;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const sheetInfo = getSheetFromId(id);
      if (!sheetInfo) {
        return NextResponse.json(
          { success: false, error: "ID tidak valid" },
          { status: 400 },
        );
      }
      const rows = await getRows(sheetInfo.sheetName);
      const row = rows.find((r) => r.get(sheetInfo.idColumn) === id);
      if (!row) {
        return NextResponse.json(
          { success: false, error: "Data tidak ditemukan" },
          { status: 404 },
        );
      }
      const headers = row._worksheet.headerValues;
      const data: Record<string, string> = {};
      for (const header of headers) {
        data[header] = row.get(header);
      }
      return NextResponse.json({ success: true, data });
    }

    const statusFilter = searchParams.get("status")?.toLowerCase();
    const layananFilter = searchParams.get("layanan");
    const searchQuery = searchParams.get("search")?.toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));

    let rows = await getRows("Monitoring");
    const headers = [
      "Tgl Permintaan",
      "Kode Lot Lelang",
      "ID Pengajuan",
      "Tanggal Pengambilan",
      "Jenis Layanan",
      "Nomor Dokumen",
      "Tanggal Dokumen",
      "Status Proses",
    ];

    const result = rows.map((r) => {
      const item: Record<string, string> = {};
      for (const h of headers) {
        item[h] = r.get(h);
      }
      return item;
    });

    const filtered = result.filter((r) => {
      if (statusFilter && r["Status Proses"]?.toLowerCase() !== statusFilter) return false;
      if (layananFilter && r["Jenis Layanan"] !== layananFilter) return false;
      if (searchQuery) {
        const id = r["ID Pengajuan"]?.toLowerCase() ?? "";
        if (!id.includes(searchQuery)) return false;
      }
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    const stats = { total: 0, proses: 0, siap_diambil: 0, tidak_valid: 0, selesai: 0 };
    for (const r of result) {
      const s = r["Status Proses"]?.toLowerCase() ?? "";
      stats.total++;
      if (s === "proses") stats.proses++;
      else if (s === "siap diambil") stats.siap_diambil++;
      else if (s === "tidak valid") stats.tidak_valid++;
      else if (s === "selesai") stats.selesai++;
    }

    return NextResponse.json({ success: true, data: paginated, total, page, totalPages, stats });
  } catch (error) {
    console.error("Admin GET error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, reason, tglPengambilan } = body;
    const status = body.status?.toLowerCase();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "ID dan status harus diisi" },
        { status: 400 },
      );
    }

    const sheetInfo = getSheetFromId(id);
    if (!sheetInfo) {
      return NextResponse.json(
        { success: false, error: "ID tidak valid" },
        { status: 400 },
      );
    }

    const serviceUpdates: Record<string, string> = {
      "Status Permohonan": status,
    };
    const monitoringUpdates: Record<string, string> = {
      "Status Proses": status,
    };

    if (reason) {
      serviceUpdates["Keterangan Ditolak"] = reason;
    }
    if (tglPengambilan) {
      serviceUpdates["Tanggal Pengambilan"] = tglPengambilan;
      monitoringUpdates["Tanggal Pengambilan"] = tglPengambilan;
    }

    await updateRow(sheetInfo.sheetName, sheetInfo.idColumn, id, serviceUpdates);
    await updateRow("Monitoring", "ID Pengajuan", id, monitoringUpdates);

    return NextResponse.json({
      success: true,
      message: "Status berhasil diperbarui",
      waNumber: null,
      waText: "",
    });
  } catch (error) {
    console.error("Admin PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui status" },
      { status: 500 },
    );
  }
}
