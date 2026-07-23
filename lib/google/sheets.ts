import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const MONITORING_HEADERS = [
  "Tgl Permintaan",
  "Kode Lot Lelang",
  "ID Pengajuan",
  "Tanggal Pengambilan",
  "Jenis Layanan",
  "Nomor Dokumen",
  "Tanggal Dokumen",
  "Status Proses",
];

const KUITANSI_HEADERS = [
  "Tiket KPHL",
  "Kode Tiket KPHL",
  "ID KPHL",
  "No Pengajuan",
  "Tgl Permintaan",
  "Email Address",
  "Nama Pemohon",
  "Nomor Identitas Pemohon",
  "Alamat Pemohon",
  "Nomor Whatsapp Pemohon",
  "Jenis Pemohon",
  "Nama Pemberi Kuasa",
  "Nomor Identitas Pemberi Kuasa",
  "Alamat Pemberi Kuasa",
  "Nomor Whatsapp Pemberi Kuasa",
  "Jenis Identitas Pemberi Kuasa",
  "Dokumen Identitas Pemberi Kuasa",
  "_",
  "Verif Dok. ID Pemberi Kuasa",
  "Surat Kuasa",
  "Verif Surat Kuasa",
  "Jenis Identitas Pemohon",
  "Dokumen ID Pemohon",
  "Verif Dokumen ID",
  "Tanggal Pelunasan Pembayaran",
  "Bukti Pelunasan",
  "Verif Bukti Pelunasan",
  "Tanggal Pengambilan",
  "Waktu Pengambilan",
  "Status Permohonan",
  "Keterangan Ditolak",
  "Status Proses",
  "Tiket",
  "Kode Lot Lelang",
  "Nomor Kuitansi",
  "Tanggal Kuitansi",
  "jarak",
  "Merged Doc ID - Kuitansi Pembayaran Harga Lelang",
  "Merged Doc URL - Kuitansi Pembayaran Harga Lelang",
  "Link to merged Doc - Kuitansi Pembayaran Harga Lelang",
  "Document Merge Status - Kuitansi Pembayaran Harga Lelang",
  "Merged Doc ID - auto Kuitansi",
  "bantu_auto_kuitansi",
  "Merged Doc URL - auto Kuitansi",
  "Link to merged Doc - auto Kuitansi",
  "Document Merge Status - auto Kuitansi",
  "Merged Doc ID - auto notif kuitansi",
  "Merged Doc URL - auto notif kuitansi",
  "Link to merged Doc - auto notif kuitansi",
  "Document Merge Status - auto notif kuitansi",
  "Merged Doc ID - penolakan kuitansi",
  "Merged Doc URL - penolakan kuitansi",
  "Link to merged Doc - penolakan kuitansi",
  "Document Merge Status - penolakan kuitansi",
];

const KUTIPAN_RL_HEADERS = [
  "Tiket K-RL",
  "Kode Tiket K-RL",
  "ID K-RL",
  "No Pengajuan",
  "Tgl Permintaan",
  "Nama Pemohon",
  "Email Address",
  "Nomor Identitas Pemohon",
  "Alamat Pemohon",
  "Nomor Whatsapp Pemohon",
  "Jenis Pemohon",
  "Nama Pemberi Kuasa",
  "Nomor Identitas Pemberi Kuasa",
  "Alamat Pemberi Kuasa",
  "Nomor Whatsapp Pemberi Kuasa",
  "Jenis Identitas Pemberi Kuasa",
  "Dokumen Identitas Pemberi Kuasa",
  "_",
  "Verif Dok. ID Pemberi Kuasa",
  "Surat Kuasa",
  "Verif Surat Kuasa",
  "Jenis Dokumen ID Pemohon",
  "Dokumen ID Pemohon",
  "Verif Dokumen ID",
  "Rincian Uang Hasil Lelang",
  "Verif Rincian Uang Hasil Lelang",
  "Bukti (setor) pelunasan",
  "Verif Bukti (setor) pelunasan",
  "Kuitansi Pembayaran Harga Lelang",
  "Verif Kuitansi",
  "Bukti setor uang jaminan/tanda terima uang jaminan",
  "Verif bukti setor uang jaminan/tanda terima uang jaminan",
  "Objek Lelang",
  "SPPD BPHTB",
  "Verif SPPD BPHTB",
  "Tanggal Pengambilan",
  "Waktu Pengambilan",
  "Status Permohonan",
  "Keterangan Ditolak",
  "Status Proses",
  "Tiket",
  "Kode Lot Lelang",
  "Nomor Kutipan",
  "Tanggal Kutipan",
  "jarak",
  "Merged Doc ID - Kutipan Risalah Lelang",
  "Merged Doc URL - Kutipan Risalah Lelang",
  "Link to merged Doc - Kutipan Risalah Lelang",
  "Document Merge Status - Kutipan Risalah Lelang",
  "Merged Doc ID - auto Kutipan RL",
  "bantu_auto_kutipan",
  "Link to merged Doc - auto Kutipan RL",
  "Document Merge Status - auto Kutipan RL",
  "Merged Doc ID - auto notif kutipan",
  "Merged Doc URL - auto notif kutipan",
  "Link to merged Doc - auto notif kutipan",
  "Document Merge Status - auto notif kutipan",
  "Merged Doc URL - auto Kutipan RL",
];

const VALIDASI_PPH_HEADERS = [
  "Tiket VPPh",
  "Kode Tiket VPPh",
  "ID VPPh",
  "No Pengajuan",
  "Tgl Permintaan",
  "Email Address",
  "Nama Pemohon",
  "Nomor Identitas Pemohon",
  "Alamat Pemohon",
  "Nomor Whatsapp Pemohon",
  "Jenis Pemohon",
  "Nama Pemberi Kuasa",
  "Nomor Identitas Pemberi Kuasa",
  "Alamat Pemberi Kuasa",
  "Nomor Whatsapp Pemberi Kuasa",
  "Jenis Identitas Pemberi Kuasa",
  "Dokumen Identitas Pemberi Kuasa",
  "_",
  "Verif Dok. ID Pemberi Kuasa",
  "Surat Kuasa",
  "Verif Surat Kuasa",
  "Jenis Identitas Pemohon",
  "Dokumen ID Pemohon",
  "Verif Dokumen ID",
  "Nomor Kuitansi Pembayaran Harga Lelang",
  "Kuitansi Pembayaran Harga Lelang",
  "Verif Kuitansi",
  "NPWP Pemenang Lelang",
  "Upload NPWP Pemenang Lelang",
  "NTPN",
  "Slip setor PPh",
  "Verif Slip setor PPh",
  "NOP",
  "Dok. PBB / BPHTB",
  "Alamat Objek Lelang",
  "Verif Dok. PBB / BPHTB",
  "Tanggal Pengambilan",
  "Waktu Pengambilan",
  "Status Permohonan",
  "Keterangan Ditolak",
  "Status Proses",
  "Tiket",
  "Kode Lot Lelang",
  "Nomor Validasi",
  "Tanggal Validasi",
  "catatan",
  "jarak",
  "Merged Doc ID - Validasi PPh",
  "Merged Doc URL - Validasi PPh",
  "Link to merged Doc - Validasi PPh",
  "Document Merge Status - Validasi PPh",
  "Merged Doc ID - auto Validasi PPh",
  "bantu_auto_pph",
  "Merged Doc URL - auto Validasi PPh",
  "Link to merged Doc - auto Validasi PPh",
  "Document Merge Status - auto Validasi PPh",
  "Merged Doc ID - auto notif validasi pph",
  "Merged Doc URL - auto notif validasi pph",
  "Link to merged Doc - auto notif validasi pph",
  "Document Merge Status - auto notif validasi pph",
];

const SHEET_DEFINITIONS: Record<string, string[]> = {
  Monitoring: MONITORING_HEADERS,
  Kuitansi: KUITANSI_HEADERS,
  "Kutipan RL": KUTIPAN_RL_HEADERS,
  "Validasi PPh": VALIDASI_PPH_HEADERS,
};

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!email || !key || !sheetId) return null;
  return {
    jwt: new JWT({
      email,
      key: key.replace(/\\n/g, "\n"),
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
      ],
    }),
    sheetId,
  };
}

let doc: GoogleSpreadsheet | null = null;

async function getDoc() {
  const auth = getAuth();
  if (!auth) return null;
  if (!doc) {
    doc = new GoogleSpreadsheet(auth.sheetId, auth.jwt);
    await doc.loadInfo();
  }
  return doc;
}

export async function getOrCreateSheet(sheetName: string) {
  const d = await getDoc();
  if (!d) return null;
  const headers = SHEET_DEFINITIONS[sheetName];
  if (!headers) return null;
  let sheet = d.sheetsByTitle[sheetName];
  if (!sheet) {
    sheet = await d.addSheet({ title: sheetName, headerValues: headers });
  } else {
    await sheet.loadHeaderRow();
    if (
      sheet.headerValues.length === 0 ||
      sheet.headerValues[0] !== headers[0]
    ) {
      await sheet.setHeaderRow(headers);
    }
  }
  return sheet;
}

export async function appendRow(
  sheetName: string,
  data: Record<string, string>,
) {
  const sheet = await getOrCreateSheet(sheetName);
  if (!sheet) return null;
  const headers = SHEET_DEFINITIONS[sheetName];
  if (!headers) return null;
  const rowData: Record<string, string> = {};
  for (const header of headers) {
    rowData[header] = data[header] ?? "";
  }
  return sheet.addRow(rowData);
}

export async function findRow(value: string) {
  for (const name of ["Kuitansi", "Kutipan RL", "Validasi PPh"]) {
    const sheet = await getOrCreateSheet(name);
    if (!sheet) continue;
    const rows = await sheet.getRows();
    const found = rows.find((r) => {
      for (const col of ["ID KPHL", "ID K-RL", "ID VPPh"]) {
        if (r.get(col) === value) return true;
      }
      return false;
    });
    if (found) return found;
  }
  return null;
}

export async function updateRow(
  sheetName: string,
  idColumn: string,
  idValue: string,
  updates: Record<string, string>,
) {
  const sheet = await getOrCreateSheet(sheetName);
  if (!sheet) return null;
  const rows = await sheet.getRows();
  const row = rows.find((r) => r.get(idColumn) === idValue);
  if (!row) return null;
  for (const [key, value] of Object.entries(updates)) {
    row.set(key, value);
  }
  await row.save();
  return row;
}

export async function getRows(sheetName: string) {
  const sheet = await getOrCreateSheet(sheetName);
  if (!sheet) return [];
  return sheet.getRows();
}

export async function findRowInSheet(
  sheetName: string,
  idColumn: string,
  value: string,
) {
  const sheet = await getOrCreateSheet(sheetName);
  if (!sheet) return null;
  const rows = await sheet.getRows();
  return rows.find((r) => r.get(idColumn) === value) ?? null;
}

export async function getStats() {
  const rows = await getRows("Monitoring");
  const total = rows.length;
  let proses = 0, siapDiambil = 0, tidakValid = 0, selesai = 0;
  for (const r of rows) {
    const s = r.get("Status Proses")?.toLowerCase() ?? "";
    if (s === "proses") proses++;
    else if (s === "siap diambil") siapDiambil++;
    else if (s === "tidak valid") tidakValid++;
    else if (s === "selesai") selesai++;
  }
  return { total, proses, siap_diambil: siapDiambil, tidak_valid: tidakValid, selesai };
}
