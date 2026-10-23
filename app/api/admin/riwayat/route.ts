import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const unauth = await requireAdminRole(request, ["superadmin", "kepala_kantor", "kepala_bagian"]);
  if (unauth) return unauth;
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));

    const where = { idPengajuan: { not: "" } };

    const [total, rows] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        orderBy: { waktu: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const data = rows.map((r) => ({
      id: r.idPengajuan || "-",
      waktu: r.waktu || "-",
      jenis_layanan: r.jenisLayanan || "-",
      status_lama: r.statusLama || "",
      status_baru: r.statusBaru || "-",
      keterangan: r.keterangan || "",
    }));

    return NextResponse.json({ success: true, data, total, page, totalPages });
  } catch (error) {
    console.error("Riwayat GET error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat riwayat" },
      { status: 500 }
    );
  }
}
