import { NextRequest, NextResponse } from "next/server";
import { getRows } from "@/lib/db";
import { consumeRateLimit, getRateLimitKey } from "@/lib/rate-limit";

const LAYANAN_LIST = ["Kuitansi", "Kutipan RL", "Validasi PPh"];

type ServiceStats = { total: number; proses: number; siap_diambil: number; tidak_valid: number; selesai: number };

function countStats(rows: { get: (key: string) => string }[]): ServiceStats {
  let total = 0, proses = 0, siapDiambil = 0, tidakValid = 0, selesai = 0;
  for (const r of rows) {
    total++;
    const s = r.get("Status Proses")?.toLowerCase() ?? "";
    if (s === "proses") proses++;
    else if (s === "siap diambil") siapDiambil++;
    else if (s === "tidak valid") tidakValid++;
    else if (s === "selesai") selesai++;
  }
  return { total, proses, siap_diambil: siapDiambil, tidak_valid: tidakValid, selesai };
}

export async function GET(request: NextRequest) {
  try {
    const limit = consumeRateLimit(getRateLimitKey("lacak-stats", request), { limit: 30, windowMs: 60 * 1000 });
    if (!limit.allowed) {
      return NextResponse.json({ success: false, error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }
    const layananKey = (request.nextUrl.searchParams.get("layanan") ?? "").trim().toLowerCase();
    const rows = await getRows("Monitoring");

    if (layananKey) {
      const target =
        layananKey === "kuitansi" ? "Kuitansi" :
        layananKey === "kutipan_rl" ? "Kutipan RL" :
        layananKey === "validasi_pph" ? "Validasi PPh" : "";
      const filtered = target ? rows.filter((r) => r.get("Jenis Layanan") === target) : rows;
      const stats = countStats(filtered);
      return NextResponse.json({ success: true, ...stats });
    }

    const perLayanan: Record<string, ServiceStats> = {};
    for (const l of LAYANAN_LIST) {
      const filtered = rows.filter((r) => r.get("Jenis Layanan") === l);
      perLayanan[l] = countStats(filtered);
    }

    return NextResponse.json({ success: true, perLayanan });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat statistik" },
      { status: 500 },
    );
  }
}
