import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { consumeRateLimit, getRateLimitKey } from "@/lib/rate-limit";

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

function normalizeLayanan(value: string): string {
  if (value === "Pemberian Kuitansi Pembayaran Harga Lelang") return "Kuitansi";
  if (value === "Pemberian Kutipan Risalah Lelang") return "Kutipan RL";
  if (value === "Validasi PPh (1 Bidang)" || value === "Validasi PPh (1 bidang)") return "Validasi PPh";
  return value;
}

function normalizeStatus(value: string): string {
  if (value === "Dalam Proses" || value === "Proses") return "Proses";
  if (value === "Siap Diambil") return "Siap Diambil";
  if (value === "Ditolak" || value === "Tidak Valid") return "Tidak Valid";
  if (value === "Total" || value === "Valid Total" || value === "Selesai") return "Selesai";
  return value;
}

export async function GET(request: NextRequest) {
  const unauth = await requireAdmin(request);
  if (unauth) return unauth;
  try {
    const limit = await consumeRateLimit(getRateLimitKey("admin-stats", request), { limit: 30, windowMs: 60 * 1000 });
    if (!limit.allowed) {
      return NextResponse.json({ success: false, error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }
    const { prisma } = await import("@/lib/db/prisma");

    const allMonitoring = await prisma.monitoring.findMany({
      where: { deletedAt: null },
      select: { jenisLayanan: true, statusProses: true, tglPermintaan: true },
    });
    const normalizedAll = allMonitoring.map((row) => ({
      layanan: normalizeLayanan(row.jenisLayanan),
      status: normalizeStatus(row.statusProses),
      tglPermintaan: row.tglPermintaan,
    }));

    const total = normalizedAll.length;
    const proses = normalizedAll.filter((row) => row.status === "Proses").length;
    const siap_diambil = normalizedAll.filter((row) => row.status === "Siap Diambil").length;
    const tidak_valid = normalizedAll.filter((row) => row.status === "Tidak Valid").length;
    const selesai = normalizedAll.filter((row) => row.status === "Selesai").length;
    const stats = { total, proses, siap_diambil, tidak_valid, selesai };

    const perLayanan: Record<string, typeof stats> = {};
    for (const l of LAYANAN) {
      const filtered = normalizedAll.filter((row) => row.layanan === l);
      perLayanan[l] = {
        total: filtered.length,
        proses: filtered.filter((row) => row.status === "Proses").length,
        siap_diambil: filtered.filter((row) => row.status === "Siap Diambil").length,
        tidak_valid: filtered.filter((row) => row.status === "Tidak Valid").length,
        selesai: filtered.filter((row) => row.status === "Selesai").length,
      };
    }

    // Process monthly trend (might require loading specific fields since we don't have GROUP BY on extracted date parts easily)
    const monthlyTrend: Record<string, Record<string, number>> = {};

    for (const r of normalizedAll) {
      const layanan = r.layanan;
      const tgl = r.tglPermintaan;

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

    // recent
    const recent: Record<string, Record<string, string>[]> = {};
    const recentRows = await prisma.monitoring.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
      take: 200,
      select: {
        tglPermintaan: true,
        kodeLotLelang: true,
        idPengajuan: true,
        tanggalPengambilan: true,
        jenisLayanan: true,
        nomorDokumen: true,
        tanggalDokumen: true,
        statusProses: true,
      },
    });

    for (const l of LAYANAN) {
      const filtered = recentRows
        .map((row) => ({
          ...row,
          jenisLayanan: normalizeLayanan(row.jenisLayanan),
          statusProses: normalizeStatus(row.statusProses),
        }))
        .filter((row) => row.jenisLayanan === l)
        .slice(0, 5)
        .map((row) => ({
          "Tgl Permintaan": row.tglPermintaan,
          "Kode Lot Lelang": row.kodeLotLelang,
          "ID Pengajuan": row.idPengajuan,
          "Tanggal Pengambilan": row.tanggalPengambilan,
          "Jenis Layanan": row.jenisLayanan,
          "Nomor Dokumen": row.nomorDokumen,
          "Tanggal Dokumen": row.tanggalDokumen,
          "Status Proses": row.statusProses,
        }));
      recent[l] = filtered.map((row) =>
        Object.fromEntries(HEADERS.map((header) => [header, row[header as keyof typeof row] ?? ""])),
      );
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
