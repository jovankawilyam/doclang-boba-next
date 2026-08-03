import { NextRequest, NextResponse } from "next/server";
import { getRows, updateRow, appendRow } from "@/lib/db";
import { requireAdmin, requireAdminRole } from "@/lib/auth";

export const dynamic = 'force-dynamic';

function getSheetFromId(id: string): { sheetName: string; idColumn: string } | null {
  if (id.includes("/KPHL/")) return { sheetName: "Kuitansi", idColumn: "ID KPHL" };
  if (id.includes("/K-RL/")) return { sheetName: "Kutipan RL", idColumn: "ID K-RL" };
  if (id.includes("/VPPH/")) return { sheetName: "Validasi PPh", idColumn: "ID VPPh" };
  return null;
}

export async function GET(request: NextRequest) {
  const unauth = await requireAdmin(request);
  if (unauth) return unauth;
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
    const all = searchParams.get("all") === "true";

    const rows = await getRows("Monitoring");
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
    const paginated = all ? filtered : filtered.slice((page - 1) * limit, page * limit);

    const baseForStats = layananFilter
      ? result.filter((r) => r["Jenis Layanan"] === layananFilter)
      : result;
    const stats = { total: 0, proses: 0, siap_diambil: 0, tidak_valid: 0, selesai: 0 };
    for (const r of baseForStats) {
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
  const unauth = await requireAdminRole(request, ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"]);
  if (unauth) return unauth;
  try {
    const body = await request.json();
    const { id, reason, tglPengambilan } = body;
    const newStatus = body.status?.toLowerCase();

    if (!id || !newStatus) {
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

    const rows = await getRows(sheetInfo.sheetName);
    const currentRow = rows.find((r) => r.get(sheetInfo.idColumn) === id);
    const oldStatus = currentRow?.get("Status Proses") ?? "";

    const serviceUpdates: Record<string, string> = {
      "Status Permohonan": newStatus,
      "Status Proses": newStatus,
    };
    const monitoringUpdates: Record<string, string> = {
      "Status Proses": newStatus,
    };

    if (newStatus === "tidak valid") {
      serviceUpdates["Keterangan Ditolak"] = reason || "";
    } else {
      serviceUpdates["Keterangan Ditolak"] = "";
    }
    if (tglPengambilan) {
      serviceUpdates["Tanggal Pengambilan"] = tglPengambilan;
      monitoringUpdates["Tanggal Pengambilan"] = tglPengambilan;
    }

    await updateRow(sheetInfo.sheetName, sheetInfo.idColumn, id, serviceUpdates);
    await updateRow("Monitoring", "ID Pengajuan", id, monitoringUpdates);

    const monitoringRows = await getRows("Monitoring");
    const monRow = monitoringRows.find((r) => r.get("ID Pengajuan") === id);
    const layanan = monRow?.get("Jenis Layanan") ?? "";

    await appendRow("Activity Log", {
      Waktu: new Date().toISOString(),
      "ID Pengajuan": id,
      "Jenis Layanan": layanan,
      "Status Lama": oldStatus,
      "Status Baru": newStatus,
      Keterangan: reason || (tglPengambilan ? `Tanggal pengambilan: ${tglPengambilan}` : ""),
    });

    return NextResponse.json({
      success: true,
      message: "Status berhasil diperbarui",
    });
  } catch (error) {
    console.error("Admin PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui status" },
      { status: 500 },
    );
  }
}
