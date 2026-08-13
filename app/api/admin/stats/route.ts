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

export async function GET(request: NextRequest) {
  const unauth = await requireAdmin(request);
  if (unauth) return unauth;
  try {
    const limit = await consumeRateLimit(getRateLimitKey("admin-stats", request), { limit: 30, windowMs: 60 * 1000 });
    if (!limit.allowed) {
      return NextResponse.json({ success: false, error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }
    const { prisma } = await import("@/lib/db/prisma");

    const [total, proses, siap_diambil, tidak_valid, selesai] = await Promise.all([
      prisma.monitoring.count({ where: { deletedAt: null } }),
      prisma.monitoring.count({ where: { deletedAt: null, statusProses: { in: ["Dalam Proses", "Proses"] } } }),
      prisma.monitoring.count({ where: { deletedAt: null, statusProses: "Siap Diambil" } }),
      prisma.monitoring.count({ where: { deletedAt: null, statusProses: { in: ["Ditolak", "Tidak Valid"] } } }),
      prisma.monitoring.count({ where: { deletedAt: null, statusProses: { in: ["Total", "Valid Total", "Selesai"] } } }),
    ]);
    const stats = { total, proses, siap_diambil, tidak_valid, selesai };

    const LAYANAN_MAPPING: Record<string, string | string[]> = {
      "Kuitansi": "Pemberian Kuitansi Pembayaran Harga Lelang",
      "Kutipan RL": "Pemberian Kutipan Risalah Lelang",
      "Validasi PPh": ["Validasi PPh (1 Bidang)", "Validasi PPh (1 bidang)"],
    };

    const perLayanan: Record<string, typeof stats> = {};
    for (const l of LAYANAN) {
      const condition = Array.isArray(LAYANAN_MAPPING[l]) 
        ? { in: LAYANAN_MAPPING[l] } 
        : LAYANAN_MAPPING[l];
      const whereClause = { deletedAt: null, jenisLayanan: condition };

      const [ltotal, lproses, lsiap, ltidak, lselesai] = await Promise.all([
        prisma.monitoring.count({ where: whereClause }),
        prisma.monitoring.count({ where: { ...whereClause, statusProses: { in: ["Dalam Proses", "Proses"] } } }),
        prisma.monitoring.count({ where: { ...whereClause, statusProses: "Siap Diambil" } }),
        prisma.monitoring.count({ where: { ...whereClause, statusProses: { in: ["Ditolak", "Tidak Valid"] } } }),
        prisma.monitoring.count({ where: { ...whereClause, statusProses: { in: ["Total", "Valid Total", "Selesai"] } } }),
      ]);
      perLayanan[l] = { total: ltotal, proses: lproses, siap_diambil: lsiap, tidak_valid: ltidak, selesai: lselesai };
    }

    // Process monthly trend (might require loading specific fields since we don't have GROUP BY on extracted date parts easily)
    const allData = await prisma.monitoring.findMany({
      where: { deletedAt: null },
      select: { tglPermintaan: true, jenisLayanan: true }
    });

    const monthlyTrend: Record<string, Record<string, number>> = {};
    const REVERSE_LAYANAN_MAP: Record<string, string> = {
      "Pemberian Kuitansi Pembayaran Harga Lelang": "Kuitansi",
      "Pemberian Kutipan Risalah Lelang": "Kutipan RL",
      "Validasi PPh (1 Bidang)": "Validasi PPh",
      "Validasi PPh (1 bidang)": "Validasi PPh",
    };

    for (const r of allData) {
      const layanan = REVERSE_LAYANAN_MAP[r.jenisLayanan] || r.jenisLayanan;
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
    const { SHEET_MAPPINGS } = await import("@/lib/db/mapping");
    const mapping = SHEET_MAPPINGS["Monitoring"];
    const STATUS_MAP: Record<string, string> = {
      "Total": "Selesai",
      "Valid Total": "Selesai",
      "Ditolak": "Tidak Valid",
      "Dalam Proses": "Proses",
      "Selesai": "Selesai",
      "Siap Diambil": "Siap Diambil",
      "Tidak Valid": "Tidak Valid",
      "Proses": "Proses",
    };

    for (const l of LAYANAN) {
      const condition = Array.isArray(LAYANAN_MAPPING[l]) 
        ? { in: LAYANAN_MAPPING[l] } 
        : LAYANAN_MAPPING[l];
      const r = await prisma.monitoring.findMany({
        where: { deletedAt: null, jenisLayanan: condition },
        orderBy: { id: "desc" },
        take: 5
      });
      recent[l] = r.map((rec: Record<string, unknown>) => {
        const item: Record<string, string> = {};
        for (const m of mapping) {
          let val = String((rec as Record<string, unknown>)[m.field] ?? "");
          if (m.field === "jenisLayanan" && REVERSE_LAYANAN_MAP[val]) val = REVERSE_LAYANAN_MAP[val];
          if (m.field === "statusProses" && STATUS_MAP[val]) val = STATUS_MAP[val];
          if (HEADERS.includes(m.column)) item[m.column] = val;
        }
        return item;
      });
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
