import { NextRequest, NextResponse } from "next/server";
import { getRows } from "@/lib/google/sheets";

const LAYANAN_MAP: Record<string, string> = {
  kuitansi: "Kuitansi",
  kutipan_rl: "Kutipan RL",
  validasi_pph: "Validasi PPh",
};

export async function GET(request: NextRequest) {
  try {
    const layananKey = request.nextUrl.searchParams.get("layanan") ?? "";
    const target = LAYANAN_MAP[layananKey] || "";

    const rows = await getRows("Monitoring");
    const filtered = target
      ? rows.filter((r) => r.get("Jenis Layanan") === target)
      : rows;

    const total = filtered.length;
    let proses = 0, siapDiambil = 0, tidakValid = 0, selesai = 0;
    for (const r of filtered) {
      const s = r.get("Status Proses")?.toLowerCase() ?? "";
      if (s === "proses") proses++;
      else if (s === "siap diambil") siapDiambil++;
      else if (s === "tidak valid") tidakValid++;
      else if (s === "selesai") selesai++;
    }

    return NextResponse.json({ success: true, total, proses, siap_diambil: siapDiambil, tidak_valid: tidakValid, selesai });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat statistik" },
      { status: 500 },
    );
  }
}
