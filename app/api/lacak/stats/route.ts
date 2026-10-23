import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { LAYANAN_MAP, STATUS_MAP } from "@/lib/db";
import { consumeRateLimit, getRateLimitKey } from "@/lib/rate-limit";

const LAYANAN_LIST = ["Kuitansi", "Kutipan RL", "Validasi PPh"];

type ServiceStats = { total: number; proses: number; siap_diambil: number; tidak_valid: number; selesai: number };

function layananAliases(layanan: string): string[] {
  return Object.keys(LAYANAN_MAP)
    .filter((k) => LAYANAN_MAP[k] === layanan)
    .concat(layanan);
}

async function statsFor(layanan?: string): Promise<ServiceStats> {
  const where: Prisma.MonitoringWhereInput = { deletedAt: null };
  if (layanan) where.jenisLayanan = { in: layananAliases(layanan) };

  const groups = await prisma.monitoring.groupBy({
    by: ["statusProses"],
    where,
    _count: { _all: true },
  });

  const stats: ServiceStats = { total: 0, proses: 0, siap_diambil: 0, tidak_valid: 0, selesai: 0 };
  for (const g of groups) {
    const n = g._count._all;
    stats.total += n;
    const s = STATUS_MAP[g.statusProses] ?? g.statusProses;
    if (s === "Proses") stats.proses += n;
    else if (s === "Siap Diambil") stats.siap_diambil += n;
    else if (s === "Tidak Valid") stats.tidak_valid += n;
    else if (s === "Selesai") stats.selesai += n;
  }
  return stats;
}

export async function GET(request: NextRequest) {
  try {
    const limit = await consumeRateLimit(getRateLimitKey("lacak-stats", request), { limit: 30, windowMs: 60 * 1000 });
    if (!limit.allowed) {
      return NextResponse.json({ success: false, error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }
    const layananKey = (request.nextUrl.searchParams.get("layanan") ?? "").trim().toLowerCase();

    if (layananKey) {
      const target =
        layananKey === "kuitansi" ? "Kuitansi" :
        layananKey === "kutipan_rl" ? "Kutipan RL" :
        layananKey === "validasi_pph" ? "Validasi PPh" : "";
      if (!target) {
        return NextResponse.json({ success: false, error: "Layanan tidak valid" }, { status: 400 });
      }
      const stats = await statsFor(target);
      return NextResponse.json({ success: true, ...stats });
    }

    const perLayanan: Record<string, ServiceStats> = {};
    for (const l of LAYANAN_LIST) {
      perLayanan[l] = await statsFor(l);
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
