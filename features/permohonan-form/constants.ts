import type { DoclangFormValues, ServiceType } from "./types";

export const IDENTITY_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const SERVICE_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const FILE_ACCEPT_ATTRIBUTE = ".pdf,.jpg,.jpeg,.png";
export const ACCEPTED_FILE_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

export const serviceOptions: ServiceType[] = [
  "Pemberian Kuitansi Pembayaran Harga Lelang",
  "Pemberian Kutipan Risalah Lelang",
  "Validasi PPh (1 Bidang)",
];

export const defaultValues: DoclangFormValues = {
  email_pemohon: "",
  nama_pemohon: "",
  jenis_identitas_pemohon: "KTP",
  nomor_identitas_pemohon: "",
  alamat_pemohon: "",
  nomor_wa_pemohon: "",
  peran_pemohon: undefined,
  nama_pemberi_kuasa: "",
  jenis_identitas_pemberi_kuasa: "KTP",
  nomor_identitas_pemberi_kuasa: "",
  alamat_pemberi_kuasa: "",
  nomor_wa_pemberi_kuasa: "",
  kode_lot_lelang: "",
  jenis_layanan: undefined,
  tanggal_pelunasan: "",
  jenis_objek_risalah: undefined,
  nomor_kuitansi_pembayaran_harga_lelang: "",
  nomor_objek_pajak: "",
  alamat_objek_lelang: "",
  ntpn: "",
  npwp_pemenang_lelang: "",
};

export const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm md:text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-navy focus:ring-2 focus:ring-navy/10";
export const labelClassName = "text-sm md:text-[15px] font-medium tracking-[0.01em] text-slate-700";
export const helperClassName = "text-xs md:text-sm leading-5 text-slate-500";
export const errorClassName = "text-xs md:text-sm font-medium text-red-600";
export const sectionClassName =
  "space-y-6 rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm md:px-8 md:py-8";
