import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getRows, softDeleteSubmission, updateRow } from "@/lib/db";
import { getAdminFromRequest, requireAdmin, requireAdminRole } from "@/lib/auth";
import { validateAdminCsrf } from "@/lib/csrf";
import { appendActivityLog } from "@/lib/audit";

export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = ["proses", "siap diambil", "tidak valid", "selesai"];

const LAYANAN_FILTERS: Record<string, string[]> = {
  Kuitansi: ["Pemberian Kuitansi Pembayaran Harga Lelang", "Kuitansi"],
  "Kutipan RL": ["Pemberian Kutipan Risalah Lelang", "Kutipan RL"],
  "Validasi PPh": ["Validasi PPh (1 Bidang)", "Validasi PPh (1 bidang)", "Validasi PPh"],
};

const STATUS_FILTERS: Record<string, Prisma.MonitoringWhereInput["statusProses"]> = {
  proses: { in: ["Dalam Proses", "Proses", "proses"] },
  "siap diambil": { in: ["Siap Diambil", "siap diambil"] },
  "tidak valid": { in: ["Ditolak", "Tidak Valid", "tidak valid"] },
  selesai: { in: ["Total", "Valid Total", "Selesai", "selesai"] },
};

function layananLabels(layanan: string): string[] {
  return LAYANAN_FILTERS[layanan] ?? [layanan];
}

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

    // Reconstruct filtering logic in the database to get count
    const whereClause: Record<string, unknown> = { deletedAt: null };
    if (statusFilter) {
      whereClause.statusProses = STATUS_FILTERS[statusFilter];
    }
    if (layananFilter) {
      whereClause.jenisLayanan = { in: layananLabels(layananFilter) };
    }
    if (searchQuery) {
      whereClause.idPengajuan = { contains: searchQuery, mode: "insensitive" };
    }

    const { prisma } = await import("@/lib/db/prisma");
    const total = await prisma.monitoring.count({ where: whereClause });
    const totalPages = Math.ceil(total / limit);

    const getRowsOpts: Record<string, unknown> = {};
    if (!all) {
      getRowsOpts.limit = limit;
      getRowsOpts.offset = (page - 1) * limit;
    }
    
    // We still have to fetch the correct data
    let paginatedRows;
    if (searchQuery || layananFilter || statusFilter) {
       // It's much simpler to just get from prisma directly using our whereClause, 
       // but we want SheetRow objects. For now, since getRows doesn't accept complex where clauses,
       // we'll just implement the mapping here.
        const rawRows = await prisma.monitoring.findMany({
          where: whereClause,
          orderBy: { id: "desc" },
          ...(all ? {} : { take: limit, skip: (page - 1) * limit }),
        });
        const { SHEET_MAPPINGS } = await import("@/lib/db/mapping");
        const mapping = SHEET_MAPPINGS["Monitoring"];
        const LAYANAN_MAP: Record<string, string> = {
          "Pemberian Kuitansi Pembayaran Harga Lelang": "Kuitansi",
          "Pemberian Kutipan Risalah Lelang": "Kutipan RL",
          "Validasi PPh (1 Bidang)": "Validasi PPh",
          "Validasi PPh (1 bidang)": "Validasi PPh",
        };
        const STATUS_MAP: Record<string, string> = {
          "Total": "Selesai",
          "Valid Total": "Selesai",
          "Ditolak": "Tidak Valid",
          "Dalam Proses": "Proses",
          "Selesai": "Selesai",
          "Siap Diambil": "Siap Diambil",
          "Tidak Valid": "Tidak Valid",
          "Proses": "Proses",
          "selesai": "Selesai",
          "siap diambil": "Siap Diambil",
          "tidak valid": "Tidak Valid",
          "proses": "Proses",
        };
        paginatedRows = rawRows.map((r: Record<string, unknown>) => {
          const row: Record<string, string> = {};
          for (const m of mapping) {
            let val = String((r as Record<string, unknown>)[m.field] ?? "");
            if (m.field === "jenisLayanan" && LAYANAN_MAP[val]) val = LAYANAN_MAP[val];
            if (m.field === "statusProses" && STATUS_MAP[val]) val = STATUS_MAP[val];
            row[m.column] = val;
          }
          return row;
        });
     } else {
       const rows = await getRows("Monitoring", getRowsOpts);
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
       paginatedRows = rows.map((r) => {
         const item: Record<string, string> = {};
         for (const h of headers) {
           item[h] = r.get(h);
         }
         return item;
       });
     }

     // Since we don't have all data in memory, we can either fetch stats with aggregate queries,
     // or if we just want basic stats for the base filter, we can query it.
     const statsWhereClause: Prisma.MonitoringWhereInput = layananFilter
       ? { deletedAt: null, jenisLayanan: { in: layananLabels(layananFilter) } }
       : { deletedAt: null };
     const [statsTotal, statsProses, statsSiapDiambil, statsTidakValid, statsSelesai] = await Promise.all([
       prisma.monitoring.count({ where: statsWhereClause }),
       prisma.monitoring.count({ where: { ...statsWhereClause, statusProses: { in: ["Dalam Proses", "Proses", "proses"] } } }),
       prisma.monitoring.count({ where: { ...statsWhereClause, statusProses: { in: ["Siap Diambil", "siap diambil"] } } }),
       prisma.monitoring.count({ where: { ...statsWhereClause, statusProses: { in: ["Ditolak", "Tidak Valid", "tidak valid"] } } }),
       prisma.monitoring.count({ where: { ...statsWhereClause, statusProses: { in: ["Total", "Valid Total", "Selesai", "selesai"] } } }),
     ]);

     const stats = { 
       total: statsTotal, 
       proses: statsProses, 
       siap_diambil: statsSiapDiambil, 
       tidak_valid: statsTidakValid, 
       selesai: statsSelesai 
     };

    return NextResponse.json({ success: true, data: paginatedRows, total, page, totalPages, stats });

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
    if (!validateAdminCsrf(request)) {
      return NextResponse.json({ success: false, error: "CSRF token tidak valid" }, { status: 403 });
    }
    const body = await request.json();
    const { id, reason, tglPengambilan } = body;
    const newStatus = body.status?.toLowerCase();

    if (!id || !newStatus) {
      return NextResponse.json(
        { success: false, error: "ID dan status harus diisi" },
        { status: 400 },
      );
    }

    if (!ALLOWED_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: "Status tidak valid" },
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
    if (!currentRow) {
      return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });
    }
    const oldStatus = currentRow.get("Status Proses") ?? "";

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

    await appendActivityLog({
      waktu: new Date().toISOString(),
      idPengajuan: id,
      jenisLayanan: layanan,
      statusLama: oldStatus,
      statusBaru: newStatus,
      keterangan: reason || (tglPengambilan ? `Tanggal pengambilan: ${tglPengambilan}` : ""),
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

export async function DELETE(request: NextRequest) {
  const unauth = await requireAdminRole(request, ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"]);
  if (unauth) return unauth;
  try {
    if (!validateAdminCsrf(request)) {
      return NextResponse.json({ success: false, error: "CSRF token tidak valid" }, { status: 403 });
    }
    const admin = await getAdminFromRequest(request);
    const body = await request.json().catch(() => null);
    const id = body?.id;
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "ID harus diisi" },
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
    if (!currentRow) {
      return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });
    }
    const oldStatus = currentRow.get("Status Proses") ?? "";

    const monitoringRows = await getRows("Monitoring");
    const monRow = monitoringRows.find((r) => r.get("ID Pengajuan") === id);
    if (!monRow) {
      return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });
    }
    const layanan = monRow.get("Jenis Layanan") ?? "";

    await softDeleteSubmission(sheetInfo.sheetName, id, admin?.name ?? "");

    await appendActivityLog({
      waktu: new Date().toISOString(),
      idPengajuan: id,
      jenisLayanan: layanan,
      statusLama: oldStatus,
      statusBaru: "Dihapus",
      keterangan: "Permohonan dipindahkan ke Sampah",
    });

    return NextResponse.json({
      success: true,
      message: "Permohonan dipindahkan ke Sampah",
    });
  } catch (error) {
    console.error("Admin DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus permohonan" },
      { status: 500 },
    );
  }
}
