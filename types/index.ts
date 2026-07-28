export type JenisLayanan = "kuitansi" | "kutipan_rl" | "validasi_pph";

export const JENIS_LAYANAN_LABEL: Record<JenisLayanan, string> = {
  kuitansi: "Pemberian Kuitansi Pembayaran Harga Lelang",
  kutipan_rl: "Pemberian Kutipan Risalah Lelang",
  validasi_pph: "Validasi PPh (1 Bidang)",
};

export const JENIS_LAYANAN_PREFIX: Record<JenisLayanan, string> = {
  kuitansi: "KPHL",
  kutipan_rl: "K-RL",
  validasi_pph: "VPPH",
};

export type StatusProses =
  | "Total"
  | "Selesai"
  | "Ditolak"
  | "Siap Diambil"
  | "Dalam Proses"
  | "Tidak Valid"
  | "Valid Total";

export interface Pengajuan {
  timestamp: string;
  kodeLotLelang: string;
  idPengajuan: string;
  tanggalPengambilan: string;
  jenisLayanan: JenisLayanan;
  nomorDokumen: string;
  tanggalDokumen: string;
  statusProses: StatusProses;
}
