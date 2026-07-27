import { NextRequest, NextResponse } from "next/server";
import { getRows } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { SheetRow } from "@/lib/db";

const LOG_HEADERS = ["Waktu", "ID Pengajuan", "Jenis Layanan", "Status Lama", "Status Baru", "Keterangan"];

export async function GET(request: NextRequest) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));

    let rows: SheetRow[] = [];
    try {
      rows = await getRows("Activity Log");
    } catch {
      rows = [];
    }

    const result = rows
      .map((r) => {
        const item: Record<string, string> = {};
        for (const h of LOG_HEADERS) {
          item[h] = r.get(h);
        }
        return item;
      })
      .filter((r) => r["ID Pengajuan"])
      .sort((a, b) => {
        const dateA = a["Waktu"] || "";
        const dateB = b["Waktu"] || "";
        return dateB.localeCompare(dateA);
      });

    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = result.slice((page - 1) * limit, page * limit);

    const data = paginated.map((r) => ({
      id: r["ID Pengajuan"] || "-",
      waktu: r["Waktu"] || "-",
      jenis_layanan: r["Jenis Layanan"] || "-",
      status_lama: r["Status Lama"] || "",
      status_baru: r["Status Baru"] || "-",
      keterangan: r["Keterangan"] || "",
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
