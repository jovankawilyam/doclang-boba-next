import { NextRequest, NextResponse } from "next/server";
import { appendPermohonanRows } from "@/lib/db";
import { generateId } from "@/lib/generate-id";
import { consumeRateLimit, getRateLimitKey } from "@/lib/rate-limit";
type Peran = "pemenang" | "kuasa";

const PERAN_MAP: Record<Peran, string> = {
  pemenang: "Pemenang Lelang",
  kuasa: "Penerima Kuasa",
};

const OBJEK_RL_MAP: Record<string, string> = {
  tanah_bangunan: "Tanah/Bangunan",
  kendaraan: "Kendaraan",
};

const FILE_FIELD_TO_SHEET_COLUMN: Record<string, string> = {
  dokumen_identitas_pemohon: "Dokumen ID Pemohon",
  dokumen_identitas_pemberi_kuasa: "Dokumen Identitas Pemberi Kuasa",
  surat_kuasa: "Surat Kuasa",
};

const MAX_REQUEST_BODY_BYTES = 1_500_000;

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((v) => typeof v === "string")
  );
}

function withRateLimitHeaders(response: NextResponse, remaining: number, resetAt: number): NextResponse {
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
  return response;
}

function getPeranLabel(peran: string): string {
  return PERAN_MAP[peran as Peran] ?? peran;
}

function getObjekRlLabel(objek: string): string {
  return OBJEK_RL_MAP[objek] ?? objek;
}

function getSheetName(jenisLayanan: string): string | null {
  switch (jenisLayanan) {
    case "Pemberian Kuitansi Pembayaran Harga Lelang":
      return "Kuitansi";
    case "Pemberian Kutipan Risalah Lelang":
      return "Kutipan RL";
    case "Validasi PPh (1 Bidang)":
      return "Validasi PPh";
    default:
      return null;
  }
}

function getJenisLayananLabel(jenisLayanan: string): string {
  switch (jenisLayanan) {
    case "Pemberian Kuitansi Pembayaran Harga Lelang":
      return "Kuitansi";
    case "Pemberian Kutipan Risalah Lelang":
      return "Kutipan RL";
    case "Validasi PPh (1 Bidang)":
      return "Validasi PPh";
    default:
      return jenisLayanan;
  }
}

function getFileColumnMap(
  jenisLayanan: string,
): Record<string, string> {
  const map: Record<string, string> = { ...FILE_FIELD_TO_SHEET_COLUMN };
  switch (jenisLayanan) {
    case "Pemberian Kuitansi Pembayaran Harga Lelang":
      map["bukti_pelunasan"] = "Bukti Pelunasan";
      break;
    case "Pemberian Kutipan Risalah Lelang":
      map["bukti_pelunasan"] = "Bukti (setor) pelunasan";
      map["kuitansi_pembayaran_harga_lelang_file"] =
        "Kuitansi Pembayaran Harga Lelang";
      map["bukti_validasi_sspd_bphtb"] = "SPPD BPHTB";
      break;
    case "Validasi PPh (1 Bidang)":
      map["kuitansi_pembayaran_harga_lelang_file"] =
        "Kuitansi Pembayaran Harga Lelang";
      map["slip_setor_pbb_atau_bphtb"] = "Dok. PBB / BPHTB";
      map["slip_setor_pph"] = "Slip setor PPh";
      map["npwp_pemenang_lelang_file"] = "Upload NPWP Pemenang Lelang";
      break;
  }
  return map;
}

function buildRowData(
  textData: Record<string, string>,
  driveLinks: Record<string, string>,
  idPengajuan: string,
  tiket: string,
  kodeTiket: string,
  jenisLayanan: string,
): Record<string, string> {
  const peran = getPeranLabel(textData["peran_pemohon"] ?? "");

  const base = {
    "Tgl Permintaan": new Date().toISOString(),
    "Kode Lot Lelang": textData["kode_lot_lelang"] ?? "",
    "Status Proses": "proses",
  };

  const serviceSpecific: Record<string, string> = {};

  switch (jenisLayanan) {
    case "Pemberian Kuitansi Pembayaran Harga Lelang": {
      Object.assign(serviceSpecific, {
        "Tiket KPHL": tiket,
        "Kode Tiket KPHL": kodeTiket,
        "ID KPHL": idPengajuan,
        "No Pengajuan": tiket,
        "Email Address": textData["email_pemohon"] ?? "",
        "Nama Pemohon": textData["nama_pemohon"] ?? "",
        "Nomor Identitas Pemohon": textData["nomor_identitas_pemohon"] ?? "",
        "Alamat Pemohon": textData["alamat_pemohon"] ?? "",
        "Nomor Whatsapp Pemohon": textData["nomor_wa_pemohon"] ?? "",
        "Jenis Pemohon": peran,
        "Nama Pemberi Kuasa": textData["nama_pemberi_kuasa"] ?? "",
        "Nomor Identitas Pemberi Kuasa":
          textData["nomor_identitas_pemberi_kuasa"] ?? "",
        "Alamat Pemberi Kuasa": textData["alamat_pemberi_kuasa"] ?? "",
        "Nomor Whatsapp Pemberi Kuasa":
          textData["nomor_wa_pemberi_kuasa"] ?? "",
        "Jenis Identitas Pemberi Kuasa":
          textData["jenis_identitas_pemberi_kuasa"] ?? "",
        "Jenis Identitas Pemohon": textData["jenis_identitas_pemohon"] ?? "",
        "Tanggal Pelunasan Pembayaran": textData["tanggal_pelunasan"] ?? "",
      });
      break;
    }
    case "Pemberian Kutipan Risalah Lelang": {
      Object.assign(serviceSpecific, {
        "Tiket K-RL": tiket,
        "Kode Tiket K-RL": kodeTiket,
        "ID K-RL": idPengajuan,
        "No Pengajuan": tiket,
        "Nama Pemohon": textData["nama_pemohon"] ?? "",
        "Email Address": textData["email_pemohon"] ?? "",
        "Nomor Identitas Pemohon": textData["nomor_identitas_pemohon"] ?? "",
        "Alamat Pemohon": textData["alamat_pemohon"] ?? "",
        "Nomor Whatsapp Pemohon": textData["nomor_wa_pemohon"] ?? "",
        "Jenis Pemohon": peran,
        "Nama Pemberi Kuasa": textData["nama_pemberi_kuasa"] ?? "",
        "Nomor Identitas Pemberi Kuasa":
          textData["nomor_identitas_pemberi_kuasa"] ?? "",
        "Alamat Pemberi Kuasa": textData["alamat_pemberi_kuasa"] ?? "",
        "Nomor Whatsapp Pemberi Kuasa":
          textData["nomor_wa_pemberi_kuasa"] ?? "",
        "Jenis Identitas Pemberi Kuasa":
          textData["jenis_identitas_pemberi_kuasa"] ?? "",
        "Jenis Dokumen ID Pemohon": textData["jenis_identitas_pemohon"] ?? "",
        "Objek Lelang": getObjekRlLabel(
          textData["jenis_objek_risalah"] ?? "",
        ),
      });
      break;
    }
    case "Validasi PPh (1 Bidang)": {
      Object.assign(serviceSpecific, {
        "Tiket VPPh": tiket,
        "Kode Tiket VPPh": kodeTiket,
        "ID VPPh": idPengajuan,
        "No Pengajuan": tiket,
        "Email Address": textData["email_pemohon"] ?? "",
        "Nama Pemohon": textData["nama_pemohon"] ?? "",
        "Nomor Identitas Pemohon": textData["nomor_identitas_pemohon"] ?? "",
        "Alamat Pemohon": textData["alamat_pemohon"] ?? "",
        "Nomor Whatsapp Pemohon": textData["nomor_wa_pemohon"] ?? "",
        "Jenis Pemohon": peran,
        "Nama Pemberi Kuasa": textData["nama_pemberi_kuasa"] ?? "",
        "Nomor Identitas Pemberi Kuasa":
          textData["nomor_identitas_pemberi_kuasa"] ?? "",
        "Alamat Pemberi Kuasa": textData["alamat_pemberi_kuasa"] ?? "",
        "Nomor Whatsapp Pemberi Kuasa":
          textData["nomor_wa_pemberi_kuasa"] ?? "",
        "Jenis Identitas Pemberi Kuasa":
          textData["jenis_identitas_pemberi_kuasa"] ?? "",
        "Jenis Identitas Pemohon": textData["jenis_identitas_pemohon"] ?? "",
        "Nomor Kuitansi Pembayaran Harga Lelang":
          textData["nomor_kuitansi_pembayaran_harga_lelang"] ?? "",
        "NPWP Pemenang Lelang": textData["npwp_pemenang_lelang"] ?? "",
        NTPN: textData["ntpn"] ?? "",
        NOP: textData["nomor_objek_pajak"] ?? "",
        "Alamat Objek Lelang": textData["alamat_objek_lelang"] ?? "",
      });
      break;
    }
  }

  return { ...base, ...serviceSpecific, ...driveLinks };
}

function buildMonitoringRow(
  textData: Record<string, string>,
  idPengajuan: string,
  jenisLayanan: string,
): Record<string, string> {
  return {
    "Tgl Permintaan": new Date().toISOString(),
    "Kode Lot Lelang": textData["kode_lot_lelang"] ?? "",
    "ID Pengajuan": idPengajuan,
    "Tanggal Pengambilan": "",
    "Jenis Layanan": getJenisLayananLabel(jenisLayanan),
    "Nomor Dokumen": "",
    "Tanggal Dokumen": "",
    "Status Proses": "proses",
  };
}

export async function POST(request: NextRequest) {
  try {
    const limit = consumeRateLimit(getRateLimitKey("permohonan", request), {
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (!limit.allowed) {
      return withRateLimitHeaders(
        NextResponse.json(
          { success: false, error: "Terlalu banyak permintaan. Coba lagi nanti." },
          { status: 429 },
        ),
        limit.remaining,
        limit.resetAt,
      );
    }

    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > MAX_REQUEST_BODY_BYTES) {
      return withRateLimitHeaders(
        NextResponse.json(
          { success: false, error: "Ukuran permohonan terlalu besar." },
          { status: 413 },
        ),
        limit.remaining,
        limit.resetAt,
      );
    }

    const body: unknown = await request.json();
    if (!isStringRecord(body)) {
      return NextResponse.json(
        { success: false, error: "Format data tidak sesuai" },
        { status: 400 },
      );
    }
    const textData: Record<string, string> = Object.fromEntries(
      Object.entries(body).map(([key, value]) => [key.trim(), value.trim()]),
    );

    const jenisLayanan = textData["jenis_layanan"]?.trim();

    if (!jenisLayanan || !getSheetName(jenisLayanan)) {
      return withRateLimitHeaders(
        NextResponse.json(
          { success: false, error: "Jenis layanan tidak valid" },
          { status: 400 },
        ),
        limit.remaining,
        limit.resetAt,
      );
    }

    const fileColumnMap = getFileColumnMap(jenisLayanan);
    const driveLinks: Record<string, string> = {};
    for (const [field, column] of Object.entries(fileColumnMap)) {
      if (textData[field]) {
        driveLinks[column] = textData[field];
        delete textData[field];
      }
    }

    let id: string, tiket: string, kodeTiket: string;
    try {
      const generated = await generateId(jenisLayanan);
      id = generated.id;
      tiket = generated.tiket;
      kodeTiket = generated.kodeTiket;
    } catch (genError) {
      console.error("Generate ID error:", genError);
      return withRateLimitHeaders(
        NextResponse.json(
          { success: false, error: "Gagal membuat ID pengajuan. Periksa koneksi database." },
          { status: 500 },
        ),
        limit.remaining,
        limit.resetAt,
      );
    }

    const sheetName = getSheetName(jenisLayanan)!;
    const rowData = buildRowData(
      textData,
      driveLinks,
      id,
      tiket,
      kodeTiket,
      jenisLayanan,
    );

    try {
      await appendPermohonanRows(sheetName, rowData, buildMonitoringRow(textData, id, jenisLayanan));
    } catch (sheetError) {
      console.error("Append row error:", sheetError);
      return withRateLimitHeaders(
        NextResponse.json(
          { success: false, error: "Gagal menyimpan data. Periksa koneksi database." },
          { status: 500 },
        ),
        limit.remaining,
        limit.resetAt,
      );
    }

    return withRateLimitHeaders(
      NextResponse.json({ success: true, id_pengajuan: id }),
      limit.remaining,
      limit.resetAt,
    );
  } catch (error) {
    console.error("Permohonan error:", error);
    const message =
      error instanceof TypeError
        ? "Format data tidak sesuai"
        : "Gagal mengirim permohonan";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
