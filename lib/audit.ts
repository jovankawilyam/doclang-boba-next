import { appendRow } from "@/lib/db";

export async function appendActivityLog(entry: {
  waktu: string;
  idPengajuan: string;
  jenisLayanan: string;
  statusLama: string;
  statusBaru: string;
  keterangan: string;
}) {
  await appendRow("Activity Log", {
    Waktu: entry.waktu,
    "ID Pengajuan": entry.idPengajuan,
    "Jenis Layanan": entry.jenisLayanan,
    "Status Lama": entry.statusLama,
    "Status Baru": entry.statusBaru,
    Keterangan: entry.keterangan,
  });
}
