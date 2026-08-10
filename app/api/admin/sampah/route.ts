import { NextRequest, NextResponse } from "next/server";
import {
  getRows,
  hardDeleteSubmission,
  restoreSubmission,
} from "@/lib/db";
import { getAdminFromRequest, requireAdminRole } from "@/lib/auth";
import { validateAdminCsrf } from "@/lib/csrf";
import { appendActivityLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

const HEADERS = [
  "Tgl Permintaan",
  "Kode Lot Lelang",
  "ID Pengajuan",
  "Jenis Layanan",
  "Status Proses",
  "Tgl Dihapus",
];

function getSheetFromId(id: string): { sheetName: string; idColumn: string } | null {
  if (id.includes("/KPHL/")) return { sheetName: "Kuitansi", idColumn: "ID KPHL" };
  if (id.includes("/K-RL/")) return { sheetName: "Kutipan RL", idColumn: "ID K-RL" };
  if (id.includes("/VPPH/")) return { sheetName: "Validasi PPh", idColumn: "ID VPPh" };
  return null;
}

export async function GET(request: NextRequest) {
  const unauth = await requireAdminRole(request, ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"]);
  if (unauth) return unauth;
  try {
    const { searchParams } = new URL(request.url);
    const layananFilter = searchParams.get("layanan");
    const searchQuery = searchParams.get("search")?.toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));

    const rows = await getRows("Monitoring", { onlyDeleted: true });
    const result = rows.map((r) => {
      const item: Record<string, string> = {};
      for (const h of HEADERS) item[h] = r.get(h);
      return item;
    });

    const filtered = result.filter((r) => {
      if (layananFilter && r["Jenis Layanan"] !== layananFilter) return false;
      if (searchQuery) {
        const id = r["ID Pengajuan"]?.toLowerCase() ?? "";
        if (!id.includes(searchQuery)) return false;
      }
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({ success: true, data: paginated, total, page, totalPages });
  } catch (error) {
    console.error("Sampah GET error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data sampah" },
      { status: 500 },
    );
  }
}

async function getLayanan(id: string): Promise<string> {
  const rows = await getRows("Monitoring", { onlyDeleted: true });
  return rows.find((r) => r.get("ID Pengajuan") === id)?.get("Jenis Layanan") ?? "";
}

export async function PATCH(request: NextRequest) {
  const unauth = await requireAdminRole(request, ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"]);
  if (unauth) return unauth;
  try {
    if (!validateAdminCsrf(request)) {
      return NextResponse.json({ success: false, error: "CSRF token tidak valid" }, { status: 403 });
    }
    const body = await request.json().catch(() => null);
    const id = body?.id;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, error: "ID harus diisi" }, { status: 400 });
    }

    const sheetInfo = getSheetFromId(id);
    if (!sheetInfo) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    const layanan = await getLayanan(id);
    await restoreSubmission(sheetInfo.sheetName, id);

    await appendActivityLog({
      waktu: new Date().toISOString(),
      idPengajuan: id,
      jenisLayanan: layanan,
      statusLama: "Dihapus",
      statusBaru: "Dipulihkan",
      keterangan: "Permohonan dipulihkan dari Sampah",
    });

    return NextResponse.json({ success: true, message: "Permohonan dipulihkan" });
  } catch (error) {
    console.error("Sampah PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memulihkan permohonan" },
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
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID harus diisi" }, { status: 400 });
    }

    const sheetInfo = getSheetFromId(id);
    if (!sheetInfo) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    const layanan = await getLayanan(id);
    await hardDeleteSubmission(sheetInfo.sheetName, id);

    await appendActivityLog({
      waktu: new Date().toISOString(),
      idPengajuan: id,
      jenisLayanan: layanan,
      statusLama: "Dihapus",
      statusBaru: "Dihapus Permanen",
      keterangan: `Permohonan dihapus permanen oleh ${admin?.name ?? ""}`,
    });

    return NextResponse.json({ success: true, message: "Permohonan dihapus permanen" });
  } catch (error) {
    console.error("Sampah DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus permanen" },
      { status: 500 },
    );
  }
}
