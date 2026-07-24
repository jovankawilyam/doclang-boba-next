import { NextRequest, NextResponse } from "next/server";
import { getRows } from "@/lib/google/sheets";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));

    const rows = await getRows("Monitoring");
    const headers = [
      "Tgl Permintaan",
      "ID Pengajuan",
      "Jenis Layanan",
      "Status Proses",
      "Tanggal Pengambilan",
    ];

    const result = rows
      .map((r) => {
        const item: Record<string, string> = {};
        for (const h of headers) {
          item[h] = r.get(h);
        }
        return item;
      })
      .filter((r) => r["Status Proses"])
      .sort((a, b) => {
        const dateA = a["Tgl Permintaan"] || "";
        const dateB = b["Tgl Permintaan"] || "";
        return dateB.localeCompare(dateA);
      });

    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = result.slice((page - 1) * limit, page * limit);

    const data = paginated.map((r) => ({
      id: r["ID Pengajuan"] || "-",
      waktu: r["Tgl Permintaan"] || "-",
      jenis_layanan: r["Jenis Layanan"] || "-",
      status_lama: "",
      status_baru: r["Status Proses"] || "-",
      keterangan: r["Tanggal Pengambilan"]
        ? `Tanggal pengambilan: ${r["Tanggal Pengambilan"]}`
        : "",
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
