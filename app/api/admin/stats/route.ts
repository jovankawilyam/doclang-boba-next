import { NextRequest, NextResponse } from "next/server";
import { getRows } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const HEADERS = [
  "Tgl Permintaan",
  "Kode Lot Lelang",
  "ID Pengajuan",
  "Tanggal Pengambilan",
  "Jenis Layanan",
  "Nomor Dokumen",
  "Tanggal Dokumen",
  "Status Proses",
];

const LAYANAN = ["Kuitansi", "Kutipan RL", "Validasi PPh"];

export async function GET(request: NextRequest) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;
  try {
    const rows = await getRows("Monitoring");

    const allData = rows.map((r) => {
      const item: Record<string, string> = {};
      for (const h of HEADERS) item[h] = r.get(h);
      return item;
    });

    const stats = { total: 0, proses: 0, siap_diambil: 0, tidak_valid: 0, selesai: 0 };
    const perLayanan: Record<string, typeof stats> = {};
    const recent: Record<string, typeof allData> = {};
    for (const l of LAYANAN) {
      perLayanan[l] = { total: 0, proses: 0, siap_diambil: 0, tidak_valid: 0, selesai: 0 };
      recent[l] = [];
    }

    const monthlyTrend: Record<string, Record<string, number>> = {};

    for (const r of allData) {
      const s = r["Status Proses"]?.toLowerCase() ?? "";
      const layanan = r["Jenis Layanan"] ?? "";
      const tgl = r["Tgl Permintaan"] ?? "";

      stats.total++;
      if (s === "proses") stats.proses++;
      else if (s === "siap diambil") stats.siap_diambil++;
      else if (s === "tidak valid") stats.tidak_valid++;
      else if (s === "selesai") stats.selesai++;

      if (perLayanan[layanan]) {
        perLayanan[layanan].total++;
        if (s === "proses") perLayanan[layanan].proses++;
        else if (s === "siap diambil") perLayanan[layanan].siap_diambil++;
        else if (s === "tidak valid") perLayanan[layanan].tidak_valid++;
        else if (s === "selesai") perLayanan[layanan].selesai++;
      }

      let monthKey = "";
      try {
        const d = new Date(tgl);
        if (!isNaN(d.getTime())) {
          monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        }
      } catch {}

      if (monthKey) {
        if (!monthlyTrend[monthKey]) {
          monthlyTrend[monthKey] = { Kuitansi: 0, "Kutipan RL": 0, "Validasi PPh": 0 };
        }
        if (monthlyTrend[monthKey][layanan] !== undefined) {
          monthlyTrend[monthKey][layanan]++;
        }
      }
    }

    const trend = Object.entries(monthlyTrend)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([bulan, counts]) => ({
        bulan,
        ...counts,
      }));

    for (const l of LAYANAN) {
      const filtered = allData.filter((r) => r["Jenis Layanan"] === l);
      recent[l] = filtered.slice(-5).reverse();
    }

    return NextResponse.json({ success: true, stats, perLayanan, monthlyTrend: trend, recent });
  } catch (error) {
    console.error("Stats GET error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data statistik" },
      { status: 500 },
    );
  }
}
